import React, { useEffect, useState } from "react";
import {FaCheckSquare, FaFileCsv, FaFileImport, FaFilePdf, FaUserCheck, FaSortDown, FaSortUp, FaFileContract} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import ChartComponent from "components/Chart/BarChart.js";
import LineComponent from "components/Chart/LineChart";
import PolarAreaComponent from "components/Chart/PolarAreaChart";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import 'chartist-plugin-tooltips';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css'; // Impor CSS untuk tooltip
import 'chartist/dist/chartist.min.css'; // Impor CSS Chartist
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/beranda3.png";
import "../assets/scss/lbd/_table-header.scss";
import Calendar from "react-calendar";
import "../assets/scss/lbd/_calendar.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// import {Link} from "react-router-dom"; 

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Spinner, 
  Modal, 
  Form
} from "react-bootstrap";

ChartJS.register(ArcElement, Tooltip, Legend);
// ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

function Beranda() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [message, setMessage] = useState("");
  const [plafondSaatIni, setPlafondSaatIni] = useState(0);
  const history = useHistory(); 
  const [error, setError] = useState("");
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [totalDibayar, setTotalDibayar] = useState(0);
  const [totalPeminjam, setTotalPeminjam] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false); 
  const [years, setYears] = useState([]); 
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDepartemen, setSelectedDepartemen] = useState("");
  const [selectedMonthPeminjam, setSelectedMonthPeminjam] = useState("");
  const [selectedDepartemenPeminjam, setSelectedDepartemenPeminjam] = useState("");
  const [chartDataTahunan, setChartDataTahunan] = useState({ labels: [], series: [[]] });
  const [chartDataBulanan, setChartDataBulanan] = useState({ labels: [], series: [[]] });
  const [chartDataPeminjamBulanan, setDataPeminjamBulanan] = useState({ labels: [], series: [[]] });
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 

  const [latestPlafond, setLatestPlafond] = useState(""); 
  const [plafondAngsuran, setPlafondAngsuran] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_pinjaman");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const [date, setDate] = useState(new Date());

  const [filepath_pernyataan, setFilePathPernyataan] = useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [file, setFile] = useState(null);

  const findNomorAntrean = (idPinjaman) => {
    const antreanItem = antrean.find(item => item.id_pinjaman === idPinjaman);
    return antreanItem ? antreanItem.nomor_antrean : "-"; 
  };

  const isPreviousAccepted = (nomorAntrean) => {
    for (let i = 1; i < nomorAntrean; i++) {
      const prevItem = antrean.find(item => item.nomor_antrean === i); 
      if (prevItem && prevItem.status_transfer !== "Selesai") {
        return false;
      }
    }
    return true;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // const filteredAndSortedPinjaman = pinjaman 
  // .filter(
  //   (pinjaman) =>
  //     (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
  //     (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
  //     (pinjaman.nomor_antrean && pinjaman.nomor_antrean.toLowerCase().includes(searchQuery)) ||
  //     (pinjaman.id_peminjam && String(pinjaman.id_peminjam).toLowerCase().includes(searchQuery)) ||
  //     (pinjaman?.Peminjam?.nama && String(pinjaman.Peminjam.nama).toLowerCase().includes(searchQuery)) ||
  //     (pinjaman.keperluan && String(pinjaman.keperluan).toLowerCase().includes(searchQuery)) ||
  //     (pinjaman.status_pengajuan && String(pinjaman.status_pengajuan).toLowerCase().includes(searchQuery))
  // ) 
  // .filter(
  //   (item) => 
  //     item.status_transfer !== "Selesai" &&
  //     item.status_pengajuan !== "Dibatalkan" && 
  //     item.status_transfer !== "Dibatalkan"
  // )
  // .map((pinjaman) => ({
  //   ...pinjaman,
  //   nomor_antrean: findNomorAntrean(pinjaman.id_pinjaman),
  // }))
  // .sort((a, b) => a.nomor_antrean - b.nomor_antrean);

  const filteredAndSortedPinjaman = pinjaman 
  .filter(
    (pinjaman) =>
      (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
      (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.nomor_antrean && pinjaman.nomor_antrean.toLowerCase().includes(searchQuery)) ||
      (pinjaman.id_peminjam && String(pinjaman.id_peminjam).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.Peminjam?.nama && String(pinjaman.Peminjam.nama).toLowerCase().includes(searchQuery)) ||
      (pinjaman.keperluan && String(pinjaman.keperluan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.status_pengajuan && String(pinjaman.status_pengajuan).toLowerCase().includes(searchQuery)) ||
      (pinjaman.jumlah_pinjaman && String(pinjaman.jumlah_pinjaman).toLowerCase().includes(searchQuery)) ||
      (pinjaman.jumlah_angsuran && String(pinjaman.jumlah_angsuran).toLowerCase().includes(searchQuery)) ||
      (pinjaman.rasio_angsuran && String(pinjaman.rasio_angsuran).toLowerCase().includes(searchQuery)) ||
      (pinjaman?.UpdatePinjamanPlafond?.tanggal_plafond_tersedia && String(pinjaman.UpdatePinjamanPlafond.tanggal_plafond_tersedia).toLowerCase().includes(searchQuery))

  ) 
  .filter(
    (item) => 
      item.status_transfer !== "Selesai" &&
      item.status_pengajuan !== "Dibatalkan" && 
      item.status_transfer !== "Dibatalkan"
  )
  .map((pinjaman) => ({
    ...pinjaman,
    nomor_antrean: findNomorAntrean(pinjaman.id_pinjaman),
  }))
  .sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0; 
    }

  });

  const currentItems = filteredAndSortedPinjaman.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setSortOrderDibayar(sortOrderDibayar === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
      setSortOrderDibayar("asc");
    }
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    getAntrean();
    getPinjaman();
    getPinjamanData();
    fetchAntrean(); 
    // fetchPlafondAngsuran();

    setTimeout(() => setLoading(false), 3000)
  }, []);


  const getPinjaman = async () =>{
    try {
      // setLoading(true);
      const response = await axios.get("http://localhost:5000/pinjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      // withCredentials: true,
      });
      setPinjaman(response.data);
      // console.log("Response pinjaman dari backend:", response.data);

    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  const getPinjamanData = async () =>{
    try {
      // setLoading(true);
      const response = await axios.get("http://localhost:5000/pinjaman-data", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      // withCredentials: true,
  
      });
      setPinjamanData(response.data);
      // console.log("Response dari backend:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  
  const getAntrean = async () => {
    try {
      // setLoading(true);
      const response = await axios.get("http://localhost:5000/antrean-pengajuan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
  
      });
      setAntrean(response.data); 
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
      setError("Gagal mengambil antrean. Silakan coba lagi.");
    // } finally {
    //   setLoading(false);
    }
  };

  const fetchAntrean = async () => {
    try {
      const response = await axios.get("http://localhost:5000/antrean-pengajuan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setAntrean(response.data);
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
    }
  };

  const getMonths = () => {
    return [
      { value: "01", label: "Januari" },
      { value: "02", label: "Februari" },
      { value: "3", label: "Maret" },
      { value: "4", label: "April" },
      { value: "5", label: "Mei" },
      { value: "06", label: "Juni" },
      { value: "07", label: "Juli" },
      { value: "08", label: "Agustus" },
      { value: "09", label: "September" },
      { value: "10", label: "Oktober" },
      { value: "11", label: "November" },
      { value: "12", label: "Desember" },
    ];
  };
  

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get("http://localhost:5000/filter-piutang", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = response.data;
        // console.log("Data: ", data);
        const uniqueYears = [
          ...new Set(data.map((item) => new Date(item.tanggal_pengajuan).getFullYear())),
        ];
        setYears(uniqueYears.sort()); 
        // console.log("Years: ", uniqueYears);
      } catch (error) {
        console.error("Error fetching years:", error.message);
      }
    };
  
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (!token || !username) return;
  
      try {
        const response = await axios.get(
          `http://localhost:5000/user-details/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (response.data) {
          setUserData({
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            divisi: response.data.divisi,
          });
          // console.log("User data fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    const fetchSummaryData = async () => {
          try {
            const [responseTotalPinjaman, responseTotalPeminjam, responseTotalDibayar, responsePlafond] = await Promise.all([
              axios.get("http://localhost:5000/total-pinjaman-keseluruhan", {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get("http://localhost:5000/total-peminjam", {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get("http://localhost:5000/total-dibayar", {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get("http://localhost:5000/latest-plafond-saat-ini", {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);
      
            setTotalPinjamanKeseluruhan(responseTotalPinjaman.data.totalPinjamanKeseluruhan || 0);
            setTotalPeminjam(responseTotalPeminjam.data.totalPeminjam || 0);
            setTotalDibayar(responseTotalDibayar.data.total_dibayar || 0);
            setLatestPlafond(responsePlafond.data.latestPlafond || 0);
          } catch (error) {
            console.error("Error fetching summary data:", error);
          }
        };
  
    fetchYears();
    fetchUserData();
    fetchSummaryData();

    dataPinjaman(selectedYear);
    dataPerDivisi();
    dataPeminjamPerDivisi();
  }, [selectedYear]); 
  
  const totalPinjaman = parseFloat(totalPinjamanKeseluruhan);
  const plafondTerakhir = parseFloat(latestPlafond);
  // console.log("plafond terakhir: ", plafondTerakhir);
  const total = totalPinjaman + plafondTerakhir;
  const persentaseJumlahPinjaman =  total > 0 ? ((totalPinjaman / total) * 100).toFixed(2) : "";
  const percentage = plafondTerakhir > 0? 100 : "0";
  // console.log("Percentage: ", percentage);
  const usedPercentage = (persentaseJumlahPinjaman > 0? (100 - persentaseJumlahPinjaman).toFixed(2) : percentage);
  // const usedPercentage = ( (total > 0 ? ((totalPinjaman / total) * 100).toFixed(2) : "0")) ; 
  console.log("usedPercentage: ", usedPercentage);

  const data_plafond = {
    // labels: ['Digunakan', 'Tersedia'],
    datasets: [
      {
        label: 'Pinjaman Overview',
        data: [
          totalPinjamanKeseluruhan,
          latestPlafond,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverOffset: 4
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', 
    plugins: {
      legend: {
        display: true,
      },
      // tooltip: {
      //   callbacks: {
      //     label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${((tooltipItem.raw / total) * 100).toFixed(1)}%)`,
      //   },
      // },
    },
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      const { width, height, options } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = (height / 100).toFixed(2);
      ctx.font = `${fontSize*7}px Nunito`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
  
      const x = width / 2;
      const y = height / 2;
  
      ctx.fillStyle = '#333'; // Text color
      const text = options.plugins.centerText?.usedPercentage || "";
      ctx.fillText(`${text}%`, x, y);
      ctx.save();
    },
  };
  

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

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

  const handleScreeningClick = (pinjaman) => {
    // console.log('Selected Pinjaman:', pinjaman); 
    history.push({
      pathname: "/admin/screening-karyawan", 
      state: {selectedPinjaman: pinjaman}
    }); 
  };

  const handleTerimaClick = async (pinjaman) => {
    // console.log("Isi userData:", userData);

    if (!userData || !userData.id_karyawan) {
      console.error("ID Asesor tidak ditemukan. Pastikan userData diinisialisasi dengan benar.");
      toast.error("ID Asesor tidak ditemukan. Silakan coba lagi.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      return;
    }

    try {
      // console.log('Mencoba mengupdate status pengajuan:', pinjaman);
  
      const payload = { 
        status_pengajuan: "Diterima",
        id_asesor: userData.id_karyawan,
      };

      // console.log("Payload yang dikirim ke server:", payload);

      const response = await axios.put(`http://localhost:5000/pengajuan/${pinjaman.id_pinjaman}`, {
        status_pengajuan: "Diterima",

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
  
      // console.log('Status pengajuan diperbarui:', response.data);
  
      toast.success('Status pengajuan berhasil diperbarui!', {
        position: "top-right", 
        autoClose: 5000,
        hideProgressBar: true,
      });
  
      getPinjaman(); //refresh data pinjaman
  
    } catch (error) {
      console.error('Error updating status_pengajuan:', error.response ? error.response.data : error.message);
      toast.error('Gagal memperbarui status pengajuan.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }
  
  const handleImportSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Antrean Pengajuan berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };


  const downloadCSV = (data) => {
    const header = ["id_pinjaman", "tanggal_pengajuan", "nomor_antrean", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "rasio_angsuran", "keperluan", "status_pengajuan", "status_transfer", "id_peminjam", "filepath_pernyataan"];
    
    const filteredData = data.filter(
      (item) =>
        item.status_pengajuan === "Ditunda" ||
        item.status_transfer === "Belum Ditransfer"
    );
    
    const rows = filteredData.map((item) => {

      const findNomorAntrean = (idPinjaman) => {
        const antreanItem = antrean.find(item => item.id_pinjaman === idPinjaman);
        return antreanItem ? antreanItem.nomor_antrean : "-"; 
      };

      return [
        item.id_pinjaman,
        item.tanggal_pengajuan,
        findNomorAntrean(item.id_pinjaman),
        item.jumlah_pinjaman,
        item.jumlah_angsuran,
        item.pinjaman_setelah_pembulatan,
        item.rasio_angsuran,
        item.keperluan,
        item.status_pengajuan,
        item.status_transfer,
        item.id_peminjam,
        // item.id_asesor,
        item.filepath_pernyataan
      ];
    });

    // console.log("Baris CSV:", rows);
    
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "antrean_pengajuan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Antrean Pengajuan Pinjaman", 12, 20);
    
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  
    doc.setFontSize(12); 
    doc.text(`Tanggal cetak: ${formattedDate}`, 12, 30);
  
    const headers = [
      "ID Pinjaman", 
      "Tanggal Pengajuan", 
      "Nomor Antrean", 
      "ID Karyawan", 
      "Nama Lengkap", 
      "Jumlah Pinjaman", 
      "Jumlah Angsuran", 
      "Jumlah Pinjaman Setelah Pembulatan", 
      "Rasio Angsuran",
      "Keperluan", 
      "Tanggal Plafond Tersedia",
      "Status Pengajuan", 
      "Status Transfer", 
    ];  
    const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => {
      return Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: [headers],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [3, 177, 252] }, 

      columnStyles: {
        0: { cellWidth: 'auto' },  
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 'auto' },  
        3: { cellWidth: 'auto' },  
        4: { cellWidth: 'auto' },  
        5: { cellWidth: 'auto' },  
        6: { cellWidth: 'auto' },  
        7: { cellWidth: 'auto' },  
        8: { cellWidth: 'auto' },  
        9: { cellWidth: 'auto' },  
        10: { cellWidth: 'auto' },
        11: { cellWidth: 'auto' }
      },
      tableWidth: 'auto',
  
    });
  
    doc.save("antrean_pengajuan_pinjaman.pdf");
  };

  const dataPinjaman = async (selectedYear) => {
    try {
      const response = await axios.get("http://localhost:5000/data-pinjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          year: selectedYear, 
        },
      });
  
      const data = response.data;
  
      const labels = [];
      const seriesPinjaman = [];
  
      data.forEach((item) => {
        labels.push(item.departemen);
        const jumlahPinjamanScaled = Math.floor(item.jumlah_pinjaman / 1000000);
        seriesPinjaman.push(jumlahPinjamanScaled);
      });
  
      if (labels.length > 0 && seriesPinjaman.length > 0) {
        setChartDataTahunan({
          labels: labels,
          series: [seriesPinjaman],
        });
      } else {
        setChartDataTahunan({
          labels: [],
          series: [[]],
        });
        console.error("Data kosong");
      }
    } catch (error) {
      console.error("Error fetching dataPinjaman:", error.message);
    }
  };
  
