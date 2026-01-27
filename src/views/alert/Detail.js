import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams, } from 'react-router-dom';
import {
    CForm, CFormLabel, CButtonGroup, CButton, CFormTextarea, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CContainer, CToaster,
    CCardBody, CCard, CRow, CCol, CCardTitle, CCardText, CCardHeader,
    CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem,
    CModal, CModalHeader, CModalTitle, CModalBody
} from '@coreui/react';
import MyToast from '../../components/Toast'
import useAxios from '../../services/useAxios';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import CIcon from '@coreui/icons-react';
import { cilUser, cilShieldAlt } from '@coreui/icons';

import * as icon from '@coreui/icons';
import * as d3 from 'd3'
import ChatBot from '../../components/ChatBot';
import IncidentFeedback from '../../components/IncidentFeedback';
import RelatedChanges from './RelatedChanges';



const Detail = () => {

    const [toast, addToast] = useState(0)
    const { id } = useParams();
    const api = useAxios();
    const navigate = useNavigate();
    const toaster = useRef()
    const [data, setData] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [graphData, setGraphData] = useState(null)
    const [graphLoading, setGraphLoading] = useState(false)
    const [graphError, setGraphError] = useState(null)
    const [graphTitle, setGraphTitle] = useState('')
    const [visibleGraphModal, setVisibleGraphModal] = useState(false)
    const graphRef = useRef(null)

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

    useEffect(() => {
        if (!data || !data.entity) return;

        const fetchGraph = async () => {
            const entity = data.entity;
            const url = `http://192.168.1.201:8080/entity/${encodeURIComponent(entity)}`
            try {
                setGraphLoading(true)
                setGraphError(null)
                setGraphTitle(`Graph for ${entity}`)
                const response = await api.get(url)
                setGraphData(response.data)
            } catch (err) {
                console.error('Failed to fetch graph:', err)
                setGraphError(err?.message || 'Failed to fetch graph')
                setGraphData(null)
            } finally {
                setGraphLoading(false)
            }
        }
        fetchGraph();
    }, [data]);

    // Render D3 graph into modal when graphData is set and modal is visible
    useEffect(() => {
        if (!graphData || !visibleGraphModal) return

        // debug: effect entry
        // eslint-disable-next-line no-console
        console.log('D3 effect triggered', { hasGraphData: !!graphData })

        // Helper: wait until container has measurable size (modal rendering may be delayed)
        const waitForSize = async (maxAttempts = 10, delayMs = 100) => {
            for (let i = 0; i < maxAttempts; i++) {
                const el = graphRef.current
                if (el) {
                    const w = el.clientWidth
                    const h = el.clientHeight
                    if (w > 20 && h > 20) return { width: w, height: h }
                }
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, delayMs))
            }
            const el = graphRef.current
            return { width: (el && el.clientWidth) || 800, height: (el && el.clientHeight) || 600 }
        }

        // clear previous contents
        d3.select(graphRef.current).selectAll('*').remove()

            // async render so we can wait for sizing
            ; (async () => {
                const { width, height } = await waitForSize()

                const svg = d3
                    .select(graphRef.current)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)

                // add a container group that will be zoomed/panned
                const g = svg.append('g')

                // enable zoom and pan on the svg, transforming the container group
                const zoom = d3.zoom().scaleExtent([0.2, 6]).on('zoom', (event) => {
                    g.attr('transform', event.transform)
                })
                svg.call(zoom)

                // Normalize incoming graph payload: support {nodes, edges} or {nodes, links}
                let nodes = graphData.nodes || []
                let links = graphData.links || graphData.edges || []

                // Ensure each node has an 'id' field (use name when id missing)
                nodes = nodes.map((n, i) => ({ ...n, id: n.id || n.name || `node-${i}` }))

                // Normalize links so source/target are ids (strings)
                links = links.map((l) => ({
                    ...l,
                    source: typeof l.source === 'object' ? (l.source.id || l.source.name) : l.source,
                    target: typeof l.target === 'object' ? (l.target.id || l.target.name) : l.target,
                    value: l.value || 1,
                }))

                // Build adjacency for path-finding (undirected)
                const idToNode = new Map(nodes.map((n) => [n.id, n]))
                const adj = new Map()
                nodes.forEach((n) => adj.set(n.id, []))
                links.forEach((l) => {
                    if (l.source && l.target && adj.has(l.source) && adj.has(l.target)) {
                        adj.get(l.source).push(l.target)
                        adj.get(l.target).push(l.source)
                    }
                })

                // Find alert nodes
                const alertNodeIds = Array.from(new Set(nodes.filter((n) => n.has_alert).map((n) => n.id)))

                // Helper: BFS shortest path between two node ids (returns array of ids) or null
                const bfsPath = (startId, goalId) => {
                    if (startId === goalId) return [startId]
                    const queue = [startId]
                    const visited = new Set([startId])
                    const parent = new Map()
                    while (queue.length) {
                        const cur = queue.shift()
                        const neighbors = adj.get(cur) || []
                        for (const nb of neighbors) {
                            if (visited.has(nb)) continue
                            visited.add(nb)
                            parent.set(nb, cur)
                            if (nb === goalId) {
                                // reconstruct path
                                const path = [goalId]
                                let p = goalId
                                while (p !== startId) {
                                    p = parent.get(p)
                                    if (!p) break
                                    path.push(p)
                                }
                                return path.reverse()
                            }
                            queue.push(nb)
                        }
                    }
                    return null
                }

                // Determine which nodes to include: nodes with alerts + any nodes on shortest paths between alert nodes
                const includedIds = new Set(alertNodeIds)
                for (let i = 0; i < alertNodeIds.length; i++) {
                    for (let j = i + 1; j < alertNodeIds.length; j++) {
                        const a = alertNodeIds[i]
                        const b = alertNodeIds[j]
                        const path = bfsPath(a, b)
                        if (path && path.length > 0) {
                            path.forEach((id) => includedIds.add(id))
                        }
                    }
                }

                // If there are no alert nodes, show only nodes that explicitly have alerts (will be empty) —
                // this follows the requirement to show only alerting nodes and their connecting path nodes.
                const nodesFiltered = nodes.filter((n) => includedIds.has(n.id))
                const linksFiltered = links.filter((l) => l.source && l.target && includedIds.has(l.source) && includedIds.has(l.target))

                // debug log
                // eslint-disable-next-line no-console
                console.log('D3 graph nodes (normalized):', nodes)
                // eslint-disable-next-line no-console
                console.log('D3 graph links (normalized):', links)
                // eslint-disable-next-line no-console
                console.log('D3 graph nodes (filtered):', nodesFiltered)
                // eslint-disable-next-line no-console
                console.log('D3 graph links (filtered):', linksFiltered)

                const simulation = d3
                    .forceSimulation(nodesFiltered)
                    .force('link', d3.forceLink(linksFiltered).id((d) => d.id).distance(80))
                    .force('charge', d3.forceManyBody().strength(-300))
                    .force('center', d3.forceCenter(width / 2, height / 2))

                function drag() {
                    function dragstarted(event, d) {
                        if (!event.active) simulation.alphaTarget(0.3).restart()
                        // account for current zoom transform when fixing positions
                        const t = d3.zoomTransform(svg.node())
                        d.fx = t.invertX(event.x)
                        d.fy = t.invertY(event.y)
                    }

                    function dragged(event, d) {
                        const t = d3.zoomTransform(svg.node())
                        d.fx = t.invertX(event.x)
                        d.fy = t.invertY(event.y)
                    }

                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0)
                        d.fx = null
                        d.fy = null
                    }

                    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
                }

                const link = g
                    .append('g')
                    .attr('stroke', '#999')
                    .attr('stroke-opacity', 0.6)
                    .selectAll('line')
                    .data(linksFiltered)
                    .join('line')
                    .attr('stroke-width', (d) => Math.sqrt(d.value || 1))

                const node = g
                    .append('g')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1.5)
                    .selectAll('circle')
                    .data(nodesFiltered)
                    .join('circle')
                    .attr('r', (d) => (d.has_alert ? 8 : 6))
                    .attr('fill', (d) => (d.severity === 'WARN' || d.severity === 'WARNING' ? '#f0ad4e' : '#69b3a2'))
                    .call(drag())

                const label = g
                    .append('g')
                    .selectAll('text')
                    .data(nodesFiltered)
                    .join('text')
                    .text((d) => d.id || d.name || '')
                    .attr('font-size', 10)
                    .attr('dx', 8)
                    .attr('dy', 4)

                // add a styled HTML tooltip (better than the default SVG title)
                const escapeHtml = (unsafe) => {
                    return String(unsafe)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;')
                }

                const formatTooltipHTML = (d) => {
                    let html = '<div style="line-height:1.2">'
                    if (d.id) html += `<div><strong>ID:</strong> ${escapeHtml(d.id)}</div>`
                    if (d.name && d.name !== d.id) html += `<div><strong>Name:</strong> ${escapeHtml(d.name)}</div>`
                    if (d.severity) html += `<div><strong>Severity:</strong> ${escapeHtml(d.severity)}</div>`
                    if (typeof d.has_alert !== 'undefined') html += `<div><strong>Has alert:</strong> ${escapeHtml(String(d.has_alert))}</div>`

                    const alerts = d.alerts || d.alertsList || d.alertList || d.alerts_details
                    if (Array.isArray(alerts) && alerts.length > 0) {
                        html += '<div style="margin-top:6px"><strong>Alerts:</strong><ul style="margin:6px 0 0 16px;padding:0">'
                        alerts.forEach((a) => {
                            const summary = a.alertsummary || a.summary || a.message || a.title || a.text || a.body || JSON.stringify(a)
                            html += `<li style="margin-bottom:4px">${escapeHtml(summary)}</li>`
                        })
                        html += '</ul></div>'
                    }

                    html += '</div>'
                    return html
                }

                // create tooltip div inside the graph container
                const container = d3.select(graphRef.current)
                // remove any existing tooltip to avoid duplicates
                container.selectAll('.d3-tooltip').remove()
                const tooltip = container.append('div')
                    .attr('class', 'd3-tooltip')
                    .style('position', 'absolute')
                    .style('pointer-events', 'none')
                    .style('background', 'rgba(0,0,0,0.85)')
                    .style('color', '#fff')
                    .style('padding', '8px')
                    .style('border-radius', '6px')
                    .style('font-size', '12px')
                    .style('max-width', '360px')
                    .style('display', 'none')
                    .style('z-index', 1000)

                node.on('mouseenter', function (event, d) {
                    tooltip.html(formatTooltipHTML(d)).style('display', 'block')
                })
                    .on('mousemove', function (event) {
                        const rect = graphRef.current.getBoundingClientRect()
                        const x = event.clientX - rect.left + 12
                        const y = event.clientY - rect.top + 12
                        tooltip.style('left', `${x}px`).style('top', `${y}px`)
                    })
                    .on('mouseleave', function () {
                        tooltip.style('display', 'none')
                    })

                simulation.on('tick', () => {
                    link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y)

                    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

                    label.attr('x', (d) => d.x).attr('y', (d) => d.y)
                })

                // cleanup when modal closes
                return () => {
                    simulation.stop()
                    d3.select(graphRef.current).selectAll('*').remove()
                }
            })()
    }, [graphData, visibleGraphModal])

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

            <CContainer fluid className="alert-detail-view">
                <CContainer fluid className='mb-4'>

                    <CToaster ref={toaster} push={toast} placement="top-end" />
                    <CButtonGroup size="sm" role="group" aria-label="Small button group" className='me-4'>
                        <CButton onClick={() => handleActionButtonClick('ack')} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilUserFollow} size="lg" /></CButton>
                        <CButton onClick={() => handleActionButtonClick('unack')} color="primary" variant="outline"><CIcon className='text-warning' icon={icon.cilUserUnfollow} size="lg" /></CButton>
                        <CButton onClick={() => handleActionButtonClick('clear')} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilCheckCircle} size="lg" /></CButton>
                        {graphData && graphData.nodes && graphData.nodes.length > 0 && (
                            <CButton onClick={() => setVisibleGraphModal(true)} color="info" variant="outline">Show topology</CButton>
                        )}
                    </CButtonGroup>
                    <CDropdown>
                        <CDropdownToggle color="primary" variant="outline" size="sm">Actions</CDropdownToggle>
                        <CDropdownMenu>
                            {notifications && notifications.map((notification) => (
                                <CDropdownItem key={notification['_id']} onClick={() => triggerNotify(notification['_id'], notification['rulename'])}  >{notification['rulename']}</CDropdownItem>
                            ))}

                        </CDropdownMenu>
                    </CDropdown>

                </CContainer >
                {data && (
                    <CContainer fluid>
                        <IncidentFeedback
                            incidentId={id}
                            incidentStatus={data.alertstatus}
                            topologyNodes={graphData?.nodes || []}
                            aiRootCause={data.additionaldetails?.['Root Cause'] || data.entity}
                            aiConfidence={data.additionaldetails?.['Confidence'] || 0.85}
                            existingSymptoms={data.childalerts?.map(a => a.entity) || []}
                        />
                    </CContainer>
                )}
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
                                            <CTableHeaderCell scope="col">Alert Status</CTableHeaderCell>
                                            <CTableHeaderCell scope="col">Alert Summary</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {data && data['childalerts'] && data['childalerts'].map((alert) => (
                                            <CTableRow key={alert._id}>
                                                <CTableDataCell><Link className="link" to={`/alert/details/${alert._id}`} > {alert.entity}</Link></CTableDataCell>
                                                <CTableDataCell>{alert.alertfirsttime}</CTableDataCell>
                                                <CTableDataCell>
                                                    {(() => {
                                                        const sev = alert.severity ? alert.severity.toUpperCase() : '';
                                                        if (sev === 'CRITICAL') return <span className="badge text-bg-danger">{alert.severity}</span>;
                                                        if (sev === 'WARN' || sev === 'WARNING') return <span className="badge text-bg-warning">{alert.severity}</span>;
                                                        return <span>{alert.severity}</span>;
                                                    })()}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {alert.alertstatus === 'OPEN' ?
                                                        <span className="badge text-bg-warning">OPEN</span> :
                                                        <span className="badge text-bg-success">CLOSED</span>
                                                    }
                                                </CTableDataCell>
                                                <CTableDataCell>{alert.alertsummary}</CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCardBody>
                        </CCard>
                    </div>
                ) : ""}

                {(data && data['parent'] == true && data['grouping_reason']) ? (
                    <div className="mb-4">
                        <CCard>
                            <CCardHeader>Why grouped?</CCardHeader>
                            <CCardBody>
                                {data['grouping_reason'].type === 'SIMILARITY' ? (
                                    <>
                                        <p className="mb-2"><strong>Grouped by similarity:</strong></p>
                                        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                            {data['grouping_reason'].reasons && data['grouping_reason'].reasons.map((reason, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <span className="text-success me-2">✔</span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p>{data['grouping_reason'].description || "Grouped based on correlation rules."}</p>
                                )}
                            </CCardBody>
                        </CCard>
                    </div>
                ) : null}

                <CRow>
                    <CCol>
                        <CContainer>
                            <CCard>
                                <CCardHeader>Event Details</CCardHeader>
                                <CCardBody style={{ height: '300px', overflowY: 'auto' }}>
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
                            <CCard className='mt-4'>
                                <CCardHeader>Additional Details</CCardHeader>
                                <CCardBody style={{ height: '200px', overflowY: 'auto' }}>
                                    <CTable small >
                                        <CTableBody>
                                            {data && data['additionaldetails'] && Object.entries(data['additionaldetails']).map(([key, value]) => (
                                                <CTableRow key={key}>
                                                    <CTableHeaderCell scope="row">{key}</CTableHeaderCell>
                                                    {key == 'ticket' ? <CTableDataCell> <UrlLink url={value} text="Ticket" /></CTableDataCell> : <CTableDataCell> {value}</CTableDataCell>}
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                </CCardBody>
                            </CCard>
                            <RelatedChanges alertId={id} />
                            <CCard className='mt-4'>
                                <CCardHeader>Alert Notes</CCardHeader>
                                <CCardBody style={{ height: '140px', overflowY: 'auto' }}>
                                    <p className="mb-0">{data && data['alertnotes']}</p>
                                </CCardBody>
                            </CCard>
                        </CContainer>
                    </CCol>
                    <CCol>
                        <CContainer fluid>
                            <CCard>
                                <CCardHeader>Comments</CCardHeader>
                                <CCardBody style={{ height: '788px', overflowY: 'auto' }}>
                                    <CCol >
                                        <CommentComponent ></CommentComponent>
                                        {data && data['worklogs'] && data['worklogs'].length > 0 && (
                                            <VerticalTimeline layout={'1-column-left'} className="mt-4">
                                                {[...data['worklogs']].reverse().map((comment, index) => (
                                                    <VerticalTimelineElement
                                                        key={index}
                                                        contentStyle={{ background: 'rgb(244, 244, 253)', color: 'rgb(6, 3, 29)' }}
                                                        contentArrowStyle={{ borderRight: '7px solid rgb(244, 244, 253)' }}
                                                        date={comment['createdAt']}
                                                        icon={<CIcon icon={cilUser} size="xl" />}
                                                        iconStyle={{ background: 'rgb(244, 244, 253)', color: 'rgb(6, 3, 29)' }}
                                                    >
                                                        {comment['author']}<br></br>
                                                        {comment['comment']}<br></br>
                                                    </VerticalTimelineElement>
                                                ))}
                                            </VerticalTimeline>
                                        )}
                                    </CCol>
                                </CCardBody>
                            </CCard>
                        </CContainer>
                    </CCol>
                </CRow>
            </CContainer >
            <CModal visible={visibleGraphModal} onClose={() => setVisibleGraphModal(false)} size="xl" fullscreen>
                <CModalHeader onClose={() => setVisibleGraphModal(false)}>
                    <CModalTitle>{graphTitle}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {graphLoading && <div>Loading graph...</div>}
                    {graphError && <div style={{ color: 'red' }}>{graphError}</div>}
                    {!graphLoading && !graphError && graphData && (
                        <div ref={graphRef} style={{ width: '100%', height: '85vh', overflow: 'hidden' }} />
                    )}
                </CModalBody>
            </CModal>
            <ChatBot alertData={data} graphData={graphData} />
        </>
    )
}

export default Detail