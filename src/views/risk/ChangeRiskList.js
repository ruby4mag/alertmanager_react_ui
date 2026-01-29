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
} from '@coreui/react'
import useAxios from '../../services/useAxios'
import ChangeRiskDetail, { RiskBadge, RiskScoreVisual } from './ChangeRiskDetail'

const ChangeRow = ({ change, onClick }) => {
    return (
        <CTableRow onClick={() => onClick(change)} style={{ cursor: 'pointer' }} hover>
            <CTableDataCell className="text-primary fw-semibold">
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
    )
}

const ChangeRiskList = () => {
    const [changes, setChanges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedChange, setSelectedChange] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
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

    const handleRowClick = (change) => {
        setSelectedChange(change)
        setModalVisible(true)
    }

    return (
        <>
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
                                <ChangeRow key={change.change_id} change={change} onClick={handleRowClick} />
                            ))}
                        </CTableBody>
                    </CTable>
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

export default ChangeRiskList
