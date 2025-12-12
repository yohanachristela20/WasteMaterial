import React, { useEffect, useState } from "react";
import {FaFilePdf, FaFileImport, FaTrashAlt, FaHandHoldingUsd, FaRecycle, FaRegFileAlt, FaFolder, FaSortUp, FaSortDown, FaMoneyBillWave, FaHourglassStart, FaClipboardCheck, FaExclamationTriangle, FaFileExcel } from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import {toast } from 'react-toastify';
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";
import * as XLSX from 'sheetjs-style';

import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  DropdownButton,
  ButtonGroup, 
  Dropdown,
  Modal,
  Form
} from "react-bootstrap";

 function DataPengajuan() {
  const history = useHistory();
  const [pengajuan, setPengajuan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [totalScrapping, setTotalScrapping] = useState(0);
  const [jumlahBelumDiproses, setJumlahBelumDiproses] = useState(0);
  const [jumlahPengajuanSelesai, setJumlahPengajuanSelesai] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [showModal, setShowModal] = useState(false); 
  const [deletedIDPengajuan, setDeletedIDPengajuan] = useState(null);
  const [detailTransaksi, setDetailTransaksi] = useState([]);
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [tanggal_awal, setTanggalAwal] = useState("");
  const [tanggal_akhir, setTanggalAkhir] = useState("");
  const [tanggalError, setTanggalError] = useState(false);
  const [tanggal_awal_scrapping, setTanggalAwalScrap] = useState("");
  const [tanggal_akhir_scrapping, setTanggalAkhirScrap] = useState("");
  const [tglScrapError, setTglScrapError] = useState(false);
  const [showDownloadScrap, setShowDownloadScrapping] = useState(false);
  const [antrean, setAntrean] = useState([]); 
  const [error, setError] = useState("");
    

  let counter = 1;
  let counterAsset = 1;
  let counterKelapa = 1;
  let counterScrap = 1;

  // const tanggalAwalPenjualan = new Date(tanggal_awal);
  // const formattedSDatePenjualan = tanggalAwalPenjualan.toLocaleString('id-ID', {
  //   year: 'numeric', 
  //   month: 'short', 
  //   day: '2-digit',
  // });

  const formattedSDatePenjualan = (tanggal_awal) => {
    if (tanggal_awal && !isNaN(new Date(tanggal_awal).getTime())) {
      return new Date(tanggal_awal).toLocaleString('id-ID', {
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
      });
    }
    return '-';
  };

  const formattedSDateScrapping = (tanggal_awal_scrapping) => {
    if (tanggal_awal_scrapping && !isNaN(new Date(tanggal_awal_scrapping).getTime())) {
      return new Date(tanggal_awal_scrapping).toLocaleString('id-ID', {
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
      });
    }
    return '-';
  };

  // const tanggalAkhirPenjualan = new Date(tanggal_akhir);
  // const formattedEDatePenjualan = tanggalAkhirPenjualan.toLocaleString('id-ID', {
  //   year: 'numeric', 
  //   month: 'short', 
  //   day: '2-digit',
  // });

  const formattedEDatePenjualan = (tanggal_akhir) => {
    if (tanggal_akhir && !isNaN(new Date(tanggal_akhir).getTime())) {
      return new Date(tanggal_akhir).toLocaleString('id-ID', {
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
      });
    }
    return '-';
  };


  const formattedEDateScrapping = (tanggal_akhir_scrapping) => {
    if (tanggal_akhir_scrapping && !isNaN(new Date(tanggal_akhir_scrapping).getTime())) {
      return new Date(tanggal_akhir_scrapping).toLocaleString('id-ID', {
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
      });
    }
    return '-';
  };

  const token = localStorage.getItem("token");

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
  

  useEffect(() => {
    const getDetailTransaksi = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5001/detail-transaksi`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDetailTransaksi(resp.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const getDetailPengajuan = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5001/detail-pengajuan`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDetailPengajuan(Array.isArray(resp.data) ? resp.data : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
      getDetailTransaksi();
      getDetailPengajuan();
  }, [token]);

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

  const toNumber = (val) => {
    if (val == null || val === "") return 0;
    const n = Number(val);
    if (!isNaN(n)) return n;
    const parsed = parseFloat(String(val).replace(/\s/g, "").replace(/,/g, "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  let penjualanNonAsset;
  let penjualanAsset
  let penjualanAmpasKelapa;

  if (tanggal_akhir !== "" && tanggal_awal !== "") {
    // GROUP TOTAL BY ID PENGAJUAN - NON ASSET 
    penjualanNonAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
      const dateObject = new Date(item.createdAt);
      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const day = String(dateObject.getDate()).padStart(2, '0'); 
      const formattedDate = `${year}-${month}-${day}`;

      const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
      return checkDate;
    })
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});

    // GROUP TOTAL BY ID PENGAJUAN - ASSET 
    penjualanAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
      const dateObject = new Date(item.createdAt);
      //console.log("dateObject:", dateObject);

      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const day = String(dateObject.getDate()).padStart(2, '0'); 
      const formattedDate = `${year}-${month}-${day}`;

      // console.log("formattedDate:", formattedDate);

      const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
      return checkDate;
    })
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});

    // GROUP TOTAL BY ID PENGAJUAN - AMPAS KELAPA
    penjualanAmpasKelapa = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
          const dateObject = new Date(item.createdAt);
          //console.log("dateObject:", dateObject);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          // console.log("formattedDate:", formattedDate);

          const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
          return checkDate;
        })
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});

  } else {
    // GROUP TOTAL BY ID PENGAJUAN - NON ASSET 
    penjualanNonAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});

    // GROUP TOTAL BY ID PENGAJUAN - ASSET 
    penjualanAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});

    // GROUP TOTAL BY ID PENGAJUAN - AMPAS KELAPA
    penjualanAmpasKelapa = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      const id = item.id_pengajuan;
      if(!acc[id]) acc[id] = { totalPerID: 0 }; 
      acc[id].totalPerID += Number(item.total) || 0;
      return acc;
    }, {});
  }

  let byDateNonAsset;
  let byDateAsset;
  let byDateKelapa;

  if (tanggal_akhir !== "" && tanggal_awal !== "") {
    //GROUP TOTAL BY DATE - NON ASSET 
    byDateNonAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
      const dateObject = new Date(item.createdAt);

      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const day = String(dateObject.getDate()).padStart(2, '0'); 
      const formattedDate = `${year}-${month}-${day}`;

      const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
      return checkDate;
    })
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});

    // GROUP TOTAL BY DATE - ASSET 
    byDateAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
          const dateObject = new Date(item.createdAt);
          //console.log("dateObject:", dateObject);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          // console.log("formattedDate:", formattedDate);

          const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
          return checkDate;
        })
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});

    //GROUP TOTAL BY DATE - AMPAS KELAPA 
    byDateKelapa = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .filter(item => {
      const dateObject = new Date(item.createdAt);
      //console.log("dateObject:", dateObject);

      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const day = String(dateObject.getDate()).padStart(2, '0'); 
      const formattedDate = `${year}-${month}-${day}`;

      // console.log("formattedDate:", formattedDate);

      const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
      return checkDate;
    })
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});
  } else {
    //GROUP TOTAL BY DATE - NON ASSET 
    byDateNonAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});

    // GROUP TOTAL BY DATE - ASSET 
    byDateAsset = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});

    //GROUP TOTAL BY DATE - AMPAS KELAPA 
    byDateKelapa = detailPengajuan
    .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
    .reduce((acc, item) => {
      if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN" ) return acc;

      const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
      const dateStr = related?.createdAt
        ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
        : "";

      if (!dateStr) return acc;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalPerDay: 0,
          items: []
        };
      }

      acc[dateStr].totalPerDay += toNumber(item.total);
      acc[dateStr].items.push(item.id_pengajuan);

      return acc;
    }, {});
  }

  //SUB TOTAL PER DAY - NON ASSET 
  const subTotalNonAsset = Object.values(byDateNonAsset)
  .reduce((sum, d) => sum + (Number(d.totalPerDay) || 0), 0);

  // console.log("subTotalNonAsset:", subTotalNonAsset);

  // SUB TOTAL PER DAY - AMPAS KELAPA
  const subTotalKelapa = Object.values(byDateKelapa)
  .reduce((sum, d) => sum + (Number(d.totalPerDay) || 0), 0);

  // console.log("subTotalKelapa:", subTotalKelapa);




  // SUB TOTAL PER DAY - ASSET
  const subTotalAsset = Object.values(byDateAsset)
  .reduce((sum, d) => sum + (Number(d.totalPerDay) || 0), 0);

  // console.log("subTotalAsset:", subTotalAsset);

  //GRAND TOTAL 
  const grandTotal = subTotalNonAsset + subTotalAsset + subTotalKelapa;



  const exportToExcel = () => {
    const titleHeaders = ["LAPORAN PENJUALAN WASTE MATERIAL"];
    const subTitleHeaders = [`PERIODE: ${formattedSDatePenjualan(tanggal_awal)} s/d ${formattedEDatePenjualan(tanggal_akhir)}`];
    const headers = ["NO", "TANGGAL","NO BPBB", "ID KATEGORI", "DESKRIPSI KATEGORI", "QTY", "UOM", "HARGA PER UOM", "JUMLAH", "TOTAL", "TOTAL PER DAY", "DIVISI", "PEMBELI", "KETERANGAN"];
    let nonAssetGroups;
    let assetGroups;
    let ampasKelapaGroups;

    // const currentDate = related?.createdAt
    // ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
    // : "";

    const grandTotalData = [
      {NO: 1, DESKRIPSI:"Non-Asset", TOTAL: subTotalNonAsset }, 
      {NO: 2, DESKRIPSI:"Asset", TOTAL: subTotalAsset }, 
      {NO: 3, DESKRIPSI:"Ampas Kelapa", TOTAL: subTotalKelapa }, 
      {NO: "", DESKRIPSI: "Grand Total", TOTAL: grandTotal},
    ];


    if (tanggal_akhir !== "" && tanggal_awal !== "") {
      nonAssetGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
        .filter(item => {
          const dateObject = new Date(item.createdAt);
          //console.log("dateObject:", dateObject);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          // console.log("formattedDate:", formattedDate);

          const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
          return checkDate;
        })
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});

      assetGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
        .filter(item => {
          const dateObject = new Date(item.createdAt);
          //console.log("dateObject:", dateObject);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          // console.log("formattedDate:", formattedDate);

          const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
          return checkDate;
        })
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});

      
       ampasKelapaGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
        .filter(item => {
          const dateObject = new Date(item.createdAt);
          //console.log("dateObject:", dateObject);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          // console.log("formattedDate:", formattedDate);

          const checkDate = formattedDate >= tanggal_awal && formattedDate <= tanggal_akhir;
          return checkDate;
        })
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});
    } else {
      nonAssetGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() !== "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});

      assetGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "ASSET" && item?.GeneratePengajuan?.status === "Selesai")
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});

      ampasKelapaGroups = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
        .filter(item => String(item?.BarangDiajukan?.KategoriBarang?.jenis_barang).toUpperCase() === "NON-ASSET" && String(item?.BarangDiajukan?.KategoriBarang?.nama).toUpperCase() === "AMPAS KELAPA (N)" && item?.GeneratePengajuan?.status === "Selesai")
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});
    }


    const rowsNonAsset = [];
    const rowsAsset = [];
    const rowsAmpasKelapa = [];

    const mergesNonAsset = [];
    const mergesAsset = [];
    const mergesAmpasKelapa = [];

    let sheetRowNonAsset = 3; 
    let sheetRowAsset = 3;
    let sheetRowAmpasKelapa = 3;

    const dateFirstNonAsset = {};
    const dateFirstAsset = {};
    const dateFirstKelapa = {};

    const dateLastAsset = {}; 
    const dateLastNonAsset = {};
    const dateLastKelapa = {};

    //Sheet 1 - Non Asset
    Object.keys(nonAssetGroups).forEach((id_pengajuan) => {
      const items = nonAssetGroups[id_pengajuan];
      const firstRowNonAsset = sheetRowNonAsset;

      items.forEach((item, index) => {
        const isFirstRow = index === 0;
        const totalPerID = isFirstRow ? penjualanNonAsset[id_pengajuan]?.totalPerID : "";
        const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
        const createdAtFull = related.createdAt
          ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
          : "";
        const dateStr = related?.createdAt
          ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
          : "";

        if (dateStr) {
          if (!dateFirstNonAsset[dateStr]) dateFirstNonAsset[dateStr] = sheetRowNonAsset;
          dateLastNonAsset[dateStr] = sheetRowNonAsset;
        }

        const idTransaksi = related.id_transaksi || "";
        const pembeli = related.VendorPenjualan?.nama || "";
        const keterangan = related.keterangan || "";
        // const no = index + 1;

        const totalPerDay = Number(byDateNonAsset[dateStr]?.totalPerDay) || 0;
        const showTotalPerDay = dateStr && dateFirstNonAsset[dateStr] === sheetRowNonAsset;
        // console.log("totalPerDay Non-asset:", totalPerDay);

        const hargaBarang = Number(item?.BarangDiajukan?.KategoriBarang?.harga_barang) || 0;
        const jumlah = Number(item?.total) || 0;

        rowsNonAsset.push([
          // no,
          isFirstRow ? counter : "",
          createdAtFull,
          idTransaksi,
          item.BarangDiajukan?.id_kategori || "",
          item.BarangDiajukan?.KategoriBarang?.nama || "",
          Number(item.jumlah_barang) || "",
          item.BarangDiajukan?.KategoriBarang?.satuan || "",
          hargaBarang,
          jumlah,          
          totalPerID,            
          showTotalPerDay ? totalPerDay : "", 
          item.Pemohon?.divisi || "",
          pembeli,                  
          keterangan,              
        ]);

        sheetRowNonAsset++;


      });


      const lastRowNonAsset = sheetRowNonAsset - 1;
      if (items.length > 1) {
        const colsToMerge = [0, 1, 2, 9, 11, 12];
        colsToMerge.forEach((col) => {
          mergesNonAsset.push({
            s: { r: firstRowNonAsset, c: col },
            e: { r: lastRowNonAsset, c: col }
          });
        });
      }
      counter++;
    });

    if (subTotalNonAsset !== 0) {
      rowsNonAsset.push([
        "", "", "", "", "", "", "", "", "",
        "SUB TOTAL: ", 
        subTotalNonAsset, 
        "", 
        "",
      ]);
    } else {
      ""
    }

    Object.keys(dateFirstNonAsset).forEach((dateStr) => {
      const sRow = dateFirstNonAsset[dateStr];
      const eRow = dateLastNonAsset[dateStr];
      if (sRow !== undefined && eRow !== undefined && eRow > sRow) {
        mergesNonAsset.push({
          s: { r: sRow, c: 10 },
          e: { r: eRow, c: 10 }
        });
      }
    });

    const allNonAsset = [titleHeaders, subTitleHeaders, headers, ...rowsNonAsset];
    const wsNonAsset = XLSX.utils.aoa_to_sheet(allNonAsset);

    const borderStyle = {
      style: "thin", 
      color: { rgb: "FF000000" }
    };


    // rowsNonAsset.forEach((row, i) => {
    //   const excelRow = i + 2;
    //   const numericCols = [4,6,7,9];
    //   numericCols.forEach(col => {
    //     const cellAddr = XLSX.utils.encode_cell({r: excelRow, c: col});
    //     const cell = wsNonAsset[cellAddr];
    //     if (!cell) return;

    //     cell.t = "n";
    //     cell.v = Number(cell.v);
    //   })
    // });

    const titleMerge = { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } };
    const subTitleMerge = { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } };

    wsNonAsset['!merges'] = [titleMerge, subTitleMerge, ...mergesNonAsset];

    headers.forEach((_, colIndex) => {
      const cellTitle = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      const cellSubTitle = XLSX.utils.encode_cell({ r: 1, c: colIndex });
      const cellHeaders = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      if (wsNonAsset[cellHeaders]) {
        wsNonAsset[cellHeaders].s = {
          fill: {
            fgColor: { rgb: "62f740" } 
          }, 
          alignment: {
            horizontal: "center",
          },
          font: {
            bold: true,
          },
          border: {
            top: borderStyle, 
            bottom: borderStyle, 
            left: borderStyle, 
            right: borderStyle,
          },
        };
      }
      if (wsNonAsset[cellTitle]) {
        wsNonAsset[cellTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 14,
          },
        }
      }
      if (wsNonAsset[cellSubTitle]) {
        wsNonAsset[cellSubTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 12,
          },
        }
      }
    });

    const grandTotalNAIndex = rowsNonAsset.length + 2;
    const cellAddr = XLSX.utils.encode_cell({r: grandTotalNAIndex, c: 10});
    const cell = wsNonAsset[cellAddr];
    const labelGrandTotalNA = rowsNonAsset.length + 2;
    const cellLabelTotalNA = XLSX.utils.encode_cell({r: labelGrandTotalNA, c: 9});
    const cellLabelNA = wsNonAsset[cellLabelTotalNA];

    if(cell && subTotalNonAsset !== 0) {
      cell.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "right", 
          vertical: "right",
        },
      }
    } 
    
    if(cellLabelNA && subTotalNonAsset !== 0) {
      cellLabelNA.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "left", 
          vertical: "left",
        }
      }
    }


    // Sheet 2 - Asset 
    Object.keys(assetGroups).forEach((id_pengajuan) => {
      const items = assetGroups[id_pengajuan];
      const firstRowAsset = sheetRowAsset;

      items.forEach((item, index) => {
        const isFirstRow = index === 0;
        const totalPerID = isFirstRow ? penjualanAsset[id_pengajuan]?.totalPerID : "";
        const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
        const createdAtFull = related.createdAt
          ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
          : "";
        const dateStr = related?.createdAt
          ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
          : "";

        if (dateStr) {
          if (!dateFirstAsset[dateStr]) dateFirstAsset[dateStr] = sheetRowAsset;
          dateLastAsset[dateStr] = sheetRowAsset;
        }

        const idTransaksi = related.id_transaksi || "";
        const pembeli = related.VendorPenjualan?.nama || "";
        const keterangan = related.keterangan || "";

        const totalPerDayAsset = Number(byDateAsset[dateStr]?.totalPerDay) || 0;
        // console.log("totalPerDayAsset:", totalPerDayAsset);

        const showTotalPerDayAsset = dateStr && dateFirstAsset[dateStr] === sheetRowAsset;

        const hargaBarang = Number(item?.BarangDiajukan?.KategoriBarang?.harga_barang) || 0;
        const jumlah = Number(item?.total) || 0;

        rowsAsset.push([
          isFirstRow ? counterAsset : "",
          createdAtFull,
          idTransaksi,
          item.BarangDiajukan?.id_kategori || "",
          item.BarangDiajukan?.KategoriBarang?.nama || "",
          Number(item.jumlah_barang) || "",
          item.BarangDiajukan?.KategoriBarang?.satuan || "",
          hargaBarang,
          jumlah,          
          totalPerID,            
          showTotalPerDayAsset ? totalPerDayAsset : "", 
          item.Pemohon?.divisi || "",
          pembeli,                  
          keterangan,              
        ]);

        sheetRowAsset++;
      });

      const lastRowAsset = sheetRowAsset - 1;
      if (items.length > 1) {
        const colsToMerge = [0, 1, 2, 9, 11, 12];
        colsToMerge.forEach((col) => {
          mergesAsset.push({
            s: { r: firstRowAsset, c: col },
            e: { r: lastRowAsset, c: col }
          });
        });
      }
      counterAsset++;
    });

    if (subTotalAsset !== 0) {
      rowsAsset.push([
        "", "", "", "", "", "", "", "", "", 
        "SUB TOTAL: ", 
        subTotalAsset, 
        "", 
        "",
      ]);
    } else {
      ""
    }

    Object.keys(dateFirstAsset).forEach((dateStr) => {
      const sRow = dateFirstAsset[dateStr];
      const eRow = dateLastAsset[dateStr];
      if (sRow !== undefined && eRow !== undefined && eRow > sRow) {
        mergesAsset.push({
          s: { r: sRow, c: 10 },
          e: { r: eRow, c: 10 }
        });
      }
    });

    const allAsset = [titleHeaders, subTitleHeaders, headers, ...rowsAsset];
    const wsAsset = XLSX.utils.aoa_to_sheet(allAsset);

    // rowsAsset.forEach((row, i) => {
    //   const excelRow = i + 2;
    //   const numericCols = [4,6,7,8,9];
    //   numericCols.forEach(col => {
    //     const cellAddr = XLSX.utils.encode_cell({r: excelRow, c: col});
    //     const cell = wsAsset[cellAddr];
    //     if (!cell) return;

    //     cell.t = "n";
    //     cell.v = Number(cell.v);
    //   })
    // });


    wsAsset['!merges'] = [titleMerge, subTitleMerge, ...mergesAsset];

    headers.forEach((_, colIndex) => {
      const cellTitle = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      const cellSubTitle = XLSX.utils.encode_cell({ r: 1, c: colIndex });
      const cellHeaders = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      if (wsAsset[cellHeaders]) {
        wsAsset[cellHeaders].s = {
          fill: {
            fgColor: { rgb: "5594fa" } 
          }, 
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
          }, 
          border: {
            top: borderStyle, 
            bottom: borderStyle, 
            left: borderStyle, 
            right: borderStyle,
          },
        };
      }
      if (wsAsset[cellTitle]) {
        wsAsset[cellTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 14,
          }
        }
      }
      if (wsAsset[cellSubTitle]) {
        wsAsset[cellSubTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 12,
          }
        }
      }
    });

    const grandTotalAIndex = rowsAsset.length + 2;
    const cellAddrAsset = XLSX.utils.encode_cell({r: grandTotalAIndex, c: 10});
    const cellAsset = wsAsset[cellAddrAsset];
    const labelTotalAsset = rowsAsset.length + 2;
    const cellLabelTotalA = XLSX.utils.encode_cell({r: labelTotalAsset, c: 9});
    const cellLabelA = wsAsset[cellLabelTotalA];

    if(cellAsset && subTotalAsset !== 0) {
      cellAsset.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "right", 
          vertical: "right",
        },
      }
    } 
    
    if(cellLabelA && subTotalAsset !== 0) {
      cellLabelA.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "left", 
          vertical: "left",
        }
      }
    }

    //Sheet 3 - Ampas Kelapa
    Object.keys(ampasKelapaGroups).forEach((id_pengajuan) => {
      const items = ampasKelapaGroups[id_pengajuan];
      const firstRowKelapa = sheetRowAmpasKelapa;

      items.forEach((item, index) => {
        const isFirstRow = index === 0;
        const totalPerID = isFirstRow ? penjualanAmpasKelapa[id_pengajuan]?.totalPerID : "";
        const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
        const createdAtFull = related.createdAt
          ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
          : "";
        const dateStr = related?.createdAt
          ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
          : "";

        if (dateStr) {
          if (!dateFirstKelapa[dateStr]) dateFirstKelapa[dateStr] = sheetRowAmpasKelapa;
          dateLastKelapa[dateStr] = sheetRowAmpasKelapa;
        }

        const idTransaksi = related.id_transaksi || "";
        const pembeli = related.VendorPenjualan?.nama || "";
        const keterangan = related.keterangan || "";

        const totalPerDayKelapa = Number(byDateKelapa[dateStr]?.totalPerDay) || 0;
        const showTotalPerDayKelapa = dateStr && dateFirstKelapa[dateStr] === sheetRowAmpasKelapa;
        // console.log("totalPerDayKelapa:", totalPerDayKelapa);

        const hargaBarang = Number(item?.BarangDiajukan?.KategoriBarang?.harga_barang) || 0;
        const jumlah = Number(item?.total) || 0;

        rowsAmpasKelapa.push([
          isFirstRow ? counterKelapa : "",
          createdAtFull,
          idTransaksi,
          item.BarangDiajukan?.id_kategori || "",
          item.BarangDiajukan?.KategoriBarang?.nama || "",
          Number(item.jumlah_barang) || "",
          item.BarangDiajukan?.KategoriBarang?.satuan || "",
          hargaBarang,
          jumlah,          
          totalPerID,            
          showTotalPerDayKelapa ? totalPerDayKelapa : "", 
          item.Pemohon?.divisi || "",
          pembeli,                  
          keterangan,              
        ]);

        sheetRowAmpasKelapa++;
      });

      const lastRowKelapa = sheetRowAmpasKelapa - 1;
      if (items.length > 1) {
        const colsToMerge = [0, 1, 2, 9, 11, 12];
        colsToMerge.forEach((col) => {
          mergesAmpasKelapa.push({
            s: { r: firstRowKelapa, c: col },
            e: { r: lastRowKelapa, c: col }
          });
        });
      }
      counterKelapa++;
    });

    if (subTotalKelapa !== 0) {
      rowsAmpasKelapa.push([
        "", "", "", "", "", "", "", "", "",
        "SUB TOTAL: ", 
        subTotalKelapa, 
        "", 
        "",
      ]);
    } else {
      ""
    };

    Object.keys(dateFirstKelapa).forEach((dateStr) => {
      const sRow = dateFirstKelapa[dateStr];
      const eRow = dateLastKelapa[dateStr];
      if (sRow !== undefined && eRow !== undefined && eRow > sRow) {
        mergesAmpasKelapa.push({
          s: { r: sRow, c: 10 },
          e: { r: eRow, c: 10 }
        });
      }
    });

    const allAmpasKelapa = [titleHeaders, subTitleHeaders, headers, ...rowsAmpasKelapa];
    const wsAmpasKelapa = XLSX.utils.aoa_to_sheet(allAmpasKelapa);

    // rowsAmpasKelapa.forEach((row, i) => {
    //   const excelRow = i + 2;
    //   const numericCols = [4,6,7,8,9];
    //   numericCols.forEach(col => {
    //     const cellAddr = XLSX.utils.encode_cell({r: excelRow, c: col});
    //     const cell = wsAmpasKelapa[cellAddr];
    //     if (!cell) return;

    //     cell.t = "n";
    //     cell.v = Number(cell.v);
    //   })
    // });

    wsAmpasKelapa['!merges'] = [titleMerge, subTitleMerge, ...mergesAmpasKelapa];

    headers.forEach((_, colIndex) => {
      const cellTitle = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      const cellSubTitle = XLSX.utils.encode_cell({ r: 1, c: colIndex });
      const cellHeaders = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      if (wsAmpasKelapa[cellHeaders]) {
        wsAmpasKelapa[cellHeaders].s = {
          fill: {
            fgColor: { rgb: "fcf51e" } 
          }, 
          alignment: {
            horizontal: "center",
          },
          font: {
            bold: true,
          }, 
          border: {
            top: borderStyle, 
            bottom: borderStyle, 
            left: borderStyle, 
            right: borderStyle,
          },
        };
      }
      if (wsAmpasKelapa[cellTitle]) {
        wsAmpasKelapa[cellTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 14,
          }
        }
      }
      if (wsAmpasKelapa[cellSubTitle]) {
        wsAmpasKelapa[cellSubTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 12,
          }
        }
      }
    });

    const grandTotalAKIndex = rowsAmpasKelapa.length + 2;
    const cellAddrKelapa = XLSX.utils.encode_cell({r: grandTotalAKIndex, c: 10});
    const cellKelapa = wsAmpasKelapa[cellAddrKelapa];
    const labelGrandTotalAK = rowsAmpasKelapa.length + 2;
    const cellLabelTotalAK = XLSX.utils.encode_cell({r: labelGrandTotalAK, c: 9});
    const cellLabelAK = wsAmpasKelapa[cellLabelTotalAK];

    if(cellKelapa && subTotalKelapa !== 0) {
      cellKelapa.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "right", 
          vertical: "right",
        },
      }
    } 
    
    if(cellLabelAK && subTotalKelapa !== 0) {
      cellLabelAK.s = {
        font: {
          bold: true, 
          sz: 12,
        }, 
        fill: {
          fgColor: { rgb: "fcf51e" }
        }, 
        alignment: {
          horizontal: "left", 
          vertical: "left",
        }
      }
    }


    // TOTAL PER BULAN 
    // const allGrandTotal = [titleHeaders, grandTotalHeaders, ...grandTotalData];
    const wsGrandTotal = XLSX.utils.json_to_sheet(grandTotalData);

    wsGrandTotal["A1"].s = {
      fill: {
        fgColor: { rgb: "f59b1d" } 
      }, 
      alignment: {
        horizontal: "center",
      },
      font: {
        bold: true,
      },
      border: {
        top: borderStyle, 
        bottom: borderStyle, 
        left: borderStyle, 
        right: borderStyle,
      },
    }
    wsGrandTotal["B1"].s = {
      fill: {
        fgColor: { rgb: "f59b1d" } 
      }, 
      alignment: {
        horizontal: "center",
      },
      font: {
        bold: true,
      },
      border: {
        top: borderStyle, 
        bottom: borderStyle, 
        left: borderStyle, 
        right: borderStyle,
      },
    }
    wsGrandTotal["C1"].s = {
      fill: {
        fgColor: { rgb: "f59b1d" } 
      }, 
      alignment: {
        horizontal: "center",
      },
      font: {
        bold: true,
      },
      border: {
        top: borderStyle, 
        bottom: borderStyle, 
        left: borderStyle, 
        right: borderStyle,
      },
    }
    wsGrandTotal["B5"].s = {
      fill: {
        fgColor: { rgb: "fcf51e" } 
      }, 
      alignment: {
        horizontal: "left",
      },
      font: {
        bold: true,
      },
    }
    wsGrandTotal["C5"].s = {
      fill: {
        fgColor: { rgb: "fcf51e" } 
      }, 
      alignment: {
        horizontal: "right",
      },
      font: {
        bold: true,
      },
      
    }
    


    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, wsNonAsset, 'Non-Asset');
    XLSX.utils.book_append_sheet(workbook, wsAsset, 'Asset');
    XLSX.utils.book_append_sheet(workbook, wsAmpasKelapa, 'Ampas Kelapa');
    XLSX.utils.book_append_sheet(workbook, wsGrandTotal, 'Grand Total');
    XLSX.writeFile(workbook, 'laporan_penjualan.xlsx');
    setShowDownloadModal(false);
    setTanggalAwal("");
    setTanggalAkhir("");
  };

  const exportToExcelScrap = () => {
    const titleHeaders = ["LAPORAN SCRAPPING WASTE MATERIAL"];
    const subTitleHeaders = [`PERIODE: ${formattedSDateScrapping(tanggal_awal_scrapping)} s/d ${formattedEDateScrapping(tanggal_akhir_scrapping)}`];
    const headers = ["NO","TANGGAL","NO BPBB", "ID KATEGORI", "DESKRIPSI KATEGORI", "QTY", "UOM", "DIVISI", "KETERANGAN"];
    let ScrapItem;

    // const currentDate = related?.createdAt
    // ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
    // : "";

    if (tanggal_akhir_scrapping !== "" && tanggal_awal_scrapping !== "") {
      ScrapItem = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "SCRAPPING")
        .filter(item => item?.GeneratePengajuan?.status === "Selesai")
        .filter(item => {
          const dateObject = new Date(item.createdAt);

          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0'); 
          const formattedDate = `${year}-${month}-${day}`;

          const checkDate = formattedDate >= tanggal_awal_scrapping && formattedDate <= tanggal_akhir_scrapping;
          return checkDate;
        })
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});

    } else {
      ScrapItem = detailPengajuan
        .filter(item => String(item.jenis_pengajuan).toUpperCase() === "SCRAPPING")
        .filter(item => item?.GeneratePengajuan?.status === "Selesai")
        .reduce((acc, item) => {
          (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
          return acc;
      }, {});
    }


    const rowScrapItem = [];

    const mergeScrapItem = [];

    let sheetRowScrapItem = 3; 

    const dateFirstScrapItem= {};

    const dateLastScrapItem = {}; 

    //Sheet 1 - Non Asset
    Object.keys(ScrapItem).forEach((id_pengajuan) => {
      const items = ScrapItem[id_pengajuan];
      const firstRowScrapItem = sheetRowScrapItem;

      items.forEach((item, index) => {
        const isFirstRow = index === 0;
        const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
        const createdAtFull = related.createdAt
          ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
          : "";
        const dateStr = related?.createdAt
          ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
          : "";

        if (dateStr) {
          if (!dateFirstScrapItem[dateStr]) dateFirstScrapItem[dateStr] = sheetRowScrapItem;
          dateLastScrapItem[dateStr] = sheetRowScrapItem;
        }

        const idTransaksi = related.id_transaksi || "";
        const keterangan = related.keterangan || "";

        rowScrapItem.push([
          isFirstRow ? counterScrap : "",
          createdAtFull,
          idTransaksi,
          item.BarangDiajukan?.id_kategori || "",
          item.BarangDiajukan?.KategoriBarang?.nama || "",
          Number(item.jumlah_barang) || "",
          item.BarangDiajukan?.KategoriBarang?.satuan || "",
          item.Pemohon?.divisi || "",
          keterangan,              
        ]);

        sheetRowScrapItem++;
      });

      const lastRowScrapItem = sheetRowScrapItem - 1;
      if (items.length > 1) {
        const colsToMerge = [0, 1, 2];
        colsToMerge.forEach((col) => {
          mergeScrapItem.push({
            s: { r: firstRowScrapItem, c: col },
            e: { r: lastRowScrapItem, c: col }
          });
        });
      }
      counterScrap++;
    });

    const allScrapItem = [titleHeaders, subTitleHeaders, headers, ...rowScrapItem];
    const wsScrapItem = XLSX.utils.aoa_to_sheet(allScrapItem);

    const borderStyle = {
      style: "thin", 
      color: { rgb: "FF000000" }
    };

    const titleMerge = { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } };
    const subTitleMerge = { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } };
    wsScrapItem['!merges'] = [titleMerge, subTitleMerge, ...mergeScrapItem];

    headers.forEach((_, colIndex) => {
      const cellTitle = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      const cellSubTitle = XLSX.utils.encode_cell({ r: 1, c: colIndex });
      const cellHeaders = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      if (wsScrapItem[cellHeaders]) {
        wsScrapItem[cellHeaders].s = {
          fill: {
            fgColor: { rgb: "62f740" } 
          }, 
          alignment: {
            horizontal: "center",
          },
          font: {
            bold: true,
          },
          border: {
            top: borderStyle, 
            bottom: borderStyle, 
            left: borderStyle, 
            right: borderStyle,
          },
        };
      }
      if (wsScrapItem[cellTitle]) {
        wsScrapItem[cellTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 14,
          },
        }
      }
      if (wsScrapItem[cellSubTitle]) {
        wsScrapItem[cellSubTitle].s = {
          alignment: {
            horizontal: "center",
          }, 
          font: {
            bold: true,
            sz: 12,
          },
        }
      }
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, wsScrapItem, 'Scrapping');
    XLSX.writeFile(workbook, 'laporan_scrapping.xlsx');
    setShowDownloadScrapping(false);
    setTanggalAkhirScrap("");
    setTanggalAwalScrap("");
  };

  const filteredPengajuan = pengajuan.filter((dataPengajuan) => 
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



  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };
  

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Data Pengajuan", 12, 20);
    
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
      "ID Pengajuan", 
      "Pemohon", 
      "Divisi",
      "Jenis Pengajuan", 
      "Status", 
      "Diajukan"
    ];  
    // const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => {
    //   return Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
    // });

    const allRows = sortedPengajuan.map((p) => {
      const id = p.id_pengajuan || "";
      const nama = p.Pemohon?.nama || "";
      const divisi = p.Pemohon?.divisi || "";
      const jenis = p.jenis_pengajuan || "";
      const status = p.GeneratePengajuan?.status || "";
      const tanggal = p.createdAt
        ? new Date(p.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      return [id, nama, divisi, jenis, status, tanggal];
    });


    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: [headers],
      body: allRows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
      columnStyles: {
        0: { cellWidth: 'auto' },  
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 'auto' },  
        3: { cellWidth: 'auto' },  
        4: { cellWidth: 'auto' },  
        5: { cellWidth: 'auto' }
      },
      tableWidth: 'auto',
  
    });
  
    doc.save("data_pengajuan.pdf");
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

  const handleProses = (pengajuan) => {
    history.push({
      pathname: "/admin/transaksi",
      state: {selectedPengajuan: pengajuan}
    });
  }


 

  useEffect(() => {
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

    fetchSummaryData();
  });

  const handleDeletePengajuan = (id_pengajuan) => {
    setDeletedIDPengajuan(id_pengajuan);
    setShowModal(true);
  };

  const findNomorAntrean = (id_pengajuan) => {
    const antreanItem = pengajuan.find(item => item.id_pengajuan === id_pengajuan);
    return antreanItem ? antreanItem?.GeneratePengajuan?.Antrean?.nomor_antrean : "-"; 
  };

  const getAntrean = async () => {
    try {
      // setLoading(true);
      const response = await axios.get("http://10.70.10.131:5001/antrean-pengajuan", {
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
  
  useEffect(() => {
    getAntrean();

    setTimeout(() => setLoading(false), 3000)
  }, []);

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
        <Container fluid>
          <Row>
            <Col lg="4" sm="6">
                <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaMoneyBillWave className="text-warning" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Uang Masuk</p>
                      </div>
                    </Col>
                    <Col>
                    <div className="text-right">
                      <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">Rp {formatRupiah(totalPenjualan || 0)}</h3></Card.Title>
                    </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Hasil Penjualan Barang Bekas
                  </div>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="4" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaHourglassStart className="text-danger" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Pengajuan Belum Diproses</p>

                      </div>
                    </Col>
                    <Col>
                      <div className="text-right">
                        <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">{jumlahBelumDiproses}</h3></Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Pengajuan Belum Diproses
                  </div>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="4" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaClipboardCheck className="text-primary"/>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Pengajuan Selesai</p>
                      </div>
                    </Col>
                    <Col>
                      <div className="text-right">
                        <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">{jumlahPengajuanSelesai}</h3></Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Pengajuan Selesai
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          <Row>
            {/* <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
            </Button>
            <ImportPengajuan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} /> */}
            
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={downloadPDF}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              // onClick={exportToExcel}
              onClick={() => setShowDownloadModal(true)}
              >
              <FaFileExcel style={{ marginRight: '8px' }} />
              Laporan Penjualan
            </Button>

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              // onClick={exportToExcel}
              onClick={() => setShowDownloadScrapping(true)}
              >
              <FaFileExcel style={{ marginRight: '8px' }} />
              Laporan Scrapping
            </Button>
            
            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />

            <Col md="12">
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
                            {currentItems.map((pengajuan) => (
                              <tr key={pengajuan.id_pengajuan}>
                                <td className="text_center">{pengajuan.GeneratePengajuan?.Antrean?.nomor_antrean || '-'}</td>
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
                                  <Button className="btn-fill pull-right warning mt-2 btn-reset" variant="warning" onClick={() => handleProses(pengajuan)}
                                    style={{ width: 103, fontSize: 14 }} 
                                    disabled={pengajuan.GeneratePengajuan?.status === "Selesai"||
                                      !isPreviousAccepted(findNomorAntrean(pengajuan.id_pengajuan))
                                    }
                                    hidden={pengajuan.GeneratePengajuan?.status === "Selesai"}>
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
                                  <Button className="btn-fill pull-right danger mt-2 btn-reset" variant="danger" onClick={() => handleDeletePengajuan(pengajuan.id_pengajuan)} style={{ width: 100, fontSize: 13 }}
                                  >
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

        <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} dialogClassName="modal-warning">
          <Modal.Header style={{borderBottom: "none"}}>
              <h3 style={{ width:"100%", position: "relative", textAlign:"center", fontWeight:350}}><strong>Unduh Laporan Penjualan</strong></h3>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={() => setShowDownloadModal(false)}
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
          
          {/* <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"left"}} >Pilih rentang waktu:</Modal.Body> */}
          <Form>
            <label className="px-4">Pilih rentang waktu:</label>
            <Row className="px-4 mb-4">
              <Col md="6">
                <Form.Group>
                    <label>Tanggal Awal</label>
                    <Form.Control
                      type="date"
                      value={tanggal_awal}
                      onChange={(e) => setTanggalAwal(e.target.value)}
                    />
                </Form.Group>
              </Col>
              <Col md="6">
              <Form.Group>
                    <label>Tanggal Akhir</label>
                    <Form.Control
                      type="date"
                      value={tanggal_akhir}
                      onChange={(e) => {
                        const selectedTglAkhir = e.target.value;
                        setTanggalAkhir(e.target.value);

                        if (tanggal_awal && selectedTglAkhir < tanggal_awal) {
                          setTanggalError(true);
                        } else {
                          setTanggalError(false);
                        }
                      }}
                      // isInvalid={tanggalError}
                    />
                    {tanggalError && <span className="text-danger required-select">Tanggal akhir tidak boleh kurang dari tanggal awal!</span>}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3 px-4">
              <Col md="12" style={{ width:"100%", height:"60px", position: "relative", textAlign:"right"}}>
                <Button className="btn btn-fill" variant="success" onClick={exportToExcel} disabled={tanggal_akhir < tanggal_awal || (tanggal_akhir !== '' && tanggal_awal === '')}>
                  Unduh
                </Button> 
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal show={showDownloadScrap} onHide={() => setShowDownloadScrapping(false)} dialogClassName="modal-warning">
          <Modal.Header style={{borderBottom: "none"}}>
              <h3 style={{ width:"100%", position: "relative", textAlign:"center", fontWeight:350}}><strong>Unduh Laporan Scrapping</strong></h3>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={() => setShowDownloadScrapping(false)}
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
          
          {/* <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"left"}} >Pilih rentang waktu:</Modal.Body> */}
          <Form>
            <label className="px-4">Pilih rentang waktu:</label>
            <Row className="px-4 mb-4">
              <Col md="6">
                <Form.Group>
                    <label>Tanggal Awal</label>
                    <Form.Control
                      type="date"
                      value={tanggal_awal_scrapping}
                      onChange={(e) => setTanggalAwalScrap(e.target.value)}
                    />
                </Form.Group>
              </Col>
              <Col md="6">
              <Form.Group>
                    <label>Tanggal Akhir</label>
                    <Form.Control
                      type="date"
                      value={tanggal_akhir_scrapping}
                      onChange={(e) => {
                        const selectedTglAkhirScrap = e.target.value;
                        setTanggalAkhirScrap(e.target.value);

                        if (tanggal_awal_scrapping && selectedTglAkhirScrap < tanggal_awal_scrapping) {
                          setTglScrapError(true);
                        } else {
                          setTglScrapError(false);
                        }
                      }}
                      // isInvalid={tanggalError}
                    />
                    {tglScrapError && <span className="text-danger required-select">Tanggal akhir tidak boleh kurang dari tanggal awal!</span>}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3 px-4">
              <Col md="12" style={{ width:"100%", height:"60px", position: "relative", textAlign:"right"}}>
                <Button className="btn btn-fill" variant="success" onClick={exportToExcelScrap} disabled={tanggal_akhir_scrapping < tanggal_awal_scrapping}>
                  Unduh
                </Button> 
              </Col>
            </Row>
          </Form>
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

export default DataPengajuan;