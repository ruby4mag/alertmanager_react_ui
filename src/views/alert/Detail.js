import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams, } from 'react-router-dom';
import { CForm, CFormLabel, CFormTextarea, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CContainer, CToaster, CCardBody, CCard, CRow, CCol, CCardTitle, CCardText, CCardHeader } from '@coreui/react';
import MyToast from '../../components/Toast'
import useAxios from '../../services/useAxios';

const Detail = () => {

    const [toast, addToast] = useState(0)
    const { id } = useParams();
    const api = useAxios();
    const navigate = useNavigate();
    const toaster = useRef()
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            const response = await api.get(`/api/alerts/${id}`);
            console.log(response.data);
            setData(response.data)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // Fetch the data for the given ID
        fetchData(id);
    }, [id]);

    // Go back to alerts page
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                navigate(-1); // Equivalent to history.goBack()
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    const UrlLink = ({ url, text }) => {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                {text}
            </a>
        );
    };

    const CommentComponent = () => {

        console.log(id)
        const [comment, setComment] = useState("")
        const api = useAxios();
        const handleCommentSubmit = () => {
            const newComment = {
                comment: comment
            };

            const addComment = async () => {
                try {
                    const response = await api.post(`/api/alerts/${id}/comment`, newComment);
                    console.log(response.data);
                    addToast(MyToast({
                        title: "Alert Comment",
                        timestamp: "Just now",
                        body: "Alert Comment added successfully",
                        color: 'success',
                        autohide: true,
                        dismissible: true
                    }))
                    setComment('')
                } catch (error) {
                    console.error('Error fetching data:', error);
                    addToast(MyToast({
                        title: "Alert Comment",
                        timestamp: "Just now",
                        body: "Failed to add alert comment.",
                        color: 'danger',
                        autohide: true,
                        dismissible: true
                    }))
                }
                fetchData(id)
            }
            addComment()
        }
        return (
            <>

                <CContainer fluid>
                    <CForm>
                        <div className="mb-3">
                            <CFormTextarea id="exampleFormControlTextarea12" rows={3} placeholder="Add Comment" value={comment} onChange={(e) => setComment(e.target.value)}></CFormTextarea>
                        </div>
                    </CForm>
                    <CButton disabled={comment == "" ? true : false} variant="outline" onClick={handleCommentSubmit} color="primary">Add Comment</CButton>
                </CContainer>
            </>
        )
    }

    return (
        <>
            <CContainer fluid>
                <CToaster ref={toaster} push={toast} placement="top-end" />
                <CRow>
                    <CCol >
                        <CRow>
                            <CContainer>
                                <CCard>
                                    <CCardHeader>Event Details</CCardHeader>
                                    <CCardBody>
                                        <CTable small >
                                            <CTableBody>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Entity</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['entity']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Time</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertfirsttime']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Latest Time</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertlasttime']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Clear Time</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertcleartime']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Source</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertsource']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Service Name</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['servicename']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Summary</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertsummary']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Status</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertstatus']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Acknowledged</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertacked']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Severity</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['severity']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Id</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertid']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Priority</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertpriority']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Ip Addess</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['ipaddress']}</CTableDataCell>
                                                </CTableRow>
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">Alert Count</CTableHeaderCell>
                                                    <CTableDataCell>{data && data['alertcount']}</CTableDataCell>
                                                </CTableRow>
                                            </CTableBody>
                                        </CTable>
                                    </CCardBody>
                                </CCard>
                            </CContainer>
                        </CRow>
                    </CCol>
                    <CCol>
                        <CContainer fluid>
                            <CCard>
                                <CCardHeader>Additional Details</CCardHeader>
                                <CCardBody>
                                    <CTable small >
                                        <CTableBody>
                                            {data && data['additionaldetails'] && Object.entries(data['additionaldetails']).map(([key, value]) => (
                                                <CTableRow>
                                                    <CTableHeaderCell scope="row">{key}</CTableHeaderCell>
                                                    {key == 'ticket' ? <CTableDataCell> <UrlLink url={value} text="Ticket" /></CTableDataCell> : <CTableDataCell> {value}</CTableDataCell>}
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                </CCardBody>
                            </CCard>
                            <CCard className='mt-4'>
                                <CCardHeader>Alert Notes</CCardHeader>
                                <CCardBody>
                                    <CTableRow>
                                        <CTableDataCell>{data && data['alertnotes']}</CTableDataCell>
                                    </CTableRow>
                                </CCardBody>
                            </CCard>
                            <CCard className='mt-4'>
                                <CCardHeader>Add Comment</CCardHeader>
                                <CCardBody>
                                    <CommentComponent ></CommentComponent>
                                </CCardBody>
                            </CCard>
                        </CContainer>
                    </CCol>
                </CRow>
            </CContainer >
            <CContainer fluid>

                <CCard className="mt-4 mb-4" hidden={data && data['worklogs'] ? false : true} >
                    <CCardHeader>Comments</CCardHeader>
                    <CCardBody>
                        <CCol >
                            {data && data['worklogs'] && data['worklogs'].reverse().map((comment, index) => (
                                <CCard className="mb-4" key={comment['id']}>
                                    <CCardBody>
                                        <CCardText>
                                            Date : {comment['createdAt']}<br />
                                            Author : {comment['author']}<br />
                                            Comment : {comment['comment']}
                                        </CCardText>
                                    </CCardBody>
                                </CCard>
                            ))}
                        </CCol>
                    </CCardBody>
                </CCard>
            </CContainer >
        </>
    )
}

export default Detail