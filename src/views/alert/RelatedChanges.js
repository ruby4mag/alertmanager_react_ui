import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CBadge,
    CSpinner,
    CAlert
} from '@coreui/react'
import useAxios from '../../services/useAxios'
import CIcon from '@coreui/icons-react'
import { cilClock } from '@coreui/icons'

const RelatedChanges = ({ alertId }) => {
    const api = useAxios()
    const [changes, setChanges] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!alertId) return

        const fetchChanges = async () => {
            setLoading(true)
            try {
                const response = await api.get(`/api/v1/alerts/${alertId}/related-changes`)
                setChanges(response.data.related_changes || [])
                setError(null)
            } catch (err) {
                // Quietly fail or show error? Requirement says "Handle Error state"
                console.error('Failed to fetch related changes:', err)
                setError('Unable to load related changes.')
                setChanges([])
            } finally {
                setLoading(false)
            }
        }

        fetchChanges()
    }, [alertId])

    // Helpers
    const getBadgeColor = (type) => {
        const t = type?.toLowerCase() || ''
        if (t.includes('config')) return 'info'
        if (t.includes('deploy')) return 'primary'
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

    if (loading) return (
        <CCard className="mt-4 mb-4">
            <CCardHeader>Recent Changes on This Entity</CCardHeader>
            <CCardBody className="text-center p-3">
                <CSpinner size="sm" variant="grow" /> <span className="ms-2">Checking for recent changes...</span>
            </CCardBody>
        </CCard>
    )

    if (error) return (
        <CCard className="mt-4 mb-4">
            <CCardHeader>Recent Changes on This Entity</CCardHeader>
            <CCardBody className="text-center p-3">
                <span className="text-danger">{error}</span>
            </CCardBody>
        </CCard>
    )

    return (
        <CCard className="mt-4">
            <CCardHeader>Recent Changes on This Entity</CCardHeader>
            <CCardBody style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {changes.length === 0 ? (
                    <p className="text-muted mb-0 fst-italic">No recent changes detected for this entity</p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {changes.map((change, index) => {
                            const overlap = getOverlapLabel(change.overlap_type)
                            return (
                                <div key={change.change_id || index} className={`pb-2 ${index !== changes.length - 1 ? 'border-bottom mb-2' : ''}`}>
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div>
                                            <CBadge color={getBadgeColor(change.change_type)} className="me-2">
                                                {change.change_type?.toUpperCase()}
                                            </CBadge>
                                            <span className="fw-bold text-wrap" style={{ fontSize: '0.95rem' }}>{change.name}</span>
                                        </div>
                                        <CBadge color={overlap.color} shape="rounded-pill" className="ms-2">
                                            {overlap.text}
                                        </CBadge>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center small text-muted">
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
                        })}
                    </div>
                )}
                {/* Future: highlight change suspected as root cause */}
            </CCardBody>
        </CCard>
    )
}

export default RelatedChanges
