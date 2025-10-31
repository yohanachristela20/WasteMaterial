import React, { useEffect, useState } from "react";
import {FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaSortUp, FaSortDown} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddVendor from "components/ModalForm/AddVendor.js";
import EditVendor from "components/ModalForm/EditVendor.js";
import ImportVendor from "components/ModalForm/ImportVendor.js";
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";


import {Button, Container, Row, Col, Card, Table, Spinner } from "react-bootstrap";

function MasterVendor() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [vendor, setVendor] = useState([]); 
  const [selectedVendor, setSelectedVendor] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_vendor");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredVendor = vendor.filter((vendor) =>
    (vendor.id_vendor && String(vendor.id_vendor).toLowerCase().includes(searchQuery)) ||
    (vendor.nama && String(vendor.nama).toLowerCase().includes(searchQuery)) ||
    (vendor.alamat && String(vendor.alamat).toLowerCase().includes(searchQuery)) ||
    (vendor.no_telepon && String(vendor.no_telepon).toLowerCase().includes(searchQuery)) ||
    (vendor.no_kendaraan && String(vendor.no_kendaraan).toLowerCase().includes(searchQuery)) ||
    (vendor.createdAt && String(vendor.createdAt).toLowerCase().includes(searchQuery)) ||
    (vendor.updatedAt && String(vendor.updatedAt).toLowerCase().includes(searchQuery)) ||
    (vendor.sopir && String(vendor.sopir).toLowerCase().includes(searchQuery))
  );

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  const sortedVendor = filteredVendor.sort((a, b) => {
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
  const currentItems = sortedVendor.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const token = localStorage.getItem("token");

  const getVendor = async () =>{
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("http://localhost:5000/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setVendor(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const deleteVendor = async(id_vendor) =>{
    try {
      await axios.delete(`http://localhost:5000/vendor/${id_vendor}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("Data vendor berhasil dihapus.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
      getVendor(); 
      window.location.reload();
    } catch (error) {
      console.log(error.message); 
    }
  }

  useEffect(()=> {
    try {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }

      getVendor();
      
    } catch (error) {
      console.error("Error fetching data", error.message); 
    }
  }, [token]); 

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getVendor();
    toast.success("Data vendor baru berhasil dibuat!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getVendor();
    toast.success("Data vendor berhasil diperbarui!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getVendor();
    toast.success("Data vendor berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Master Vendor", 12, 20);

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
  
    const headers = [["ID Vendor", "Nama", "Alamat", "No. Telepon", "No. Kendaraan", "Sopir", "Dibuat", "Terakhir Diubah"]];
  
    // const rows = data.map((item) => [
    //   item.id_vendor,
    //   item.nama,
    //   item.alamat,
    //   item.no_telepon,
    //   item.no_kendaraan,
    //   item.sopir,
    //   (new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')),
    //   (new Date(item.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', ''))
    // ]);

    const allRows = data.map((p) => {
      const id = p.id_vendor || "";
      const nama = p.nama || "";
      const alamat = p.alamat || "";
      const no_telepon = p.no_telepon || "";
      const no_kendaraan = p.no_kendaraan || "";
      const sopir = p.sopir || "";
      const tanggal_dibuat = p.createdAt
        ? new Date(p.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      const tanggal_diubah = p.updatedAt
        ? new Date(p.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      return [id, nama, alamat, no_telepon, no_kendaraan, sopir, tanggal_dibuat, tanggal_diubah];
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: allRows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });

    doc.save("master_vendor.pdf");
  };
  
  useEffect(() => {
    getVendor();

    setTimeout(() => setLoading(false), 1000)
  }, []); 

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

            <AddVendor showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

            <EditVendor
                        showEditModal={showEditModal}
                        setShowEditModal={setShowEditModal}
                        vendor={selectedVendor}
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

          <ImportVendor showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadPDF(vendor)}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          
          <Col md="12">
            <Card className="p-3 striped-tabled-with-hover mt-2">
              <Card.Header>
                <Card.Title as="h4" className="mb-4"><strong>Master Vendor</strong></Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                  <Table className="table-striped table-hover">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                     <table className="flex-table table table-striped table-hover">
                     <thead >
                     <tr>
                       <th onClick={() => handleSort("id_vendor")}>ID Vendor {sortBy==="id_vendor" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap"onClick={() => handleSort("nama")}>Nama {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("alamat")}>Alamat {sortBy==="alamat" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("no_telepon")}>No. Telepon {sortBy==="no_telepon" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("no_kendaraan")}>No. Kendaraan{sortBy==="no_kendaraan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap"onClick={() => handleSort("sopir")}>Sopir {sortBy==="sopir" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("createdAt")}>Dibuat{sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("updatedAt")}>Terakhir Diubah{sortBy==="updatedAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="scroll scroller-tbody">
                     {currentItems.map((vendor, index) => (
                       <tr key={vendor.id_vendor}>
                       <td className="text-center">{vendor.id_vendor}</td>
                       <td className="text-center">{vendor.nama}</td>
                       <td className="text-center">{vendor.alamat}</td>
                       <td className="text-center">{vendor.no_telepon}</td>
                       <td className="text-center">{vendor.no_kendaraan}</td>
                       <td className="text-center">{vendor.sopir}</td>
                       <td className="text-center">{new Date(vendor.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                       <td className="text-center">{new Date(vendor.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                        <td className="text-center">
                          <Button className="btn-fill pull-right warning mt-2 btn-reset" variant="warning" onClick={() => { setShowEditModal(true); setSelectedVendor(vendor); }} style={{ width: 96, fontSize: 14 }}>
                            <FaRegEdit style={{ marginRight: '8px' }} />
                            Ubah
                          </Button>
                          <Button className="btn-fill pull-right danger mt-2 btn-reset" variant="danger"  onClick={() => deleteVendor(vendor.id_vendor)} style={{ width: 96, fontSize: 13 }}>
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
              </Card.Body>
            </Card>
            <div className="pagination-container">
            <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={filteredVendor.length}
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

export default MasterVendor;
