import React, { useState, useEffect } from 'react'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CBadge,
    CProgress,
    CProgressBar,
    CSpinner
} from '@coreui/react'
import useAxios from '../../services/useAxios'

export const RiskBadge = ({ score, level }) => {
    let color = 'success'
    if (score > 80) color = 'danger'
    else if (score > 50) color = 'warning'
    else if (score > 20) color = 'warning'

    return (
        <CBadge color={color} shape="rounded-pill">
            {level} ({score})
        </CBadge>
    )
}

export const RiskScoreVisual = ({ score }) => {
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

const ChangeRiskDetail = ({ visible, onClose, change }) => {
    const api = useAxios()
    const [fullChangeData, setFullChangeData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && change) {
            // Check if we already have detailed risk info. 
            // If risk_breakdown is missing, we likely need to fetch full details.
            // Or if we want to be safe, always fetch to ensure latest data.
            // Let's try to fetch if risk_details are sparse.

            const fetchDetails = async () => {
                setLoading(true)
                try {
                    // Assuming endpoint /api/v1/changes/:id exists. 
                    // If not, we might need to use the risk list endpoint with a filter, but ID lookup is standard.
                    // User prompt implies we might need to ask, but let's try to assume a standard pattern first 
                    // or use the list data if 'risk_breakdown' is already there.

                    if (change.risk_details && change.risk_details.risk_breakdown) {
                        setFullChangeData(change)
                        setLoading(false)
                        return
                    }

                    const response = await api.get(`/api/v1/changes/${change.change_id}`)
                    setFullChangeData(response.data)
                } catch (e) {
                    console.error("Failed to fetch change details", e)
                    // Fallback to existing partial data
                    setFullChangeData(change)
                } finally {
                    setLoading(false)
                }
            }
            fetchDetails()
        } else {
            setFullChangeData(null)
        }
    }, [visible, change])

    if (!change) return null

    // Use fullChangeData if available, otherwise fall back to prop 'change' (initially)
    const displayData = fullChangeData || change
    const risk_breakdown = displayData.risk_details?.risk_breakdown

    return (
        <CModal visible={visible} onClose={onClose} size="lg" keyboard={false}>
            <CModalHeader onClose={onClose}>
                <CModalTitle>Change Risk Details: {displayData.change_id}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {loading ? (
                    <div className="text-center p-5">
                        <CSpinner color="primary" />
                        <div className="mt-2 text-muted">Loading details...</div>
                    </div>
                ) : (
                    <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <div>
                                <h5 className="mb-1">{displayData.name}</h5>
                                <span className="text-muted small">ID: {displayData.change_id}</span>
                            </div>
                            <div className="text-end">
                                <RiskBadge score={displayData.risk_details?.risk_score || 0} level={displayData.risk_details?.risk_level || 'UNKNOWN'} />
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-12">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">Description</div>
                                <div>{displayData.description || 'No description provided.'}</div>
                            </div>
                            <div className="col-md-3">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">Source</div>
                                <div className="text-uppercase">{displayData.source || '-'}</div>
                            </div>
                            <div className="col-md-3">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">Implemented By</div>
                                <div>{displayData.implemented_by || '-'}</div>
                            </div>
                            <div className="col-md-3">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">Start Time</div>
                                <div>{displayData.start_time ? new Date(displayData.start_time).toLocaleString() : '-'}</div>
                            </div>
                            <div className="col-md-3">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">End Time</div>
                                <div>{displayData.end_time ? new Date(displayData.end_time).toLocaleString() : 'Ongoing'}</div>
                            </div>
                            <div className="col-md-12">
                                <div className="small text-muted text-uppercase fw-semibold mb-1">Affected Entities</div>
                                <div>
                                    {displayData.affected_entities && Array.isArray(displayData.affected_entities) && displayData.affected_entities.length > 0 ? (
                                        displayData.affected_entities.map((entity, idx) => (
                                            <CBadge color="secondary" shape="rounded-pill" className="me-1" key={idx}>{entity}</CBadge>
                                        ))
                                    ) : displayData.affected_entity_id ? (
                                        <CBadge color="secondary" shape="rounded-pill">{displayData.affected_entity_id}</CBadge>
                                    ) : (
                                        <span className="text-muted fst-italic">No specific entities recorded</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {risk_breakdown ? (
                            <>
                                <div className="fw-bold mb-3 border-bottom pb-2">Risk Scoring Breakdown</div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="small text-muted">Blast Radius Score</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.blast_radius}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="small text-muted">Node Tier Impact</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.node_tier}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="small text-muted">Neighbor Tier Impact</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.neighbor_tier}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="small text-muted">Change Type Score</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.change_type}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="small text-muted">Scope Score</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.change_scope}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="small text-muted">Modifiers</div>
                                        <div className="fw-semibold fs-5">{risk_breakdown.modifiers}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted p-3 bg-light rounded">
                                Risk breakdown details not available.
                            </div>
                        )}
                    </div>
                )}
            </CModalBody>
        </CModal>
    )
}

export default ChangeRiskDetail
