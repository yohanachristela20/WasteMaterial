import React, { useEffect, useState } from "react";
import {FaPlusCircle, FaRegTimesCircle, FaSortUp, FaSortDown, FaFileContract} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import AddPengajuan from "components/ModalForm/AddPengajuan.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Modal, 
  Spinner, 
  Form
} from "react-bootstrap";


// ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

function RiwayatPengajuanKaryawan() {
  const [pinjaman, setPinjaman] = useState([]); 
  const [pinjamanData, setPinjamanData] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [message, setMessage] = useState("");
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);
  const [plafondTersedia, setPlafondTersedia] = useState([]);
  const history = useHistory(); 
  const [error, setError] = useState("");
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [totalPeminjam, setTotalPeminjam] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false); 
  const [totalSudahDibayar, setTotalDibayar] = useState([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_pinjaman");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const [file, setFile] = useState(null);
  const [filepath_pernyataan, setFilePathPernyataan] = useState("");
  const [id_pinjaman, setIdPinjaman] = useState("");
  const [pinjamanById, setPinjamanById] = useState([]);
  

  const filteredPinjamanFinal = pinjaman
  .filter((item) => item.id_peminjam === userData.id_karyawan)
  .filter((pinjaman) => 
    (pinjaman.id_pinjaman && String(pinjaman.id_pinjaman).toLowerCase().includes(searchQuery)) ||
    (pinjaman.tanggal_pengajuan && String(pinjaman.tanggal_pengajuan).toLowerCase().includes(searchQuery)) ||
    (pinjaman?.Asesor?.nama && String(pinjaman.Asesor.nama).toLowerCase().includes(searchQuery)) ||
    (pinjaman.keperluan && String(pinjaman.keperluan).toLowerCase().includes(searchQuery)) ||
    (pinjaman.status_pengajuan && String(pinjaman.status_pengajuan).toLowerCase().includes(searchQuery)) ||
    (pinjaman.status_transfer && String(pinjaman.status_transfer).toLowerCase().includes(searchQuery))
  )

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

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

  const sortedPengajuan = filteredPinjamanFinal.sort((a, b) => {
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
  const currentItems = sortedPengajuan.slice(indexOfFirstItem, indexOfLastItem);

  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    // console.log("User token: ", token, "User role:", role);
    try {
      if (!token || !username) return;

      const response = await axios.get(`http://localhost:5000/user-details/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUserData({
          id_karyawan: response.data.id_karyawan,
          nama: response.data.nama,
          divisi: response.data.divisi,
          role: response.data.role, 
        });
        // console.log("User data fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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


  useEffect(()=> {
    try {
      Promise.all([
        axios.get("http://localhost:5000/total-pinjaman-keseluruhan", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }),
        axios.get("http://localhost:5000/total-peminjam", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }),
        axios.get("http://localhost:5000/total-dibayar", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        }), 
        axios.get("http://localhost:5000/plafond-tersedia", {
          headers: {
            Authorization: `Bearer ${token}`,
        },
        })
      ])
        .then(([responseTotalPinjaman, responseTotalPeminjam, responseTotalDibayar, responsePlafond]) => {
          if (responseTotalPinjaman.data && responseTotalPinjaman.data.totalPinjamanKeseluruhan !== undefined) {
            const totalPinjamanKeseluruhan = responseTotalPinjaman.data.totalPinjamanKeseluruhan || 0;
            setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);  
          } else {
            console.error("Total Pinjaman not found in the response:", responseTotalPinjaman.data);
            setTotalPinjamanKeseluruhan(0); 
          }
  
          const totalPeminjam = responseTotalPeminjam.data.totalPeminjam || 0;
          const totalSudahDibayar = responseTotalDibayar.data.total_dibayar || 0;
  
          setPlafondTersedia(responsePlafond.data.plafondTersedia); 
  
  
          setTotalPeminjam(totalPeminjam); 
          setTotalDibayar(totalSudahDibayar);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } catch (error) {
      console.error(error.message);
    }
  }, [token]); 

  useEffect(() => {
    fetchUserData();
    getPinjaman();
    getPinjamanData();
    getAntrean();
    fetchAntrean();

    setTimeout(() => setLoading(false), 2000)
  }, []);

  const data_plafond = {
    labels: ['Total Pinjaman', 'Plafond Tersedia'],
    datasets: [
      {
        label: 'Pinjaman Overview',
        data: [
          totalPinjamanKeseluruhan,
          plafondTersedia
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverOffset: 4
      }
    ]
  };

  const getPinjaman = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/pinjaman", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setPinjaman(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  const isAjukanDisabled = pinjaman.some(
    (item) => 
      item.id_peminjam === userData?.id_karyawan &&
      item.status_pelunasan !== "Lunas"
  );

  const getPinjamanData = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/pinjaman-data", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setPinjamanData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  
  const getAntrean = async () => {
    try {
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

const findNomorAntrean = (id_pinjaman) => {
  // console.log("Searching for antrean with id_peminjam:", id_pinjaman);

  const antreanRecord = antrean.find((item) => item.id_pinjaman === id_pinjaman);
  if (antreanRecord) {
    console.log("Found antrean record:", antreanRecord);
  } else {
    console.log("No antrean record found for id_pinjaman:", id_pinjaman);
  }

  return antreanRecord ? antreanRecord.nomor_antrean : '-';
};

  const handleDeleteFile = async(pinjaman) => {
   try {
    const response = await axios.delete(`http://localhost:5000/delete-file/${pinjaman.id_pinjaman}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('File berhasil dihapus.', {
      position: "top-right", 
      autoClose: 5000,
      hideProgressBar: true,
    });

    getPinjaman(); 
    getAntrean();
   } catch (error) {
    console.error('Error deleting file:', error.response ? error.response.data : error.message);
      toast.error('Gagal menghapus file.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
   }
  }


  const handleBatalPengajuan = async (pinjaman) => {
    try {
      handleDeleteFile(pinjaman);
      const response = await axios.put(`http://localhost:5000/batal-pengajuan/${pinjaman.id_pinjaman}`, {
        status_pengajuan: "Dibatalkan",
        status_transfer: "Dibatalkan",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
  
      setShowModal(false);
 
      toast.success('Pengajuan berhasil dibatalkan!', {
        position: "top-right", 
        autoClose: 5000,
        hideProgressBar: true,
      });
  
      getPinjaman(); 
      getAntrean();

  
    } catch (error) {
      console.error('Error updating status_pengajuan:', error.response ? error.response.data : error.message);
      toast.error('Gagal memperbarui status pengajuan.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };


  const handleAddSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Data pengajuan baru berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

  
  const handleModalOpen = (pinjaman) => {
    setSelectedPinjaman(pinjaman); 
    setShowModal(true); 
  };

  const handlePengajuanOpen = (pinjaman) => {
    setSelectedPinjaman(pinjaman); 
    setShowAddModal(true); 
  };

    const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    };

    // const handleFileUpload = async() => {
    // if (!file) {
    //     toast.error("Silakan pilih file PDF terlebih dahulu.");
    //     return;
    // }
    // if (file.type !== "application/pdf") {
    //     toast.error("File harus berformat PDF.");
    //     return;
    // }
    

    // const formData = new FormData();
    // formData.append("pdf-file", file);
    // formData.append("id_pinjaman", pinjaman.id_pinjaman);

    // console.log('Id pinjaman: ', pinjaman.id_pinjaman);
    // console.log('Form data: ', formData);

    // fetch("http://localhost:5000/upload-pernyataan", {
    //     method: "PUT",
    //     body: formData,
    //     headers: {
    //     Authorization: `Bearer ${token}`,
    //     },
    // })
    // .then(async (response) => {
    //     const data = await response.json();
    //     console.log('File path saved: ', data.filePath);
    //     if (!response.ok) {
    //     throw new Error(data.message || "Gagal mengunggah.");
    //     }

    //     setFilePathPernyataan(data.filePath);
    //     toast.success("File berhasil diunggah.");
    //     // setShowImportModal(false);
    //     setShowAddModal(false);
    //     // handleFilepath();
    //     // onSuccess();
    // })
    // .catch((error) => {
    //     toast.error(`Gagal: ${error.message}`);
    // });

    // };
  
    const handleFilepath = async(selectedPinjaman) => {
        try {       
          if (!file) {
            toast.error("Silakan pilih file PDF terlebih dahulu.");
            return;
          }

          const formData = new FormData();
          formData.append("pdf-file", file);
          formData.append("id_pinjaman", selectedPinjaman.id_pinjaman)

          const uploadResponse = await fetch("http://localhost:5000/upload-pernyataan", {
            method: "PUT",
            body: formData,
            headers: {
            Authorization: `Bearer ${token}`,
            }
          });

          const uploadData = await uploadResponse.json();

          if (!uploadResponse.ok) {
            throw new Error(uploadData.message || "Gagal mengunggah file.");
          }

          const uploadFilePath = uploadData.filePath;
          console.log('File path yang berhasil diupload: ', uploadFilePath);

          const response = await axios.put(`http://localhost:5000/unggah-permohonan/${selectedPinjaman.id_pinjaman}`, {
            filepath_pernyataan: uploadFilePath,
          }, {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });

          console.log('Update filepath pernyataan berhasil: ', response.data);
          setShowAddModal(false);
          toast.success('Filepath berhasil diperbarui!', {
            position: "top-right", 
            autoClose: 5000,
            hideProgressBar: true,
          });

          fetchUserData();
          getPinjaman();
          getPinjamanData();
          
        } catch (error) {
          console.error('Gagal mengupdate filepath:', error.response ? error.response.data : error.message);
          toast.error('Gagal memperbarui filepath.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
        }
    }
  

  const downloadCSV = (data) => {
    const header = ["id_pinjaman", "tanggal_pengajuan", "nomor_antrean", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "keperluan", "status_pengajuan", "status_transfer", "id_peminjam", "id_asesor"];
    
    const filteredData = data.filter(
      (item) =>
        item.status_pengajuan === "Ditunda" ||
        item.status_transfer === "Belum Ditransfer"
    );
    
    const rows = data.map((item) => {

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
        item.keperluan,
        item.status_pengajuan,
        item.status_transfer,
        item.id_peminjam,
        item.id_asesor
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

  return (
    <>
    {loading === false ? 
      (<div className="App">
      <Container fluid>
      {/* <ToastContainer /> */}
      <Heartbeat/>
        <Row className="mb-4">
            {/* <div>
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="success"
              onClick={() => setShowAddModal(true)}
              // disabled={pinjaman.status_pelunasan !== "Lunas"}
              disabled={isAjukanDisabled}
              >
              <FaPlusCircle style={{ marginRight: '8px' }} />
              Ajukan Pinjaman
            </Button>

            <AddPengajuan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />
            </div> */}

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        </Row>
          
        <Row>
          <Col md="12" className="mt-1">
            <Card className="striped-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Riwayat Pengajuan</Card.Title>
              </Card.Header>
              <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                 {/* {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : ( */}
                <Table className="table-hover table-striped">
                  <div className="table-scroll" style={{height: 'auto'}}>
                    <table className="flex-table table table-striped table-hover">
                      <thead>
                      <tr>
                        <th className="border-0" onClick={() => handleSort("id_pinjaman")}>ID Pinjaman {sortBy==="id_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("tanggal_pengajuan")}>Tanggal Pengajuan{sortBy==="tanggal_pengajuan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("jumlah_pinjaman")}>Jumlah Pinjaman{sortBy==="jumlah_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("jumlah_angsuran")}>Jumlah Angsuran{sortBy==="jumlah_angsuran" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("pinjaman_setelah_pembulatan")}>Jumlah Pinjaman Setelah Pembulatan{sortBy==="pinjaman_setelah_pembulatan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0" onClick={() => handleSort("id_pinjaman")}>ID Pinjaman {sortBy==="id_pinjaman" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                        <th className="border-0">Ditransfer Oleh</th>
                        <th className="border-0">Keperluan</th>
                        <th className="border-0">Tanggal Plafond Tersedia</th>
                        <th className="border-0">Status Pengajuan</th>
                        <th className="border-0">Status Transfer</th>
                        <th className="border-0">Aksi</th>
                      </tr>
                      </thead>
                      <tbody className="scroll scroller-tbody">
                        { currentItems
                        .map ((pinjaman) => ({
                          ...pinjaman,
                          nomor_antrean: findNomorAntrean(pinjaman.id_pinjaman),
                        }))
                        // .sort((a, b) => a.nomor_antrean - b.nomor_antrean)
                        .map((pinjaman) => (
                          <tr key={pinjaman.id_pinjaman}>
                          <td className="text-center">{pinjaman.id_pinjaman}</td>
                          <td className="text-center">{pinjaman.tanggal_pengajuan}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_pinjaman)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.jumlah_angsuran)}</td>
                          <td className="text-right">{formatRupiah(pinjaman.pinjaman_setelah_pembulatan)}</td>
                          <td className="text-right">{findNomorAntrean(pinjaman.id_pinjaman)}</td>
                          <td className="text-center">{pinjaman.Asesor ? pinjaman.Asesor.nama: 'N/A'}</td>
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
                                <Badge pill bg="secondary p-2">
                                Belum Ditransfer
                                </Badge >
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              className="btn-fill pull-right mb-2"
                              type="button"
                              variant="danger"
                              onClick={() => {
                                handleModalOpen(pinjaman); 
                              }}
                              disabled={pinjaman.status_pengajuan === "Diterima" || pinjaman.status_pengajuan === "Dibatalkan"}
                              style={{
                                width: 103,
                                fontSize: 14,
                              }}>
                              <FaRegTimesCircle style={{ marginRight: '8px' }} />
                              Batal
                            </Button>

                            <Button
                              className="btn-fill pull-right mb-2"
                              type="button"
                              variant="warning"
                              onClick={() => handlePengajuanOpen(pinjaman)}
                              disabled={pinjaman.filepath_pernyataan !== ""}
                              style={{width: 125, fontSize:14}}>
                              <FaFileContract style={{ marginRight: '8px' }}/>
                              Unggah Permohonan
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
                  totalItemsCount={filteredPinjamanFinal.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass="page-item"
                  linkClass="page-link"
            />
            </div>
          </Col>
        </Row>
      </Container>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Pembatalan Pengajuan Pinjaman</Modal.Title>
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
        <Modal.Body >
          <p>{userData.divisi || "Loading..."} : {userData.id_karyawan} - {userData.nama}</p>
          <p>
              ID Pinjaman: {selectedPinjaman?.id_pinjaman || "Tidak tersedia"} <br />
              Jumlah: {selectedPinjaman? formatRupiah(selectedPinjaman.jumlah_pinjaman) : "Tidak tersedia"}
            </p>
          Yakin ingin membatalkan pengajuan pinjaman?
        </Modal.Body>
        <Modal.Footer className="mb-4">
          <Button variant="success"  onClick={() => handleBatalPengajuan(selectedPinjaman)}>
            Ya
          </Button>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Tidak
          </Button>
        </Modal.Footer>
      </Modal>
      
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
                            <Button className="btn-fill w-100 mt-3" variant="primary" onClick={() => handleFilepath(selectedPinjaman)}>
                                Simpan
                            </Button>
                            </a>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal.Body>
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

export default RiwayatPengajuanKaryawan;

