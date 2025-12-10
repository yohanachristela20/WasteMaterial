import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {FaPlusCircle, FaTrashAlt} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import {toast } from 'react-toastify';
import PendingAlert from "components/Alert/PendingAlert.js";
import Select from "react-select";

import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col, 
} from "react-bootstrap";

function PengajuanScrapping() {
  const history = useHistory();
  const [id_pengajuan, setIDPengajuan] = useState("");
  const [nama_kategori, setNamaKategori] = useState([]);
  const [jumlah_barang, setJumlahBarang] = useState("");
  const [id_barang, setIdBarang] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [jenis_pengajuan, setJenisPengajuan] = useState("");
  const [total, setTotal] = useState(0);
  const uniqueKey = () => Date.now() + Math.random();
  const [items, setItems] = useState([{key: uniqueKey(), namaBarang: null, id_barang: "", jumlah_barang: "", harga: 0, total: 0, kondisi_lainnya: ""}]);
  const [id_karyawan, setIdKaryawan] = useState("");
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [prevId, setPrevId] = useState(null);
  const previousId = useRef();  
  const [statusPrevPengajuan, setStatusPrevPengajuan] = useState([]);
  const [harga, setHarga] = useState(0);
  const [isSearchable, setIsSearchable] = useState(true);

  const [namaBarang, setNamaBarang] = useState([]); //kunci
  const [kategoriList, setKategoriList] = useState([]);
  const [jenisBarangList, setJenisBarangList] = useState([]);
  const [satuanList, setSatuanList] = useState([]);
  const [hargaList, setHargaList] = useState([]);
  const [kondisiList, setKondisiList] = useState([]);
  const [lainnyaList, setLainnyaList] = useState([]);
  const [antrean, setAntrean] = useState([]);
  
  const token = localStorage.getItem("token");

  const handleSelect = (idx, option) => {
		const updatedItems = [...items];
    updatedItems[idx].namaBarang = option;
    updatedItems[idx].id_barang = option.value;
    setItems(updatedItems);
    getDetailKategori(option.value, idx);
	};

  const getFilterOptions = (idx) => {
    const selectedValues = items
    .map((item, i) => i !== idx ? item.id_barang: null)
    .filter(Boolean);
    return namaBarang.filter(opt => !selectedValues.includes(opt.value));
  };

  const IDPengajuan = async(e) => {
    const response = await axios.get('http://localhost:5001/getLastPengajuanID', {
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

  const findNomorAntrean = (IDPengajuan) => {
    const antreanItem = antrean.find(item => item.id_pengajuan === IDPengajuan);
    return antreanItem ? antreanItem.nomor_antrean : "-"; 
  };

  const isPreviousAccepted = (nomorAntrean) => {
    for (let i = 1; i < nomorAntrean; i++) {
      const prevItem = antrean.find(item => item.nomor_antrean === i); 
      if (prevItem && prevItem.status !== "Selesai") {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (id_pengajuan && typeof id_pengajuan === "string" && id_pengajuan.length >= 8) {
      previousId.current = id_pengajuan;
      
      const prefix = id_pengajuan.substring(0, 4); // Tahun - bulan
      const numericPart = id_pengajuan.substring(4, 8); // 4 digit nomor urut
      const suffix = id_pengajuan.slice(-2); //PG

      const numericValue = parseInt(numericPart, 10);
      if (!isNaN(numericValue) && numericValue > 1) {
        const decremented = (numericValue - 2).toString().padStart(4, '0');
        const calculatedPrevId = `${prefix}${decremented}${suffix}`;
        setPrevId(calculatedPrevId);
      }
    } else {
      setPrevId(null);
    }
  }, [id_pengajuan]);

  useEffect(() => {
    const getStatusPrevPengajuan = async() => {
      try {
        const res = await axios.get(`http://localhost:5001/prev-status/${prevId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setStatusPrevPengajuan(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching previous pengajuan status:", error.message);
      }
    };
    if (prevId) {
      getStatusPrevPengajuan();
    }
  }, [prevId, token]);

  const uniqueStatus = [
    ...new Map(
      statusPrevPengajuan.map((s) => [s?.prevId, s])
    ).values(),
  ];

  const getNamaKategori = async() => {
      try {
          const response = await axios.get('http://localhost:5001/namaKategori', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

          const options = (response.data || []).map(item => ({
              value: item.id_kategori, 
              label: item.nama,
          }));

          setNamaKategori(options);
          
      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const getNamaBarang = async() => {
      try {
          const response = await axios.get('http://localhost:5001/namaBarang', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
          });

          const options = (response.data || []).map(item => ({
            value: item.id_barang, 
            label: item.id_barang + " " + item.nama,
          }));

          setNamaBarang(options);
        
      } catch (error) {
        console.error("Error fetching data: ", error.message);
      }
  };


  const getDetailKategori = async(id_barang, idx) => {
    if (!id_barang) return;
    try {
      const resp = await axios.get(`http://localhost:5001/detail-kategori/${id_barang}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });

      const updatedKategori = [...kategoriList];
      updatedKategori[idx] = resp.data.kategori;

      const updatedJenisBarang = [...jenisBarangList];
      updatedJenisBarang[idx] = resp.data.jenis_barang;

      const updatedSatuan = [...satuanList];
      updatedSatuan[idx] = resp.data.satuan;

      const updatedHarga = [...hargaList];
      updatedHarga[idx] = resp.data.harga_barang;

      const updatedKondisi = [...kondisiList];
      updatedKondisi[idx] = resp.data.kondisi;

      const updatedKondisiLainnya = [...lainnyaList];
      updatedKondisiLainnya[idx] = resp.data.kondisi;

      setKategoriList(updatedKategori);
      setJenisBarangList(updatedJenisBarang);
      setSatuanList(updatedSatuan);
      setHargaList(updatedHarga);
      setKondisiList(updatedKondisi);
      setLainnyaList(updatedKondisiLainnya);

    } catch (error) {
      console.error("Error fetching barang details:", error.message);
      toast.error("Gagal mengambil detail barang.")
    }
  };

  
  const getDetailPengajuan = async() => {
      try {
          const resp = await axios.get(`http://localhost:5001/detail-pengajuan`, {
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

  const fetchAntrean = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/antrean`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      });
      setAntrean(response.data);
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
    }
  };

  useEffect(() => {
      getNamaKategori();
      getNamaBarang();
      getDetailPengajuan();
      fetchAntrean();

      setTimeout(() => setLoading(false), 1000);
  }, []);


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
        const response = await axios.get(`http://localhost:5001/user-details/${username}`, {
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

    try {
      const res = await axios.post('http://localhost:5001/generate-pengajuan', {
        id_pengajuan,
        status: "Belum Diproses"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const detailItems = items.map((item, idx) => ({
        id_pengajuan, 
        id_karyawan, 
        id_barang: item.namaBarang?.value,
        jumlah_barang: item.jumlah_barang, 
        kondisi: item.kondisi_lainnya !== "" ? item.kondisi_lainnya : item.kondisi, 
        jenis_pengajuan,
        harga: hargaList[idx], 
        total: item.jumlah_barang * hargaList[idx],
      }));

      await axios.post('http://localhost:5001/pengajuan', { 
        items: detailItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (role === "Admin") {
        history.push("/admin/data-pengajuan");
      } else if (role === "User") {
        history.push("/user/dashboard-user");
      }

      toast.success("Pengajuan berhasil dikirim.");
      setItems([blankItem()]); 
      IDPengajuan();

    } catch (error) {
      console.error(error);
      console.log("Error:", error.message);
      toast.error("Gagal mengirim pengajuan.");
    }
  }

  const handleItemChange = (idx, field, value) => {
    console.log("idx:", idx, "field:", field, "value:", value);
    const updated = [...items];
    updated[idx][field] = value;

    if (field === "kondisi" && value !== "LAINNYA") {
      updated[idx].kondisi_lainnya = "";
    }
    setItems(updated);
  };

  const handleJumlahBarang = (idx, value) => {
    const updatedItems = [...items];
    updatedItems[idx].jumlah_barang = value;
    updatedItems[idx].total = Number(value) * Number(updatedItems[idx].harga);
    setItems(updatedItems);
  };

  return (
    <>
      <Container fluid>
        <Form onSubmit={handleSubmit}>
          {/* <Row>
            <Col md="12">
              {uniqueStatus.map((s) => (
                <div key={s?.prevId} >
                  <PendingAlert hidden={s?.status !== "Belum Diproses"} />
                </div>
              ))}
            </Col>
          </Row> */}
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
                              <Select
                                options={getFilterOptions(idx)}
                                value={item.namaBarang}
                                onChange={(option) => handleSelect(idx, option)}
                                isSearchable={isSearchable}
                              >
                              </Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Kategori</label>
                              <Form.Control type="text" value={kategoriList[idx] || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Jenis Barang</label>
                              <Form.Control type="text" value={jenisBarangList[idx] || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Satuan</label>
                              <Form.Control type="text" value={satuanList[idx] || ""} disabled />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Harga (Rp)</label>
                              <Form.Control type="text" value={formatRupiah(hargaList[idx] || "")} disabled />
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
                                  handleJumlahBarang(idx, val);
                                }}
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Total (Rp)</label>
                              <Form.Control type="text" value={formatRupiah(item.jumlah_barang * hargaList[idx] || "0")} readOnly />
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