// Lê Minh Long 104180139 , Nguyễn Đức Lê Nguyên 104224493 ,Trần Minh Quân 104167682

'use strict';


/**
 * Function to add an event listener to one or multiple elements
 * @param {HTMLElement|NodeList} elem - The element or NodeList to attach the event to
 * @param {string} type - The type of event (e.g., "click", "scroll")
 * @param {Function} callback - The callback function to be executed on the event
 */
const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}


/**
 * Navbar toggle functionality
 */

const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
  document.body.classList.toggle("active");
}

// Event listener for toggling the navbar
addEventOnElem(navToggler, "click", toggleNavbar);

// Event listener for closing the navbar when a link is clicked
const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
  document.body.classList.remove("active");
}

addEventOnElem(navbarLinks, "click", closeNavbar);

/**
 * Header activation on scroll
 */

const header = document.querySelector("[data-header]");

const activeHeader = function () {
  if (window.scrollY > 300) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", activeHeader);

/**
 * Scroll reveal effect for sections
 */

const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 1.5) {
      sections[i].classList.add("active");
    } else {
      sections[i].classList.remove("active");
    }
  }
}

// Initial call for scroll reveal
scrollReveal();

// Event listener for scroll reveal on scroll
addEventOnElem(window, "scroll", scrollReveal);

/**
 * Bar chart initialization
 */

// Sample data for the bar chart
var chartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  datasets: [{
    label: 'Monthly Trading',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1,
    data: [65, 59, 80, 81, 56, 55, 67, 82, 45, 90, 30, 22]
  }]
};

// Get the canvas element for the bar chart
var ctx = document.getElementById('myChart').getContext('2d');

// Set the desired width and height for the chart
var chartWidth = 1000;
var chartHeight = 1000;

// Create the bar chart
var myChart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    // Additional options can be added here
  }
});

/**
 * Real-time transaction crypto chart initialization
 */

// Get the canvas element for the real-time line chart
const interactiveCtx = document.getElementById('interactiveChart').getContext('2d');

// Data structure for the real-time line chart
let interactiveChartData = {
  labels: [],
  datasets: [{
    label: 'Crypto Transaction',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1,
    data: [],
  }],
};

// Create the real-time line chart
const interactiveChart = new Chart(interactiveCtx, {
  type: 'line',
  data: interactiveChartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: [{
        type: 'linear',
        position: 'bottom',
      }],
    },
  },
});

// Set interval for updating the real-time data
setInterval(() => {
  const newDataPoint = Math.floor(Math.random() * 100);

  interactiveChartData.labels.push(interactiveChartData.labels.length);
  interactiveChartData.datasets[0].data.push(newDataPoint);

  const maxDataPoints = 50;
  if (interactiveChartData.labels.length > maxDataPoints) {
    interactiveChartData.labels.shift();
    interactiveChartData.datasets[0].data.shift();
  }

  interactiveChart.update();
}, 1300);

// Adjust the size of the bar chart based on the desired width and height
myChart.resize(chartWidth, chartHeight);




