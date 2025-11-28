import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlusCircle, FaTrashAlt} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {toast } from 'react-toastify';
import Select from "react-select";

import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col, 
} from "react-bootstrap";

function Pengajuan() {
  const history = useHistory();
  const location = useLocation();
  const [id_pengajuan, setIDPengajuan] = useState("");
  const [nama_kategori, setNamaKategori] = useState([]);
  const [jumlah_barang, setJumlahBarang] = useState("");
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
  const [namaBarangList, setNamaBarangList] = useState([]);
  const [id_barang, setIdBarang] = useState("");
  const [kondisi, setKondisi] = useState("");

  const [selectedBarang, setSelectedBarang] = useState(null);
  const [selectedKondisi, setSelectedKondisi] = useState(null);
  
  const token = localStorage.getItem("token");

  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);

  // console.log("selectedPengajuan:", selectedPengajuan);

  // console.log("kondisi:", kondisi);
  // console.log("kondisiList:", kondisiList); 

  useEffect(() => {
    if (selectedPengajuan) {
      setIdBarang(selectedPengajuan?.id_barang);
      setSelectedBarang({
        value: selectedPengajuan.id_barang,
        label: selectedPengajuan.nama || ""
      });
      setSelectedKondisi({
        value: selectedPengajuan.kondisi,
        label: selectedPengajuan.kondisi || ""
      });

    }
  }, [selectedPengajuan]);


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
    setJenisPengajuan("PENJUALAN");
  };

  useEffect(() => {
    IDPengajuan();
    tujuanPengajuan();
  }, []);

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

      const namaBarang = [...namaBarangList];
      namaBarang[idx] = resp.data.nama_barang;

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
      setNamaBarangList(namaBarang);

    } catch (error) {
      console.error("Error fetching barang details:", error.message);
      toast.error("Gagal mengambil detail barang.")
    }
  };

  // console.log("namaBarangList:", namaBarangList);
  

  const getDetailPengajuanById = async (id_pengajuan) => {
    if (!id_pengajuan) return;
    try {
      const resp = await axios.get(`http://localhost:5001/detail-pengajuan/${id_pengajuan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(resp.data) ? resp.data : [];

      const mappedItems = data.map((d) => {
        const barang = d.BarangDiajukan || {};
        const kategori = barang.KategoriBarang || {};

        return {
          key: uniqueKey(),
          id_barang: barang.id_barang || d.id_barang || "",
          namaBarang: {
            value: barang.id_barang || d.id_barang || "",
            label: `${barang.id_barang || d.id_barang || ""} ${barang.nama || ""}`.trim(),
          },
          jumlah_barang: d.jumlah_barang || "",
          harga: kategori.harga_barang || 0,
          total: d.total || (d.jumlah_barang * (kategori.harga_barang || 0)) || 0,
          kondisi: d.kondisi || kategori.kondisi || "",
          kondisi_lainnya: d.kondisi || "",
        };
      });

      const names = [];
      const kategories = [];
      const jenis = [];
      const satuan = [];
      const hargas = [];
      const konds = [];
      const lains = [];

      data.forEach((d, idx) => {
        const barang = d.BarangDiajukan || {};
        const kategori = barang.KategoriBarang || {};

        names[idx] = `${barang.id_barang || d.id_barang || ""} ${barang.nama || ""}`.trim();
        kategories[idx] = kategori.nama || "";
        jenis[idx] = kategori.jenis_barang || "";
        satuan[idx] = kategori.satuan || "";
        hargas[idx] = kategori.harga_barang || 0;
        konds[idx] = d.kondisi || kategori.kondisi || "";
        lains[idx] = d.kondisi || "";
      });

      setItems(mappedItems.length ? mappedItems : [blankItem()]);
      setNamaBarangList(names);
      setKategoriList(kategories);
      setJenisBarangList(jenis);
      setSatuanList(satuan);
      setHargaList(hargas);
      setKondisiList(konds);
      setLainnyaList(lains);
      setDetailPengajuan(data);
    } catch (error) {
      console.error("Error fetching pengajuan detail:", error.message);
      toast.error("Gagal mengambil detail pengajuan.");
    }
  };

  useEffect(() => {
    getNamaKategori();
    getNamaBarang();
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (selectedPengajuan?.id_pengajuan) {
      getDetailPengajuanById(selectedPengajuan.id_pengajuan);
    }
  }, [selectedPengajuan]);

 
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
      const isEditing = Boolean(selectedPengajuan?.id_pengajuan);

      // Determine id_pengajuan to use for payload
      const targetIdPengajuan = isEditing ? selectedPengajuan.id_pengajuan : id_pengajuan;

      const detailItems = items.map((item, idx) => ({
        id_pengajuan: targetIdPengajuan,
        id_karyawan: item.id_karyawan || id_karyawan,
        id_barang: item.namaBarang?.value || item.id_barang,
        jumlah_barang: item.jumlah_barang || 0,
        kondisi: item.kondisi_lainnya && item.kondisi_lainnya !== "" ? item.kondisi_lainnya : (item.kondisi || ""),
        jenis_pengajuan: item.jenis_pengajuan || selectedPengajuan?.jenis_pengajuan || "",
        harga: hargaList[idx] !== undefined ? hargaList[idx] : item.harga || 0,
        total: (Number(item.jumlah_barang) || 0) * (Number(hargaList[idx] || item.harga || 0)),
      }));

      

      if (isEditing) {
        // Update existing pengajuan (replace items)
        await axios.patch(`http://localhost:5001/ubah-pengajuan/${targetIdPengajuan}`, {
          items: detailItems,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Pengajuan berhasil diperbarui.");
      } else {
        // Create new pengajuan: generate id (GenPengajuan) then insert items
        await axios.post('http://localhost:5001/generate-pengajuan', {
          id_pengajuan: targetIdPengajuan,
          status: "Belum Diproses",
        }, { headers: { Authorization: `Bearer ${token}` } });

        await axios.post('http://localhost:5001/pengajuan', {
          items: detailItems,
        }, { headers: { Authorization: `Bearer ${token}` } });

        toast.success("Pengajuan berhasil dikirim.");
      }

      // After success, redirect and reset form
      if (role === "Admin") {
        history.push("/admin/data-pengajuan");
      } else if (role === "User") {
        history.push("/user/dashboard-user");
      }

      setItems([blankItem()]);
      IDPengajuan();

    } catch (error) {
      console.error(error);
      console.log("Error:", error.message);
      toast.error("Gagal mengirim pengajuan.");
    }
  }

  // console.log("detailItems to submit:", items);


  const handleItemChange = (idx, field, value) => {
    console.log("idx:", idx, "field:", field, "value:", value);
    const updated = [...items];
    updated[idx][field] = value;

    if (field === "kondisi" && value !== "LAINNYA") {
      updated[idx].kondisi_lainnya = "";
    }

    // if (field === "jenis_pengajuan") {
    //   updated[idx].jenis_pengajuan = "";
    // }
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
          <Row>
            <Col className="card-screening">
              <Card className="card-screening p-4">
                <Card.Header>
                  <Card.Title as="h4"><strong>Ubah Data Pengajuan</strong></Card.Title>
                  <hr />
                </Card.Header>
                <Card.Body>
                  <Row className="mt-3 mb-2">
                    <Col md="6">
                      <Form.Group className="mb-2">
                        <label>ID Pengajuan</label>
                        <Form.Control disabled type="text" value={selectedPengajuan?.id_pengajuan} />
                      </Form.Group>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-2">
                        <label>Divisi</label>
                        <Form.Control disabled type="text" value={selectedPengajuan?.Pemohon?.divisi} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {items.map((item, idx) => (
                    // console.log("kondisi list:", kondisiList[idx]),
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
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Kategori</label>
                              <Form.Control 
                                type="text" 
                                value={kategoriList[idx]} 
                                disabled />
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
                              <Form.Control type="text" value={formatRupiah((item.jumlah_barang * (hargaList[idx])) || "0")} readOnly />
                            </Form.Group>

                            <Form.Group className="mb-2">
                              <span className="text-danger">*</span>
                              <label>Kondisi</label>
                              <Form.Select
                                className="form-control"
                                value={item.kondisi || kondisiList[idx] || kondisi}
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

                            {item.kondisi_lainnya !== "" ? item.kondisi_lainnya !== "" && (
                              <Form.Group className="mb-2">
                                <label>Kondisi Lainnya</label>
                                <Form.Control
                                  type="text"
                                  // required={item.kondisi === "LAINNYA"}
                                  value={item.kondisi_lainnya || ""}
                                  onChange={(e) => {
                                    handleItemChange(idx, "kondisi_lainnya" ,e.target.value.toUpperCase());
                                  }}
                                />
                              </Form.Group>
                            ) : item.kondisi === "LAINNYA" && (
                              <Form.Group className="mb-2">
                                <label>Kondisi Lainnya</label>
                                <Form.Control
                                  type="text"
                                  required={item.kondisi === "LAINNYA"}
                                  value={item.kondisi_lainnya || ""}
                                  onChange={(e) => {
                                    handleItemChange(idx, "kondisi_lainnya" ,e.target.value.toUpperCase());
                                  }}
                                />
                              </Form.Group>
                            )}


                            {/* {item.kondisi === "LAINNYA" || item.kondisi_lainnya !== "" && (
                              <Form.Group className="mb-2">
                                <label>Kondisi Lainnya</label>
                                <Form.Control
                                  type="text"
                                  required={item.kondisi === "LAINNYA"}
                                  value={item.kondisi_lainnya || ""}
                                  onChange={(e) => {
                                    handleItemChange(idx, "kondisi_lainnya" ,e.target.value.toUpperCase());
                                  }}
                                />
                              </Form.Group>
                            )} */}
                            <Form.Group className="mb-2">
                              <label>Tujuan</label>
                              
                              {/* <Form.Control type="text" value={selectedPengajuan?.jenis_pengajuan} disabled />
                               */}

                              <Form.Select
                                  className="form-control"
                                  value={item.jenis_pengajuan || selectedPengajuan?.jenis_pengajuan}
                                  required
                                  onChange={(e) => handleItemChange(idx, "jenis_pengajuan", e.target.value)}
                                >
                                  <option className="placeholder-form" key='blankChoice' hidden value>Pilih Jenis Pengajuan</option>
                                  <option value="PENJUALAN">PENJUALAN</option>
                                  <option value="SCRAPPING">SCRAPPING</option>
                              </Form.Select>
                          </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  <Row>
                    <Col md="12" className="mt-2 d-flex gap-2">
                      <Button variant="success" type="button" className="mr-3 btn-fill" onClick={handleAddCard} disabled={uniqueStatus.some((s) => s?.status === "Belum Diproses")}>
                        <FaPlusCircle className="mb-1" /> Tambah Pengajuan
                      </Button>
                      <Button variant="primary" type="submit" className="btn-fill">Ubah</Button>
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

export default Pengajuan;