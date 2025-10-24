import React, { useState, useEffect, useMemo } from "react";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaPlusCircle, FaTrashAlt} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import {toast } from 'react-toastify';


import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col, 
  Table,
  FormControl
} from "react-bootstrap";

function PengajuanScrapping() {
  const location = useLocation();
   const history = useHistory();

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
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [tujuan, setTujuan] = useState("");
  const [role, setRole] = useState("");
  
  const token = localStorage.getItem("token");

  const IDPengajuan = async(e) => {
        const response = await axios.get('http://localhost:5000/getLastPengajuanID', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const newId = response.data?.newId || "";
        setIDPengajuan(newId);
    };



  const tujuanPengajuan = async(e) => {
    setJenisPengajuan("SCRAPPING");
  };

  useEffect(() => {
      IDPengajuan();
      tujuanPengajuan();
  }, []);

  const getNamaKategori = async() => {
      try {
          const response = await axios.get('http://localhost:5000/namaKategori', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

          const options = (response.data || []).map(item => ({
              value: item.id_kategori, 
              label: item.nama,
          }));

          setNamaKategori(options);
          
          // console.log("nama options:", options);

      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const getNamaBarang = async() => {
      try {
          const response = await axios.get('http://localhost:5000/namaBarang', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

          const options = (response.data || []).map(item => ({
              value: item.id_barang, 
              label: item.nama,
          }));

          setNamaBarang(options);
          
          // console.log("nama brg:", options);

      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const parseNumberString = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\./g, "").replace(/,/g, ".")) || 0;
  }

  const getDetailKategori = async(idBarang, idx) => {
      if (!idBarang) return;
      try {
          const resp = await axios.get(`http://localhost:5000/detail-kategori/${idBarang}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          const data = resp.data || {};
          setItems(prev => {
            const copy = [...prev];
            const hargaNum = parseFloat(data?.harga_barang || 0);
            const jumlahNum = parseFloat(copy[idx]?.jumlah_barang || 0);

            copy[idx] = {
              ...copy[idx],
              id_barang: data.id_barang || "",
              id_kategori: data.id_kategori || "",
              kategori: data.kategori || "",
              jenis_barang: data.jenis_barang || "",
              harga: hargaNum,
              satuan: data.satuan || "",
              total: hargaNum * jumlahNum,
              // tujuan: "Penjualan",
            };
            // const h = parseNumberString(copy[idx].harga);
            // const j = parseNumberString(copy[idx].jumlah_barang);
            // copy[idx].total = h * j;
            return copy;
          });
      } catch (error) {
          console.error("Error fetching barang details:", error.message);
          // setIdKategori("");
          toast.error("Gagal mengambil detail barang.")
      }
  };

  
  const getDetailPengajuan = async() => {
      try {
          const resp = await axios.get(`http://localhost:5000/detail-pengajuan`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          
          setDetailPengajuan(resp.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Unauthorized: Token is invalid or expired.");
        } else {
          console.error("Error fetching data:", error.message);
        }
      }
  };

  useEffect(() => {
      getNamaKategori();
      getNamaBarang();
      getDetailPengajuan();

      setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredPengajuan = detailPengajuan.filter((dataPengajuan) => 
    (dataPengajuan.id_pengajuan && String(dataPengajuan.id_pengajuan).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.Pemohon?.divisi && String(dataPengajuan.Pemohon?.divisi).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.BarangDiajukan?.nama && String(dataPengajuan.BarangDiajukan?.nama).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.BarangDiajukan?.id_kategori && String(dataPengajuan.BarangDiajukan?.id_kategori).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.jumlah_barang && String(dataPengajuan.jumlah_barang).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.total && String(dataPengajuan.total).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.kondisi && String(dataPengajuan.kondisi).toLowerCase().includes(searchQuery)) ||
    (dataPengajuan.jenis_pengajuan && String(dataPengajuan.jenis_pengajuan).toLowerCase().includes(searchQuery))
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

  const handleJumlahBarang = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setJumlahBarang(numericValue);
  };

  useEffect(() => {
    const totalNum = parseFloat(harga) * parseFloat(jumlah_barang) || 0;
    setTotal(totalNum);
  }, [harga, jumlah_barang]);

  useEffect(() => {
    const fetchUserData = async () => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    setRole(role);

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
          // setItems(prev => prev.map(it => ({ ...it, id_karyawan: it.id_karyawan || usr.id_karyawan || "" })));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  });

  const blankItem = () => ({
    key: Date.now() + Math.random(),
    id_barang: "",
    selectedBarang: null,
    id_kategori: "",
    kategori: "",
    jenis_barang: "",
    harga: 0,
    satuan: "",
    jumlah_barang: "",
    total: 0,
    kondisi: "",
    kondisi_lainnya: "",
    jenis_pengajuan: "",
    id_karyawan: userData.id_karyawan || id_karyawan || "",
  });

  useEffect(() => {
    if (items.length === 0) setItems([blankItem()]);
  }, []);

  const handleAddCard = () => {
    setItems(prev => [...prev, blankItem()]);
  };

  const handleRemoveItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };


  const handleSubmit = async(e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Tidak ada item untuk diajukan."); return; }

    for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const idx = i + 1;
    
          if (!it.id_barang){
            toast.error(`Item ${idx}: Pilih barang terlebih dahulu`);
            return;
          }
          if (!it.kondisi || it.kondisi === ""){
            toast.error(`Item ${idx}: Pilih kondisi barang!`);
            return;
          }
          if (it.kondisi === "Lainnya" && (!it.kondisi_lainnya || it.kondisi_lainnya.trim() === "")){
            toast.error(`Item ${idx}: Pilih kondisi barang!`);
            return;
          }
    }

    try {
      const payload = items.map(it => ({
        id_pengajuan,
        jumlah_barang: it.jumlah_barang,
        total: it.total,
        // kondisi: it.kondisi !== "Lainnya" ? it.kondisi : it.kondisi_lainnya,
        kondisi: it.kondisi_lainnya !== "" ? it.kondisi_lainnya : it.kondisi,
        jenis_pengajuan,
        id_karyawan: it.id_karyawan || userData.id_karyawan || id_karyawan || "",
        id_barang: it.id_barang,
      }));
      await axios.post('http://localhost:5000/generate-pengajuan', {
        id_pengajuan,
        status: "Belum Diproses"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await axios.post('http://localhost:5000/pengajuan', { items: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (role === "Admin") {
        history.push("/admin/data-pengajuan");
      } else if (role === "User") {
        history.push("/user/data-pengajuan-user");
      }
      toast.success("Pengajuan berhasil dikirim.");
      setItems([blankItem()]); //clear item
      IDPengajuan();
    } catch (error) {
      console.error(error);
      console.log("Error:", error.message);
      toast.error("Gagal mengirim pengajuan.");
    }
  }

  const handleItemChange = (idx, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };

      if (field === "id_barang") {
        const sel = namaBarang.find(b => b.value === value) || null;
        copy[idx].selectedBarang = sel;
      }

      const hargaNum = parseFloat(String(copy[idx].harga || 0)) || 0;
      const jumlahNum = parseFloat(String(copy[idx].jumlah_barang || 0)) || 0;
      copy[idx].total = hargaNum * jumlahNum;

      return copy;
    });
  };




  return (
    <>
      <Container fluid>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col className="card-screening">
              <Card className="card-screening p-4">
                <Card.Header>
                  <Card.Title as="h4"><strong>Pengajuan Scrapping Waste Material</strong></Card.Title>
                  <hr />
                </Card.Header>
                <Card.Body>
                  <Row className="mt-3 mb-2">
                    <Col md="6">
                      <Form.Group className="mb-2">
                        <label>ID Pengajuan</label>
                        <Form.Control disabled type="text" value={id_pengajuan} />
                      </Form.Group>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-2">
                        <label>Divisi</label>
                        <Form.Control disabled type="text" value={userData.divisi} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {items.map((item, idx) => (
                    <Card className="my-4" key={item.key}>
                      <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>Item {idx + 1}</strong>
                          <Button disabled={items.length < 2} variant={items.length < 2 ? "secondary" : "danger"} size="sm" className={items.length < 2 ? "btn-fill" : ""} onClick={() => handleRemoveItem(item.key)} > <FaTrashAlt style={{ marginRight: '3px' }}  /> Hapus</Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md="6">
                            <Form.Group className="mb-2">
                              <span className="text-danger">*</span>
                              <label>Barang</label>
                              <Form.Select
                                className="form-control"
                                value={item.id_barang || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleItemChange(idx, "id_barang", val);
                                  getDetailKategori(val, idx);

                                }}
                              >
                                <option className="placeholder-form" key="blankChoice" hidden value="">
                                    Pilih Barang
                                </option>
                                {namaBarang.map(option => (
                                    <option key={option.value} value={option.value} hidden={option.value === id_barang}>
                                        {option.label}
                                    </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Kategori</label>
                              <Form.Control type="text" value={item.kategori || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Jenis Barang</label>
                              <Form.Control type="text" value={item.jenis_barang || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Satuan</label>
                              <Form.Control type="text" value={item.satuan || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Harga (Rp)</label>
                              <Form.Control type="text" value={formatRupiah(item.harga)} disabled />
                            </Form.Group>
                          </Col>

                          <Col md="6">    
                            <Form.Group className="mb-2 mt-1">
                              <span className="text-danger">*</span>
                              <label>Jumlah Barang</label>
                              <Form.Control
                                type="text"
                                required
                                value={item.jumlah_barang}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  handleItemChange(idx, "jumlah_barang", val);
                                }}
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Total (Rp)</label>
                              <Form.Control type="text" value={formatRupiah(item.total)} readOnly />
                            </Form.Group>

                            <Form.Group className="mb-2">
                              <span className="text-danger">*</span>
                              <label>Kondisi</label>
                              <Form.Select
                                className="form-control"
                                value={item.kondisi || ""}
                                required
                                onChange={(e) => handleItemChange(idx, "kondisi", e.target.value)}
                              >
                                <option className="placeholder-form" key='blankChoice' hidden value>Pilih Kondisi</option>
                                <option value="RUSAK">RUSAK</option>
                                <option value="TIDAK DIGUNAKAN">TIDAK DIGUNAKAN</option>
                                <option value="SISA PRODUKSI">SISA PRODUKSI</option>
                                <option value="LAINNYA">LAINNYA</option>
                              </Form.Select>
                            </Form.Group>

                            {item.kondisi === "LAINNYA" && (
                              <Form.Group className="mb-2">
                                <label>Kondisi Lainnya</label>
                                <Form.Control
                                  type="text"
                                  required={item.kondisi === "LAINNYA"}
                                  value={item.kondisi_lainnya || ""}
                                  onChange={(e) => handleItemChange(idx, "kondisi_lainnya", e.target.value.toUpperCase())}
                                />
                              </Form.Group>
                            )}

                            {/* <Form.Group className="mb-2">
                              <span className="text-danger">*</span>
                              <label>Tujuan</label>
                              <Form.Select
                                className="form-control"
                                value={item.jenis_pengajuan}
                                onChange={(e) => handleItemChange(idx, "jenis_pengajuan", e.target.value)}
                              >
                                <option className="placeholder-form" key='blankChoice' hidden value>Pilih Tujuan Pengajuan</option>
                                <option value="Penjualan">Penjualan</option>
                                <option value="Scrapping">Scrapping</option>
                              </Form.Select>
                            </Form.Group> */}

                            <Form.Group className="mb-2">
                              <label>Tujuan</label>
                              <Form.Control type="text" value={jenis_pengajuan} disabled />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  <Row>
                    <Col md="12" className="mt-2 d-flex gap-2">
                      <Button variant="success" type="button" className="mr-3 btn-fill" onClick={handleAddCard}>
                        <FaPlusCircle className="mb-1" /> Tambah Pengajuan
                      </Button>
                      <Button variant="primary" type="submit" className="btn-fill">Simpan</Button>
                    </Col>
                  </Row>

                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>

      </Container>
    </>
  );
}

export default PengajuanScrapping;