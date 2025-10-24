import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';


const EditBarang = ({showEditModal, setShowEditModal, dataBarang, onSuccess}) => {
    const [id_barang, setIdBarang] = useState("");
    const [nama, setNamaBarang] = useState("");
    const [id_sap, setIdSap] = useState("");
    const [id_kategori, setIdKategori] = useState("");
    const [nama_kategori, setNamaKategori] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [kategori_barang, setKategoriBarang] = useState("");
    const [nama_kat, setNamaKat] = useState("");
 
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (dataBarang) {
            setIdBarang(dataBarang.id_barang);
            setNamaBarang(dataBarang.nama);
            setIdSap(dataBarang.id_sap);
            setIdKategori(dataBarang.id_kategori);
            setNamaKat(dataBarang.KategoriBarang?.nama);

            setSelectedCategory({
                value: dataBarang.id_kategori,
                label: dataBarang.KategoriBarang?.nama || ""
            });
        }
    }, [dataBarang]);


    const updateDetailBarang = async(e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://localhost:5000/data-barang/${id_barang}`, {
                nama,
                id_sap,
                id_kategori,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            toast.success('Master barang berhasil diperbarui.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
            window.location.reload();

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
    

    const handleNamaChange = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNamaBarang(value);
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

    useEffect(() => {
        getNamaKategori();
    }, []);


    return (
        <>
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center">
               <h3 className="mt-2 mb-0"><strong>Ubah Data Barang</strong></h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 mb-1">
                <Form onSubmit={updateDetailBarang}>
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                <Row>
                    <Col md="12" className="mt-3 mb-2">
                        <Form.Group>
                            <label>ID Barang</label>
                            <Form.Control
                                readOnly
                                type="text"
                                value={id_barang}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="mb-2">
                        <Form.Group>
                            <span className="text-danger">*</span>
                            <label>Nama Detail Barang</label>
                            <Form.Control
                                type="text"
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
                            <label>ID SAP</label>
                            <Form.Control
                                type="text"
                                value={id_sap}
                                uppercase
                                onChange={(e) => handleIDSAP(e.target.value.toUpperCase())}
                            ></Form.Control>
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
                            value={id_kategori || ""}
                            onChange={(e) => {
                                const selected = nama_kategori.find(emp => emp.value === e.target.value);
                                setSelectedCategory(selected || null);
                                const id = selected ? selected.value : "";
                                setIdKategori(id);
                                setKategoriBarang(id);
                            }}
                            >
                            {nama_kategori
                            .map(option => (
                                <option key={option.value} value={option.value} hidden={option.value === id_kategori}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
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
                                Ubah
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

export default EditBarang;