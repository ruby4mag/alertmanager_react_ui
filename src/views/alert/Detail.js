import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams, } from 'react-router-dom';
import { CForm, CFormLabel, CFormTextarea, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CContainer, CToaster, CCardBody, CCard, CRow, CCol, CCardTitle, CCardText } from '@coreui/react';
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

                <CContainer>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel htmlFor="exampleFormControlTextarea1">Add Comment</CFormLabel>
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
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <h4>Event Details</h4>
            <CRow>
                <CCol style={{ flex: '0 0 60%' }}>
                    <div >
                        <CRow>
                            <CContainer>
                                <CTable small >
                                    <CTableHead>
                                    </CTableHead>
                                    <CTableBody>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Entity</CTableHeaderCell>
                                            <CTableDataCell>{data && data['entity']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Time</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertTime']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Latest Time</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertLastTime']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Clear Time</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertClearTime']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Source</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertSource']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Service Name</CTableHeaderCell>
                                            <CTableDataCell>{data && data['serviceName']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Summary</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertSummary']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Status</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertStatus']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Notes</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertNotes']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Acknowledged</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertAcked']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Severity</CTableHeaderCell>
                                            <CTableDataCell>{data && data['severity']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Id</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertId']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Priority</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertPriority']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Ip Addess</CTableHeaderCell>
                                            <CTableDataCell>{data && data['ipAddress']}</CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableHeaderCell scope="row">Alert Count</CTableHeaderCell>
                                            <CTableDataCell>{data && data['alertCount']}</CTableDataCell>
                                        </CTableRow>
                                    </CTableBody>
                                </CTable>
                            </CContainer>
                            <CommentComponent ></CommentComponent>
                        </CRow>
                    </div>
                </CCol>
                <CCol style={{ flex: '0 0 40%' }}>
                    <div >
                        Comments
                        {data && data['WorkLogs'] && data['WorkLogs'].reverse().map((comment, index) => (
                            <CCard className="mb-4">
                                <CCardBody>
                                    <CCardText>
                                        Date : {comment['createdAt']}<br />
                                        Author : {comment['author']}<br />
                                        Comment : {comment['comment']}
                                    </CCardText>
                                </CCardBody>
                            </CCard>
                        ))}
                    </div>
                </CCol>
            </CRow >


        </>
    )
}

export default Detail