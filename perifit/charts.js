/** Constants */
const MAX_LENGTH_ACC = 400;
const MAX_LENGTH_FSR = 400;

/** Variables */
var xValues = Array.from(Array(MAX_LENGTH_ACC).keys())
var yValues = [0] * MAX_LENGTH_ACC;


var csv_contents = "";

// exercise being recorded to csv file
var recording = false;

// create chart js chart
var ctx = document.getElementById("myChart").getContext("2d");
var chart_acc = new Chart(ctx, {
  type: "line",
  data: {
    labels: xValues,
    datasets: [
      {
        label: "x",
        pointRadius: 0,
        data: yValues,
        fill: false,
        borderColor: "rgb(255, 0, 0)",
      },
      {
        label: "y",
        pointRadius: 0,
        data: yValues,
        fill: false,
        borderColor: "rgb(0, 255, 0)",
      },
      {
        label: "z",
        pointRadius: 0,
        data: yValues,
        fill: false,
        borderColor: "rgb(0, 0, 255)",
      }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    scales: {
      y:
      {
        max: 2,
        min: -2

      },
      x: {
        max: MAX_LENGTH_ACC,
        min: 0
      },

    },
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    pan: {
      enabled: true,
      mode: 'x',
      speed: 10,
      threshold: 10
    },
    zoom: {
      enabled: true,
      mode: 'x',
      limits: {
        max: 10,
        min: 0.5
      }
    }
  }
});


// create chart js chart
var chart_fsr = document.getElementById("myChart_fsr").getContext("2d");
var myChart_fsr = new Chart(chart_fsr, {
  type: "line",
  data: {
    labels: xValues,
    datasets: [
      {
        label: "fsr1",
        pointRadius: 0,
        data: yValues,
        fill: false,
        borderColor: "rgb(0, 255, 0)",
      },
      {
        label: "fsr2",
        pointRadius: 0,
        data: yValues,
        fill: false,
        borderColor: "rgb(255, 0, 0)",
      }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        max: 6000,
        min: 0
      },
      x:
      {
        beginAtZero: false,
        max: MAX_LENGTH_FSR,
        min: 0
      }

    },
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    pan: {
      enabled: true,
      mode: 'x',
      speed: 10,
      threshold: 10
    },
    zoom: {
      enabled: true,
      mode: 'x',
      limits: {
        max: 10,
        min: 0.5
      }
    }
  }
});
