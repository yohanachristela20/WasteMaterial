import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlusCircle, FaSearch, FaTrashAlt} from 'react-icons/fa'; 
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

function PengajuanJual() {
   const history = useHistory();

  const [id_pengajuan, setIDPengajuan] = useState("");
  const [nama_kategori, setNamaKategori] = useState([]);

  const [jumlah_barang, setJumlahBarang] = useState("");

  const [id_barang, setIdBarang] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [jenis_pengajuan, setJenisPengajuan] = useState("");
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [id_karyawan, setIdKaryawan] = useState("");
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [prevId, setPrevId] = useState(null);
  const previousId = useRef();  
  const [statusPrevPengajuan, setStatusPrevPengajuan] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [show, setShow] = useState(true);
  const [namaBarangError, setNamaBarangError] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [kategori, setKategori] = useState("");
  const [jenis_barang, setJenisBarang] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState(0);
  const [kondisi, setKondisi] = useState("");
  const [isSearchable, setIsSearchable] = useState(true);
  const [otherFieldValue, setOtherFieldValue] = useState('');
  const [selected_kategori, setSelectedKategori] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [connectedFieldValue, setConnectedFieldValue] = useState('');

  const [namaBarang, setNamaBarang] = useState([]); //kunci
  
  const token = localStorage.getItem("token");

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(namaBarang);

	const handleSearchChange = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = nama_kategori.filter(option =>
		option.label.toLowerCase().includes(term)
		);
		setFilteredOptions(filtered);
	};

	const handleSelect = (option, e) => {
		setSelectedValue(option.value);
		setSearchTerm(option.label);
		setSatuan(option.value);
		setShowDropdown(false);
		getDetailKategori(option.value);

		// const selected = nama_kategori.find(emp => emp.value === option.value);
		// const id = selected ? selected.value : "";
		// setKategori(id);

		// setJenisBarang(option.value);
		// setHarga(data.harga_barang !== undefined && data.harga_barang !== null ? formatRupiah(String(data.harga_barang)) : "");

	};

  const handleDropdownChange = (namaBarang) => {
    const selectedValue = namaBarang;
    console.log("selectedValue:", selectedValue);
    setSelectedOption(selectedValue);

    const selectedItem = items.find(item => item.value === selectedValue);
    console.log("selectedItem:", selectedItem);

    if (selectedItem) {
      setConnectedFieldValue(selectedItem.relatedField);
    } else {
      setConnectedFieldValue(''); 
    }
  };

  // console.log("selectedValue:", selectedValue);
  // console.log("selectedBarang:", selectedBarang);
  // console.log("selected Id Barang:", id_barang);
  // console.log("Nama Kategori:", kategori);

  // console.log("namaKategori:", nama_kategori);

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
        const res = await axios.get(`http://localhost:5000/prev-status/${prevId}`, {
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
              label: item.id_barang + " " + item.nama,
          }));

          setNamaBarang(options);
          
      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  // console.log("namaBarang:", namaBarang);

  const getDetailKategori = async(id_barang, idx) => {
      console.log("INDEX:", idx);
      console.log("ID BARANG:", id_barang);
      if (!id_barang) return;
      try {
          const resp = await axios.get(`http://localhost:5000/detail-kategori/${id_barang}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          const data = resp.data || {};
          console.log("data:", data);
          
          setItems(prev => {
            const copy = [...prev];
            const hargaNum = parseFloat(data?.harga_barang || 0);
            // console.log("hargaNum:", hargaNum);
            // setHarga(hargaNum);
            const jumlahNum = parseFloat(copy[idx]?.jumlah_barang || 0);
            console.log("jumlahNum:", jumlahNum);

            copy[idx] = {
              ...copy[idx],
              id_barang: data.id_barang || "",
              id_kategori: data.id_kategori || "",
              kategori: data.kategori || "",
              jenis_barang: data.jenis_barang || "",
              harga: hargaNum,
              satuan: data.satuan || "",
              total: hargaNum * jumlahNum,
            };
            
            console.log("kategori:", copy[idx]?.kategori);
            setKategori(copy[idx]?.kategori);
            return copy;
          });
          

        } catch (error) {
          console.error("Error fetching barang details:", error.message);
          toast.error("Gagal mengambil detail barang.")
      }
  };

  // console.log("kategori:", items.kategori);
  
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
      await axios.post('http://localhost:5000/generate-pengajuan', {
        id_pengajuan,
        status: "Belum Diproses"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await axios.post('http://localhost:5000/pengajuan', { 
        jumlah_barang, 
        kondisi, 
        jenis_pengajuan,
        total,
        id_barang, 
        id_pengajuan,
        id_karyawan
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

  // console.log("Items:", items);

  const handleJumlahBarang = (value) => {
    setJumlahBarang(value);
  };

  const handleKondisi = (value) => {
    setKondisi(value);
  };

  const handleChange = (selected, idx) => {
    setSelectedBarang(selected);
    // setKategori(selectedBarang.kategori || "");
  }

  const handleOtherFieldChange = (e) => {
    setOtherFieldValue(e.target.value);
  };

  const uniqueKategori = [
    ...new Map(
      items.map((d) => [d?.kategori, d])
    ).values(),
  ];


  // console.log("selectedBarang:", selectedBarang);

  return (
    <>
      <Container fluid>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md="12">
              {uniqueStatus.map((s) => (
                <div key={s?.prevId} >
                  <PendingAlert hidden={s?.status !== "Belum Diproses"} />
                </div>
              ))}
            </Col>
          </Row>
          <Row>
            <Col className="card-screening">
              <Card className="card-screening p-4">
                <Card.Header>
                  <Card.Title as="h4"><strong>Pengajuan Penjualan Waste Material</strong></Card.Title>
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
                                options={namaBarang}
                                value={item.namaBarang}
                                onChange={handleSelect}
                                // onChange={(e) => 
                                //   {const val = item.namaBarang
                                //   handleSelect(idx, "id_barang", val);
                                //   getDetailKategori(val, idx);
                                // }}
                                isSearchable={isSearchable}
                              >
                              </Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Kategori</label>
                              <Form.Control 
                                type="text" 
                                value={kategori} 
                                disabled />
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
                              <Form.Control type="text" value={formatRupiah(item.harga || "")} disabled />
                            </Form.Group>
                          </Col>

                          <Col md="6">    
                            <Form.Group className="mb-2 mt-1">
                              <span className="text-danger">*</span>
                              <label>Jumlah Barang</label>
                              <Form.Control
                                type="text"
                                required
                                value={jumlah_barang}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  handleJumlahBarang(val);
                                }}
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <label>Total (Rp)</label>
                              <Form.Control type="text" value={formatRupiah(jumlah_barang * harga)} readOnly />
                            </Form.Group>

                            <Form.Group className="mb-2">
                              <span className="text-danger">*</span>
                              <label>Kondisi</label>
                              <Form.Select
                                className="form-control"
                                value={kondisi}
                                onChange={(e) => handleKondisi(e.target.value)}
                                required
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
                      <Button variant="success" type="button" className="mr-3 btn-fill" onClick={handleAddCard} disabled={uniqueStatus.some((s) => s?.status === "Belum Diproses")}>
                        <FaPlusCircle className="mb-1" /> Tambah Pengajuan
                      </Button>
                      <Button variant="primary" type="submit" className="btn-fill" disabled={uniqueStatus.some((s) => s?.status === "Belum Diproses")}>Simpan</Button>
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

export default PengajuanJual;