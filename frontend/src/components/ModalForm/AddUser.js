import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddUser = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_user, setIdUser] = useState("");
    const [username, setUserName] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState(""); 
    const [id_karyawan, setIdKaryawan] = useState("");


    const token = localStorage.getItem("token");
    const saveUser = async(e) => {
        e.preventDefault();
        try {
            const defaultPassword = "cmpi"; 

            const response = await axios.get('http://localhost:5000/last-id', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let newId = "USR0001";
            if (response.data?.lastId) {
                const lastIdNumber = parseInt(response.data.lastId.substring(3), 10);
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(4, '0');
                newId = `USR${incrementedIdNumber}`;
            }

            await axios.post('http://localhost:5000/user', {
                id_user: newId,
                username, 
                password: defaultPassword,
                role, 
                id_karyawan,
                user_active: 0,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false);
            // onSuccess();
            window.location.reload();
            toast.success('Data user baru berhasil dibuat.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.log(error.message);
            toast.error('Gagal menyimpan data user baru.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
        }
    
    };

    // const handleUsernameChange = (value) => {
    //     const numericValue = value.replace(/\D/g, "");
    //     setIdUser(numericValue);
    // };

    const handleIDKaryawan = (value) => {
        setIdKaryawan(value);
    };


    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Form Master User</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-3">
                <Form onSubmit={saveUser}>
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                <Row>
                </Row>
                <Row>
                    <Col md="12" className="mb-2">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Username</label>
                        <Form.Control
                            type="text"
                            required
                            value={username}
                            onChange={(e) => {
                                setUserName(e.target.value);
                            }}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                <Col md="12" className="mb-2">
                <Form.Group>
                    <span className="text-danger">*</span>
                    <label>Role</label>
                    <Form.Select
                        placeholder="Role"
                        className="form-control"
                        type="text"
                        value={role}
                        required
                        onChange={(e) => {
                            setRole(e.target.value);
                        }}
                        >
                            <option className="placeholder-form" key='blankChoice' hidden value>Pilih Role</option>
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
                    </Form.Select>
                </Form.Group>
                </Col>
                </Row>

                <Row>
                    <Col md="12" className="mb-2">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>ID Karyawan</label>
                        <Form.Control
                            type="text"
                            required
                            value={id_karyawan}
                            uppercase
                            onChange={(e) => handleIDKaryawan(e.target.value.toUpperCase())}

                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                <Col md="12" className="mb-3">
                    <div className="d-flex flex-column">
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

export default AddUser;