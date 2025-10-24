import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFilePdf, FaFileImport, FaLandmark, FaCoins, FaRegEdit, FaDownload, FaTrashAlt, FaHandHoldingUsd, FaUserFriends, FaUserCheck, FaFileContract, FaPlusCircle, FaRecycle, FaPaperclip, FaRegAddressBook, FaRegClone, FaRegClipboard, FaComment, FaArchive, FaRegFileAlt, FaFolder } from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ImportAntreanPengajuan from "components/ModalForm/ImportAntreanPengajuan.js";
import {toast } from 'react-toastify';
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";
import AddDataBarang from "components/ModalForm/AddDataBarang.js";
import { useLocation } from "react-router-dom";

import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  Spinner, 
  Modal, 
  Form,
  DropdownButton,
  ButtonGroup, 
  Dropdown
} from "react-bootstrap";

 function DataPengajuan() {
  const history = useHistory();
  const location = useLocation();

  const [id_pengajuan, setIDPengajuan] = useState("");
  const [nama, setNama] = useState("");
  const [nama_kategori, setNamaKategori] = useState([]);
  const [jenis_barang, setJenisBarang] = useState("");
  const [harga, setHarga] = useState(0);
  const [satuan, setSatuan] = useState("");
  const [id_kategori, setIdKategori] = useState("");
  const [kategori_barang, setKategoriBarang] = useState("");
  const [jumlah_barang, setJumlahBarang] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [namaBarang, setNamaBarang] = useState([]);
  const [id_barang, setIdBarang] = useState("");
  const [kategori, setKategori] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [kondisi_lainnya, setKondisiLainnya] = useState("");
  const [divisi, setDivisi] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [jenis_pengajuan, setJenisPengajuan] = useState("");
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [id_karyawan, setIdKaryawan] = useState("");
  const [pengajuan, setPengajuan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  
  // const getDetailPengajuan = async() => {
  //     try {
  //         const resp = await axios.get(`http://localhost:5000/detail-pengajuan`, {
  //             headers: {
  //                 Authorization: `Bearer ${token}`,
  //             }
  //         });
          
  //         setPengajuan(resp.data);
  //     } catch (error) {
  //       if (error.response?.status === 401) {
  //         console.error("Unauthorized: Token is invalid or expired.");
  //       } else {
  //         console.error("Error fetching data:", error.message);
  //       }
  //     }
  // };

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

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


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

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }
  
  const handleImportSuccess = () => {
    window.location.reload();
  };


  const downloadCSV = (data) => {
  const header = ["id_pengajuan", "tanggal_pengajuan", "tanggal_penerimaan", "jumlah_pinjaman", "jumlah_angsuran", "pinjaman_setelah_pembulatan", "rasio_angsuran", "keperluan", "id_peminjam", "id_asesor", "sudah_dibayar", "belum_dibayar", "bulan_angsuran", "status", "filepath_pernyataan"];

  if (!Array.isArray(data) || data.length === 0) {
    console.error("Data untuk CSV tidak valid atau kosong.");
    return;
  }

  const filteredData = data.filter(
    (item) =>
      item.status_pengajuan === "Diterima" &&
      item.status_transfer === "Selesai"
  );

  const rows = filteredData.map((item) => {
    // console.log("Pinjaman SudahDibayar:", item.SudahDibayar);
    
    const totalSudahDibayar = item.SudahDibayar
    ? item.SudahDibayar.reduce((total, angsuran) => {
        const sudahDibayar = angsuran.sudah_dibayar ? parseFloat(angsuran.sudah_dibayar) : 0;
        return total + sudahDibayar;
      }, 0)
    : 0;

    const belumDibayar = item.AngsuranPinjaman?.[0]?.belum_dibayar ?? item.pinjaman_setelah_pembulatan;
    const bulanAngsuran = item.AngsuranPinjaman?.[0]?.bulan_angsuran ?? 0;
    const status =
      item.AngsuranPinjaman &&
      item.AngsuranPinjaman[0] &&
      parseFloat(belumDibayar) === 0
        ? "Lunas"
        : "Belum Lunas";

    return [
      item.id_pinjaman ?? "N/A",
      item.tanggal_pengajuan ?? "N/A",
      item.tanggal_penerimaan ?? "N/A",
      item.jumlah_pinjaman ?? "N/A",
      item.jumlah_angsuran ?? "N/A",
      item.pinjaman_setelah_pembulatan ?? "N/A",
      item.rasio_angsuran ?? "N/A",
      item.keperluan ?? "N/A",
      item.id_peminjam ?? "N/A",
      item.id_asesor ?? "N/A",
      totalSudahDibayar,
      belumDibayar,
      bulanAngsuran,
      status, 
      item.filepath_pernyataan ?? "N/A",
    ];


  });

  // console.log("Baris CSV:", rows);

  const csvContent = [header, ...rows]
    .map((row) => row.join(","))
    .join("\n");

    try {
      const csvContent = [header, ...rows]
        .map((row) => (Array.isArray(row) ? row.join(",") : "")) // Validasi array sebelum join
        .join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "laporan_piutang.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Kesalahan saat membuat CSV:", error);
    }

  // console.log("Data untuk CSV:", data);

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
    // Format Data untuk Tabel
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

  // console.log("Id pinjaman: ", pinjaman.id_pinjaman);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };


  const handlePengajuan = () => {
    history.push("/admin/pengajuan");
  }

  const deletePengajuan = async(id_pengajuan) =>{
      try {
        await axios.delete(`http://localhost:5000/delete-pengajuan/${id_pengajuan}`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
        ); 
        toast.success("Data Pengajuan berhasil dihapus.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        // window.location.reload();
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


  return (
    <>
    {loading === false ? 
      (<div className="App">
        <Container fluid>
          <Row>
            <Col lg="3" sm="6">
                <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaLandmark className="text-warning" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Jumlah Plafond</p>
                      </div>
                    </Col>
                    <Col>
                    <div className="text-right">
                      {/* <Card.Title className="card-plafond" as="h4">Rp {formatRupiah(plafond || 0)}</Card.Title> */}
                    </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Jumlah Plafond
                  </div>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="3" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaCoins className="text-success" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Plafond Tersedia</p>
                      </div>
                    </Col>
                    <Col>
                    <div className="text-right">
                      {/* <Card.Title as="h4" className="card-plafond"> Rp
                        {(() => {
                          return formatRupiah(plafondTersedia); 
                        })()}
                      </Card.Title> */}
                    </div>
                    </Col>
                  </Row>
                  {/* )} */}
                </Card.Body>
                <Card.Footer>
                  <hr />
                  <div className="stats">Plafond Tersedia</div>
                </Card.Footer>
              </Card>
            </Col>

            <Col lg="3" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaHandHoldingUsd className="text-danger" />
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Jumlah Pinjaman</p>

                      </div>
                    </Col>
                    <Col>
                      <div className="text-right">
                      {/* <Card.Title as="h4" className="card-plafond">Rp {formatRupiah(totalPinjamanKeseluruhan)}</Card.Title> */}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Jumlah Pinjaman
                  </div>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="3" sm="6">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big icon-warning">
                        <FaUserFriends className="text-primary"/>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Jumlah Peminjam</p>
                      </div>
                    </Col>
                    <Col>
                      <div className="text-right">
                      {/* <Card.Title as="h4" className="card-plafond">{totalPeminjam}</Card.Title> */}
                      </div>
                    </Col>
                  </Row>
                  {/* )} */}
                </Card.Body>
                <Card.Footer>
                  <hr></hr>
                  <div className="stats">
                    Jumlah Peminjam
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>


          
          <Row className="mt-1">
          {/* <div>
            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="success"
              onClick={handlePengajuan}>
              <FaPlusCircle style={{ marginRight: '8px' }} />
              Pengajuan Barang Bekas
            </Button>
          </div> */}

          {/* <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}
              hidden={role === "Finance"}
              >
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
          </Button> */}
          
          {/* <ImportAntreanPengajuan showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} /> */}

          {/* <Button
            className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
            type="button"
            variant="primary"
            onClick={() => downloadCSV(pinjaman)}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Unduh CSV
          </Button> */}
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
                                    <Badge pill bg="danger" text="light" className="p-2">Belum Diproses</Badge>
                                  ) : pengajuan.GeneratePengajuan?.status ? (
                                    <Badge pill bg="success" text="light" className="p-2">Selesai</Badge>
                                  ) : null}
                                </td>
                                <td className="text_center">{new Date(pengajuan.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">
                                  <Button className="btn-fill pull-right warning" variant="warning" onClick={() => handleProses(pengajuan)} style={{ width: 103, fontSize: 14 }} hidden={pengajuan.GeneratePengajuan?.status === "Selesai"}>
                                    <FaRecycle style={{ marginRight: '8px' }} />
                                    Proses
                                  </Button>
                                  <Button className="btn-fill pull-right info mt-2" variant="info" onClick={() => handleDetail(pengajuan)} style={{ width: 103, fontSize: 14 }}>
                                    <FaRegFileAlt style={{ marginRight: '8px' }} />
                                    Detail
                                  </Button>
                                  <ButtonGroup vertical>
                                    <DropdownButton className="pull-right primary mt-2" as={ButtonGroup} variant="primary btn-fill"  title={<span style={{fontSize: 14}}><FaFolder style={{ marginRight: '8px', marginBottom: '2px' }}/>Dokumen</span>} id="bg-vertical-dropdown-1">
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
                                  <Button className="btn-fill pull-right danger mt-2" variant="danger" onClick={() => deletePengajuan(pengajuan.id_pengajuan)} style={{ width: 100, fontSize: 13 }}>
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