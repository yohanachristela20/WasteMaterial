import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddVendor = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_vendor, setIdVendor] = useState("");
    const [nama_vendor, setNamaVendor] = useState("");
    const [alamat_vendor, setAlamatVendor] = useState("");
    const [no_telepon, setTelepon] = useState("");
    const [no_kendaraan, setKendaraan] = useState("");

    const token = localStorage.getItem("token");

    const idVendor = async(e) => {
        const response = await axios.get('http://localhost:5000/getLastVendorId', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const newId = response.data?.nextId || "1-V";
        setIdVendor(newId);

        console.log("newId: ", newId);
    };

    useEffect(() => {
        idVendor();
    });

    const saveVendor = async(e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/vendor', {
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
            setShowAddModal(false);
            onSuccess();
        } catch (error) {
            console.log(error.message);
        }
    
    };

    const handleNamaChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNamaVendor(alphabetValue);
    };

    const handleAlamatChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setAlamatVendor(alphabetValue);
    };

    const handleTelepon = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setTelepon(numericValue);
    };


    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center pb-1">
                <h3 className="mt-3 mb-0">Form Master Vendor</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left pt-0">
                <hr />
                <Form onSubmit={saveVendor}>

                <span className="text-danger required-select">(*) Wajib diisi.</span>

                <Row>
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label className="mt-3">ID Vendor</label>
                            <Form.Control
                                placeholder="ID Vendor"
                                type="text"
                                readOnly
                                value={id_vendor}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
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
                    <span className="text-danger">*</span>
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
                    <span className="text-danger">*</span>
                        <label>Nomor Telepon</label>
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
                    <span className="text-danger">*</span>
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

export default AddVendor;