import { useState, useEffect } from "react";
import { FaInfoCircle, FaWindowClose } from 'react-icons/fa'; 
import DeclineAlert from "components/Alert/DeclineAlert.js";

import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
    Form,
    OverlayTrigger,
    Tooltip,
    Alert, 
    Spinner
  } from "react-bootstrap";

function ConditionallyAcceptedAlert({ selectedPinjaman, hidden }) {
    const [show, setShow] = useState(true);

    if (!show) return null;
    if (hidden) return null;

    return (
        <div className="alert alert-info bg-alert" role="alert">
            <Row>
                <Col md="1" className="info-icon-container">
                    <FaInfoCircle className="info-icon"/>
                </Col>
                <Col md="11">
                    <Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><strong>Pengajuan Diterima Dengan Syarat</strong></Alert.Heading>
                    {/* <hr className="border" /> */}
                    <p className="mt-2 mb-0">Hasil screening data diri anda tidak memenuhi syarat persentase angsuran maksimal.</p>
                    <p className="mt-0">Namun, anda tetap dapat mengajukan pinjaman dengan mengirimkan surat permohonan terlebih dahulu.</p>
                    <p className="mt-0">Klik tombol <a href="#permohonan" style={{fontWeight: "500", color: "red"}}><strong>Ajukan Permohonan</strong></a>.</p>
                    <Button
                        variant="link"
                        onClick={() => setShow(false)}
                        className="close-button"
                    >
                        <FaWindowClose style={{ marginRight: "-8px", marginTop:"-15px" }} />
                    </Button>
                </Col>
            </Row>
        </div>
        
    );
}

export default ConditionallyAcceptedAlert;