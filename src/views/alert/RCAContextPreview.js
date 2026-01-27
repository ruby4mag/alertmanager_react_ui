import React, { useMemo } from 'react'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CBadge,
    COffcanvas,
    COffcanvasHeader,
    COffcanvasTitle,
    COffcanvasBody,
    CTooltip,
    CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilShareBoxed } from '@coreui/icons'

const RCAContextPreview = ({ alertData, relatedChangesData }) => {
    // Ideally this component receives the "graph payload" intended for n8n.
    // If that exact payload isn't available in state yet, we can derive the "Preview" 
    // from the data we DO have (alertData + relatedChangesData) which is effectively what gets sent.

    const contextSummary = useMemo(() => {
        const rootEntity = alertData?.entity || 'Unknown'
        const directChanges = relatedChangesData?.direct_changes || []
        const neighborChanges = relatedChangesData?.neighbor_changes || []

        let maxHop = 0
        neighborChanges.forEach(c => {
            if (c.hop_distance > maxHop) maxHop = c.hop_distance
        })

        return {
            rootEntity,
            directCount: directChanges.length,
            neighborCount: neighborChanges.length,
            maxHop,
            directChanges,
            neighborChanges
        }
    }, [alertData, relatedChangesData])

    // Helper for compact list items
    const CompactChangeItem = ({ change, isNeighbor }) => (
        <div className="d-flex align-items-center mb-2 small border-bottom pb-1">
            <span className={`badge me-2 ${isNeighbor ? 'text-bg-secondary' : 'text-bg-primary'}`} style={{ width: '65px' }}>
                {isNeighbor ? 'Neighbor' : 'Direct'}
            </span>
            <div className="text-truncate">
                <span className="fw-semibold">{change.name}</span>
                {isNeighbor && (
                    <span className="text-muted ms-1">
                        ({change.affected_entity_id} • {change.hop_distance} hops)
                    </span>
                )}
            </div>
        </div>
    )

    if (!alertData) return null

    return (
        <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center py-2 bg-light">
                <span className="fw-semibold text-dark">Context Used for RCA</span>
                <CTooltip content="The following alerts, entities, and changes will be used as context for RCA analysis.">
                    <CIcon icon={cilInfo} className="text-secondary" />
                </CTooltip>
            </CCardHeader>
            <CCardBody className="p-3">
                {/* Summary Metadata */}
                <div className="d-flex flex-wrap gap-4 mb-3 small text-muted border-bottom pb-3">
                    <div>
                        <div className="fw-bold text-dark">Root Entity</div>
                        <div>{contextSummary.rootEntity}</div>
                    </div>
                    <div>
                        <div className="fw-bold text-dark">Direct Changes</div>
                        <div>{contextSummary.directCount}</div>
                    </div>
                    <div>
                        <div className="fw-bold text-dark">Neighbor Changes</div>
                        <div>{contextSummary.neighborCount} {contextSummary.maxHop > 0 && `(up to ${contextSummary.maxHop} hops)`}</div>
                    </div>
                </div>

                {/* Compact Change List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>

                    {contextSummary.directChanges.length === 0 && contextSummary.neighborChanges.length === 0 && (
                        <div className="text-muted fst-italic small">No relevant changes found for context.</div>
                    )}

                    {contextSummary.directChanges.map((change, idx) => (
                        <CompactChangeItem key={`d-${idx}`} change={change} isNeighbor={false} />
                    ))}

                    {contextSummary.neighborChanges.slice(0, 5).map((change, idx) => (
                        <CompactChangeItem key={`n-${idx}`} change={change} isNeighbor={true} />
                    ))}

                    {contextSummary.neighborChanges.length > 5 && (
                        <div className="text-center small text-muted mt-1 fst-italic">
                            ...and {contextSummary.neighborChanges.length - 5} more neighbor changes included
                        </div>
                    )}
                </div>

                {/* Future: visualize RCA graph */}
                {/* Future: highlight nodes referenced in RCA explanation */}
                {/* Future: allow excluding neighbor depth */}

            </CCardBody>
        </CCard>
    )
}

export default RCAContextPreview
