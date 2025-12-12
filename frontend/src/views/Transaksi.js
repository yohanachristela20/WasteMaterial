import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {toast } from 'react-toastify';

import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col, 
  Table,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

function Transaksi() {
  const location = useLocation();
  const history = useHistory();
  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [id_transaksi, setIDPenjualan] = useState("");
  const [nama_kategori, setNamaKategori] = useState([]);
  const [harga, setHarga] = useState(0);
  const [jumlah_barang, setJumlahBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState([]);
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [id_karyawan, setIdKaryawan] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [id_vendor, setIDVendor] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cara_bayar, setCaraBayar] = useState("");
  const [caraBayarError, setCaraBayarError] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [sopir, setSopir] = useState("");
  const [namaVendor, setNamaVendor] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [show, setShow] = useState(true);
  const [vendorError, setVendorError] = useState(false);
  const [antrean, setAntrean] = useState([]); 
  const [error, setError] = useState("");
  
  const token = localStorage.getItem("token");

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(namaVendor);

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = namaVendor.filter(option =>
    option.label.toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
	};

	const handleSelect = (option, e, idx) => {
		setSelectedValue(option.value);
		setSearchTerm(option.label);
    // setNamaVendor(option.value);
		setVendorError(false);
		setShowDropdown(false);
		getDetailVendor(option.value);

		const selected = namaVendor.find(v => v.value === option.value);
    setSelectedVendor(selected || null);
    const id_v = selected ? selected.value : "";
    setIDVendor(id_v);
    handleItemChange(idx, "id_vendor", id_v);
    
    if (id_v) getDetailVendor(id_v, idx);

	};

  const IDPenjualan = async(e) => {
      const response = await axios.get('http://localhost:5001/getLastTransaksiID', {
          headers: {
              Authorization: `Bearer ${token}`,
          }
      });
      const newId = response.data?.newId || "";
      setIDPenjualan(newId);
  };

  useEffect(() => {
      IDPenjualan();
  }, []);

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
          
          // console.log("nama options:", options);

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
              label: item.nama,
          }));

          setNamaBarang(options);
          
          // console.log("nama brg:", options);

      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const getDetailVendor = async(idVendor) => {
      if (!idVendor) return;
      try {
          const resp = await axios.get(`http://localhost:5001/detail-vendor/${idVendor}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          const data = resp.data || {};
          setSopir(data.sopir || "");
      } catch (error) {
          console.error("Error fetching vendor details:", error.message);
          toast.error("Gagal mengambil detail vendor.");
      }
  };

  console.log("Sopir:", sopir);

  
  useEffect(() => {
    const getDetailPengajuan = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5001/detail-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDetailPengajuan(Array.isArray(resp.data) ? resp.data : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

     if (selectedPengajuan?.id_pengajuan) {
        getDetailPengajuan();
    } 
  }, [selectedPengajuan, token]);

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
          setItems(prev => prev.map(it => ({ ...it, id_karyawan: it.id_karyawan || usr.id_karyawan || "" })));
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


  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      if (!cara_bayar) {
        setCaraBayarError(true);
        return;
      }

      await axios.post('http://localhost:5001/transaksi', {
        id_transaksi, 
        cara_bayar,
        id_vendor,
        id_pengajuan: selectedPengajuan?.id_pengajuan,
        id_petugas: userData?.id_karyawan || "",
        keterangan,
      }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      await axios.patch(`http://localhost:5001/gen-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
        status: "Selesai",
      }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Transaksi penjualan berhasil.");
      history.push("/admin/data-pengajuan");

    } catch (error) {
      toast.error("Transaksi penjualan gagal.");
      console.log(error.message);
    }
  }


