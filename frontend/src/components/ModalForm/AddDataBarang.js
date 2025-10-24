import { Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddDataBarang = ({ showAddModal, setShowAddModal, onSuccess }) => {
    const [id_barang, setIdBarang] = useState("");
    const [nama, setNama] = useState("");
    const [id_sap, setIdSap] = useState("");
    const [id_kategori, setIdKategori] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [kategori_barang, setKategoriBarang] = useState("");
    const [kategori, setKategori] = useState([]);
    const [nama_kategori, setNamaKategori] = useState([]);
    const [barangID, setBarangID] = useState("");
    // const [nama, setNama] = useState("");
    const [jenis_barang, setJenisBarang] = useState("");
    const [harga, setHarga] = useState("");
    const [satuan, setSatuan] = useState("");

    const token = localStorage.getItem("token");

    const IdBarang = async(e) => {
        const response = await axios.get('http://localhost:5000/getLastDataBarangId', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const newId = response.data?.nextId || "1-B";
        setIdBarang(newId);

        console.log("newId: ", newId);
    };

    useEffect(() => {
        IdBarang();
    }, []);


    const saveDataBarang = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/data-barang', {
                id_barang,
                nama,
                id_sap,
                id_kategori
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false); 
            onSuccess();
            
        } catch (error) {
            console.log(error.message);
            // toast.error('Gagal menyimpan data plafond baru.', {
            //     position: "top-right",
            //     autoClose: 5000,
            //     hideProgressBar: true,
            //   });
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

    const handleNamaChange = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(value);
    };

    const handleIDSAP = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setIdSap(value);
    };

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

    const getKategoriDetails = async(kategoriId) => {
        if (!kategoriId) return;
        try {
            const resp = await axios.get(`http://localhost:5000/kategori-barang/${kategoriId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = resp.data || {};
            setJenisBarang(data.jenis_barang || "");
            setHarga(data.harga_barang !== undefined && data.harga_barang !== null ? formatRupiah(String(data.harga_barang)) : "");
            setSatuan(data.satuan || ""); 
        } catch (error) {
            console.error("Error fetching kategori details:", error.message);
            setJenisBarang("");
            setHarga("");
            setSatuan("");
        }
    };

    useEffect(() => {
        getNamaKategori();
    }, []);



    return (
        <>
            <Modal
                className="modal-primary"
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
            >
                <Modal.Header>
                    <h3 className="mt-2 mb-0"><strong>Form Barang</strong></h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0 mt-2 mb-1">
                    <Form onSubmit={saveDataBarang}>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
                        <Row>
                            <Col md="12" className="mt-3 mb-2">
                                <Form.Group>
                                    <label>ID Barang</label>
                                    <Form.Control
                                        type="text"
                                        value={id_barang}
                                        readOnly
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12" className="mb-2">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Nama Barang</label>
                                    <Form.Control
                                        type="text"
                                        value={nama}
                                        uppercase
                                        required
                                        onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12" className="mb-2">
                                <Form.Group>
                                    <label>ID SAP</label>
                                    <Form.Control
                                        type="text"
                                        value={id_sap}
                                        uppercase
                                        onChange={(e) => handleIDSAP(e.target.value.toUpperCase())}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                <label>Pilih Kategori Barang</label>
                                <Form.Select 
                                    className="form-control"
                                    required
                                    value={selectedCategory?.value}
                                    onChange={(e) => {
                                        const selected = nama_kategori.find(emp => emp.value === e.target.value);
                                        setSelectedCategory(selected || null);
                                        const id = selected ? selected.value : "";
                                        setIdKategori(id);
                                        setKategoriBarang(id);
                                        getKategoriDetails(id);
                                    }}
                                    >
                                    <option className="placeholder-form" key="blankChoice" hidden value="">
                                        Pilih Kategori
                                    </option>
                                    {nama_kategori.map(option => (
                                        <option key={option.value} value={option.value} hidden={option.value === id_kategori}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12" className="mb-2">
                                <Form.Group>
                                    <label>Jenis Barang</label>
                                    <Form.Control
                                        type="text"
                                        value={jenis_barang}
                                        uppercase
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12" className="mb-2">
                                <Form.Group>
                                    <label>Harga</label>
                                    <Form.Control
                                        type="text"
                                        value={harga}
                                        uppercase
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12" className="mb-2">
                                <Form.Group>
                                    <label>Satuan</label>
                                    <Form.Control
                                        type="text"
                                        value={satuan}
                                        uppercase
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                       
                        <Row>
                            <Col md="12">
                                <div className="d-flex flex-column">
                                    <Button className="btn-fill w-100 my-3" type="submit" variant="primary">
                                        Simpan
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AddDataBarang;
