import React from "react";
import { Line } from "react-chartjs-2";

const LineComponent2 = ({ chartData }) => {
  const formatRupiah = (angka) => {
    let pinjamanString = angka.toString().replace(".00");
    let sisa = pinjamanString.length % 3;
    let rupiah = pinjamanString.substr(0, sisa);
    let ribuan = pinjamanString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const data = {
    labels: chartData.labels, // Labels untuk sumbu X
    datasets: [
      {
        label: "Divisi", 
        data: chartData.series[0], // Data pada sumbu Y
        backgroundColor: "rgba(68, 132, 143, 1)", 
        borderColor: "rgba(68, 132, 143, 1)",            
        borderWidth: 1,
        fill: {
          target: "origin",
          above: "rgba(191,251,255,0.5)",
        }
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
            text: "Pengeluaran-Scrapping (Rp)", 
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return 'Rp '+ formatRupiah(tooltipItem.raw); 
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
    <div className="chart-container" style={{ height: "242px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineComponent2;
