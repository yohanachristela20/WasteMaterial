import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const EditVendor = ({showEditModal, setShowEditModal, vendor, onSuccess}) => {
    const [id_vendor, setIdVendor] = useState("");
    const [nama_vendor, setNamaVendor] = useState("");
    const [alamat_vendor, setAlamatVendor] = useState("");
    const [no_telepon, setTelepon] = useState("");
    const [no_kendaraan, setKendaraan] = useState("");


    const token = localStorage.getItem("token");

    useEffect(() => {
        if (vendor) {
            setIdVendor(vendor.id_vendor);
            setNamaVendor(vendor.nama_vendor);
            setAlamatVendor(vendor.alamat_vendor);
            setTelepon(vendor.no_telepon);
            setKendaraan(vendor.no_kendaraan);
        }
    }, [vendor]);

    const updateVendor = async(e) => {
        e.preventDefault();

        try {
            await axios.patch(`http://localhost:5000/vendor/${vendor.id_vendor}`, {
                id_vendor,
                nama_vendor, 
                alamat_vendor,
                no_telepon,
                no_kendaraan
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
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
        setNamaVendor(alphabetValue);
    };

    const handleAlamatChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setAlamatVendor(alphabetValue);
    };


    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center pb-1">
                <h3 mt-3 mb-0>Form Edit Vendor</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left pt-0">
                <hr />
                <Form onSubmit={updateVendor}>
                <Row>
                    <Col md="12">
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
                    <Col md="12">
                    <Form.Group>
                        <label>Nama Vendor</label>
                        <Form.Control
                            type="text"
                            required
                            value={nama_vendor}
                            uppercase
                            onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>Alamat Vendor</label>
                        <Form.Control
                            type="text"
                            required
                            value={alamat_vendor}
                            uppercase
                            onChange={(e) => setAlamatVendor(e.target.value.toUpperCase())}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>No. Telepon</label>
                        <Form.Control
                            type="text"
                            required
                            value={no_telepon}
                            onChange={(e) => handleTelepon(e.target.value)}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                    <Form.Group>
                        <label>No. Kendaraan</label>
                        <Form.Control
                            type="text"
                            required
                            value={no_kendaraan}
                            uppercase
                            onChange={(e) => setKendaraan(e.target.value.toUpperCase())}
                        ></Form.Control>
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
                            Simpan
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

export default EditVendor;