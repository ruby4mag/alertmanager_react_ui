import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CBadge,
    CSpinner,
    CAccordion,
    CAccordionItem,
    CAccordionHeader,
    CAccordionBody,
    CButton,
    CCollapse
} from '@coreui/react'
import useAxios from '../../services/useAxios'
import CIcon from '@coreui/icons-react'
import { cilClock, cilChevronBottom, cilChevronTop, cilGraph } from '@coreui/icons'
import ChangeRiskDetail from '../risk/ChangeRiskDetail'

const ChangeCard = ({ change, onClick }) => {
    const getBadgeColor = (type) => {
        const t = type?.toLowerCase() || ''
        if (t.includes('config')) return 'info'
        if (t.includes('deploy')) return 'primary'
        if (t.includes('db')) return 'warning'
        return 'secondary'
    }

    const getStatusColor = (status) => {
        return status?.toLowerCase() === 'completed' ? 'text-success' : 'text-warning'
    }

    const formatTime = (start, end) => {
        try {
            if (!start) return ''
            const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const e = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'
            return `${s} – ${e}`
        } catch (e) {
            return ''
        }
    }

    const getOverlapLabel = (overlap) => {
        const map = {
            'during_alert': { text: 'During alert', color: 'danger' },
            'before_alert': { text: 'Before alert', color: 'warning' },
            'after_alert': { text: 'After alert', color: 'secondary' }
        }
        return map[overlap] || { text: overlap?.replace('_', ' '), color: 'secondary' }
    }

    const isNeighbor = change.change_scope === 'neighbor'
    const opacity = isNeighbor && change.hop_distance > 3 ? 0.75 : 1

    return (
        <div
            className="border-bottom py-2"
            style={{ opacity, cursor: 'pointer' }}
            onClick={() => onClick(change)}
        >
            <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                    <CBadge color={getBadgeColor(change.change_type)} className="me-2">
                        {change.change_type?.toUpperCase()}
                    </CBadge>
                    <span className="fw-bold text-wrap" style={{ fontSize: '0.95rem' }}>{change.name}</span>
                    {isNeighbor && (
                        <div className="text-primary small mt-1">
                            <CIcon icon={cilGraph} size="sm" className="me-1" />
                            <span className="fw-semibold">{change.affected_entity_id}</span>
                            <span className="text-muted mx-1">•</span>
                            <span>{change.hop_distance} hops away</span>
                        </div>
                    )}
                </div>
                <CBadge color={getOverlapLabel(change.overlap_type).color} shape="rounded-pill" className="ms-2">
                    {getOverlapLabel(change.overlap_type).text}
                </CBadge>
            </div>
            <div className="d-flex justify-content-between align-items-center small text-muted mt-1">
                <div>
                    <span className={`fw-semibold ${getStatusColor(change.status)}`}>
                        ● {change.status}
                    </span>
                    <span className="mx-2 text-secondary">|</span>
                    <span>By: <span className="text-body fw-medium">{change.implemented_by}</span></span>
                </div>
                <div className="d-flex align-items-center">
                    <CIcon icon={cilClock} size="sm" className="me-1" />
                    {formatTime(change.start_time, change.end_time)}
                </div>
            </div>
        </div>
    )
}

const DirectChangesList = ({ changes, onCardClick }) => {
    if (!changes || changes.length === 0) {
        return <p className="text-muted mb-0 fst-italic p-2">No changes detected directly on this entity</p>
    }

    return (
        <div className="d-flex flex-column gap-2">
            {changes.map((change, index) => (
                <ChangeCard key={change.change_id || `d-${index}`} change={change} onClick={onCardClick} />
            ))}
        </div>
    )
}

