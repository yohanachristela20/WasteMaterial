import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaUserLock, FaSortUp, FaSortDown} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddUser from "components/ModalForm/AddUser.js";
import EditUser from "components/ModalForm/EditUser.js";
import ImportUser from "components/ModalForm/ImportUser.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import { useLocation, useHistory } from "react-router-dom";

import {Button, Container, Row, Col, Card, Table, Spinner, Badge} from "react-bootstrap";

function MasterUser() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [user, setUser] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState([]);

  const [sortBy, setSortBy] = useState("id_user");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const filteredUser = detailUser.filter((user) =>
    (user.id_user && String(user.id_user).toLowerCase().includes(searchQuery)) ||
    (user.username && String(user.username).toLowerCase().includes(searchQuery)) ||
    (user.role && String(user.role).toLowerCase().includes(searchQuery)) ||
    (user.user_active && String(user.user_active).toLowerCase().includes(searchQuery)) ||  //Cari dengan true/false 
    (user.KaryawanPengguna?.nama && String(user.KaryawanPengguna?.nama).toLowerCase().includes(searchQuery)) ||
    (user.KaryawanPengguna?.divisi && String(user.KaryawanPengguna?.divisi).toLowerCase().includes(searchQuery)) ||
    (user.createdAt && String(user.createdAt).toLowerCase().includes(searchQuery)) ||
    (user.updatedAt && String(user.updatedAt).toLowerCase().includes(searchQuery))
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

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  };

  const sortedUser = [...filteredUser].sort((a, b) => {
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
  const currentItems = sortedUser.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  }

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getUser();
    fetchUserData();
    getDetailUsers();
  }, []); 

  const getUser = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  const getDetailUsers = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/detail-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDetailUser(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };
  

  const deleteUser = async(id_user) =>{
    try {
      await axios.delete(`http://localhost:5000/user/${id_user}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("User berhasil dihapus!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      window.location.reload();
      getUser(); 
    } catch (error) {
      console.log(error.message); 
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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getUser();
    toast.success("Data user baru berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getUser();
    toast.success("Data user berhasil diperbarui!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getUser();
    toast.success("Data User berhasil diimport!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadCSV = (data) => {
    const header = ["id_user", "nama_karyawan", "divisi" , "username", "role"];
    const rows = currentItems.map((item) => [
      item.id_user,
      item.KaryawanPengguna?.nama,
      item.KaryawanPengguna?.divisi,
      item.username,
      item.role,
    ]);
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "master_user.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Master User", 12, 20);

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
  
    const headers = [["ID User", "Nama Karyawan", "Divisi", "Username", "Role", "Dibuat", "Terakhir Diubah"]];
  
    // const rows = currentItems.map((item) => [
    //   item.id_user,
    //   item.KaryawanPengguna?.nama,
    //   item.KaryawanPengguna?.divisi,
    //   item.username,
    //   item.role,
    //   (new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')),
    //   (new Date(item.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', ''))
    // ]);

    const allRows = currentItems.map((u) => {
      const id = u.id_user || "";
      const nama = u.KaryawanPengguna?.nama || "";
      const divisi = u.KaryawanPengguna?.divisi || "";
      const username = u.username || "";
      const role = u.role || "";
      const tanggal_dibuat = u.createdAt
        ? new Date(u.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
      const tanggal_diubah = u.updatedAt
        ? new Date(u.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')
        : "";
        return [id, nama, divisi, username, role, tanggal_dibuat, tanggal_diubah];
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: allRows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });
  
    doc.save("master_user.pdf");
  };

  const setPassword = async(id_user) => {
    try {

        await axios.put(`http://localhost:5000/user/${id_user}`, {
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        toast.success("Password berhasil diubah!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        getUser();    
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error('Gagal menyimpan data user baru.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
    }

  };
  
  return (
    <>
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

            <AddUser showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

            <EditUser
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                user={selectedUser}
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

          <ImportUser showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(user)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button>

          <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadPDF(user)}>
            <FaFilePdf style={{ marginRight: '8px' }} />
            Unduh PDF
          </Button>
          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          
          <Col md="12">
            <Card className="striped-tabled-with-hover mt-2">
              <Card.Header>
                <Card.Title as="h4">Master User</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : (
                <Table className="table-hover table-striped">
                  <div className="table-scroll" style={{ height: 'auto' }}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th onClick={() => handleSort("id_user")}>ID User {sortBy==="id_user" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("KaryawanPengguna.nama")}>Nama Karyawan {sortBy==="KaryawanPengguna.nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("KaryawanPengguna.divisi")}>Divisi{sortBy==="KaryawanPengguna.divisi" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("username")}>Username {sortBy==="username" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("role")}>Role {sortBy==="role" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("user_active")}>Status {sortBy==="user_active" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("createdAt")}>Dibuat {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("updatedAt")}>Terakhir Diubah {sortBy==="updatedAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0">Aksi</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        {currentItems.map((user, index) => (
                        <tr key={user.id_user}>
                          <td className="text-center">{user.id_user}</td>
                          <td className="text-center">{user.KaryawanPengguna?.nama}</td>
                          <td className="text-center">{user.KaryawanPengguna?.divisi}</td>
                          <td className="text-center">{user.username}</td>
                          <td className="text-center">{user.role}</td>
                          <td className="text-center">
                            {user.user_active === true ? (
                              <Badge pill bg="success p-2" style={{ color: 'white'}} >
                                Aktif
                              </Badge >
                              ) : (
                              <Badge pill bg="secondary p-2" style={{ color: 'white'}} >
                                Tidak Aktif
                              </Badge >
                            )}
                          </td>
                          <td className="text-center">{new Date(user.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                          <td className="text-center">{new Date(user.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                         
                          <td className="text-center">
                          <Button
                            className="btn-fill info btn-reset mt-2"
                            variant="info"
                            onClick={() => {
                              setShowEditModal(true);
                              setSelectedUser(user);
                            }}
                            style={{
                              width: 110,
                              //96
                              fontSize: 13,
                            }}>
                            <FaRegEdit style={{ marginRight: '8px' }} />
                            Ubah
                          </Button>
                          <Button
                            className="btn-fill primary btn-reset mt-2"
                            variant="primary"
                            onClick={() => {
                              setPassword(user.id_user)
                            }}
                            style={{
                              width: 138,
                              fontSize: 13,
                            }}>
                            <FaUserLock style={{ marginRight: '8px' }} />
                            Set Password
                          </Button>
                          <Button
                            className="btn-fill pull-right warning mt-2 btn-reset"
                            variant="danger"
                            onClick={() => deleteUser(user.id_user)}
                            style={{
                              width: 110,
                              //103
                              fontSize: 13,
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
                  totalItemsCount={filteredUser.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>
        </Row>
        
      </Container>
    </>
  );
}

export default MasterUser;
