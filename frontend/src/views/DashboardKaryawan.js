import React, { useEffect, useState } from "react";
import {FaFilePdf, FaTrashAlt, FaRegFileAlt, FaMoneyBillWave, FaHandHoldingUsd, FaHourglassStart, FaClipboardCheck, FaExclamationTriangle, FaFolder } from 'react-icons/fa'; 
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
import cardBeranda from "../assets/img/dashboard3.png";

import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col,
  Table,
  Modal, 
} from "react-bootstrap";

 function DashboardKaryawan() {
  const history = useHistory();
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [items, setItems] = useState([]);
  const [id_karyawan, setIdKaryawan] = useState("");
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
  const [showModal, setShowModal] = useState(false); 
  const [deletedPengajuan, setDeletedPengajuan] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
    const username = localStorage.getItem("username");
      if (!token || !username) return;
      try {
        const response = await axios.get(`http://localhost:5000/user-details/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          const usr = {
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            divisi: response.data.divisi,
          }
          setUserData(usr);
          setIdKaryawan(usr.id_karyawan || "");
          setItems(prev => prev.map(it => ({ ...it, id_karyawan: it.id_karyawan || usr.id_karyawan || "" })));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  });

  const getPengajuan = async() => {
      try {
          const resp = await axios.get(`http://localhost:5000/pengajuan`, {
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
  .filter((item) => item.id_karyawan === userData.id_karyawan)
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
    (dataPengajuan.createdAt && String(dataPengajuan.createdAt).toLowerCase().includes(searchQuery))
  );


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
    const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => {
      return Array.from(tr.querySelectorAll("td")).map((td) => td.innerText.trim());
    });

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: [headers],
      body: rows,
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
      await axios.delete(`http://localhost:5000/delete-pengajuan/${deletedPengajuan}`,
      {
        headers: {Authorization: `Bearer ${token}`}
      }
      ); 
      setShowModal(false);
      toast.success("Data Pengajuan berhasil dihapus.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getPengajuan(); 
    } catch (error) {
      console.log(error.message); 
    }
  };

  const handleDetail = (pengajuan) => {
    history.push({
      pathname: "/user/detail-pengajuan-user",
      state: {selectedPengajuan: pengajuan}
    });
  }

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

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const [resTotalPenjualan, resTotalScrapping, resJumlahBelumDiproses, resPengajuanSelesai] = await Promise.all([
          axios.get(`http://localhost:5000/total-penjualan/${id_karyawan}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/total-scrapping/${id_karyawan}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/jumlah-belum-diproses/${id_karyawan}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/jumlah-pengajuan-selesai/${id_karyawan}`, {
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
    setDeletedPengajuan(id_pengajuan);
    setShowModal(true);
  };

  const handleDokPengajuan = (pengajuan) => {
    history.push({
      pathname: "/user/dok-pengajuan",
      state: {selectedPengajuan: pengajuan}
    });
  }

  return (
    <>
    {loading === false ? 
      (<div className="App">
        <Container fluid>
          <Row>
            <Col md="12">
              <div className="home-card w-100">
                <div className="card-content">
                  <h2 className="card-title">Hai, {userData.nama}!</h2>
                  <h4 className="card-subtitle">Ajukan Penjualan/Scrapping Barang Bekas disini.</h4><hr/>
                  <p className="text-danger">*Sistem akan logout secara otomatis dalam 5 menit jika tidak terdapat aktifitas dalam sistem.</p>
                </div>
                <div className="card-opening">
                  <img 
                    src={cardBeranda}
                    alt="Beranda Illustration"
                  /> 
                </div>
              </div>
            </Col>
          </Row>

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
            {/* <Col lg="3" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaHandHoldingUsd className="text-success" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Uang Keluar</p>
                      </div>
                    </Col>
                    <Col>
                    <div className="text-right">
                      <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">Rp {formatRupiah(totalScrapping || 0)}</h3></Card.Title>
                    </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr />
                  <div className="stats">Scrapping</div>
                </Card.Footer>
              </Card>
            </Col> */}

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

          <Row className="mt-1">
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={downloadPDF}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>
            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
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
                              <th className="border-0">ID Pengajuan</th>
                              <th className="border-0">Pemohon</th>
                              <th className="border-0">Divisi</th>
                              <th className="border-0">Jenis Pengajuan</th>
                              <th className="border-0">Status</th>
                              <th className="border-0">Diajukan</th>
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
                                    <Badge bg="danger" text="light" className="p-2">Belum Diproses</Badge>
                                  ) : pengajuan.GeneratePengajuan?.status ? (
                                    <Badge bg="success" text="light" className="p-2">Selesai</Badge>
                                  ) : null}
                                </td>
                                <td className="text_center">{new Date(pengajuan.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">
                                  <Button className="btn-fill pull-right info mt-2 btn-reset" variant="info" onClick={() => handleDetail(pengajuan)} style={{ width: 103, fontSize: 14 }}>
                                    <FaRegFileAlt style={{ marginRight: '8px' }} />
                                    Detail
                                  </Button>
                                  <Button className="btn-fill pull-right info mt-2 btn-reset" variant="primary" onClick={() => handleDokPengajuan(pengajuan)} style={{ width: 157, fontSize: 14 }}>
                                    <FaFolder style={{ marginRight: '8px' }} />
                                    Dok. Pengajuan
                                  </Button>
                                  <Button className="btn-fill pull-right danger mt-2 btn-reset" variant="danger" hidden={pengajuan?.GeneratePengajuan?.status === "Selesai"} onClick={() => handleDeletePengajuan(pengajuan.id_pengajuan)} style={{ width: 100, fontSize: 13 }}>
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

export default DashboardKaryawan;