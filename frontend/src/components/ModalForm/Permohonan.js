import { Badge, Button, Modal, Form, Row, Col, Card } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const Permohonan = ({ showAddModal, setShowAddModal, onSuccess }) => {
    const [id_plafond, setIdPlafond] = useState("");
    const [tanggal_penetapan, setTanggalPenetapan] = useState("");
    const [jumlah_plafond, setJumlahPlafond] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchNextId = async () => {
            try {
                const response = await axios.get('http://localhost:5000/plafond/getNextPlafondId', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIdPlafond(response.data.nextId);
            } catch (error) {
                console.error('Error fetching next plafond ID:', error);
            }
        };

        const today = new Date().toISOString().split("T")[0];
        setTanggalPenetapan(today); 
        fetchNextId();
    }, []);




    const savePlafond = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/plafond', {
                id_plafond,
                tanggal_penetapan,
                jumlah_plafond,
                keterangan,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false); 
            onSuccess(); 
            
        } catch (error) {
            // console.log(error.message);
            toast.error('Gagal menyimpan data plafond baru.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
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

    const handleJumlahPlafondChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setJumlahPlafond(numericValue);
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
                    <h3 className="mt-3 mb-0">Form Permohonan Top-up Angsuran</h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0">
                    <hr />
                    <Form onSubmit={savePlafond}>
                    <Card> 
                        <Card.Header as="h4" className="mt-1"><strong>Top-up Angsuran</strong></Card.Header><hr/>
                        <Card.Body>
                            <Card.Text>
                                Merupakan kondisi dimana keluarga calon peminjam diperbolehkan untuk membantu <strong>meningkatkan jumlah angsuran per-bulan</strong> untuk mencapai jumlah pinjaman yang diperlukan.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
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
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Jumlah Plafond</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        value={formatRupiah(jumlah_plafond)}
                                        onChange={(e) => handleJumlahPlafondChange(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                <span className="text-danger">*</span>
                                    <label>Keterangan</label>
                                    <Form.Control
                                        placeholder="Keterangan"
                                        type="text"
                                        required
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
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

export default Permohonan;
