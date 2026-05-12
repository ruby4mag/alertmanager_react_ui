import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { CListGroup, CListGroupItem, CToaster, CContainer, CRow, CCol, CButton } from '@coreui/react';
import useAxios from '../../../services/useAxios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import MyToast from '../../../components/Toast';

const List = () => {
    const api = useAxios();
    const [toast, addToast] = useState(0)
    const toaster = useRef()
    const [data, setData] = useState([])
    const navigate = useNavigate();
    const { role } = useAuth();

    const fetchData = async () => {
        try {
            const response = await api.get('/api/correlationrules');
            console.log(response.data);
            setData(response.data)

        } catch (error) {
            console.error('Error fetching data:', error);

        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleButtonClick = () => {
        navigate('/rule/correlationrule/new');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this correlation rule?")) {
            try {
                await api.delete(`/api/correlationrules/${id}`);
                setData(data.filter(item => (item._id || item.id || item.ID) !== id));
                addToast(MyToast({
                    title: "Success",
                    body: "Rule deleted successfully.",
                    color: "success",
                    autohide: true,
                    dismissible: true
                }));
            } catch (error) {
                console.error("Error deleting rule:", error);
                addToast(MyToast({
                    title: "Error",
                    body: "Failed to delete rule.",
                    color: "danger",
                    autohide: true,
                    dismissible: true
                }));
            }
        }
    };


    return (
        <>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CButton variant="outline" onClick={handleButtonClick} color="primary">Add rule</CButton>
            <CListGroup className="mt-3 md" >
                {data.map((item, index) => {
                    const itemId = item._id || item.id || item.ID;
                    return (
                        <CListGroupItem key={itemId || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{item['groupname']}</span>
                            <div>
                                {role == 'admin' ?
                                    <>
                                        <Link to={`/rule/correlationrule/edit/${itemId}`}>
                                            <CButton size="sm" variant="outline" color="primary" className="me-2">Edit</CButton>
                                        </Link>
                                        <CButton size="sm" variant="outline" color="danger" className="me-2" onClick={() => handleDelete(itemId)}>Delete</CButton>
                                    </>
                                    : ""
                                }
                                <Link to={`/rule/correlationrule/view/${itemId}`}>
                                    <CButton size="sm" variant="outline" color="primary">View</CButton>
                                </Link>
                            </div>
                        </CListGroupItem>
                    );
                })}
            </CListGroup >
        </>
    )
}

export default List