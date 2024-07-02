import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams, } from 'react-router-dom';
import {
    CForm, CFormLabel, CButtonGroup, CButton, CFormTextarea, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CContainer, CToaster,
    CCardBody, CCard, CRow, CCol, CCardTitle, CCardText, CCardHeader,
    CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem
} from '@coreui/react';
import MyToast from '../../components/Toast'
import useAxios from '../../services/useAxios';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import CIcon from '@coreui/icons-react';
import { cilUser, cilShieldAlt } from '@coreui/icons';
import * as icon from '@coreui/icons';



const Detail = () => {

    const [toast, addToast] = useState(0)
    const { id } = useParams();
    const api = useAxios();
    const navigate = useNavigate();
    const toaster = useRef()
    const [data, setData] = useState(null);
    const [notifications, setNotifications] = useState(null);

    const fetchData = async () => {
        try {
            const response = await api.get(`/api/alerts/${id}`);
            console.log(response.data);
            setData(response.data)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifyrules');
            console.log(response.data);
            setNotifications(response.data)
        } catch (error) {
            console.error('Error fetching data:', error);

        }

    };

    useEffect(() => {
        fetchNotifications();
    }, []);
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


    const handleActionButtonClick = async (ModelAction) => {
        var action
        if (typeof ModelAction === 'object') {
            action = ModelAction['modalAction']
        } else {
            action = ModelAction
        }


        // Acknowledge Action
        if (action == 'ack') {
            const newComment = {
                comment: "Alert Acknowledged"
            };

            try {
                const response = await api.post(`/api/alerts/${id}/acknowledge`, newComment);
                console.log(`Alert ${id} acknowledged:`, response.data);
                addToast(MyToast({
                    title: "Alert Acknowledgement",
                    timestamp: "Just now",
                    body: "Alert acknowledged successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
                fetchData(id);
            } catch (error) {
                console.error(`Failed to acknowledge alert ${id}:`, error);
            }


        }

        // Unacknowledge Action
        if (action == 'unack') {
            const newComment = {
                comment: "Alert Unacknowledged"
            };

            try {
                const response = await api.post(`/api/alerts/${id}/unacknowledge`, newComment);
                console.log(`Alert ${id} acknowledged:`, response.data);
                addToast(MyToast({
                    title: "Alert Acknowledgement",
                    timestamp: "Just now",
                    body: "Alert unacknowledged successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
                fetchData(id);
            } catch (error) {
                console.error(`Failed to acknowledge alert ${id}:`, error);
            }


        }



        // Clear Action
        if (action == 'clear') {
            const newComment = {
                comment: "Clearing Alert"
            };

            try {
                const response = await api.post(`/api/alerts/${id}/clear`, newComment);
                console.log(`Alert ${id} cleared:`, response.data);
                addToast(MyToast({
                    title: "Alert Clear",
                    timestamp: "Just now",
                    body: "Alert cleared successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
                fetchData(id);
            } catch (error) {
                console.error(`Failed to clear alert ${id}:`, error);
            }

        }
        console.log('Selected Data IDs:', selectedDataIds);
    };
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const triggerNotify = async (notificationId, notificationName) => {
        const newComment = {
            comment: `Triggering Notification : ${notificationName}`
        };
        try {
            const response = await api.post(`/api/alerts/${id}/notify/${notificationId}`, newComment);
            console.log(`Alert ${id} cleared:`, response.data);
            addToast(MyToast({
                title: "Alert Action",
                timestamp: "Just now",
                body: "Alert Notified successfully",
                color: 'success',
                autohide: true,
                dismissible: true
            }))
            sleep(2000).then(() => {
                console.log('End');
                fetchData(id);
            });

        } catch (error) {
            console.error(`Failed to trigger notifivcation  ${notificationName}:`, error);
        }

    }

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
                <CContainer fluid className='mb-4'>

                    <CToaster ref={toaster} push={toast} placement="top-end" />
                    <CButtonGroup size="sm" role="group" aria-label="Small button group" className='me-4'>
                        <CButton onClick={() => handleActionButtonClick('ack')} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilUserFollow} size="lg" /></CButton>
                        <CButton onClick={() => handleActionButtonClick('unack')} color="primary" variant="outline"><CIcon className='text-warning' icon={icon.cilUserUnfollow} size="lg" /></CButton>
                        <CButton onClick={() => handleActionButtonClick('clear')} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilCheckCircle} size="lg" /></CButton>
                    </CButtonGroup>
                    <CDropdown>
                        <CDropdownToggle color="primary" variant="outline" size="sm">Actions</CDropdownToggle>
                        <CDropdownMenu>
                            {notifications && notifications.map((notification) => (
                                <CDropdownItem onClick={() => triggerNotify(notification['_id'], notification['rulename'])}  >{notification['rulename']}</CDropdownItem>
                            ))}

                        </CDropdownMenu>
                    </CDropdown>

                </CContainer >
                {(data && data['parent'] == true) ? (
                    <div>
                        <CCard className='mb-4'>
                            <CCardHeader>Related events</CCardHeader>
                            <CCardBody>
                                <CTable align="middle" responsive>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell scope="col">Entity</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Alert Time</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Severity</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Alert Summary</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {data && data['childalerts'] && data['childalerts'].map((alert) => (
                                            <CTableRow>
                                                <CTableDataCell><Link className="link" to={`/alert/details/${alert.ID}`} > {alert.entity}</Link></CTableDataCell>
                                                <CTableDataCell>{alert.alertfirsttime}</CTableDataCell>
                                                <CTableDataCell>{alert.entity}</CTableDataCell>
                                                <CTableDataCell>{alert.alertsummary}</CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCardBody>
                        </CCard>
                    </div>
                ) : ""}
                <CCol>
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
                            </CContainer>
                        </CCol>
                        <CCol>
                            <CCard>
                                <CCardHeader>Comments</CCardHeader>
                                <CCardBody>
                                    <CCol >
                                        <CommentComponent ></CommentComponent>
                                        <VerticalTimeline layout={'1-column-left'} className="mt-4" hidden={data && data['worklogs'] ? false : true} >
                                            {data && data['worklogs'] && data['worklogs'].reverse().map((comment, index) => (
                                                <VerticalTimelineElement
                                                    contentStyle={{ background: 'rgb(108, 102, 175)', color: 'rgb(227, 226, 236)' }}
                                                    contentArrowStyle={{ borderRight: '7px solid  rgb(108, 102, 175)' }}
                                                    date={comment['createdAt']}
                                                    icon={<CIcon icon={cilUser} size="xl" />}
                                                    iconStyle={{ background: 'rgb(108, 102, 175)', color: '#fff' }}
                                                >
                                                    {comment['author']}<br></br>
                                                    {comment['comment']}<br></br>
                                                </VerticalTimelineElement>
                                            ))}
                                        </VerticalTimeline>
                                    </CCol>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CCol>
            </CContainer >
        </>
    )
}

export default Detail