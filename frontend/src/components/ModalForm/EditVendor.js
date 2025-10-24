import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const EditVendor = ({showEditModal, setShowEditModal, vendor, onSuccess}) => {
    const [id_vendor, setIdVendor] = useState("");
    const [nama, setNama] = useState("");
    const [alamat, setAlamat] = useState("");
    const [no_telepon, setTelepon] = useState("");
    const [no_kendaraan, setKendaraan] = useState("");
    const [sopir, setSopir] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (vendor) {
            setIdVendor(vendor.id_vendor);
            setNama(vendor.nama);
            setAlamat(vendor.alamat);
            setTelepon(vendor.no_telepon);
            setKendaraan(vendor.no_kendaraan);
            setSopir(vendor.sopir);
        }
    }, [vendor]);

    const updateVendor = async(e) => {
        e.preventDefault();

        try {
            await axios.patch(`http://localhost:5000/vendor/${vendor.id_vendor}`, {
                id_vendor,
                nama, 
                alamat,
                no_telepon,
                no_kendaraan, 
                sopir,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
            // window.location.reload();
        } catch (error) {
            console.log(error.message);
            toast.error('Gagal mengubah data vendor.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    const handleTelepon = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setTelepon(numericValue);
    };

    const handleNamaChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(alphabetValue);
    };

    const handleAlamatChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setAlamat(alphabetValue);
    };

    const handleNamaSopir = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setSopir(alphabetValue);
    };



    return (
        <>
            <Modal
                className="modal-primary"
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
            >
                <Modal.Header>
                    <h3 className="mt-2 mb-0"><strong>Form Edit Vendor</strong></h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0 mt-2 mb-1">
                    <Form onSubmit={updateVendor}>
                    <span className="text-danger required-select">(*) Wajib diisi.</span>
                    <Row>
                        <Col md="12" className="mt-3 mb-2">
                            <Form.Group>
                                <label>ID Vendor</label>
                                <Form.Control
                                    readOnly
                                    placeholder="ID Vendor"
                                    type="text"
                                    value={id_vendor}
                                ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" className="mb-2">
                        <Form.Group>
                            <span className="text-danger">*</span>
                            <label>Nama Vendor</label>
                            <Form.Control
                                type="text"
                                value={nama}
                                required
                                uppercase
                                onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" className="mb-2">
                        <Form.Group>
                            <label>Alamat Vendor</label>
                            <Form.Control
                                type="text"
                                value={alamat}
                                uppercase
                                onChange={(e) => setAlamat(e.target.value.toUpperCase())}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" className="mb-2">
                        <Form.Group>
                            <label>No. Telepon</label>
                            <Form.Control
                                type="text"
                                value={no_telepon}
                                onChange={(e) => handleTelepon(e.target.value)}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" className="mb-2">
                        <Form.Group>
                            <label>No. Kendaraan</label>
                            <Form.Control
                                type="text"
                                value={no_kendaraan}
                                uppercase
                                onChange={(e) => setKendaraan(e.target.value.toUpperCase())}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" className="mb-2">
                        <Form.Group>
                            <label>Nama Sopir</label>
                            <Form.Control
                                type="text"
                                value={sopir}
                                uppercase
                                onChange={(e) => handleNamaSopir(e.target.value.toUpperCase())}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                    <Col md="12">
                        <div className="d-flex flex-column">
                            <Button
                                className="btn-fill w-100 my-3"
                                type="submit"
                                variant="primary"
                                >
                                Simpan
                            </Button>
                        </div>
                    </Col>
                    </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EditVendor;