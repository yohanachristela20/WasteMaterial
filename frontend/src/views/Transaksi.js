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

function Transaksi() {
  const location = useLocation();
  const history = useHistory();

  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);
  const [detailPengajuan, setDetailPengajuan] = useState([]);

  const [id_pengajuan, setIDPengajuan] = useState("");
  const [id_transaksi, setIDPenjualan] = useState("");

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [tujuan, setTujuan] = useState("");
  const [sub_total, setSubTotal] = useState("");
  const [id_vendor, setIDVendor] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cara_bayar, setCaraBayar] = useState("");
  const [caraBayarError, setCaraBayarError] = useState(false);
  const [scrapping, setScrapping] = useState("");

  const [keterangan, setKeterangan] = useState("");
  const [sopir, setSopir] = useState("");
  const [namaVendor, setNamaVendor] = useState([]);
  
  
  const token = localStorage.getItem("token");

  const IDPenjualan = async(e) => {
      const response = await axios.get('http://localhost:5000/getLastTransaksiID', {
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
          
          console.log("nama options:", options);

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
          
          console.log("nama brg:", options);

      } catch (error) {
          console.error("Error fetching data: ", error.message);
      }
  };

  const parseNumberString = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\./g, "").replace(/,/g, ".")) || 0;
  }

  const getDetailVendor = async(idVendor, idx) => {
      if (!idVendor) return;
      try {
          const resp = await axios.get(`http://localhost:5000/detail-vendor/${idVendor}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          const data = resp.data || {};
          setItems(prev => {
            const copy = [...prev];
            copy[idx] = {
              ...copy[idx],
              id_vendor: idVendor,
              sopir: data.sopir || "",
            };

            return copy;
          });
      } catch (error) {
          console.error("Error fetching vendor details:", error.message);
          toast.error("Gagal mengambil detail vendor.");
      }
  };

  
  useEffect(() => {
    const getDetailPengajuan = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5000/detail-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
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

  // console.log("detailPengajuan:", detailPengajuan);


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

    try {
      if (!cara_bayar) {
        setCaraBayarError(true);
        return;
      }

      await axios.post('http://localhost:5000/transaksi', {
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
      await axios.patch(`http://localhost:5000/gen-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
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
      `http://localhost:5000/vendor/${id_vendor}`,
      { sopir }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // toast.success("Nama sopir berhasil diperbarui!");
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
    // console.log("total:", total);
    return acc + total;
  }, 0);

  const getNamaVendor = async() => {
      try {
          const response = await axios.get('http://localhost:5000/namaVendor', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

          const options = (response.data || []).map(item => ({
              value: item.id_vendor, 
              label: item.nama,
          }));

          setNamaVendor(options);
          
          console.log("nama brg:", options);

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
      // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
      setKeterangan(value);
  };

  const handleNamaSopir = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setSopir(alphabetValue);
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
                          <Form.Select
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
                          </Form.Select>
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
                        {/* <span className="text-danger">*</span> */}
                            <label>Keterangan</label>
                            <Form.Control
                                type="text"
                                value={keterangan}
                                uppercase
                                // required
                                onChange={(e) => handleKeterangan(e.target.value.toUpperCase())}
                            />
                      </Form.Group>
                      <Form.Group>
                        <label>Nama Sopir</label>
                        <Form.Control
                          type="text"
                          value={item.sopir || ""} 
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
                                      {/* <th className="border-0">ID Pengajuan</th>
                                      <th className="border-0">Divisi</th> */}
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
                                          {/* <td className="text_center">{d?.id_pengajuan}</td>
                                          <td className="text_center">{d?.Pemohon?.divisi}</td> */}
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
                        <Button variant="primary" type="submit" className="btn-fill px-4">Jual</Button>
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