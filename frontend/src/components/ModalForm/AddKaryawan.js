import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddKaryawan = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [divisi, setDivisi] = useState("");

    const [divisiError, setDivisiError] = useState(false);


    const token = localStorage.getItem("token");

    const idKaryawan = async(e) => {
        const response = await axios.get('http://localhost:5000/getLastKaryawanId', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const newId = response.data?.nextId || "KRY0001";
        setIdKaryawan(newId);

        console.log("newId: ", newId);
    };

    useEffect(() => {
        idKaryawan();
    });

    const saveKaryawan = async(e) => {
        e.preventDefault();
        if (!divisi) {
            setDivisiError(true);
            e.preventDefault();
            return; 
        }

        try {
            await axios.post('http://localhost:5000/karyawan', {
                id_karyawan,
                nama, 
                divisi
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
        setNama(alphabetValue);
    };


    return (
        <>
            <Modal
            className="modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center pb-1">
                <h3 className="mt-3 mb-0">Form Master Karyawan</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-3">
                <Form onSubmit={saveKaryawan}>
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                <Row>
                    <Col md="12" className="mt-3 mb-2">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>ID Karyawan</label>
                            <Form.Control
                                placeholder="ID Karyawan"
                                type="text"
                                readOnly
                                value={id_karyawan}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="mb-2">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Nama Lengkap</label>
                        <Form.Control
                            placeholder="Nama Lengkap"
                            type="text"
                            required
                            value={nama}
                            uppercase
                            onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="mb-2">
                        <Form.Group>
                        <span className="text-danger">*</span>
                        <label>Divisi</label>
                        <Form.Select 
                        className="form-control"
                        required
                        value={divisi}
                        onChange={(e) => {
                            setDivisi(e.target.value);
                            setDivisiError(false);
                        }}
                        >
                            <option className="placeholder-form" key='blankChoice' hidden value>Pilih Divisi</option>

                            <option value="DIREKSI">DIREKSI</option>
                            <option value="PURCHASING">PURCHASING</option>
                            <option value="FINANCE">FINANCE</option>
                            <option value="LOGISTIC">LOGISTIC</option>
                            <option value="ACCOUNTING">ACCOUNTING</option>
                            <option value="TAX">TAX</option>
                            <option value="FREEZER MANAGEMENT">FREEZER MANAGEMENT</option>
                            <option value="PRODUCT COST">PRODUCT COST</option>
                            <option value="DELIVERY VAN REPAIR">DELIVERY VAN REPAIR</option>
                            <option value="INTERNAL AUDIT">INTERNAL AUDIT</option>
                            <option value="PRODUCTION">PRODUCTION</option>
                            <option value="PPC">PPC</option>
                            <option value="R&D">R&D</option>
                            <option value="QC">QC</option>
                            <option value="QS">QS</option>
                            <option value="MARKETING OPERATIONAL">MARKETING OPERATIONAL</option>
                            <option value="IT SUPPORT">IT SUPPORT</option>
                            <option value="HR & GENERAL AFFAIR">HR & GENERAL AFFAIR</option>
                            <option value="TEKNIK & ADM. MEKANIK">TEKNIK & ADM. MEKANIK</option>
                        </Form.Select>
                        {divisiError && <span className="text-danger required-select">Divisi belum dipilih</span>}
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
            {/* End Modal */}
        </>
    )
}

export default AddKaryawan;