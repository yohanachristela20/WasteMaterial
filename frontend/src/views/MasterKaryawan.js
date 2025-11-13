import React, { useEffect, useState } from "react";
import { FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaSortUp, FaSortDown, FaExclamationTriangle} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddKaryawan from "components/ModalForm/AddKaryawan.js";
import EditKaryawan from "components/ModalForm/EditKaryawan.js";
import ImportKaryawan from "components/ModalForm/ImportKaryawan.js";
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";


import {Button, Container, Row, Col, Card, Table, Spinner, Modal } from "react-bootstrap";

function MasterKaryawan() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [karyawan, setKaryawan] = useState([]); 
  const [selectedKaryawan, setSelectedKaryawan] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_karyawan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");
  const [showModal, setShowModal] = useState(false); 
  const [deletedKaryawan, setDeletedKaryawan] = useState(null);

  const filteredKaryawan = karyawan.filter((karyawan) =>
    (karyawan.id_karyawan && String(karyawan.id_karyawan).toLowerCase().includes(searchQuery)) ||
    (karyawan.nama && String(karyawan.nama).toLowerCase().includes(searchQuery)) ||
    (karyawan.divisi && String(karyawan.divisi).toLowerCase().includes(searchQuery)) ||
    (karyawan.createdAt && String(karyawan.createdAt).toLowerCase().includes(searchQuery)) ||
    (karyawan.updatedAt && String(karyawan.updatedAt).toLowerCase().includes(searchQuery))
  );

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

  const sortedPlafond = filteredKaryawan.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; 
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0; 
    }

  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPlafond.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  const getKaryawan = async () =>{
    const token = localStorage.getItem("token");

    try {

      setLoading(true);
      
      const response = await axios.get("http://localhost:5000/karyawan", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setKaryawan(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  const deleteKaryawan = async() =>{
    try {
      await axios.delete(`http://localhost:5000/karyawan/${deletedKaryawan}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      setShowModal(false);
      toast.success("Data karyawan berhasil dihapus.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
      getKaryawan(); 
     
    } catch (error) {
      console.log(error.message); 
    }
  };

  useEffect(()=> {
    try {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }

      getKaryawan();
      
    } catch (error) {
      console.error("Error fetching data", error.message); 
    }
  }, [token]); 

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getKaryawan();
    toast.success("Data karyawan baru berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getKaryawan();
    toast.success("Data karyawan berhasil diperbarui!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getKaryawan();
    toast.success("Data Karyawan berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadCSV = (data) => {
    const header = ["id_karyawan", "nama", "divisi"];
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.divisi,
    ]);
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "master_karyawan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Master Karyawan", 12, 20);

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
  
    const headers = [["ID Karyawan", "Nama Lengkap", "Divisi"]];
  
    // const rows = data.map((item) => [
    //   item.id_karyawan,
    //   item.nama,
    //   item.divisi
    // ]);

    const allRows = data.map((k) => {
      const id = k.id_karyawan;
      const nama = k.nama;
      const divisi = k.divisi;
      return [id, nama, divisi];
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: allRows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });

    doc.save("master_karyawan.pdf");
  };
  
  useEffect(() => {
    getKaryawan();
    setTimeout(() => setLoading(false), 1000)
  }, []); 

  const handleDeleteKaryawan = (id_karyawan) => {
    setDeletedKaryawan(id_karyawan);
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
              onClick={() => setShowAddModal(true)}>
              <FaPlusCircle style={{ marginRight: '8px' }} />
              Tambah Data
            </Button>

            <AddKaryawan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

            <EditKaryawan
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              karyawan={selectedKaryawan}
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

          <ImportKaryawan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(karyawan)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button>

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadPDF(karyawan)}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>


          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          
          <Col md="12">
            <Card className="striped-tabled-with-hover mt-2">
              <Card.Header>
                <Card.Title as="h4">Master Karyawan</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  <Table className="table-striped table-hover">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                     <table className="flex-table table table-striped table-hover">
                     <thead >
                     <tr>
                       <th onClick={() => handleSort("id_karyawan")}>ID Karyawan {sortBy==="id_karyawan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("nama")}>Nama Lengkap {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("divisi")}>Divisi {sortBy==="divisi" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("createdAt")}>Dibuat {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("updatedAt")}>Terakhir Diubah {sortBy==="updatedAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="scroll scroller-tbody">
                     {currentItems.map((karyawan, index) => (
                       <tr key={karyawan.id_karyawan}>
                       <td className="text-center">{karyawan.id_karyawan}</td>
                       <td className="text-center">{karyawan.nama}</td>
                       <td className="text-center">{karyawan.divisi}</td>
                       <td className="text-center">{new Date(karyawan.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                       <td className="text-center">{new Date(karyawan.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                       <td className="text-center">
                       <Button
                         className="btn-fill pull-right warning btn-reset mt-2"
                         type="button"
                         variant="warning"
                         onClick={() => {
                           setShowEditModal(true);
                           setSelectedKaryawan(karyawan);
                         }}
                         style={{
                           width: 103,
                           fontSize: 14,
                         }}>
                         <FaRegEdit style={{ marginRight: '8px' }} />
                         Ubah
                       </Button>
                       <Button
                         className="btn-fill pull-right btn-reset mt-2"
                         type="button"
                         variant="danger"
                         onClick={() => handleDeleteKaryawan(karyawan.id_karyawan)}
                         style={{
                           width: 103,
                           fontSize: 14,
                         }}>
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
                )}
              </Card.Body>
            </Card>
            <div className="pagination-container">
            <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={filteredKaryawan.length}
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
        <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}} >Yakin ingin menghapus data karyawan?</Modal.Body>
        <Row className="mb-3">
          <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
            <Button variant="danger" onClick={() => setShowModal(false)}>
              Tidak
            </Button>
          </Col>
          <Col md="6" style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}}>
            <Button variant="success" onClick={() => deleteKaryawan(karyawan.id_karyawan)}>
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

export default MasterKaryawan;