const NeighborChangesList = ({ changes, onCardClick }) => {
    const [visible, setVisible] = useState(changes.length <= 3)

    if (!changes || changes.length === 0) {
        return <p className="text-muted mb-0 fst-italic p-2">No nearby changes observed in topology</p>
    }

    // Sort by hop_distance ASC, then start_time DESC (newest first)
    const sortedChanges = [...changes].sort((a, b) => {
        if (a.hop_distance !== b.hop_distance) return a.hop_distance - b.hop_distance
        return new Date(b.start_time) - new Date(a.start_time)
    })

    return (
        <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2 bg-light p-2 rounded"
                onClick={() => setVisible(!visible)}
                style={{ cursor: 'pointer' }}>
                <span className="fw-semibold text-body-secondary small text-uppercase">
                    Changes on Related Entities ({changes.length})
                </span>
                <CIcon icon={visible ? cilChevronTop : cilChevronBottom} size="sm" />
            </div>

            <CCollapse visible={visible}>
                <div className="d-flex flex-column gap-2 px-1">
                    {sortedChanges.map((change, index) => (
                        <ChangeCard key={change.change_id || `n-${index}`} change={change} onClick={onCardClick} />
                    ))}
                </div>
            </CCollapse>
        </div>
    )
}

const RelatedChanges = ({ alertId, onDataLoaded, prefetchedData, skipInternalFetch }) => {
    const api = useAxios()
    const [data, setData] = useState({ direct_changes: [], neighbor_changes: [] })
    const [loading, setLoading] = useState(skipInternalFetch ? !prefetchedData : !prefetchedData)
    const [error, setError] = useState(null)
    const [selectedChange, setSelectedChange] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        if (prefetchedData) {
            setData({
                direct_changes: prefetchedData.direct_changes || [],
                neighbor_changes: prefetchedData.neighbor_changes || []
            })
            setLoading(false)
            return
        }

        if (skipInternalFetch) {
            setLoading(true)
            return
        }

        if (!alertId) return

        const fetchChanges = async () => {
            setLoading(true)
            try {
                const response = await api.get(`/api/v1/alerts/${alertId}/related-changes`)
                let payload = response.data
                if (payload.related_changes && !payload.direct_changes) {
                    payload.direct_changes = payload.related_changes
                    payload.neighbor_changes = []
                }

                if (onDataLoaded) {
                    onDataLoaded({
                        direct_changes: payload.direct_changes || [],
                        neighbor_changes: payload.neighbor_changes || []
                    })
                }

                setData({
                    direct_changes: payload.direct_changes || [],
                    neighbor_changes: payload.neighbor_changes || []
                })
                setError(null)
            } catch (err) {
                console.error('Failed to fetch related changes:', err)
                setError('Unable to load related changes.')
            } finally {
                setLoading(false)
            }
        }

        fetchChanges()
    }, [alertId, prefetchedData, skipInternalFetch])

    const handleCardClick = (change) => {
        setSelectedChange(change)
        setModalVisible(true)
    }

    if (loading) return (
        <CCard className="h-100">
            <CCardHeader className="py-2">
                <span className="fw-semibold">Recent Changes</span>
            </CCardHeader>
            <CCardBody className="text-center p-3">
                <CSpinner size="sm" variant="grow" /> <span className="ms-2">Scanning topology for changes...</span>
            </CCardBody>
        </CCard>
    )

    if (error) return (
        <CCard className="h-100">
            <CCardHeader className="py-2">
                <span className="fw-semibold">Recent Changes</span>
            </CCardHeader>
            <CCardBody className="text-center p-3">
                <span className="text-danger">{error}</span>
            </CCardBody>
        </CCard>
    )

    return (
        <>
            <CCard className="h-100">
                <CCardBody style={{ height: '300px', overflowY: 'auto' }}>
                    <div className="mb-2">
                        <span className="fw-semibold text-body-secondary small text-uppercase d-block mb-2 bg-light p-2 rounded">
                            Changes on This Entity
                        </span>
                        <DirectChangesList changes={data.direct_changes} onCardClick={handleCardClick} />
                    </div>

                    {data.neighbor_changes && data.neighbor_changes.length > 0 && (
                        <NeighborChangesList changes={data.neighbor_changes} onCardClick={handleCardClick} />
                    )}
                </CCardBody>
            </CCard>
            <ChangeRiskDetail
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                change={selectedChange}
            />
        </>
    )
}

export default RelatedChanges
