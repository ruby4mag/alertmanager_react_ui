import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
    CButton,
    CCollapse,
    CSpinner,
    CProgress,
    CProgressBar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronTop, cilWarning } from '@coreui/icons'
import useAxios from '../../services/useAxios'

const RiskBadge = ({ score, level }) => {
    let color = 'success'
    if (score > 80) color = 'danger'
    else if (score > 50) color = 'warning'
    else if (score > 20) color = 'warning' // Yellowish

    return (
        <CBadge color={color} shape="rounded-pill">
            {level} ({score})
        </CBadge>
    )
}

const RiskScoreVisual = ({ score }) => {
    let color = 'success'
    if (score > 80) color = 'danger'
    else if (score > 50) color = 'warning'
    else if (score > 20) color = 'warning'

    return (
        <div className="d-flex align-items-center" style={{ width: '120px' }}>
            <CProgress className="flex-grow-1 me-2" height={8}>
                <CProgressBar color={color} value={score} />
            </CProgress>
            <span className="small fw-bold">{score}</span>
        </div>
    )
}

const ChangeDetailRow = ({ change }) => {
    const risk_breakdown = change.risk_details?.risk_breakdown

    if (!risk_breakdown) return null;

    return (
        <div className="p-3 bg-light">
            <div className="row g-3 mb-4 border-bottom pb-3">
                <div className="col-md-12">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">Description</div>
                    <div>{change.description || 'No description provided.'}</div>
                </div>
                <div className="col-md-3">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">Source</div>
                    <div className="text-uppercase">{change.source || '-'}</div>
                </div>
                <div className="col-md-3">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">Implemented By</div>
                    <div>{change.implemented_by || '-'}</div>
                </div>
                <div className="col-md-3">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">Start Time</div>
                    <div>{change.start_time ? new Date(change.start_time).toLocaleString() : '-'}</div>
                </div>
                <div className="col-md-3">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">End Time</div>
                    <div>{change.end_time ? new Date(change.end_time).toLocaleString() : 'Ongoing'}</div>
                </div>
                <div className="col-md-12">
                    <div className="small text-muted text-uppercase fw-semibold mb-1">Affected Entities</div>
                    <div>
                        {change.affected_entities && Array.isArray(change.affected_entities) && change.affected_entities.length > 0 ? (
                            change.affected_entities.map((entity, idx) => (
                                <CBadge color="secondary" shape="rounded-pill" className="me-1" key={idx}>{entity}</CBadge>
                            ))
                        ) : change.affected_entity_id ? (
                            <CBadge color="secondary" shape="rounded-pill">{change.affected_entity_id}</CBadge>
                        ) : (
                            <span className="text-muted fst-italic">No specific entities recorded</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="fw-bold mb-2">Risk Breakdown</div>
            <div className="row g-3">
                <div className="col-md-4">
                    <div className="small text-muted">Blast Radius Score</div>
                    <div className="fw-semibold">{risk_breakdown.blast_radius}</div>
                </div>
                <div className="col-md-4">
                    <div className="small text-muted">Node Tier Impact</div>
                    <div className="fw-semibold">{risk_breakdown.node_tier}</div>
                </div>
                <div className="col-md-4">
                    <div className="small text-muted">Neighbor Tier Impact</div>
                    <div className="fw-semibold">{risk_breakdown.neighbor_tier}</div>
                </div>
                <div className="col-md-4">
                    <div className="small text-muted">Change Type Score</div>
                    <div className="fw-semibold">{risk_breakdown.change_type}</div>
                </div>
                <div className="col-md-4">
                    <div className="small text-muted">Scope Score</div>
                    <div className="fw-semibold">{risk_breakdown.change_scope}</div>
                </div>
                <div className="col-md-4">
                    <div className="small text-muted">Modifiers</div>
                    <div className="fw-semibold">{risk_breakdown.modifiers}</div>
                </div>
            </div>
        </div>
    )
}


const ChangeRow = ({ change }) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <>
            <CTableRow onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                <CTableDataCell>
                    <CIcon icon={expanded ? cilChevronTop : cilChevronBottom} size="sm" className="me-2 text-muted" />
                    {change.change_id}
                </CTableDataCell>
                <CTableDataCell>{change.name}</CTableDataCell>
                <CTableDataCell>
                    <CBadge color={change.status === 'in_progress' ? 'primary' : 'secondary'} size="sm" shape="rounded-pill">
                        {change.status}
                    </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                    <CBadge color="info" shape="rounded-pill" size="sm">{change.change_type}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                    <RiskScoreVisual score={change.risk_details?.risk_score || 0} />
                </CTableDataCell>
                <CTableDataCell>
                    <RiskBadge score={change.risk_details?.risk_score || 0} level={change.risk_details?.risk_level || 'UNKNOWN'} />
                </CTableDataCell>
            </CTableRow>
            <CTableRow>
                <CTableDataCell colSpan={6} className="p-0 border-0">
                    <CCollapse visible={expanded}>
                        <ChangeDetailRow change={change} />
                    </CCollapse>
                </CTableDataCell>
            </CTableRow>
        </>
    )
}

const ChangeRiskList = () => {
    const [changes, setChanges] = useState([])
    const [loading, setLoading] = useState(true)
    const api = useAxios()

    useEffect(() => {
        const fetchChanges = async () => {
            setLoading(true)
            try {
                const response = await api.get('/api/v1/changes/risk')
                setChanges(response.data || [])
            } catch (error) {
                console.error("Failed to fetch changes", error)
            } finally {
                setLoading(false)
            }
        }
        fetchChanges()
    }, [])

    return (
        <CCard className="mb-4">
            <CCardHeader>
                <strong>Change Risk Assessment</strong>
            </CCardHeader>
            <CCardBody>
                <CTable hover responsive align="middle">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Change ID</CTableHeaderCell>
                            <CTableHeaderCell>Change Name</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Change Type</CTableHeaderCell>
                            <CTableHeaderCell>Risk Score</CTableHeaderCell>
                            <CTableHeaderCell>Risk Level</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {changes.map(change => (
                            <ChangeRow key={change.change_id} change={change} />
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
        </CCard>
    )
}

export default ChangeRiskList
