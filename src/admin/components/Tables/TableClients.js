import React, { useEffect, useState } from "react";
import { storage, db } from '../../../Config/Config'
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import './TableStyle.css'

import {
    Table,
    Button,
    Container,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    ModalFooter,
} from "reactstrap";

const TableClients = () => {

    const initialStateValues = {
        nombre: '',
        apellido: 0,
        telefono: 0, 
        direccion: true,
        correo: '', 
        estado: true
    };

    const [datos, setDatos] = useState([]);
    const [dataCliente, setDataCliente] = useState(initialStateValues);
    const [modalActualizar, setModalActualizar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [error, setError] = useState('');
    const [currentId, setCurrentId] = useState("");
    

    const types = ['image/png', 'image/jpeg']; 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDataCliente({ ...dataCliente, [name]: value });
    }

    const mostrarModalActualizar = (dato) => {
        setCurrentId(dato.id);
        setDataCliente({ 
            nombre: dato.Name,
            apellido: dato.LastName,
            telefono: dato.Phone, 
            direccion: dato.Address,
            correo: dato.Email
        });
        setModalActualizar(true);
    };

    const cerrarModalActualizar = () => {
        setModalActualizar(false);
    };

    const mostrarModalInsertar = () => {
        setModalInsertar(true);
    };

    const cerrarModalInsertar = () => {
        setModalInsertar(false);
    };

    const obtenerRegistros = async () => {
        db.collection('Clients').onSnapshot((querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                let correo = doc.data().Email
                let correito = correo.split("@");
                if(correito[1]!=="admin.com"){
                    docs.push({...doc.data(), id: doc.id});
                }
            });
            setDatos(docs);
        });
    }

    useEffect(() => {
        obtenerRegistros();
    }, []);

    const editar = (dato) => {
        const dataActualizar = {
            Name: dato.nombre,
            LastName: dato.apellido,
            Phone: dato.telefono,
            Address: dato.direccion,
            Email: dato.correo
        }
        db.collection('Clients').doc(currentId).update(dataActualizar)
        .then(() => {
            toast("Cliente actualizado con éxito!", {
                type: "info",
              });
                setModalActualizar(false);
        }).catch(err => setError(err.message));
    };

    const eliminar = async (dato) => {
        if (window.confirm("¿Estás seguro que deseas eliminar a este cliente? " + dato.Name+""+dato.LastName)) {
            await db.collection('Clients').doc(dato.id).update({Estado: false})
            toast("Se eliminó al cliente con éxito.", {
                type: "error",
                autoClose: 2000
            });
        }
    };

    const insertar = (e) => {
        const uploadTask = storage.ref(`clients-images/${imagen.name}`).put(imagen);
        uploadTask.on('state_changed', snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(progress);
        }, err => setError(err.message)
            , () => {
                storage.ref('clients-images').child(imagen.name).getDownloadURL().then(url => {
                    db.collection('Clients').add({
                        Name: dataCliente.nombre,
                        LastName: dataCliente.apellido,
                        Phone: dataCliente.telefono,
                        Address: dataCliente.direccion,
                        Imagen: url, 
                        Email: dataCliente.correo,
                        Estado: true
                    }).then(() => {
                        setDataCliente({ ...initialStateValues });
                        setImagen('');
                        document.getElementById('file').value = '';
                        setModalInsertar(false);
                        setError('');
                        toast("Cliente añadido con éxito.", {
                            type: "info",
                          });
                    }).catch(err => setError(err.message))
                })
            })
    }

    const productImgHandler = (e) => {
        let selectedFile = e.target.files[0];
        if (selectedFile && types.includes(selectedFile.type)) {
            setImagen(selectedFile);
            setError('')
        }
        else {
            setImagen(null);
            setError('Por favor, selecione un tipo de imagen válido (jpg or png)');
        }
    }

    return (
        <div>
            <div className="titulo">
                <h1>Tabla de Clientes</h1>
            </div>
            <Container>
                <br />
                <Button
                    color="primary"
                    onClick={() => mostrarModalInsertar()}>
                    Añadir Cliente
                </Button>
                <br />
                <br />
                <Table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {datos.map((dato) => (
                            <tr key={dato.id}>
                                <td>{dato.Name}</td>
                                <td>{dato.LastName}</td>
                                <td>{dato.Email}</td>
                                <td>{dato.Phone}</td>
                                <td>{dato.Address}</td>
                                <td>
                                    <Button
                                        color="primary"
                                        onClick={() => mostrarModalActualizar(dato)}
                                    >
                                        <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                                    </Button>{" "}
                                    <Button color="danger" onClick={() => eliminar(dato)}>
                                        <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            <Modal isOpen={modalActualizar}>
                <ModalHeader>
                    <div><h3 className="text-center">Editar Registro</h3></div>
                </ModalHeader>

                <ModalBody>
                    <FormGroup>
                        <label>
                            Id:
                        </label>

                        <input
                            className="form-control"
                            readOnly
                            type="text"
                            value={datos.length + 1}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>
                            Nombre:
                        </label>
                        <input
                            className="form-control"
                            name="nombre"
                            type="text"
                            onChange={handleInputChange}
                            value={dataCliente.nombre}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>
                            Apellido:
                        </label>
                        <input
                            className="form-control"
                            name="apellido"
                            type="text"
                            onChange={handleInputChange}
                            value={dataCliente.apellido}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Email:
                        </label>
                        <input
                            className="form-control"
                            name="email"
                            type="email"
                            onChange={handleInputChange}
                            value={dataCliente.correo}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Teléfono:
                        </label>
                        <input
                            className="form-control"
                            name="telefono"
                            type="text"
                            onChange={handleInputChange}
                            value={dataCliente.telefono}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Dirección:
                        </label>
                        <input
                            className="form-control"
                            name="direccion"
                            type="address"
                            onChange={handleInputChange}
                            value={dataCliente.direccion}
                        />
                    </FormGroup>
                </ModalBody>

                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={() => editar(dataCliente)}
                    >
                        Editar
                    </Button>
                    <Button
                        color="danger"
                        onClick={() => cerrarModalActualizar()}
                    >
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalInsertar}>
                <ModalHeader>
                    <div><h3 className="text-center">Añadir Cliente</h3></div>
                </ModalHeader>

                <ModalBody>
                    <FormGroup>
                        <label>
                            Id:
                        </label>

                        <input
                            className="form-control"
                            readOnly
                            type="text"
                            value={datos.length + 1}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Nombre:
                        </label>
                        <input
                            className="form-control"
                            name="nombre"
                            type="text"
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Apellido:
                        </label>
                        <input
                            className="form-control"
                            name="apellido"
                            type="text"
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Email:
                        </label>
                        <input
                            className="form-control"
                            name="email"
                            type="email"
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Teléfono:
                        </label>
                        <input
                            className="form-control"
                            name="telefono"
                            type="text"
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            Dirección:
                        </label>
                        <input
                            className="form-control"
                            name="direccion"
                            type="address"
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label
                            htmlFor="foto"
                        >
                            Foto
                        </label>

                        <input
                            className="form-control"
                            name="foto"
                            type="file"
                            id="file"
                            required
                            onChange={productImgHandler}
                        />
                    </FormGroup>
                </ModalBody>

                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={() => insertar()}
                    >
                        Insertar
                    </Button>
                    <Button
                        className="btn btn-danger"
                        onClick={() => cerrarModalInsertar()}
                    >
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
export default TableClients;