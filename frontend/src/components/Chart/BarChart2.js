import React from "react";
import { Bar } from "react-chartjs-2";

const BarChartComponent = ({ chartData }) => {

  const data = {
    labels: chartData.labels, // Labels untuk sumbu X
    datasets: [
      {
        label: "ASSET", 
        data: chartData.series[0], // Data pada sumbu Y
        backgroundColor: "rgba(255,99,132,0.3)",
        borderColor: "rgba(255,99,132,1)", 
        borderWidth: 1,
      },
      {
        label: "NON-ASSET", 
        data: chartData.seriesNA[0], 
        backgroundColor: "rgba(191,251,255,0.5)",
        borderColor: "rgba(68, 132, 143, 1)", 
        borderWidth: 1,
      },
      {
        label: "AMPAS KELAPA", 
        data: chartData.seriesAK[0],
        backgroundColor: "rgba(255, 156, 99, 0.3)",
        borderColor: "rgba(255, 161, 99, 1)", 
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, 
        },
      },
      y: {
        beginAtZero: true, 
        ticks: {
          stepSize: 10, 
        },
        grid: {
          drawBorder: true, 
        },
            title: {
            display: true,
            text: "Jumlah Barang", 
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function (tooltipItem) {
            const tooltipTitle = tooltipItem[0].dataset.label;
            return tooltipTitle; 
          },
          label: function (tooltipItem) {
            return (tooltipItem.raw); 
          },
        },
      },
      legend: {
        display: true,
        position: "top", 
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: "245px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChartComponent;
