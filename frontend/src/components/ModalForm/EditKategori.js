import { Badge, Button, Modal, Form, Row, Col, OverlayTrigger, Popover } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const EditKategori = ({ showEditModal, setShowEditModal, onSuccess, detailBarang }) => {
    const [id_kategori, setIdKategori] = useState("");
    const [nama, setNamaKategori] = useState("");
    const [tanggal_penetapan, setTanggalPenetapan] = useState("");
    const [satuan, setSatuan] = useState("");
    const [harga_barang, setHargaBarang] = useState("");
    const [jenis_barang, setJenisBarang] = useState("");
    const [jenisBarangError, setJenisBarangError] = useState(false);
    const [satuanError, setSatuanError] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (detailBarang) {
            setIdKategori(detailBarang.id_kategori);
            setNamaKategori(detailBarang.nama);
            setTanggalPenetapan(detailBarang.tanggal_penetapan);
            setSatuan(detailBarang.satuan);
            setHargaBarang(detailBarang.harga_barang);
            setJenisBarang(detailBarang.jenis_barang);
        }
    }, [detailBarang]);

    useEffect(() => {
        const now = new Date();
        const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const yyyy = jakartaTime.getFullYear();
        const mm = String(jakartaTime.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
        const dd = String(jakartaTime.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        setTanggalPenetapan(formattedDate); 
    }, []);
    

    const updateKategori = async(e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://localhost:5000/kategori-barang/${id_kategori}`, {
                nama,
                tanggal_penetapan,
                satuan,
                harga_barang,
                jenis_barang,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            toast.success('Kategori barang berhasil diperbarui.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
            window.location.reload();
        } catch (error) {
            console.log(error.message);
            toast.error('Gagal mengubah kategori barang.', {
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

    const handleHargaBarang = (value) => {
        const numericValue = value.replace(/\D/g, "");
        setHargaBarang(numericValue);
    };

    const handleNamaChange = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNamaKategori(value);
    };

    const handleSatuan = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setSatuan(alphabetValue);
    };

    return (
        <>
            <div>
                <Modal
                    className="modal-primary"
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                >
                    <Modal.Header>
                        <h3 className="mt-2 mb-0"><strong>Form Ubah Kategori Barang</strong></h3>
                    </Modal.Header>
                    <Modal.Body className="text-left pt-0 mt-2 mb-1">
                        <Form onSubmit={updateKategori}>
                        <span className="text-danger required-select">(*) Wajib diisi.</span>
                            <Row>
                                <Col md="12" className="mt-3 mb-2">
                                    <Form.Group>
                                        <label>ID Kategori</label>
                                        <Form.Control
                                            type="text"
                                            value={id_kategori}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col md="12">
                                    <Form.Group>
                                    <span className="text-danger">*</span>
                                        <label>Nama Kategori</label>
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
														<Row className="mb-2">
															<Col md="12">
																	<Form.Group>
																	<span className="text-danger">*</span>
																	<label>Satuan</label>
																	<OverlayTrigger 
																			key={top}
																			placement="top"
																			
																			overlay={
																					<Popover id={`popover-top`} style={{ backgroundColor: "#e2feff"}}>
																							<Popover.Header as="h4" className="mt-0"  style={{ backgroundColor: "#b8f3f5ff"}} >
																									Deskripsi Satuan
																							</Popover.Header>
																							<Popover.Body>
																									<div style={{fontSize: '12px', marginTop: '5px', marginBottom: '5px'}} >                                                
																									BAG=BAG; BTG=BATANG; BTL=BOTTLE; BOX=BOX; BKS=BUNGKUS; CAN=CAN; CAR=CARTON; CS=CASE; CC=CC; CM=CENTIMETER; DR=DRUM; DOZ=DUS; EA=EACH; FT=FEET; GLN=GALON; GR=GRAM; INC=INCH; JRG=JIRIGEN; KLG=KALENG; KG=KILOGRAM; LBR=LEMBAR; LT=LITER; LSN=LUSIN; M=METER; MG=MILIGRAM; ML=MILILITER; PAC=PAC; PL=PAIL; PLT=PALLET; PSG=PASANG; PCS=PIECE; RIM=RIM; ROL=ROL; ZAK=SAK; SET=SET; TB=TABUNG; UNT=UNIT; GAL=US GALLON</div>
																							</Popover.Body>
																					</Popover>
																			}
																	>
																			<Form.Select 
																			className="form-control"
																			required
																			value={satuan}
																			onChange={(e) => {
																					setSatuan(e.target.value);
																					setSatuanError(false);
																			}}
																			>
																					<option className="placeholder-form" key='blankChoice' hidden value>Pilih Satuan</option>
																					<option value="BAG">BAG</option>
																					<option value="BTG">BTG</option>
																					<option value="BTL">BTL</option>
																					<option value="BOX">BOX</option>
																					<option value="BKS">BKS</option>
																					<option value="CAN">CAN</option>
																					<option value="CAR">CAR</option>
																					<option value="CS">CS</option>
																					<option value="CC">CC</option>
																					<option value="CM">CM</option>
																					<option value="DR">DR</option>
																					<option value="DOZ">DOZ</option>
																					<option value="EA">EA</option>
																					<option value="FT">FT</option>
																					<option value="GLN">GLN</option>
																					<option value="GR">GR</option>
																					<option value="INC">INC</option>
																					<option value="JRG">JRG</option>
																					<option value="KLG">KLG</option>
																					<option value="KG">KG</option>
																					<option value="LBR">LBR</option>
																					<option value="LT">LT</option>
																					<option value="LSN">LSN</option>
																					<option value="M">M</option>
																					<option value="MG">MG</option>
																					<option value="ML">ML</option>
																					<option value="PAC">PAC</option>
																					<option value="PL">PL</option>
																					<option value="PLT">PLT</option>
																					<option value="PSG">PSG</option>
																					<option value="PCS">PCS</option>
																					<option value="RIM">RIM</option>
																					<option value="ROL">ROL</option>
																					<option value="ZAK">ZAK</option>
																					<option value="SET">SET</option>
																					<option value="TB">TB</option>
																					<option value="UNT">UNT</option>
																					<option value="GAL">GAL</option>
																			</Form.Select>
																	</OverlayTrigger>
																	{satuanError && <span className="text-danger required-select">Satuan belum dipilih</span>}
																	</Form.Group>
															</Col>
														</Row>
                            <Row className="mb-2">
                                <Col md="12">
                                    <Form.Group>
                                    <span className="text-danger">*</span>
                                        <label>Harga Barang</label>
                                        <Form.Control
                                            placeholder="Rp"
                                            type="text"
                                            required
                                            value={"Rp " + formatRupiah(harga_barang)}
                                            onChange={(e) => handleHargaBarang(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-2">
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
                            <Row className="mb-2">
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
                                    <div className="d-flex flex-column">
                                        <Button className="btn-fill w-100 my-3" type="submit" variant="primary">
                                            Ubah
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default EditKategori;
