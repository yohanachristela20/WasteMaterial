import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const EditKaryawan = ({showEditModal, setShowEditModal, karyawan, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [divisi, setDivisi] = useState("");

    const [divisiError, setDivisiError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (karyawan) {
            setIdKaryawan(karyawan.id_karyawan);
            setNama(karyawan.nama);
            setDivisi(karyawan.divisi);
        }
    }, [karyawan]);

    const updateKaryawan = async(e) => {
        e.preventDefault();


        if (!divisi) {
            setDivisiError(true);
            e.preventDefault();
            return; 
        }

        try {
            await axios.patch(`http://localhost:5000/karyawan/${karyawan.id_karyawan}`, {
                id_karyawan,
                nama, 
                divisi
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            console.log(error.message);
            toast.error('Gagal mengubah data karyawan.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

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
    
    const handleGajiPokokChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setGajiPokok(numericValue);
    };

    const handleIdKaryawanChange = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setIdKaryawan(numericValue);
    };

    const handleNamaChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(alphabetValue);
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
                <h3 mt-3 mb-0>Form Edit Karyawan</h3>
                
            </Modal.Header>
            <Modal.Body className="text-left pt-0">
                <hr />
                <Form onSubmit={updateKaryawan}>
                <Row>
                <Col md="12">
                    <Form.Group>
                        <label>ID Karyawan</label>
                        <Form.Control
                            readOnly
                            placeholder="ID Karyawan"
                            type="text"
                            value={id_karyawan}
                        ></Form.Control>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md="12">
                <Form.Group>
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
                <Col md="12">
                    <Form.Group>
                    <label>Divisi</label>
                    <Form.Select 
                    className="form-control"
                    value={divisi}
                    required
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

export default EditKaryawan;