import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddVendor = ({showAddModal, setShowAddModal, onSuccess}) => {
	const [id_vendor, setIdVendor] = useState("");
	const [nama, setNamaVendor] = useState("");
	const [alamat, setAlamatVendor] = useState("");
	const [no_telepon, setTelepon] = useState("");
	const [no_kendaraan, setKendaraan] = useState("");
	const [sopir, setSopir] = useState("");

	const token = localStorage.getItem("token");

	const idVendor = async(e) => {
		const response = await axios.get('http://localhost:5001/getLastVendorId', {
			headers: {
				Authorization: `Bearer ${token}`,
			}
		});

		//spare data up to 100.000 data 
		let newId = "V00001";
		if (response.data?.nextId) {
			const lastIdNumber = parseInt(response.data.nextId.substring(1), 10);
			const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
			newId= `V${incrementedIdNumber}`;
		}
		
		setIdVendor(newId);

	};

	useEffect(() => {
			idVendor();
	});

	const saveVendor = async(e) => {
		e.preventDefault();
		try {
				await axios.post('http://localhost:5001/vendor', {
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
				setShowAddModal(false);
				onSuccess();
				window.location.reload();
		} catch (error) {
				console.log(error.message);
		}
	};

	const handleNamaChange = (value) => {
			const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
			setNamaVendor(alphabetValue);
	};

	const handleNamaSopir = (value) => {
			const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
			setSopir(alphabetValue);
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
			<Modal
					className="modal-primary"
					show={showAddModal}
					onHide={() => setShowAddModal(false)}
			>
			<Modal.Header>
					<h3 className="mt-2 mb-0"><strong>Form Master Vendor</strong></h3>
			</Modal.Header>
			<Modal.Body className="text-left pt-0 mt-2 mb-1">
					<Form onSubmit={saveVendor}>
					<span className="text-danger required-select">(*) Wajib diisi.</span>
					<Row>
							<Col md="12" className="mt-3 mb-2">
									<Form.Group>
									<span className="text-danger">*</span>
											<label>ID Vendor</label>
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
							<Col md="12" className="mb-2">
							<Form.Group>
							<span className="text-danger">*</span>
									<label>Nama Vendor</label>
									<Form.Control
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
									<label>Alamat Vendor</label>
									<Form.Control
											type="text"
											required
											value={alamat}
											uppercase
											onChange={(e) => setAlamatVendor(e.target.value.toUpperCase())}
									></Form.Control>
									</Form.Group>
							</Col>
					</Row>
					<Row>
							<Col md="12" className="mb-2">
							<Form.Group>
									<label>Nomor Telepon</label>
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
									<label>Sopir</label>
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

export default AddVendor;