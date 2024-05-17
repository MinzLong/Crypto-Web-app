
This repository contains the project files for Group 3's submission for Assignment 2 in the course COS30049. The project involves database design and implementation using Neo4j.

## Group Members
- Nguyen Duc Le Nguyen
- Le Minh Long
- Tran Minh Quan

## Project Files

### 1. Group-Assessment-Contribution-Form
These forms document the contributions of each group member to the project:
- **[Group-Assessment-Contribution-Form.docx](./Group-Assessment-Contribution-Form.docx)**
- **[Group-Assessment-Contribution-Form.pdf](./Group-Assessment-Contribution-Form.pdf)**

### 2. DTB_Structure.txt
This file contains Neo4j Cypher queries to load and manage the database structure for the project.

#### Usage Instructions
1. **Ensure Neo4j is installed**: Install Neo4j on your system. Follow the [Neo4j Installation Guide](https://neo4j.com/docs/operations-manual/current/installation/) if needed.
2. **Start Neo4j**: Run your Neo4j instance.
3. **Prepare CSV Files**: Ensure `nodes.csv` and `relationships.csv` are in the Neo4j import directory.
4. **Load Data**: Open the Neo4j browser and run the Cypher queries from `DTB_Structure.txt`.

#### Cypher Queries Overview
- Import and create/update `Address` nodes with properties like `type`, `btc`, `eth`, `username`, and `password`.
- Import and create `TRANSACTION` relationships between `Address` nodes with properties such as `hash`, `value`, `input`, `transaction_index`, `gas`, `gas_used`, `gas_price`, `transaction_fee`, `block_number`, `block_hash`, and `block_timestamp`.

---

Feel free to modify the content as needed for your specific use case.
