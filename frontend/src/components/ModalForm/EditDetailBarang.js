import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';


const EditDetailBarang = ({showEditModal, setShowEditModal, detailBarang, onSuccess}) => {
    const [id_detailbarang, setIdDetailBarang] = useState("");
    const [nama_detailbarang, setNamaDetailBarang] = useState("");
    // const [tanggal_penetapan, setTanggalPenetapan] = useState("");
    const [satuan, setSatuan] = useState("");
    const [harga_barang, setHargaBarang] = useState("");
    const [jenis_barang, setJenisBarang] = useState("");
    const [jenisBarangError, setJenisBarangError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (detailBarang) {
            setIdDetailBarang(detailBarang.id_detailbarang);
            setNamaDetailBarang(detailBarang.nama_detailbarang);
            // setTanggalPenetapan(detailBarang.createdAt);
            setSatuan(detailBarang.satuan);
            setHargaBarang(detailBarang.harga_barang);
            setJenisBarang(detailBarang.jenis_barang);
        }
    }, [detailBarang]);

    
    const updateDetailBarang = async(e) => {
        e.preventDefault();

        if (!jenis_barang) {
            setJenisBarangError(true);
            return;
        }

        try {
            await axios.patch(`http://localhost:5000/detail-barang/${detailBarang.id_detailbarang}`, {
                id_detailbarang,
                nama_detailbarang,
                // createdAt,
                satuan,
                harga_barang,
                jenis_barang
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            console.log(error.message);
            toast.error('Gagal mengubah master barang.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    const formatRupiah = (angka) => {
        let PlafondString = angka.toString().replace(".00");
        let sisa = PlafondString.length % 3;
        let rupiah = PlafondString.substr(0, sisa);
        let ribuan = PlafondString.substr(sisa).match(/\d{3}/g);
    
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
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center">
                <h3>Form Ubah Master Barang</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left">
                <hr />
                <Form onSubmit={updateDetailBarang}>
                <Row>
                    <Col md="12">
                        <Form.Group>
                            <label>ID Detail Barang</label>
                            <Form.Control
                                readOnly
                                type="text"
                                value={id_detailbarang}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Form.Group>
                            <label>Nama Detail Barang</label>
                            <Form.Control
                                type="text"
                                value={nama_detailbarang}
                                uppercase
                                onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                {/* <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Dibuat</label>
                        <Form.Control
                            type="date"
                            value={tanggal_penetapan}
                            required
                            onChange={(e) => {
                                setTanggalPenetapan(e.target.value);
                                setTanggalError(false); 
                            }}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row> */}
                
                <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Satuan</label>
                        <Form.Control
                            type="text"
                            value={satuan}
                            uppercase
                            onChange={(e) => handleSatuan(e.target.value.toUpperCase())}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Harga Barang</label>
                        <Form.Control
                            placeholder="Rp"
                            type="text"
                            value={formatRupiah(harga_barang)}
                            onChange={(e) => handleHargaBarang(e.target.value)}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md="12">
                        <Form.Group>
                        <label>Jenis Barang</label>
                        <Form.Select 
                        className="form-control"
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
                        <div className="modal-footer d-flex flex-column">
                            <Button
                                className="btn-fill w-100 mt-3"
                                type="submit"
                                variant="primary"
                                >
                                Ubah
                            </Button>
                        </div>
                    </Col>
                </Row>
                </Form>
            </Modal.Body>
            
            </Modal>
            {/* End Modal */}
        </>
    )
}

export default EditDetailBarang;