const updateSopirVendor = async (id_vendor, sopir) => {
  if (!id_vendor || !sopir) return;
  try {
    await axios.patch(
      `http://localhost:5001/vendor/${id_vendor}`,
      { sopir }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Gagal update sopir:", error);
    toast.error("Gagal memperbarui nama sopir di database.");
  }
};


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

  const jumlahTotal = detailPengajuan.reduce((acc, item) => {
    const total = Number(item?.total);
    return acc + total;
  }, 0);

  const getNamaVendor = async() => {
      try {
          const response = await axios.get('http://localhost:5001/namaVendor', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

          const options = (response.data || []).map(item => ({
              value: item.id_vendor, 
              label: item.nama,
          }));

          setNamaVendor(options);
          
          // console.log("nama brg:", options);

      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const pengajuanScrapping = async(e) => {
    if (selectedPengajuan?.jenis_pengajuan === "SCRAPPING") {
      setCaraBayar("SCRAPPING" || "");
    } else if ((selectedPengajuan?.jenis_pengajuan === "PENJUALAN") && !cara_bayar || cara_bayar === "") {
      setCaraBayarError(true);
    }
  };


  useEffect(() => {
      getNamaKategori();
      getNamaBarang();
      getNamaVendor();
      pengajuanScrapping();

      setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleKeterangan = (value) => {
      setKeterangan(value);
  };

  if (!show) return null;

  
  const findNomorAntrean = (idPengajuan) => {
    const antreanItem = antrean.find(item => item.id_pengajuan === idPengajuan);
    return antreanItem ? antreanItem.nomor_antrean : "-"; 
  };

  const getAntrean = async () => {
    try {
      // setLoading(true);
      const response = await axios.get("http://10.70.10.131:5001/antrean-pengajuan", {
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

  useEffect(() => {
    getAntrean();

    setTimeout(() => setLoading(false), 3000)
  }, []);

  const isPreviousAccepted = (nomorAntrean) => {
    for (let i = 1; i < nomorAntrean; i++) {
      const prevItem = antrean.find(item => item.nomor_antrean === i); 
      if (prevItem && prevItem.status !== "Selesai") {
        return false;
      }
    }
    return true;
  };

  return (
    <>
      <Container fluid>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col className="card-screening">
              <Card className="card-screening p-4">
                <Card.Header>
                  <Card.Title as="h4"><strong>Form Transaksi</strong></Card.Title>
                  <hr />
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{overflowX: 'auto'}}>
                  <Row className="mt-3 mb-2">
                    <Col md="6">
                      <Form.Group className="mb-2">
                        <label>ID Pengajuan</label>
                        <Form.Control disabled type="text" value={selectedPengajuan?.id_pengajuan} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <label>Divisi</label>
                        <Form.Control disabled type="text" value={userData.divisi} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <label>Tanggal Pengajuan</label>
                        <Form.Control disabled type="text" value={new Date(selectedPengajuan?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <label>Jumlah Total (Rp)</label>
                        <Form.Control disabled type="text" value={formatRupiah(jumlahTotal)} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <label>ID Transaksi</label>
                        <Form.Control disabled type="text" value={id_transaksi} />
                      </Form.Group>
                    </Col>
                    
                    {items.map((item, idx) => (
                      <Col md="6">
                      <Form.Group className="mb-2">
                        <label>No. BPBB</label>
                        <Form.Control disabled type="text" value={id_transaksi} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <span className="text-danger">*</span>
                        <label>Pembeli</label>
                        {/* <Form.Select
                          className="form-control"
                          value={selectedVendor?.value || ""}
                          required
                          onChange={(e) => {
                            const selected = namaVendor.find(v => v.value === e.target.value);
                            setSelectedVendor(selected || null);
                            const id_v = selected ? selected.value : "";
                            setIDVendor(id_v);
                            handleItemChange(idx, "id_vendor", id_v);
                            
                            if (id_v) getDetailVendor(id_v, idx);
                          }}
                        >
                          <option className="placeholder-form" key="blankChoice" hidden value="">
                              Pilih Vendor
                          </option>
                          {namaVendor.map(option => (
                              <option key={option.value} value={option.value} hidden={option.value === id_vendor}>
                                  {option.label}
                              </option>
                          ))}
                        </Form.Select> */}
                        <div style={{position: "relative"}}>
                          <FaSearch 
                            style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%", 
                                transform: "translateY(-50%)",
                                color: "#aaa",
                            }}
                          />
                          <Form.Control
                            type="text"
                            className="form-control"
                            placeholder="Cari Vendor..."
                            style={{paddingLeft: "35px"}}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                          />
    
                          {showDropdown && filteredOptions.length > 0 && (
                            <div 
                                style={{
                                    position: "absolute",
                                    zIndex: 10,
                                    width: "100%",
                                    background: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    marginTop: "2px",
                                    maxHeight: "180px",
                                    overflowY: "auto",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                            >
                                
                            {filteredOptions.map((option) => (
                              <div
                                  key={option.value}
                                  onClick={() => handleSelect(option)}
                                  style={{
                                      padding: "8px 12px",
                                      cursor: "pointer",
                                      transition: "background 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                      (e.currentTarget.style.background = "#f5f5f5")
                                  }
                                  onMouseLeave={(e) =>
                                      (e.currentTarget.style.background = "transparent")
                                  }
                              >
                                  {option.label}
                              </div>
                            ))}
                            </div>
                                  
                                  
                          )}
                          {vendorError && <span className="text-danger required-select">Vendor belum dipilih</span>}
                        </div>
                      </Form.Group>
                      <Form.Group>
                        <span className="text-danger">*</span>
                        <label>Cara Bayar</label>
                        {selectedPengajuan?.jenis_pengajuan === "PENJUALAN" ? (
                         <>
                          <Form.Select 
                            className="form-control"
                            required
                            value={cara_bayar || ""}
                            onChange={(e) => {
                                setCaraBayar(e.target.value);
                                setCaraBayarError(false);
                            }}
                          >
                              <option className="placeholder-form" key='blankChoice' hidden value>Pilih Cara Bayar</option>
                              <option value="TUNAI">TUNAI</option>
                              <option value="KREDIT">KREDIT</option>
                              <option value="TRANSFER">TRANSFER</option>
                          </Form.Select>
                          {caraBayarError && <span className="text-danger required-select">Cara bayar belum dipilih</span>}
                         </>
                        ) : (
                          <Form.Control disabled required type="text" value={cara_bayar || ""} />
                        )}
                      </Form.Group>
                      <Form.Group>
                        <label>Keterangan</label>
                        <Form.Control
                            type="text"
                            value={keterangan}
                            uppercase
                            onChange={(e) => handleKeterangan(e.target.value.toUpperCase())}
                        />
                      </Form.Group>
                      <Form.Group>
                        <label>Nama Sopir</label>
                        <Form.Control
                          type="text"
                          value={sopir || ""} 
                          onChange={(e) => {
                            const newSopir = e.target.value.toUpperCase();
                            setItems((prev) => {
                              const copy = [...prev];
                              copy[idx] = {
                                ...copy[idx],
                                sopir: newSopir, 
                              };
                              return copy;
                            });

                            updateSopirVendor(item.id_vendor, newSopir);
                          }}
                        />
                      </Form.Group>

                    </Col>
                    ))}


                  </Row>

                  <Row>
                      <Col md="12">
                          <h4><u><strong>Detail Pengajuan</strong></u></h4>
                          <Table className="table-hover table-striped mt-4">
                              <div className="table-scroll" style={{ height:'auto' }}>
                              <table className="flex-table table table-striped table-hover">
                                  <thead>
                                  <tr>
                                      <th className="border-0">No.</th>
                                      <th className="border-0">Nama Barang</th>
                                      <th className="border-0">Kategori</th>
                                      <th className="border-0">Satuan</th>
                                      <th className="border-0">Harga Barang (Rp)</th>
                                      <th className="border-0">Jumlah Barang</th>
                                      <th className="border-0">Total (Rp)</th>
                                      <th className="border-0">Kondisi</th>
                                      <th className="border-0">Jenis Pengajuan</th>
                                  </tr>
                                  </thead>
                                  <tbody className="scroll scroller-tbody">
                                    {detailPengajuan.length === 0 ? (
                                      <tr><td colSpan={8} className="text-center">Tidak ada data pengajuan</td></tr>
                                    ) : (
                                      detailPengajuan.map((d, index) => (
                                        <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                          <td className="text_center p-0 pt-2">{index + 1}</td>
                                          <td className="text_center">{d?.BarangDiajukan?.nama}</td>
                                          <td className="text_center">{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                          <td className="text_center">{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
                                          <td className="text_center">{formatRupiah(d?.BarangDiajukan?.KategoriBarang?.harga_barang)}</td>
                                          <td className="text_center">{d?.jumlah_barang}</td>
                                          <td className="text_center">{formatRupiah(d?.total)}</td>
                                          <td className="text_center">{d?.kondisi}</td>
                                          <td className="text_center">{d?.jenis_pengajuan}</td>
                                      </tr>
                                      ))
                                    )}
                                  </tbody>
                              </table>
                              </div>
                          </Table>
                      </Col>
                  </Row>

                                   
                  <Row>
                    <Col md="12" className="my-2 d-flex gap-2">
                      {selectedPengajuan?.jenis_pengajuan === "PENJUALAN" ? (
                        <Button variant="primary" type="submit" className="btn-fill px-4"
                        >Jual</Button>
                      ) : (
                        <Button variant="primary" type="submit" className="btn-fill px-4">Scrapping</Button>
                      )}
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

export default Transaksi;