import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaSortDown, FaSortUp, FaRegEdit, FaTrashAlt} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddDetailBarang from "components/ModalForm/AddDetailBarang";
import EditKategori from "components/ModalForm/EditKategori.js";
import ImportMasterBarang from "components/ModalForm/ImportMasterBarang.js"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  Spinner  
} from "react-bootstrap";

function KategoriBarang() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [detailBarang, setDetailBarang] = useState([]); 
  const [selectedBarang, setSelectedBarang] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_kategori");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");
  const [sortedData, setSortedData] = useState();
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredBarang = detailBarang.filter((detailBarang) =>
    (detailBarang.id_kategori && String(detailBarang.id_kategori).toLowerCase().includes(searchQuery)) ||
    (detailBarang.nama && String(detailBarang.nama).toLowerCase().includes(searchQuery)) ||
    (detailBarang.satuan && (detailBarang.satuan).toLowerCase().includes(searchQuery)) ||
    (detailBarang.harga_barang && (detailBarang.harga_barang).includes(searchQuery)) ||
    (detailBarang.jenis_barang && String(detailBarang.jenis_barang).toLowerCase().includes(searchQuery)) || 
    (detailBarang.tanggal_penetapan && String(detailBarang.tanggal_penetapan).includes(searchQuery)) ||
    (detailBarang.updatedAt && String(detailBarang.updatedAt).includes(searchQuery))  

  );

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

  const parseCurrency = (currencyString) => {
    if (!currencyString && currencyString !== 0) return 0;
    if (typeof currencyString === "number") return currencyString;
    const numericString = String(currencyString).replace(/[^0-9.-]+/g, "");
    return parseFloat(numericString) || 0;
  }

  const sortingCurrency = (key = "harga_barang") => {
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newOrder);

    const sorted = [...detailBarang].sort((a, b) => {
      const hargaA = parseCurrency(a[key]);
      const hargaB = parseCurrency(b[key]);
      return newOrder === "asc" ? hargaA - hargaB : hargaB - hargaA;
    });
    setDetailBarang(sorted);
    setCurrentPage(1);
  };

  
  const sortedBarang = filteredBarang.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // if (sortOrder === "asc") {
    //   return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; 
    // } else {
    //   return bValue < aValue ? -1 : bValue > aValue ? 1 : 0; 
    // }

    if (sortBy === "harga_barang") {
      aValue = parseCurrency(aValue);
      bValue = parseCurrency(bValue);
    } else {
      aValue = aValue === null || aValue === "undefined" ? "" : String (aValue).toLowerCase();
      bValue = bValue === null || aValue === "undefined" ? "" : String (bValue).toLowerCase();
    }

    if (sortBy === "harga_barang") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;

  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBarang.slice(indexOfFirstItem, indexOfLastItem);

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getDataBarang();
    setTimeout(() => setLoading(false), 1000)
  }, []); 

  const getDataBarang = async () =>{
    try {
      // setLoading(true);
      const response = await axios.get("http://localhost:5000/kategori-barang", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDetailBarang(response.data);
      // console.log("Plafond:", response.data)
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  const formatRupiah = (angka) => { 
    let gajiString = angka.toString().replace(".00");
    let sisa = gajiString.length % 3;
    let rupiah = gajiString.substr(0, sisa);
    let ribuan = gajiString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getDataBarang();
    toast.success("Kategori barang berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

const handleEditSuccess = () => {
  getDataBarang();
  toast.success("Kategori barang berhasil diperbarui!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
  });
};

const handleImportButtonClick = () => {
  setShowImportModal(true);
}

const handleImportSuccess = () => {
  getDataBarang();
  // toast.success("Plafond berhasil diimport!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: true,
  // });
};

const deleteDetailBarang = async(id_kategori) => {
  try {
    await axios.delete(`http://localhost:5000/kategori-barang/${id_kategori}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    toast.success("Kategori barang berhasil dihapus.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
    });

    getDataBarang();
  } catch (error) {
    console.log(error.message);
  }
}



const downloadCSV = (data) => {
  const header = ["id_plafond", "tanggal_penetapan", "jumlah_plafond", "keterangan", "tanggal_penetapan", "updatedAt"];
  const rows = data.map((item) => [
    item.id_plafond,
    item.tanggal_penetapan,
    item.jumlah_plafond,
    item.keterangan,
    item.createdAt,
    item.updatedAt
  ]);

  const csvContent = [header, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "master_plafond.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadPDF = (data) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(12); 
  doc.text("Kategori Barang", 12, 20);

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

  const headers = [["ID Kategori", "Nama Barang", "Satuan", "Harga Barang", "Jenis Barang", "Tanggal Penetapan", "Terakhir Diubah"]];

  const rows = data.map((item) => [
    item.id_kategori,
    item.nama,
    item.satuan,
    // item.harga_barang,
    (formatRupiah(item.harga_barang)),
    item.jenis_barang,
    item.tanggal_penetapan,
    // item.updatedAt,
    (new Date(item.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', ''))
    // (item.updatedAt).tz('+0700').format('YYYY-MM-DD HH:mm'),
  ]);

  const marginTop = 15; 

  doc.autoTable({
    startY: 20 + marginTop, // Posisi Y awal
    head: headers,
    body: rows,
    styles: { fontSize: 12 }, // Ukuran font tabel
    headStyles: { fillColor: [3, 177, 252] }, // Warna header tabel
  });

  doc.save("master_barang.pdf");
};

  return (
    <>
    {loading === false ? 
      (<div className="App">
        <Container fluid>
        <Row>
            <div>
              <Button
                className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
                type="button"
                variant="success"
                onClick={() => setShowAddModal(true)}>
                <FaPlusCircle style={{ marginRight: '8px' }} />
                Kategori Baru
              </Button>

              <AddDetailBarang showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

              <EditKategori
                  showEditModal={showEditModal}
                  setShowEditModal={setShowEditModal}
                  detailBarang={selectedBarang}
                  onSuccess={handleEditSuccess}
                />
            </div>

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
            </Button>
            {/* {showImport && <ImportMasterBarang />} */}

            <ImportMasterBarang showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

            {/* <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={() => downloadCSV(plafond)}>
              <FaFileCsv style={{ marginRight: '8px' }} />
              Unduh CSV
            </Button> */}

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={() => downloadPDF(detailBarang)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>

            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
            
            <Col md="12">
              <Card className="p-3 striped-tabled-with-hover mt-2">
                <Card.Header>
                  <Card.Title as="h4" className="mb-4"><strong>Kategori Barang</strong></Card.Title>
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {/* {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : ( */}
                  <Table className="table-hover table-striped">
                      <div className="table-scroll" style={{ height:'auto' }}>
                        <table className="flex-table table table-striped table-hover">
                          <thead>
                        <tr>
                          <th onClick={() => handleSort("id_kategori")}>ID Kategori {sortBy==="id_kategori" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("nama")}>Nama Barang {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("satuan")}>Satuan {sortBy==="satuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => sortingCurrency("harga_barang")}>Harga Barang {sortBy==="harga_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("jenis_barang")}>Jenis Barang {sortBy==="jenis_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("tanggal_penetapan")}>Tanggal Penetapan {sortBy==="tanggal_penetapan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("updatedAt")}>Terakhir Diubah {sortBy==="terakhir_diubah" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0">Aksi</th>
                        </tr>
                          </thead>
                          <tbody className="scroll scroller-tbody">
                            {currentItems.map((detailBarang) => (
                              <tr key={detailBarang.id_kategori}>
                                <td className="text-center">{detailBarang.id_kategori}</td>
                                <td className="text-center">{detailBarang.nama}</td>
                                <td className="text-center">{detailBarang.satuan}</td>
                                <td className="text-center">{formatRupiah(detailBarang.harga_barang)}</td>
                                <td className="text-center">{detailBarang.jenis_barang}</td>
                                <td className="text-center">{new Date(detailBarang.tanggal_penetapan).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">{new Date(detailBarang.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">
                                  <Button className="btn-fill pull-right warning" variant="warning" onClick={() => { setShowEditModal(true); setSelectedBarang(detailBarang); }} style={{ width: 96, fontSize: 14 }}>
                                    <FaRegEdit style={{ marginRight: '8px' }} />
                                    Ubah
                                  </Button>
                                  <Button className="btn-fill pull-right danger mt-2" variant="danger"  onClick={() => deleteDetailBarang(detailBarang.id_kategori)} style={{ width: 96, fontSize: 13 }}>
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
                {/* )} */}
              </Card.Body>
              </Card>
              <div className="pagination-container">
              <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={filteredBarang.length}
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
    </>
  );
}

export default KategoriBarang;
