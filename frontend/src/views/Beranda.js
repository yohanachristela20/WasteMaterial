import React, { useEffect, useState } from "react";
import {FaSortDown, FaSortUp, FaRecycle, FaRegFileAlt, FaFolder, FaTrashAlt, FaExclamationTriangle} from 'react-icons/fa'; 
import ChartComponent from "components/Chart/BarChart.js";
import LineComponent from "components/Chart/LineChart";
import LineComponent2 from "components/Chart/LineChart2";
import BarChartComponent from "components/Chart/BarChart2";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "jspdf-autotable";
import 'chartist-plugin-tooltips';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css'; 
import 'chartist/dist/chartist.min.css'; 
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/dashboard3.png";
import "../assets/scss/lbd/_table-header.scss";
import "../assets/scss/lbd/_calendar.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Dropdown, 
  ButtonGroup,
  DropdownButton,
  Modal,
} from "react-bootstrap";

ChartJS.register(ArcElement, Tooltip, Legend);

function Beranda() {
  const history = useHistory(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState([]); 
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonthJual, setSelectedMonthJual] = useState("");
  const [selectedMonthScrap, setSelectedMonthScrap] = useState("");

  const [selectedDivisi, setSelectedDivisi] = useState("");
  const [selectedDivisiJual, setSelectedDivisiJual] = useState("");
  const [selectedDivisiScrap, setSelectedDivisiScrap] = useState("");

  const [chartDataTahunan, setChartDataTahunan] = useState({ labels: [], series: [[]] });
  const [chartDataBulanan, setChartDataBulanan] = useState({ labels: [], series: [[]] });
  const [chartScrappingBulanan, setChartScrappingBulanan] = useState({ labels: [], series: [[]], seriesNA: [[]], seriesAK: [[]] });
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [totalScrapping, setTotalScrapping] = useState(0);
  const [jumlahBelumDiproses, setJumlahBelumDiproses] = useState(0);
  const [jumlahPengajuanSelesai, setJumlahPengajuanSelesai] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id_pinjaman");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pengajuan, setPengajuan] = useState([]);
  const [penjualan, setPenjualan] = useState([]);
  const [penjualanData, setPenjualanData] = useState([]);
  const [deletedIDPengajuan, setDeletedIDPengajuan] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  
  

  const getPengajuan = async() => {
    try {
        const resp = await axios.get(`http://localhost:5001/pengajuan`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        setPengajuan(resp.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Unauthorized: Token is invalid or expired.");
      } else {
        console.error("Error fetching data:", error.message);
      }
    }
  };

  useEffect(() => {
    getPengajuan();
    setTimeout(() => setLoading(false), 1000);
  }, []);
  
  const filteredPengajuan = pengajuan
  .filter((item) => item.GeneratePengajuan?.status === "Belum Diproses" )
  .filter((dataPengajuan) => 
    (dataPengajuan.id_pengajuan && String(dataPengajuan.id_pengajuan).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.Pemohon?.divisi && String(dataPengajuan.Pemohon?.divisi).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.Pemohon?.nama && String(dataPengajuan.Pemohon?.nama).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.BarangDiajukan?.nama && String(dataPengajuan.BarangDiajukan?.nama).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.BarangDiajukan?.id_kategori && String(dataPengajuan.BarangDiajukan?.id_kategori).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.jumlah_barang && String(dataPengajuan.jumlah_barang).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.total && String(dataPengajuan.total).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.kondisi && String(dataPengajuan.kondisi).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.jenis_pengajuan && String(dataPengajuan.jenis_pengajuan).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.GeneratePengajuan?.status && String(dataPengajuan.GeneratePengajuan?.status).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.createdAt && String(dataPengajuan.createdAt).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.GeneratePengajuan?.Antrean?.nomor_antrean && String(dataPengajuan.GeneratePengajuan?.Antrean?.nomor_antrean).includes(searchQuery)) 
  );

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  };

  const sortedPengajuan = [...filteredPengajuan].sort((a, b) => {
    const aRaw = getNestedValue(a, sortBy) ?? "";
    const bRaw = getNestedValue(b, sortBy) ?? "";

    const aNum = (aRaw);
    const bNum = (bRaw);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    }

    const aStr = String(aRaw).toLowerCase();
    const bStr = String(bRaw).toLowerCase();
    if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
    if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPengajuan.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    getPenjualan();
    getPenjualanData();
    setTimeout(() => setLoading(false), 3000)
  }, []);


  const getPenjualan = async () =>{
    try {
      const response = await axios.get("http://localhost:5001/pengajuan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setPenjualan(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const getPenjualanData = async () =>{
    try {
      const response = await axios.get("http://localhost:5001/detail-pengajuan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
    });
    setPenjualanData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
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
  

  const dataPenjualan = async (selectedYear = "") => {
    try {
      const response = await axios.get("http://localhost:5001/data-penjualan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          year: selectedYear, 
        },
      });

      console.log("selectedYear:", selectedYear);
  
      const data = response.data;
      const labels = [];
      const seriesPenjualan = [];

      data.forEach((item) => {
        labels.push(item.divisi);
        const jumlahPenjualanScaled = Math.floor(item.total);
        seriesPenjualan.push(jumlahPenjualanScaled);
      });

      console.log("seriesPenjualan:", seriesPenjualan);
  
      if (labels.length > 0 && seriesPenjualan.length > 0) {
        setChartDataTahunan({
          labels: labels,
          series: [seriesPenjualan],
        });
      } else {
        setChartDataTahunan({
          labels: [],
          series: [[]],
        });
        console.error("Data kosong");
      }
    } catch (error) {
      console.error("Error fetching dataPenjualan:", error.message);
    }
  };

  const dataPerDivisi = async (selectedDivisi, selectedMonth = "", selectedYear = "") => {
    try {
        const tahun = selectedYear || new Date().getFullYear();
        const bulan = selectedMonth ? selectedMonth.padStart(2, '0') : "";
        const divisi = selectedDivisi || "";
        const isAllSelected = divisi === "" && bulan === "";

        const response = await axios.get("http://localhost:5001/data-divisi", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: isAllSelected ? {tahun} : {divisi, bulan, tahun},
        });

        const data = response.data;

        const labels = [];
        const seriesPenjualan = [];

        if (Array.isArray(data)) {
          data.forEach((item) => {
            labels.push(item.divisi);
            seriesPenjualan.push(Math.floor(item.total));
          });
        }

        setChartDataBulanan({
          labels: labels.length ? labels : [],
          series: [seriesPenjualan.length ? seriesPenjualan : []],
        });

    } catch (error) {
        console.error("Error fetching dataPerDivisi:", error.message);
        setChartDataBulanan({
            labels: [],
            series: [[]],
        });
    }
  };

  const groupBy = require("lodash/groupBy");

  const dataScrappingPerDivisi = async (selectedDivisi, selectedMonth = "", selectedYear = "") => {
    try {
      const tahun = selectedYear || new Date().getFullYear();
      const bulan = selectedMonth ? selectedMonth.padStart(2, '0') : "";
      const divisi = selectedDivisi || "";
      const isAllSelected = divisi === "" && bulan === "";

      const response = await axios.get("http://localhost:5001/data-scrapping-divisi", {
          headers: {
              Authorization: `Bearer ${token}`,
          },
          params: isAllSelected ? {tahun} : {divisi, bulan, tahun},
      });

      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        setChartScrappingBulanan({ labels: [], series: [[]], seriesNA: [[]], seriesAK: [[]] });
        return;
      }

      const grouped = groupBy(data, (x) => x.divisi);

      const labels = Object.keys(grouped); 
      const seriesAsset = [];
      const seriesNonAsset = [];
      const seriesKelapa = [];

      labels.forEach((div) => {
        const items = grouped[div];

        const asset = items
        .filter((x) => x.jenis_barang === "ASSET")
        .reduce((sum, x) => sum + x.jumlah_barang, 0);

        const nonAsset = items
        .filter((x) => x.jenis_barang === "NON-ASSET" && x.nama !== "AMPAS KELAPA (N)")
        .reduce((sum, x) => sum + x.jumlah_barang, 0);

        const ampasKelapa = items
        .filter((x) => x.jenis_barang === "NON-ASSET" && x.nama === "AMPAS KELAPA (N)")
        .reduce((sum, x) => sum + x.jumlah_barang, 0);

        
        seriesAsset.push(asset);
        seriesNonAsset.push(nonAsset);
        seriesKelapa.push(ampasKelapa);
      });

      setChartScrappingBulanan({
        labels: labels.length ? labels : [],
        series: [seriesAsset.length ? seriesAsset : []],
        seriesNA: [seriesNonAsset.length ? seriesNonAsset : []],
        seriesAK: [seriesKelapa.length ? seriesKelapa : []],
      });

       
    } catch (error) {
        console.error("Error fetching dataScrappingPerDivisi:", error.message);
        setChartScrappingBulanan({
            labels: [],
            series: [[]],
            seriesNA: [[]],
            seriesAK: [[]],
        });
    }
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get("http://localhost:5001/filter-penjualan-tahunan", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = response.data;
        const uniqueYears = [
          ...new Set(data.map((item) => new Date(item.createdAt).getFullYear())),
        ];
        setYears(uniqueYears.sort()); 
        // console.log("Fetched years:", uniqueYears);
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
          `http://localhost:5001/user-details/${username}`,
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    const fetchSummaryData = async () => {
      try {
        const [resTotalPenjualan, resTotalScrapping, resJumlahBelumDiproses, resPengajuanSelesai] = await Promise.all([
          axios.get("http://localhost:5001/total-penjualan", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5001/total-scrapping", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5001/jumlah-belum-diproses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5001/jumlah-pengajuan-selesai", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTotalPenjualan(resTotalPenjualan.data.totalPenjualan || 0);
        setTotalScrapping(resTotalScrapping.data.totalScrapping || 0);
        setJumlahBelumDiproses(resJumlahBelumDiproses.data.jumlahBelumDiproses || 0);
        setJumlahPengajuanSelesai(resPengajuanSelesai.data.jumlahPengajuanSelesai || 0);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };
  
    fetchYears();
    fetchUserData();
    fetchSummaryData();

    console.log("SELECTED YEAR:", selectedYear);
    dataPenjualan(selectedYear);
    dataPerDivisi();
    dataScrappingPerDivisi();
  }, [selectedYear]); 

  const handleProses = (pengajuan) => {
    history.push({
      pathname: "/admin/transaksi",
      state: {selectedPengajuan: pengajuan}
    });
  }

  const handleDetail = (pengajuan) => {
    history.push({
      pathname: "/admin/detail-pengajuan",
      state: {selectedPengajuan: pengajuan}
    });
  }

  const handleDokPengajuan = (pengajuan) => {
    history.push({
      pathname: "/admin/dok-pengajuan",
      state: {selectedPengajuan: pengajuan}
    });
  }

  const handleDokTransaksi = (pengajuan) => {
    history.push({
      pathname: "/admin/dok-transaksi",
      state: {selectedPengajuan: pengajuan}
    });
  }

  const handleBPBB = (pengajuan) => {
    history.push({
      pathname: "/admin/dok-bpbb",
      state: {selectedPengajuan: pengajuan}
    });
  }

  const handleDokSuratJalan = (pengajuan) => {
    history.push({
      pathname: "/admin/dok-surat-jalan",
      state: {selectedPengajuan: pengajuan}
    });
  }

   const handleDeletePengajuan = (id_pengajuan) => {
    setDeletedIDPengajuan(id_pengajuan);
    setShowModal(true);
  };

  const deletePengajuan = async() =>{
      try {
        await axios.delete(`http://localhost:5001/delete-pengajuan/${deletedIDPengajuan}`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
        ); 
        setShowModal(false);
        toast.success("Data Pengajuan berhasil dihapus.", {
          position: "top-right",
          autoClose: 5001,
          hideProgressBar: true,
        });
        getPengajuan(); 
      } catch (error) {
        console.log(error.message); 
      }
  };

  const findNomorAntrean = (id_pengajuan) => {
    const antreanItem = pengajuan.find(item => item.id_pengajuan === id_pengajuan);
    return antreanItem ? antreanItem?.GeneratePengajuan?.Antrean?.nomor_antrean : "-"; 
  };

  const isPreviousAccepted = (nomorAntrean) => {
    for (let i = 1; i < nomorAntrean; i++) {
      const prevItem = pengajuan.find(item => item.GeneratePengajuan?.Antrean?.nomor_antrean === i); 
      if (prevItem && prevItem.GeneratePengajuan?.status !== "Selesai") {
        return false;
      }
    }
    return true;
  };



  return (
    <>
      {loading === false ? 
        (<div className="App">
        <div className="home-card">
          <div className="card-content">
            <h2 className="card-title">Hai, {userData.nama}!</h2>
            <h4 className="card-subtitle">Siap memproses pengajuan waste material hari ini?</h4><hr/>
            <p className="text-danger mb-0">*Sistem akan logout secara otomatis dalam 5 menit jika tidak terdapat aktifitas dalam sistem.</p>
          </div>
          <div className="card-opening w-25">
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
                  <Card.Title as="h4">Hasil Penjualan Tahunan</Card.Title>
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
                          dataPenjualan(e.target.value); 
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
            <Col md="6">
              <Card className="mb-2 mb-lg-4">
              <Card.Header>
                <Card.Title as="h4">Hasil Penjualan Bulanan</Card.Title>
              </Card.Header>
              <Card.Body className="mb-5">
                <div className="ct-chart" id="chartHours">
                <div className="mt-3">
                  <label htmlFor="yearSelect">Tahun:</label>
                  <span className="year-label ml-2" onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setSelectedYear(currentYear);
                    dataPerDivisi(selectedDivisiJual, selectedMonthJual, currentYear);
                  }}>
                    {new Date().getFullYear()}
                  </span>
                </div>

                <div>
                  <label htmlFor="monthSelect" className="mb-3">Pilih Bulan:</label>
                  <select
                    id="monthSelect"
                    value={selectedMonthJual}
                    onChange={(e) => {
                      setSelectedMonthJual(e.target.value);
                      dataPerDivisi(selectedDivisi, e.target.value, selectedYear);
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
                    <label htmlFor="divisiSelect">Pilih Divisi:</label>
                    <select
                      id="divisiSelect"
                      value={selectedDivisiJual}
                      onChange={(e) => {
                        setSelectedDivisiJual(e.target.value);
                        dataPerDivisi(e.target.value); 
                      }}
                      className="mx-2"
                    >
                      <option value="">Semua Divisi</option>
                      <option value="DIREKSI">DIREKSI</option>
                      <option value="PURCHASING">PURCHASING</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="LOGISTIC">LOGISTIC</option>
                      <option value="ACCOUNTING">ACCOUNTING</option>
                      <option value="TAX">TAX</option>
                      <option value="FREEZER MANAGEMENT">FREEZER MANAGEMENT</option>
                      <option value="PRODUCT COST">PRODUCT COST</option>
                      <option value="DELIVERY VAN REPAIR">DELIVERY VAN REPAIR</option>
                      <option value="INTERNAL AUDIT">INTERNAL AUDIT</option>
                      <option value="PRODUCTION">PRODUCTION</option>
                      <option value="PPC">PPC</option>
                      <option value="R&D">R&D</option>
                      <option value="QC">QC</option>
                      <option value="QS">QS</option>
                      <option value="MARKETING OPERATIONAL">MARKETING OPERATIONAL</option>
                      <option value="IT SUPPORT">IT SUPPORT</option>
                      <option value="HR & GENERAL AFFAIR">HR & GENERAL AFFAIR</option>
                      <option value="TEKNIK & ADM. MEKANIK">TEKNIK & ADM. MEKANIK</option>
                    </select>
                  </div>

                  <LineComponent chartData={chartDataBulanan}/>
                </div>
              </Card.Body>
              </Card>
            </Col>
            <Col md="6">
              <Card className="mb-2 mb-lg-4">
              <Card.Header>
                <Card.Title as="h4">Scrapping</Card.Title>
              </Card.Header>
              <Card.Body className="mb-5">
                <div className="ct-chart" id="chartHours">
                <div className="mt-3">
                  <label htmlFor="yearSelect">Tahun:</label>
                  <span className="year-label ml-2" onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setSelectedYear(currentYear);
                    dataScrappingPerDivisi(selectedDivisiScrap, selectedMonthScrap, currentYear);
                  }}>
                    {new Date().getFullYear()}
                  </span>
                </div>

                <div>
                  <label htmlFor="monthSelect" className="mb-3">Pilih Bulan:</label>
                  <select
                    id="monthSelect"
                    value={selectedMonthScrap}
                    onChange={(e) => {
                      setSelectedMonthScrap(e.target.value);
                      dataScrappingPerDivisi(selectedDivisi, e.target.value, selectedYear);
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
                    <label htmlFor="divisiSelect">Pilih Divisi:</label>
                    <select
                      id="divisiSelect"
                      value={selectedDivisiScrap}
                      onChange={(e) => {
                        setSelectedDivisiScrap(e.target.value);
                        dataScrappingPerDivisi(e.target.value); 
                      }}
                      className="mx-2"
                    >
                      <option value="">Semua Divisi</option>
                      <option value="DIREKSI">DIREKSI</option>
                      <option value="PURCHASING">PURCHASING</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="LOGISTIC">LOGISTIC</option>
                      <option value="ACCOUNTING">ACCOUNTING</option>
                      <option value="TAX">TAX</option>
                      <option value="FREEZER MANAGEMENT">FREEZER MANAGEMENT</option>
                      <option value="PRODUCT COST">PRODUCT COST</option>
                      <option value="DELIVERY VAN REPAIR">DELIVERY VAN REPAIR</option>
                      <option value="INTERNAL AUDIT">INTERNAL AUDIT</option>
                      <option value="PRODUCTION">PRODUCTION</option>
                      <option value="PPC">PPC</option>
                      <option value="R&D">R&D</option>
                      <option value="QC">QC</option>
                      <option value="QS">QS</option>
                      <option value="MARKETING OPERATIONAL">MARKETING OPERATIONAL</option>
                      <option value="IT SUPPORT">IT SUPPORT</option>
                      <option value="HR & GENERAL AFFAIR">HR & GENERAL AFFAIR</option>
                      <option value="TEKNIK & ADM. MEKANIK">TEKNIK & ADM. MEKANIK</option>
                    </select>
                  </div>

                  <BarChartComponent chartData={chartScrappingBulanan}/>
                </div>
              </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md="12" className="mt-2">
              <Card className="p-3 striped-tabled-with-hover mt-2">
                <Card.Header>
                  <Card.Title as="h4" className="mb-4"><strong>Data Pengajuan Barang Bekas</strong></Card.Title>
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                  <Col md="12">
                    <Table className="table-hover table-striped">
                      <div className="table-scroll" style={{ height:'auto' }}>
                        <table className="flex-table table table-striped table-hover">
                          <thead>
                            <tr>
                              <th className="border-0" onClick={() => handleSort("GeneratePengajuan.Antrean.nomor_antrean")}>No. Antrean {sortBy === "GeneratePengajuan.Antrean.nomor_antrean" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0" onClick={() => handleSort("id_pengajuan")}>ID Pengajuan {sortBy === "id_pengajuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0"onClick={() => handleSort("Pemohon.nama")}>Pemohon {sortBy === "Pemohon.nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0" onClick={() => handleSort("Pemohon.divisi")}>Divisi {sortBy === "Pemohon.divisi" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0" onClick={() => handleSort("jenis_pengajuan")}>Jenis Pengajuan {sortBy === "jenis_pengajuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0" onClick={() => handleSort("GeneratePengajuan.status")}>Status {sortBy === "GeneratePengajuan.status" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0" onClick={() => handleSort("createdAt")}>Diajukan {sortBy === "createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                              <th className="border-0">Aksi</th>   
                            </tr>
                          </thead>
                          <tbody className="scroll scroller-tbody">
                            {currentItems
                            .map((pengajuan) => (
                              <tr key={pengajuan.id_pengajuan}>
                                <td className="text_center">{pengajuan.GeneratePengajuan?.Antrean?.nomor_antrean}</td>
                                <td className="text_center">{pengajuan.id_pengajuan}</td>
                                <td className="text_center">{pengajuan.Pemohon?.nama}</td>
                                <td className="text_center">{pengajuan.Pemohon?.divisi}</td>
                                <td className="text_center">{pengajuan.jenis_pengajuan}</td>
                                <td className="text_center">
                                  {pengajuan.GeneratePengajuan?.status === "Belum Diproses" ? (
                                    <Badge pill bg="danger" text="light" className="p-2">Belum Diproses</Badge>
                                  ) : pengajuan.GeneratePengajuan?.status ? (
                                    <Badge pill bg="success" text="light" className="p-2">Selesai</Badge>
                                  ) : null}
                                </td>
                                <td className="text_center">{new Date(pengajuan.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">
                                  <Button 
                                    className="btn-fill pull-right mt-2 warning btn-reset" 
                                    variant="warning" 
                                    onClick={() => handleProses(pengajuan)} 
                                    style={{ width: 103, fontSize: 14 }} 
                                    disabled={pengajuan.GeneratePengajuan?.status === "Selesai"||
                                      !isPreviousAccepted(findNomorAntrean(pengajuan.id_pengajuan))
                                    }
                                    hidden={pengajuan.GeneratePengajuan?.status === "Selesai"}
                                  >
                                    <FaRecycle style={{ marginRight: '8px' }} />
                                    Proses
                                  </Button>
                                  <Button className="btn-fill pull-right info mt-2 btn-reset" variant="info" onClick={() => handleDetail(pengajuan)} style={{ width: 103, fontSize: 14 }}>
                                    <FaRegFileAlt style={{ marginRight: '8px' }} />
                                    Detail
                                  </Button>
                                  <ButtonGroup vertical>
                                    <DropdownButton className="pull-right primary mt-2 btn-reset w-75" as={ButtonGroup} variant="primary btn-fill"  title={<span style={{fontSize: 14}}><FaFolder style={{ marginRight: '8px', marginBottom: '2px' }}/>Dokumen</span>} id="bg-vertical-dropdown-1">
                                    {pengajuan.jenis_pengajuan === "Penjualan" || pengajuan.jenis_pengajuan === "PENJUALAN"? 
                                      (
                                        <>
                                          <Dropdown.Item eventKey="1" onClick={() => handleDokPengajuan(pengajuan)}>Pengajuan</Dropdown.Item>
                                          <Dropdown.Item eventKey="2" onClick={() => handleDokTransaksi(pengajuan)} hidden={pengajuan.GeneratePengajuan?.status === "Belum Diproses"}>Penjualan</Dropdown.Item>
                                          <Dropdown.Item eventKey="2" onClick={() => handleBPBB(pengajuan)} hidden={pengajuan.GeneratePengajuan?.status === "Belum Diproses"}>BPBB</Dropdown.Item>
                                          <Dropdown.Item eventKey="2" onClick={() => handleDokSuratJalan(pengajuan)} hidden={pengajuan.GeneratePengajuan?.status === "Belum Diproses"}>Surat Jalan</Dropdown.Item>
                                        </>  
                                      ) : (
                                        <>
                                          <Dropdown.Item eventKey="1" onClick={() => handleDokPengajuan(pengajuan)}>Pengajuan</Dropdown.Item>
                                          <Dropdown.Item eventKey="2" onClick={() => handleDokTransaksi(pengajuan)} hidden={pengajuan.GeneratePengajuan?.status === "Belum Diproses"}>Scrapping</Dropdown.Item>
                                          <Dropdown.Item eventKey="2" onClick={() => handleDokSuratJalan(pengajuan)} hidden={pengajuan.GeneratePengajuan?.status === "Belum Diproses"}>Surat Jalan</Dropdown.Item>
                                        </>  
                                      )
                                    }
                                    </DropdownButton>
                                  </ButtonGroup>
                                  <Button className="btn-fill pull-right danger mt-2 btn-reset" variant="danger" onClick={() => handleDeletePengajuan(pengajuan.id_pengajuan)} style={{ width: 100, fontSize: 13 }}>
                                    <FaTrashAlt style={{ marginRight: '8px' }} />
                                    Hapus
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Table>
                  </Col>
                </Card.Body>
              </Card>
              <div className="pagination-container">
              <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={filteredPengajuan.length}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange}
                    itemClass="page-item"
                    linkClass="page-link"
              />
              </div>
            </Col>
          </Row>

        </Container>

        <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-warning">
          <Modal.Header style={{borderBottom: "none"}}>
            <FaExclamationTriangle style={{ width:"100%", height:"60px", position: "relative", textAlign:"center", marginTop:"20px"}} color="#ffca57ff"/>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                &times; {/* Simbol 'x' */}
              </button>
          </Modal.Header>
          <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}} >Yakin ingin menghapus data pengajuan?</Modal.Body>
          <Row className="mb-3">
            <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
              <Button variant="danger" onClick={() => setShowModal(false)}>
                Tidak
              </Button>
            </Col>
            <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
              <Button variant="success" onClick={() => deletePengajuan(pengajuan.id_pengajuan)}>
                Ya
              </Button> 
            </Col>
          </Row>
        </Modal>
        </div>
        ):
        ( <>
            <div className="App-loading">
              <ReactLoading type="spinningBubbles" color="#fb8379" height={150} width={150}/>
              <span style={{paddingTop:'100px'}}>Loading...</span>
            </div>
          </>
        )}
    </>
  );

  
}

export default Beranda;
