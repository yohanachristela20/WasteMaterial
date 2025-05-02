import { Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddDetailBarang = ({ showAddModal, setShowAddModal, onSuccess }) => {
    const [id_detailbarang, setIdDetailBarang] = useState("1-K");
    const [nama_detailbarang, setNamaDetailBarang] = useState("");
    const [tanggal_penetapan, setTanggalPenetapan] = useState("");
    const [satuan, setSatuan] = useState("");
    const [harga_barang, setHargaBarang] = useState("");
    const [jenis_barang, setJenisBarang] = useState("");
    const [jenisBarangError, setJenisBarangError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchNextId = async () => {
            try {
                const response = await axios.get('http://localhost:5000/detail-barang/getNextBarangId', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIdDetailBarang(response.data.nextId);
            } catch (error) {
                console.error('Error fetching next barang ID:', error);
            }
        };

        const today = new Date().toISOString().split("T")[0];
        setTanggalPenetapan(today); 
        fetchNextId();

        console.log("Next id: ", id_detailbarang);
    }, []);


    const saveDetailBarang = async (e) => {
        e.preventDefault();

        if (!jenis_barang) {
            setJenisBarangError(true);
            e.preventDefault();
            return;
        }
        try {
            await axios.post('http://localhost:5000/detail-barang', {
                id_detailbarang,
                nama_detailbarang,
                satuan,
                harga_barang,
                jenis_barang,
                tanggal_penetapan,
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

    const handleHargaBarang = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setHargaBarang(numericValue);
    };

    const handleNamaChange = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNamaDetailBarang(value);
    };

    const handleSatuan = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setSatuan(alphabetValue);
    };

    return (
        <>
        {/* <ToastContainer /> */}
            {/* Mini Modal */}
            <Modal
                className="modal-primary"
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
            >
                <Modal.Header className="text-center pb-1">
                    <h3 className="mt-3 mb-0">Form Detail Barang Baru</h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0">
                    <hr />
                    <Form onSubmit={saveDetailBarang}>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>ID Detail Barang</label>
                                    <Form.Control
                                        type="text"
                                        value={id_detailbarang}
                                        readOnly
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Nama Barang</label>
                                    <Form.Control
                                        type="text"
                                        value={nama_detailbarang}
                                        uppercase
                                        required
                                        onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Satuan</label>
                                    <Form.Control
                                        type="text"
                                        value={satuan}
                                        uppercase
                                        required
                                        onChange={(e) => handleSatuan(e.target.value.toUpperCase())}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Harga Barang</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        value={formatRupiah(harga_barang)}
                                        onChange={(e) => handleHargaBarang(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                <label>Jenis Barang</label>
                                <Form.Select 
                                className="form-control"
                                required
                                value={jenis_barang}
                                onChange={(e) => {
                                    setJenisBarang(e.target.value);
                                    setJenisBarangError(false);
                                }}
                                >
                                    <option className="placeholder-form" key='blankChoice' hidden value>Pilih Jenis Barang</option>
                                    <option value="ASSET">ASSET</option>
                                    <option value="NON-ASSET">NON-ASSET</option>
                                </Form.Select>
                                {jenisBarangError && <span className="text-danger required-select">Jenis barang belum dipilih</span>}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Tanggal Penetapan</label>
                                    <Form.Control
                                        type="date"
                                        value={tanggal_penetapan}
                                        required
                                        onChange={(e) => setTanggalPenetapan(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                       
                        <Row>
                            <Col md="12">
                                <div className="modal-footer d-flex flex-column">
                                    <Button className="btn-fill w-100 mt-3" type="submit" variant="primary">
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

export default AddDetailBarang;
