const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const neo4j = require('neo4j-driver');
const crypto = require('crypto'); // Node.js Crypto module for generating random strings.


// Neo4j connection details
const neo4jUri = 'bolt://localhost';
const neo4jUser = 'neo4j';
const neo4jPassword = '12345678';

// Create a Neo4j driver instance
const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/api/wallet/:address', async (req, res) => {
  const { address } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (wallet {addressId: $address}) RETURN wallet.addressId AS addressId, wallet.type AS type, wallet.btc AS btc, wallet.eth AS eth',
      { address }
    );
    const walletInfo = result.records.map(record => {
      const eth = record.get('eth');
      // Ensure 'eth' is represented as an object with 'low' and 'high' properties.
      // This transformation assumes 'eth' values are within JavaScript's safe integer range.
      const ethValue = {
        low: neo4j.isInt(eth) ? eth.toInt() : eth, // Convert Neo4j integer to int, or keep the original number
        high: 0 // 'high' is set to 0 since JavaScript's Number range doesn't require splitting into high and low parts
      };
      return {
        addressId: record.get('addressId'),
        type: record.get('type'),
        btc: record.get('btc'),
        eth: ethValue // Use the manually constructed object
      };
    });
    console.log(walletInfo);
    res.json(walletInfo);
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).send('Database access error');
  } finally {
    await session.close();
  }
});



// API endpoint for address transaction
app.get('/api/wallet/:address/transactions', async (req, res) => {
  const { address } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (a:Address {addressId: $address})-[r:TRANSACTION]-(b:Address)
       RETURN r.hash AS hash, 
              r.value AS value, 
              r.input AS input, 
              r.transaction_index AS transaction_index, 
              r.gas AS gas, 
              r.gas_used AS gas_used, 
              r.gas_price AS gas_price, 
              r.transaction_fee AS transaction_fee, 
              r.block_number AS block_number, 
              r.block_hash AS block_hash, 
              r.block_timestamp AS block_timestamp,
              startNode(r).addressId AS from_address,
              endNode(r).addressId AS to_address`,
      { address }
    );

    const transactions = result.records.map(record => {
      return {
        hash: record.get('hash'),
        value: record.get('value'),
        input: record.get('input'),
        transaction_index: record.get('transaction_index').low, // Use .low for Neo4j integer
        gas: record.get('gas').low, // Use .low for Neo4j integer
        gas_used: record.get('gas_used').low, // Use .low for Neo4j integer
        gas_price: neo4j.integer.toNumber(record.get('gas_price')), // Convert Neo4j integer to JavaScript number
        transaction_fee: record.get('transaction_fee'),
        block_number: record.get('block_number').low, // Use .low for Neo4j integer
        block_hash: record.get('block_hash'),
        block_timestamp: record.get('block_timestamp').low, // Use .low for Neo4j integer
        from_address: record.get('from_address'), // Added: Fetch from_address
        to_address: record.get('to_address') // Added: Fetch to_address
      };
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).send('Database access error');
  } finally {
    await session.close();
  }
});


app.post('/login', async (req, res) => {
  const session = driver.session();
  try {
    const { username, password } = req.body;
    // Adjust the query to match against the Address label
    const result = await session.run(
      'MATCH (address:Address {username: $username, password: $password}) RETURN address',
      { username, password }
    );
    if (result.records.length > 0) {
      // Login successful
      const userInfo = result.records[0].get('address').properties;
      res.json({
        message: 'Login successful',
        user: userInfo
      });
    } else {
      // No matching user found
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).json({ error: 'Database access error' });
  } finally {
    await session.close();
  }
});

app.post('/api/signup', async (req, res) => {
  const session = driver.session();
  try {
    const { username, password } = req.body; // email is not included as per the database fields
    let walletAddress;
    let isUnique = false;
    const initialBTC = 0.1;
    const initialETH = 3;
    
    // Randomly assign a type
    const types = ['eoa', 'contract'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Check for unique wallet address
    while (!isUnique) {
      walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
      const uniqueCheck = await session.run(
        'MATCH (wallet:Address {addressId: $walletAddress}) RETURN wallet',
        { walletAddress }
      );
      if (uniqueCheck.records.length === 0) {
        isUnique = true;
      }
    }
    
    // Create a new address node with a wallet address, username, password, type, btc, and eth
    const createAddress = await session.run(
      `CREATE (address:Address {
        addressId: $walletAddress, 
        username: $username, 
        password: $password, 
        type: $type, 
        btc: $btc, 
        eth: $eth
      }) RETURN address`,
      {
        walletAddress,
        username,
        password,
        type,
        btc: initialBTC,
        eth: initialETH
      }
    );
    
    if (createAddress.records.length > 0) {
      const createdAddress = createAddress.records[0].get('address').properties;
      // Convert Neo4j integer to a regular number
      createdAddress.eth = neo4j.int(createdAddress.eth);
      res.json({
        message: 'Sign-up successful',
        address: createdAddress
      });
    } else {
      throw new Error('Address creation failed');
    }
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).json({ error: 'Database access error' });
  } finally {
    await session.close();
  }
});


app.get('/api/transactions/average/:address', async (req, res) => {
  const { address } = req.params;
  const session = driver.session();

  try {
    const buyQuery = `MATCH (:Address {addressId: $address})<-[r:TRANSACTION]-(from:Address)
                      RETURN avg(r.value) AS avgBuyValue`;
    const buyResult = await session.run(buyQuery, { address });
    const avgBuyValue = buyResult.records[0]?.get('avgBuyValue') || 0;

    const sellQuery = `MATCH (:Address {addressId: $address})-[r:TRANSACTION]->(to:Address)
                       RETURN avg(r.value) AS avgSellValue`;
    const sellResult = await session.run(sellQuery, { address });
    const avgSellValue = sellResult.records[0]?.get('avgSellValue') || 0;

    res.json({ avgBuyValue, avgSellValue });
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).send('Database access error');
  } finally {
    await session.close();
  }
});


// Sau tất cả các route khác, thêm middleware xử lý Error 404
app.use(function(req, res, next) {
  res.status(404).sendFile(path.resolve('public', 'error404.html'));
});

// Middleware xử lý Error 500
app.use(function(err, req, res, next) {
  console.error(err.stack); // Ghi lại chi tiết lỗi vào console/log
  res.status(500).sendFile(path.resolve('public', 'error500.html'));
});


// Catch-all route to serve the front-end
app.get('*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Clean up on exit
process.on('exit', () => {
  neo4jDriver.close();
  mysqlPool.end(); // End MySQL pool connections
});
