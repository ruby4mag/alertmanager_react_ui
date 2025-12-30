import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { CListGroup, CListGroupItem, CToaster, CContainer, CRow, CCol, CButton } from '@coreui/react';
import useAxios from '../../../services/useAxios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';

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


    return (
        <>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CButton variant="outline" onClick={handleButtonClick} color="primary">Add rule</CButton>
            <CListGroup className="mt-3 md" >
                {data.map((item, index) => (
                    <CListGroupItem key={item['_id']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item['groupname']}</span>
                        <div>
                            {role == 'admin' ?
                                <Link to={`/rule/correlationrule/edit/${item['_id']}`}>
                                    <CButton size="sm" variant="outline" color="primary" className="me-2">Edit</CButton>
                                </Link>
                                : ""
                            }
                            <Link to={`/rule/correlationrule/view/${item['_id']}`}>
                                <CButton size="sm" variant="outline" color="primary">View</CButton>
                            </Link>
                        </div>
                    </CListGroupItem>
                ))}
            </CListGroup >
        </>
    )
}

export default List