const dataPerDivisi = async (selectedDepartemen, selectedMonth = "", selectedYear = "") => {
    try {
        const tahun = selectedYear || new Date().getFullYear();
        const bulan = selectedMonth === "" ? undefined : selectedMonth.padStart(2, '0');

        // console.log("Params:", { departemen: selectedDepartemen, bulan, tahun });

        const response = await axios.get("http://localhost:5000/data-divisi", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                departemen: selectedDepartemen || "",
                bulan: bulan,
                tahun: tahun,
            },
        });

        const data = response.data;

        const labels = [];
        const seriesPinjaman = [];

        data.forEach((item) => {
            labels.push(item.divisi);
            const jumlahPinjamanScaled = Math.floor(item.jumlah_pinjaman / 1000000);
            seriesPinjaman.push(jumlahPinjamanScaled);
        });

        if (labels.length > 0 && seriesPinjaman.length > 0) {
            setChartDataBulanan({
                labels: labels,
                series: [seriesPinjaman],
            });
        } else {
            setChartDataBulanan({
                labels: [],
                series: [[]],
            });
            console.error("Data kosong");
        }
    } catch (error) {
        console.error("Error fetching dataPerDivisi:", error.message);
        setChartDataBulanan({
            labels: [],
            series: [[]],
        });
    }
};

