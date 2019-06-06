
Chart.plugins.unregister(ChartDataLabels);

function drawDoughnutChart(avg_performance, avg_target) {

  console.log(avg_performance);

  var data = {
    datasets: [
        {
            data: [avg_performance, 100-avg_performance],
            backgroundColor: [
                (avg_performance < avg_target) ? "#CD0000": "green" ,
                "#D3D3D3"
            ]
        }]
};

var ctx = document.getElementById("chart1");

// And for a doughnut chart
var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      legend: {
        position: 'bottom',
        fullWidth: true,
        display: true,
        labels: {
          fontSize: 18,
          fontColor: 'black'
        }
      },
      title: {
        display: true,
        position: 'top',
        padding: 20,
        fontSize: 22,
        color: 'black',
        text: 'Service Standards Performance'
      },
    	rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      cutoutPercentage : 80,
      tooltips: {
         enabled: false
       }
    }
});

  $('.donut-inner h2').text(parseInt(avg_performance) + '%');
  $('#target').html(((avg_performance < avg_target) ? 'The average service standard target of ' + avg_target + '%  has NOT been met' : 'The average service standard target of ' + avg_target + '%  has been met'));

}


function drawBarChart(sum16_17, sum17_18) {

  var ctx = document.getElementById("chart2");

  var data = {
    labels: ['2016-2017','2017-2018'],
    datasets: [
        {
            data: [sum16_17, sum17_18],
            backgroundColor: "#006699",
        }]
  };


  var options = {

    title: {
      display: true,
      text: 'Total Number of Applications',
      position: 'top',
      padding: 20,
      fontSize: 22,
      // fontColor: 'black'
    },
    legend: {
      display: false,
      position: 'bottom',
      onClick: function (e) {
        e.stopPropagation();
      }
    },
      animation: {
          duration: 1500
      },
      devicePixelRatio: 1.5,
      scales: {
        xAxes: [{
          barPercentage: 0.8,
          categoryPercentage: 1,
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            fontColor: 'black',
            fontSize: 16
          },
        }],
        yAxes: [{
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            display: false,
            suggestedMin: 0,
            suggestedMax: (sum17_18 > sum16_17) ? (sum17_18*1.1) : (sum16_17*1.1),
          },
        }],
      },
      plugins: {
        datalabels: {
          // color: 'black',
          anchor: 'end',
          align: 'top',
          font: {
            size: '20'
          },
          formatter: function(value, context) {
            return formatNumberMini(value);
          }
        }
      }
  }

  var myBarChart = new Chart(ctx, {
    plugins: [ChartDataLabels],
    type: 'bar',
    data: data,
    options: options
  });
}
