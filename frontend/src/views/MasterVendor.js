import React, { useEffect, useState } from "react";
import { FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaSortUp, FaSortDown} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddVendor from "components/ModalForm/AddVendor.js";
import EditVendor from "components/ModalForm/EditVendor.js";
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


// react-bootstrap components
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
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const filteredVendor = vendor.filter((vendor) =>
    (vendor.id_vendor && String(vendor.id_vendor).toLowerCase().includes(searchQuery)) ||
    (vendor.nama_vendor && String(vendor.nama_vendor).toLowerCase().includes(searchQuery)) ||
    (vendor.alamat_vendor && String(vendor.alamat_vendor).toLowerCase().includes(searchQuery)) ||
    (vendor.no_telepon && String(vendor.no_telepon).toLowerCase().includes(searchQuery)) ||
    (vendor.no_kendaraan && String(vendor.no_kendaraan).toLowerCase().includes(searchQuery)) 
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
    const role = localStorage.getItem("role");

    // console.log("User token: ", token, "User role:", role);
    try {

      setLoading(true);
      
      const response = await axios.get("http://localhost:5000/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setVendor(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
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

  const downloadCSV = (data) => {
    const header = ["id_karyawan", "nama", "jenis_kelamin", "departemen", "divisi", "tanggal_lahir", "tanggal_masuk", "gaji_pokok"];
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.jenis_kelamin,
      item.departemen,
      item.divisi,
      item.tanggal_lahir,
      item.tanggal_masuk,
      item.gaji_pokok,
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
  
    const headers = [["ID Karyawan", "Nama", "Jenis Kelamin", "Departemen", "Divisi", "Tanggal Lahir", "Tanggal Masuk", "Gaji Pokok"]];
  
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.jenis_kelamin,
      item.departemen,
      item.divisi,
      item.tanggal_lahir,
      item.tanggal_masuk,
      formatRupiah(item.gaji_pokok),
    ]);

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });

    doc.save("master_karyawan.pdf");
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
                <Card.Title as="h4">Master Vendor</Card.Title>
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
                       <th onClick={() => handleSort("id_vendor")}>ID Vendor {sortBy==="id_vendor" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap">Nama Vendor</th>
                       <th className="border-0 text-wrap" onClick={() => handleSort("alamat_vendor")}>Alamat Vendor {sortBy==="alamat_vendor" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                       <th className="border-0 text-wrap">No. Telepon</th>
                       <th className="border-0 text-wrap">No. Kendaraan</th>
                       <th className="border-0 text-wrap">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="scroll scroller-tbody">
                     {currentItems.map((vendor, index) => (
                       <tr key={vendor.id_vendor}>
                       <td className="text-center">{vendor.id_vendor}</td>
                       <td className="text-center">{vendor.nama_vendor}</td>
                       <td className="text-center">{vendor.alamat_vendor}</td>
                       <td className="text-center">{vendor.no_telepon}</td>
                       <td className="text-center">{vendor.no_kendaraan}</td>
                       <td className="text-center">
                       <Button
                         className="btn-fill pull-right warning"
                         type="button"
                         variant="warning"
                         onClick={() => {
                           setShowEditModal(true);
                           setSelectedVendor(vendor);
                           // console.log("Berhasil");
                         }}
                         style={{
                           width: 103,
                           fontSize: 14,
                         }}>
                         <FaRegEdit style={{ marginRight: '8px' }} />
                         Ubah
                       </Button>
                       <Button
                         className="btn-fill pull-right ml-2"
                         type="button"
                         variant="danger"
                         onClick={() => deleteVendor(vendor.id_vendor)}
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
