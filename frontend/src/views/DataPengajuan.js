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
import ImportPengajuan from "components/ModalForm/ImportPengajuan.js";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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
  Modal
} from "react-bootstrap";
import { data } from "jquery";
import KategoriBarang from "./KategoriBarang";

 function DataPengajuan() {
  const history = useHistory();
  const [pengajuan, setPengajuan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("desc");
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
      // if (id_pengajuan) {
      //   getDetailTransaksi();
      // } 
      getDetailTransaksi();
      getDetailPengajuan();
  }, [token]);

  // console.log("DETAIL PENGAJUAN:", detailPengajuan);

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

  // GROUP TOTAL BY ID PENGAJUAN
  const groupedPenjualan  = detailPengajuan.reduce((acc, item) => {
    if (!acc[item.id_pengajuan]) {
      acc[item.id_pengajuan] = {  
        ...item,
        totalPerID: 0
      };
    }

    if (String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN") {
      acc[item.id_pengajuan].totalPerID += toNumber(item.total);
    } 
    return acc;
  }, {});


   const groupByDate = detailPengajuan.reduce((acc, item) => {
    if (String(item.jenis_pengajuan).toUpperCase() !== "PENJUALAN") return acc;

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


  // console.log("groupedPenjualan:", groupedPenjualan);


  // TOTAL PER ID
  // const exportToExcel = () => {
  //   const headers = ["TANGGAL","NO BPBB", "ID KATEGORI", "DESKRIPSI KATEGORI", "QTY", "UOM", "HARGA PER UOM", "JUMLAH", "TOTAL", "TOTAL PER DAY", "DIVISI", "PEMBELI", "KETERANGAN"];

  //   const groups = detailPengajuan
  //     .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
  //     .reduce((acc, item) => {
  //       (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
  //       return acc;
  //     }, {});

  //   const rows = [];
  //   const merges = [];
  //   let sheetRowIndex = 1;

  //   const dateFirstRowMap = {};
  //   const dateLastRowMap = {};

  //   Object.keys(groups).forEach((id_pengajuan) => {
  //     const items = groups[id_pengajuan];
  //     const firstRowForPengajuan = sheetRowIndex;

  //     items.forEach((item) => {
  //       const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
  //       const createdAt = related.createdAt
  //         ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
  //         : "";
  //       const dateStr = related?.createdAt
  //         ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
  //         : "";

  //       if (dateStr) {
  //         if (!dateFirstRowMap[dateStr]) dateFirstRowMap[dateStr] = sheetRowIndex;
  //         dateLastRowMap[dateStr] = sheetRowIndex;
  //       }

  //       const idTransaksi = related.id_transaksi || "";
  //       const pembeli = related.VendorPenjualan?.nama || "";
  //       const keterangan = related.keterangan || "";
  //       const totalPerID = groupedPenjualan[item.id_pengajuan]?.totalPerID || 0;
  //       const totalPerDay = groupByDate[dateStr]?.totalPerDay || 0;

  //       // console.log("totalPerDay:", totalPerDay);

  //       const showTotalPerDay = dateStr && dateFirstRowMap[dateStr] === sheetRowIndex;

  //       // if (idx === 0) {
  //       //   rows.push([
  //       //     createdAt,
  //       //     idTransaksi,
  //       //     item.BarangDiajukan?.id_kategori || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.nama || "",
  //       //     item.jumlah_barang || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.satuan || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.harga_barang || "",
  //       //     item.total || "",
  //       //     totalPerID,
  //       //     showTotalPerDay ? totalPerDay : "", 
  //       //     item.Pemohon?.divisi || "",
  //       //     pembeli,
  //       //     keterangan,

  //       //   ]);
  //       // } else {
  //       //   rows.push([
  //       //     "", 
  //       //     "", 
  //       //     item.BarangDiajukan?.id_kategori || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.nama || "",
  //       //     item.jumlah_barang || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.satuan || "",
  //       //     item.BarangDiajukan?.KategoriBarang?.harga_barang || "",
  //       //     item.total || "",
  //       //     "",
  //       //     "",
  //       //     "", 
  //       //     "", 
  //       //     "", 
  //       //   ]);
  //       // }

  //       rows.push([
  //         createdAt,
  //         idTransaksi,
  //         item.BarangDiajukan?.id_kategori || "",
  //         item.BarangDiajukan?.KategoriBarang?.nama || "",
  //         item.jumlah_barang || "",
  //         item.BarangDiajukan?.KategoriBarang?.satuan || "",
  //         item.BarangDiajukan?.KategoriBarang?.harga_barang || "",
  //         item.total || "",
  //         totalPerID,
  //         showTotalPerDay ? totalPerDay : "", 
  //         item.Pemohon?.divisi || "",
  //         pembeli,
  //         keterangan,

  //       ]);
  //       sheetRowIndex++;
  //     });

  //     const lastRowForPengajuan = sheetRowIndex - 1;
  //     if (items.length > 1) {
  //       const colsToMerge = [0, 1, 8, 10, 11]; 
  //       colsToMerge.forEach((col) => {
  //         merges.push({
  //           s: { r: firstRowForPengajuan, c: col },
  //           e: { r: lastRowForPengajuan, c: col }
  //         });
  //       });
  //     }

  //     Object.keys(dateFirstRowMap).forEach((dateStr) => {
  //     const sRow = dateFirstRowMap[dateStr];
  //     const eRow = dateLastRowMap[dateStr];
  //     if (sRow !== undefined && eRow !== undefined && eRow > sRow) {
  //       merges.push({
  //         s: { r: sRow, c: 9 },
  //         e: { r: eRow, c: 9 }
  //       });
  //     }
  //   });

  //   });

  //   const allData = [headers, ...rows];
  //   const worksheet = XLSX.utils.aoa_to_sheet(allData);
  //   // worksheet['!merges'] = worksheet['!merges'] ? worksheet['!merges'].concat(merges) : merges;
  //   worksheet['!merges'] = merges;

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');
  //   XLSX.writeFile(workbook, 'laporan_penjualan.xlsx');
  // };




  const exportToExcel = () => {
    const titleHeaders = ["LAPORAN PENJUALAN"];
    const headers = ["TANGGAL","NO BPBB", "ID KATEGORI", "DESKRIPSI KATEGORI", "QTY", "UOM", "HARGA PER UOM", "JUMLAH", "TOTAL", "TOTAL PER DAY", "DIVISI", "PEMBELI", "KETERANGAN"];

    const groups = detailPengajuan
      .filter(item => String(item.jenis_pengajuan).toUpperCase() === "PENJUALAN")
      .reduce((acc, item) => {
        (acc[item.id_pengajuan] = acc[item.id_pengajuan] || []).push(item);
        return acc;
      }, {});

    const rows = [];
    const merges = [];
    let sheetRowIndex = 2; 

    const dateFirstRowMap = {};
    const dateLastRowMap = {}; 

    Object.keys(groups).forEach((id_pengajuan) => {
      const items = groups[id_pengajuan];
      const firstRowForPengajuan = sheetRowIndex;

      items.forEach((item) => {
        const related = detailTransaksi.find(dt => dt.PengajuanPenjualan?.id_pengajuan === item.id_pengajuan) || {};
        const createdAtFull = related.createdAt
          ? new Date(related.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
          : "";
        const dateStr = related?.createdAt
          ? new Date(related.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-')
          : "";

        if (dateStr) {
          if (!dateFirstRowMap[dateStr]) dateFirstRowMap[dateStr] = sheetRowIndex;
          dateLastRowMap[dateStr] = sheetRowIndex;
        }

        const idTransaksi = related.id_transaksi || "";
        const pembeli = related.VendorPenjualan?.nama || "";
        const keterangan = related.keterangan || "";
        const totalPerID = groupedPenjualan[id_pengajuan]?.totalPerID || 0;
        const totalPerDay = groupByDate[dateStr]?.totalPerDay || 0;
        const showTotalPerDay = dateStr && dateFirstRowMap[dateStr] === sheetRowIndex;

        const hargaBarang = item.BarangDiajukan?.KategoriBarang?.harga_barang;
        const roundHargaBarang = hargaBarang.replace(/\.00$/, '');

        const jumlah = item.total;
        const roundJumlah = jumlah.replace(/\.00$/, '');

        rows.push([
          createdAtFull,
          idTransaksi,
          item.BarangDiajukan?.id_kategori || "",
          item.BarangDiajukan?.KategoriBarang?.nama || "",
          item.jumlah_barang || "",
          item.BarangDiajukan?.KategoriBarang?.satuan || "",
          roundHargaBarang || "",
          roundJumlah || "",          
          totalPerID || "",            
          showTotalPerDay ? totalPerDay : "", 
          item.Pemohon?.divisi || "",
          pembeli,                  
          keterangan,              
        ]);

        sheetRowIndex++;
      });

      const lastRowForPengajuan = sheetRowIndex - 1;
      if (items.length > 1) {
        const colsToMerge = [0, 1, 8, 10, 11];
        colsToMerge.forEach((col) => {
          merges.push({
            s: { r: firstRowForPengajuan, c: col },
            e: { r: lastRowForPengajuan, c: col }
          });
        });
      }
    });

    Object.keys(dateFirstRowMap).forEach((dateStr) => {
      const sRow = dateFirstRowMap[dateStr];
      const eRow = dateLastRowMap[dateStr];
      if (sRow !== undefined && eRow !== undefined && eRow > sRow) {
        merges.push({
          s: { r: sRow, c: 9 },
          e: { r: eRow, c: 9 }
        });
      }
    });

    const allData = [titleHeaders, headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(allData);

    const titleMerge = { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } };
    worksheet['!merges'] = [titleMerge, ...merges];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');
    XLSX.writeFile(workbook, 'laporan_penjualan.xlsx');
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
    (dataPengajuan.createdAt && String(dataPengajuan.createdAt).toLowerCase().includes(searchQuery))
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

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getPengajuan();
  };

  const handleDeletePengajuan = (id_pengajuan) => {
    setDeletedIDPengajuan(id_pengajuan);
    setShowModal(true);
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
              onClick={exportToExcel}>
              <FaFileExcel style={{ marginRight: '8px' }} />
              Unduh Laporan
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
                                  <Button className="btn-fill pull-right warning mt-2 btn-reset" variant="warning" onClick={() => handleProses(pengajuan)} style={{ width: 103, fontSize: 14 }} hidden={pengajuan.GeneratePengajuan?.status === "Selesai"}>
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