const dataPeminjamPerDivisi = async (selectedDepartemenPeminjam, selectedMonthPeminjam = "", selectedYear = "") => {
  try {
      const tahun = selectedYear || new Date().getFullYear();
      const bulan = selectedMonthPeminjam === "" ? undefined : selectedMonthPeminjam.padStart(2, '0');

      const response = await axios.get("http://localhost:5000/data-peminjam-per-divisi", {
          headers: {
              Authorization: `Bearer ${token}`,
          },
          params: {
              departemen: selectedDepartemenPeminjam || "",
              bulan: bulan,
              tahun: tahun,
          },
      });

      const data = response.data;
      if (!data || !Array.isArray(data) || data.length === 0) {
          console.error("Data kosong atau tidak valid");
          setDataPeminjamBulanan({
              labels: [],
              series: [[]],
          });
          return;
      }

      // Mengisi labels dan series dengan data yang diterima
      const labels = data.map(item => item.divisi);
      const seriesPinjaman = data.map(item => item.jumlah_peminjam);

      setDataPeminjamBulanan({
          labels: labels,
          series: [seriesPinjaman],
      });

  } catch (error) {
      console.error("Error fetching dataPerDivisi:", error.message);
      setDataPeminjamBulanan({
          labels: [],
          series: [[]],
      });
  }
};

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async() => {
    if (!file) {
      toast.error("Silakan pilih file PDF terlebih dahulu.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF.");
      return;
    }
    

    const formData = new FormData();
    formData.append("pdf-file", file);
    formData.append("id_pinjaman", pinjaman.id_pinjaman);

    console.log('Id pinjaman: ', pinjaman.id_pinjaman);
    console.log('Form data: ', formData);

    fetch("http://localhost:5000/upload-pernyataan", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (response) => {
      const data = await response.json();
      console.log('File path saved: ', data.filePath);
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah.");
      }

      setFilePathPernyataan(data.filePath);
      toast.success("File berhasil diunggah.");
      // setShowImportModal(false);
      setShowAddModal(false);
      // handleFilepath();
      // onSuccess();
    })
    .catch((error) => {
      toast.error(`Gagal: ${error.message}`);
    });

  };

  const handleFilepath = async(id_pinjaman) => {
    // if (!pinjaman || !pinjaman.id_pinjaman) {
    //   console.error('Pinjaman atau id_pinjaman tidak ditemukan.');
    //   toast.error('Data pinjaman belum tersedia.');
    //   return;
    // }
    
    handleFileUpload();
    try {
  
      console.log('Id pinjaman: ', pinjaman.id_pinjaman);
      console.log('Filepath: ', pinjaman.filepath_pernyataan);
      
      await axios.patch(`http://localhost:5000/unggah-permohonan/${pinjaman.id_pinjaman}`, {
        
        filepath_pernyataan
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      toast.success('Filepath berhasil diperbarui!', {
        position: "top-right", 
        autoClose: 5000,
        hideProgressBar: true,
      });
      
    } catch (error) {
      console.error('Gagal mengupdate filepath:', error.response ? error.response.data : error.message);
      toast.error('Gagal memperbarui filepath.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }

  return (
    <>
      {loading === false ? 
        (<div className="App">
        <div className="home-card">
          <div className="card-content">
            <h2 className="card-title">Hai, {userData.nama}!</h2>
            <h4 className="card-subtitle">Siap memproses pengajuan pinjaman hari ini?</h4><hr/>
            <p className="text-danger">*Sistem akan logout secara otomatis dalam 5 menit jika tidak terdapat aktifitas dalam sistem.</p>
          </div>
          <div className="card-opening">
            <img 
              src={cardBeranda}
              alt="Beranda Illustration"
            /> 
          </div>
        </div>
        <Container fluid>
          <Row>
            <Col md="12"className="mb-lg-0">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Grafik Piutang Tahunan</Card.Title>
                </Card.Header>
                <Card.Body className="mt-2">
                  <div className="ct-chart" id="chartHours">
                    <div>
                      <label htmlFor="yearSelect">Pilih Tahun:</label>
                      <select
                        id="yearSelect"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value);
                          dataPinjaman(e.target.value); 
                        }}
                        className="mx-2"
                      >
                        <option value="">Semua Tahun</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ChartComponent chartData={chartDataTahunan} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md="8">
              <Card className="mb-2 mb-lg-4">
              <Card.Header>
                <Card.Title as="h4">Grafik Piutang Bulanan</Card.Title>
              </Card.Header>
              <Card.Body className="mb-5">
                <div className="ct-chart" id="chartHours">
                <div>
                  <label htmlFor="yearSelect">Tahun:</label>
                  <span className="year-label ml-2" onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setSelectedYear(currentYear);
                    dataPerDivisi(selectedDepartemen, selectedMonth, currentYear);
                  }}>
                    {new Date().getFullYear()}
                  </span>
                </div>

                <div>
                  <label htmlFor="monthSelect" className="mb-3">Pilih Bulan:</label>
                  <select
                    id="monthSelect"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      dataPerDivisi(selectedDepartemen, e.target.value, selectedYear);
                    }}
                    className="mx-2"
                  >
                    <option value="">Semua Bulan</option>
                    {getMonths().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                    </option>
                    ))}
                  </select>
                </div>

                  <div>
                    <label htmlFor="departemenSelect">Pilih Departemen:</label>
                    <select
                      id="departemenSelect"
                      value={selectedDepartemen}
                      onChange={(e) => {
                        setSelectedDepartemen(e.target.value);
                        dataPerDivisi(e.target.value); 
                      }}
                      className="mx-2"
                    >
                      <option value="">Semua Departemen</option>
                      <option value="Direksi">Direksi</option>
                      <option value="Finance & Administration">Finance & Administration</option>
                      <option value="Production">Production</option>
                      <option value="Sales & Distribution">Sales & Distribution</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <LineComponent chartData={chartDataBulanan}/>
                </div>
              </Card.Body>
              </Card>
            </Col>
            <Col md="4">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Ketersediaan Plafond</Card.Title>
                </Card.Header>
                <Card.Body className="mt-2">
                <div>
                  <Doughnut data={data_plafond} options={{plugins: {centerText: {usedPercentage}}}} plugins={[centerTextPlugin]}/>
                </div>

                  <div className="legend mt-3">
                    <i className="fas fa-circle" style={{ color: "#FF6384" }}></i>
                    Digunakan 
                    <i className="fas fa-circle ml-3" style={{ color: "#36A2EB" }}></i>
                    Tersedia 
                  </div>
                  <hr></hr>
                  <p className="card-category">Plafond tersedia saat ini sebesar Rp {formatRupiah(latestPlafond)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md="5">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Jumlah Peminjam Bulanan</Card.Title>
                </Card.Header>
                <Card.Body className="mt-2">
                <div>
                  <div>
                    <label htmlFor="yearSelect">Tahun:</label>
                    <span className="year-label ml-2" onClick={() => {
                      const currentYear = new Date().getFullYear();
                      setSelectedYear(currentYear);
                      dataPeminjamPerDivisi(selectedDepartemenPeminjam, selectedMonthPeminjam, currentYear);
                    }}>
                      {new Date().getFullYear()}
                    </span>
                  </div>

                  <div>
                  <select
                    id="monthSelect"
                    value={selectedMonthPeminjam}
                    onChange={(e) => {
                      setSelectedMonthPeminjam(e.target.value);
                      dataPeminjamPerDivisi(selectedDepartemen, e.target.value, selectedYear);
                    }}
                    className="mb-2"
                  >
                    <option value="">Semua Bulan</option>
                    {getMonths().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                    </option>
                    ))}
                  </select>
                  </div>

                  <div>
                    <select
                      id="departemenSelect"
                      value={selectedDepartemenPeminjam}
                      onChange={(e) => {
                        setSelectedDepartemenPeminjam(e.target.value);
                        dataPeminjamPerDivisi(e.target.value); 
                      }}
                    >
                      <option value="">Semua Departemen</option>
                      <option value="Direksi">Direksi</option>
                      <option value="Finance & Administration">Finance & Administration</option>
                      <option value="Production">Production</option>
                      <option value="Sales & Distribution">Sales & Distribution</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <PolarAreaComponent chartData={chartDataPeminjamBulanan}/>
                  </div>
                </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md="7" className="mt-2 mt-lg-0 mb-5 mb-lg-3">
              <Calendar onChange={setDate} value={date}></Calendar>
            </Col>
          </Row>

          <Row className="mt-4">
          {/* <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
          </Button>
          
          <ImportAntreanPengajuan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} /> */}

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(pinjaman)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button>
          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={downloadPDF}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>
          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />

          <Col md="12">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Antrean Pengajuan Pinjaman</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto'}}>
                {/* {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : ( */}
                <Table className="table-hover table-striped">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th className="border-0 text-wrap center" onClick={() => handleSort("id_pinjaman")}>ID Pinjaman {sortBy==="id_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("tanggal_pengajuan")}>Tanggal Pengajuan {sortBy==="tanggal_pengajuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("id_pinjaman")}>Nomor Antrean {sortBy==="id_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("id_peminjam")}>ID Karyawan{sortBy==="id_peminjam" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap">Nama Lengkap</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("jumlah_pinjaman")}>Jumlah Pinjaman {sortBy==="jumlah_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("jumlah_angsuran")}>Jumlah Angsuran {sortBy==="jumlah_angsuran" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("pinjaman_setelah_pembulatan")}>Jumlah Pinjaman Setelah Pembulatan {sortBy==="pinjaman_setelah_pembulatan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap" onClick={() => handleSort("rasio_angsuran")}>Rasio Angsuran {sortBy==="rasio_angsuran" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0 text-wrap">Keperluan</th>
                        <th className="border-0 text-wrap">Tanggal Plafond Tersedia</th>
                        <th className="border-0 text-wrap">Status Pengajuan</th>
                        <th className="border-0 text-wrap">Status Transfer</th>
                        <th className="border-0 text-wrap">Aksi</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems
                        .map((pinjaman) => (
                          <tr key={pinjaman.id_pinjaman}>
                            <td className="text-center">{pinjaman.id_pinjaman}</td>
                            <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                            <td className="text-right">{findNomorAntrean(pinjaman.id_pinjaman)}</td>
                            <td className="text-right">{pinjaman.id_peminjam}</td>
                            <td className="text-center">{pinjaman?.Peminjam?.nama || 'N/A'}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                            <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                            <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                            <td className="text-center">{pinjaman.rasio_angsuran}</td>
                            <td className="text-center">{pinjaman.keperluan}</td>
                            <td className="text-center">{pinjaman.UpdatePinjamanPlafond ? pinjaman.UpdatePinjamanPlafond.tanggal_plafond_tersedia: '-'}</td>
                            <td className="text-center">
                              {pinjaman.status_pengajuan === "Diterima" ? (
                                <Badge pill bg="success p-2">
                                Diterima
                                </Badge >
                                ) : pinjaman.status_pengajuan === "Dibatalkan" ? (
                                <Badge pill bg="danger p-2">
                                Dibatalkan
                                </Badge >
                                ) : (
                                <Badge pill bg="secondary p-2">
                                Ditunda
                                </Badge >
                              )}
                            </td>
                            <td className="text-center">
                              {pinjaman.status_transfer === "Selesai" ? (
                                  <Badge pill bg="success p-2">
                                  Selesai
                                  </Badge >
                                  ) : pinjaman.status_transfer === "Dibatalkan" ? (
                                  <Badge pill bg="danger p-2">
                                  Dibatalkan
                                  </Badge >
                                  ) : (
                                  <Badge pill bg="secondary p-2 text-wrap">
                                  Belum Ditransfer
                                  </Badge >
                              )}
                            </td>
                            <td className="text-center">
                            {/* <Button
                              className="btn-fill pull-right mb-2"
                              type="button"
                              variant="warning"
                              onClick={() => setShowAddModal(true)}
                              style={{width: 125, fontSize:14}}>
                              <FaFileContract style={{ marginRight: '8px' }}/>
                              Unggah Permohonan
                            </Button> */}

                            <Button
                              className="btn-fill pull-right mb-2"
                              type="button"
                              variant="warning"
                              onClick={() => handleScreeningClick(pinjaman)}
                              style={{width: 125, fontSize:14}}>
                              <FaUserCheck style={{ marginRight: '8px' }} />
                              Screening
                            </Button>
                            <Button
                              className="btn-fill pull-right mr-4"
                              type="Terima"
                              variant="info"
                              onClick={() => handleTerimaClick(pinjaman)}
                              disabled={pinjaman.status_pengajuan === "Diterima" || pinjaman.status_transfer === "Selesai" || pinjaman.not_compliant == 1 || pinjaman.not_compliant == null ||
                                !isPreviousAccepted(findNomorAntrean(pinjaman.id_pinjaman))
                              }
                              style={{width: 107, fontSize:14}}>
                              <FaCheckSquare style={{ marginRight: '8px' }} />
                              Terima
                            </Button>
                            
                            </td>
                          </tr>
                        ))
                        }
                      </tbody>
                    </table>
                  </div>
                </Table>
                {/* )} */}
              </Card.Body>
            </Card>
            <div className="pagination-container">
            <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={filteredAndSortedPinjaman.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>

          </Row>
            
        </Container>
        </div>
        ):
        ( <>
            <div className="App-loading">
              <ReactLoading type="spinningBubbles" color="#fb8379" height={150} width={150}/>
              <span style={{paddingTop:'100px'}}>Loading...</span>
            </div>
          </>
        )}

          <Modal
                className="modal-primary"
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
            >
                <Modal.Header className="text-center pb-1">
                    <h3 className="mt-3 mb-0">Form Permohonan Top-up Angsuran</h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0">
                    <hr />
                    <Form onSubmit={handleFilepath}>
                    <Card> 
                        <Card.Header as="h4" className="mt-1"><strong>Top-up Angsuran</strong></Card.Header><hr/>
                        <Card.Body>
                            <Card.Text>
                                <p>Merupakan kondisi dimana keluarga calon peminjam <strong>SETUJU</strong> untuk<strong> meningkatkan jumlah angsuran per-bulan yang dipotong dari Gaji Karyawan Peminjam</strong> untuk mencapai jumlah pinjaman yang diperlukan.</p>
                                <p>Silakan mengunggah Surat Pernyataan yang telah ditandatangani oleh:
                                </p>
                                <ol>
                                    <li>Karyawan Peminjam</li>
                                    <li>Perwakilan Keluarga Karyawan (suami/istri)</li>
                                    <li>Manager/Supervisor/Kabag</li>
                                    <li>Direktur Keuangan</li>
                                    <li>Presiden Direktur</li>
                                  </ol>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Unggah Surat Pernyataan</label>
                                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <div className="modal-footer d-flex flex-column">
                                    <a href="#ajukan">
                                      <Button className="btn-fill w-100 mt-3" variant="primary" onClick={() => handleFilepath(pinjaman.id_pinjaman)}>
                                          Simpan
                                      </Button>
                                    </a>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
          </Modal>
    </>
  );

  
}

export default Beranda;
