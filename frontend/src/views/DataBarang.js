import React, { useEffect, useState } from "react";
import {FaFileImport, FaFilePdf, FaPlusCircle, FaSortDown, FaSortUp, FaRegEdit, FaTrashAlt, FaExclamationTriangle} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddDataBarang from "components/ModalForm/AddDataBarang.js";
import EditBarang from "components/ModalForm/EditBarang.js";
import ImportBarang from "components/ModalForm/ImportBarang.js";
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
  Modal, 
} from "react-bootstrap";

function Barang() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [dataBarang, setDataBarang] = useState([]); 
  const [selectedBarang, setSelectedBarang] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_barang");
  const [sortOrder, setSortOrder] = useState("asc");
  const [detailBarang, setDetailBarang] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const [deletedBarang, setDeletedBarang] = useState(null);
  

  const filteredBarang = detailBarang.filter((dataBarang) =>
    (dataBarang.id_barang && String(dataBarang.id_barang).toLowerCase().includes(searchQuery)) ||
    (dataBarang.nama && String(dataBarang.nama).toLowerCase().includes(searchQuery)) ||
    (dataBarang.KategoriBarang?.nama && String(dataBarang.KategoriBarang?.nama).toLowerCase().includes(searchQuery)) ||
    (dataBarang.KategoriBarang?.harga_barang && String(dataBarang.KategoriBarang?.harga_barang).toLowerCase().includes(searchQuery)) ||
    (dataBarang.KategoriBarang?.jenis_barang && String(dataBarang.KategoriBarang?.jenis_barang).toLowerCase().includes(searchQuery)) ||
    (dataBarang.KategoriBarang?.satuan && String(dataBarang.KategoriBarang?.satuan).toLowerCase().includes(searchQuery)) ||
    (dataBarang.id_sap && (dataBarang.id_sap).toLowerCase().includes(searchQuery)) ||
    (dataBarang.id_kategori && (dataBarang.id_kategori).includes(searchQuery)) ||
    (dataBarang.createdAt && (dataBarang.createdAt).includes(searchQuery)) ||
    (dataBarang.updatedAt && (dataBarang.updatedAt).includes(searchQuery))
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

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

  const sortedBarang = [...filteredBarang].sort((a, b) => {
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
  const currentItems = sortedBarang.slice(indexOfFirstItem, indexOfLastItem);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getDataBarang = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/data-barang", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDataBarang(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const getDetailBarang = async() => {
      try {
          const resp = await axios.get(`http://localhost:5000/detail-barang`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          
          setDetailBarang(resp.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Unauthorized: Token is invalid or expired.");
        } else {
          console.error("Error fetching data:", error.message);
        }
      }
  };

  useEffect(()=> {
    getDataBarang();
    getDetailBarang();

    setTimeout(() => setLoading(false), 1000);
  }, []); 


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
    toast.success("Data barang berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    window.location.reload();
  };

  const handleEditSuccess = () => {
    getDataBarang();
    toast.success("Data barang berhasil diperbarui!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    window.location.reload();
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getDataBarang();
  };

  const deleteBarang = async() => {
    try {
      await axios.delete(`http://localhost:5000/data-barang/${deletedBarang}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setShowModal(false);
      toast.success("Data barang berhasil dihapus.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      window.location.reload();

      getDataBarang();
    } catch (error) {
      console.log(error.message);
    }
  }

  const downloadPDF = (detailBarang) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(12); 
    doc.text("Data Barang", 12, 20);

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

    const headers = [["ID Barang", "Nama Barang", "Kategori", "Harga", "Jenis Barang", "Satuan", "ID SAP", "Dibuat", "Terakhir Diubah"]];

    // const rows = currentItems.map((item) => [
    //   item.id_barang,
    //   item.nama,
    //   item.KategoriBarang?.nama,
    //   item.KategoriBarang?.harga_barang,
    //   item.KategoriBarang?.jenis_barang,
    //   item.KategoriBarang?.satuan,
    //   item.id_sap, 
    //   (new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')),
    //   (new Date(item.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', ''))
    // ]);

    const allRows = currentItems.map((p) => {
      const id = p.id_barang || "";
      const nama = p.nama || "";
      const kategori = p.KategoriBarang?.nama || "";
      const harga = p.KategoriBarang?.harga_barang || "";
      const jenis = p.KategoriBarang?.jenis_barang || "";
      const satuan = p.KategoriBarang?.satuan || "";
      const id_sap = p.id_sap || "";
      const tanggal_dibuat = p.createdAt
        ? new Date(p.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      const tanggal_diubah = p.updatedAt
        ? new Date(p.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      return [id, nama,kategori, harga, jenis, satuan, id_sap, tanggal_dibuat, tanggal_diubah];
    });


    const marginTop = 15; 

    doc.autoTable({
      startY: 20 + marginTop, // Posisi Y awal
      head: headers,
      body: allRows,
      styles: { fontSize: 12 }, 
      headStyles: { fillColor: [3, 177, 252] },
    });

    doc.save("data_barang.pdf");
  };

  const handleDeleteBarang = (id_barang) => {
    setDeletedBarang(id_barang);
    setShowModal(true);
  }

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
                hidden={role === "User"}
                onClick={() => setShowAddModal(true)}>
                <FaPlusCircle style={{ marginRight: '8px' }} />
                Tambah Barang
              </Button>

              <AddDataBarang showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

              <EditBarang
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                dataBarang={selectedBarang}
                onSuccess={handleEditSuccess}
              />
            </div>

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              hidden={role !== "Super Admin"}
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
            </Button>
            <ImportBarang showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={() => downloadPDF(dataBarang)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>

            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
            
            <Col md="12">
              <Card className="p-3 striped-tabled-with-hover mt-2">
                <Card.Header>
                  <Card.Title as="h4" className="mb-4"><strong>Data Barang</strong></Card.Title>
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                  <Table className="table-hover table-striped">
                      <div className="table-scroll" style={{ height:'auto' }}>
                        <table className="flex-table table table-striped table-hover">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort("id_barang")}>ID Barang {sortBy==="id_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("nama")}>Nama Barang {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("KategoriBarang.nama")}>Kategori {sortBy==="KategoriBarang.nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("KategoriBarang.harga_barang")}>Harga {sortBy==="KategoriBarang.harga_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("KategoriBarang.jenis_barang")}>Jenis Barang {sortBy==="KategoriBarang.jenis_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("KategoriBarang.satuan")}>Satuan {sortBy==="KategoriBarang.satuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("id_sap")}>ID SAP {sortBy==="id_sap" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("createdAt")}>Dibuat {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" onClick={() => handleSort("updatedAt")}>Terakhir Diubah {sortBy==="updatedAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                            <th className="border-0" hidden={role === "User"}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="scroll scroller-tbody">
                          {currentItems.map((dataBarang) => (
                            <tr key={dataBarang.id_barang}>
                              <td className="text-center">{dataBarang.id_barang}</td>
                              <td className="text-center">{dataBarang.nama}</td>
                              <td className="text-center">{dataBarang.KategoriBarang?.nama}</td>
                              <td className="text-center">{formatRupiah(dataBarang.KategoriBarang?.harga_barang)}</td>
                              <td className="text-center">{dataBarang.KategoriBarang?.jenis_barang}</td>
                              <td className="text-center">{dataBarang.KategoriBarang?.satuan}</td>
                              <td className="text-center">{dataBarang.id_sap}</td>
                              <td className="text-center">{new Date(dataBarang.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                              <td className="text-center">{new Date(dataBarang.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                              <td className="text-center" hidden={role === "User"}>
                                <Button className="btn-fill pull-right warning mt-2 btn-reset" variant="warning" onClick={() => { setShowEditModal(true); setSelectedBarang(dataBarang); }} style={{ width: 96, fontSize: 14 }}>
                                  <FaRegEdit style={{ marginRight: '8px' }} />
                                  Ubah
                                </Button>
                                <Button className="btn-fill pull-right danger mt-2 btn-reset" variant="danger" onClick={() => handleDeleteBarang(dataBarang.id_barang)} style={{ width: 96, fontSize: 13 }}>
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
          <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}} >Yakin ingin menghapus data barang?</Modal.Body>
          <Row className="mb-3">
            <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
              <Button variant="danger" onClick={() => setShowModal(false)}>
                Tidak
              </Button>
            </Col>
            <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
              <Button variant="success" onClick={() => deleteBarang(dataBarang.id_barang)}>
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

export default Barang;
