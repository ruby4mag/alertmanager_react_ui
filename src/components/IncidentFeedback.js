import React, { useState, useEffect } from 'react';
import {
    CCard, CCardBody, CCardHeader, CButton, CFormCheck, CFormLabel,
    CFormTextarea, CCol, CRow, CContainer, CFormRange, CAlert
} from '@coreui/react';
import { Autocomplete, TextField, Slider, Chip, Stack } from '@mui/material';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilXCircle, cilWarning } from '@coreui/icons';
import useAxios from '../services/useAxios';

const IncidentFeedback = ({ incidentId, incidentStatus, topologyNodes, aiRootCause, aiConfidence, existingSymptoms }) => {
    const api = useAxios();

    // UI State
    const [isVisible, setIsVisible] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [verdict, setVerdict] = useState(''); // 'correct', 'incorrect', 'partially_correct'
    const [finalRootCause, setFinalRootCause] = useState(null); // Selected from topology
    const [rootCauseType, setRootCauseType] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [resolutionSummary, setResolutionSummary] = useState('');
    const [whyWrong, setWhyWrong] = useState([]);
    const [confidence, setConfidence] = useState(0.8);

    // Initialize symptoms if provided
    useEffect(() => {
        if (existingSymptoms && Array.isArray(existingSymptoms)) {
            setSymptoms(existingSymptoms);
        }
    }, [existingSymptoms]);

    // Validation
    const isVerdictChosen = verdict !== '';
    const needsCorrection = verdict === 'incorrect' || verdict === 'partially_correct';

    const isValid = () => {
        if (!isVerdictChosen) return false;
        if (needsCorrection) {
            if (!finalRootCause) return false;
            if (!rootCauseType) return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!isValid()) return;
        setIsSubmitting(true);
        setSubmissionError(null);

        const payload = {
            verdict,
            final_root_cause: needsCorrection ? (finalRootCause?.id || finalRootCause?.name || finalRootCause) : undefined,
            root_cause_type: needsCorrection ? rootCauseType : undefined,
            symptoms: symptoms.map(s => typeof s === 'object' ? (s.id || s.name) : s),
            resolution_summary: resolutionSummary,
            why_ai_was_wrong: needsCorrection ? whyWrong : undefined,
            operator_confidence: confidence
        };

        try {
            await api.post(`/api/incidents/${incidentId}/feedback`, payload);
            setIsSubmitted(true);
            setIsVisible(false); // Or show success state
        } catch (error) {
            console.error("Feedback submission error:", error);
            setSubmissionError(error.response?.data?.message || "Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemindLater = () => {
        setIsVisible(false);
    };

    const toggleWhyWrong = (reason) => {
        if (whyWrong.includes(reason)) {
            setWhyWrong(whyWrong.filter(r => r !== reason));
        } else {
            setWhyWrong([...whyWrong, reason]);
        }
    };

    if (incidentStatus !== 'CLOSED' && incidentStatus !== 'RESOLVED') {
        return null;
    }

    if (!isVisible && !isSubmitted) {
        // Maybe show a small button to reopen feedback?
        return (
            <div className="mb-4">
                <CButton color="info" variant="outline" onClick={() => setIsVisible(true)} size="sm">
                    Provide Incident Feedback
                </CButton>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <CAlert color="success" className="mb-4">
                Thank you! Feedback submitted successfully.
            </CAlert>
        );
    }

    // Options for standard fields
    const rootCauseTypes = ['infrastructure', 'application', 'network', 'external'];
    const aiWrongReasons = [
        { label: 'Picked downstream service', value: 'picked_downstream_service' },
        { label: 'Missed shared dependency', value: 'missed_shared_dependency' },
        { label: 'Misleading alert timing', value: 'misleading_alert_timing' },
        { label: 'Missing context', value: 'missing_context' },
        { label: 'Other', value: 'other' },
    ];

    // Helper to get severity color for verdict buttons
    const getVerdictColor = (v) => {
        if (verdict === v) return 'white'; // Selected text color
        return '';
    };

    const getVerdictBtnVariant = (v) => verdict === v ? '' : 'outline';

    return (
        <CCard className="mb-4 border-info shadow-sm">
            <CCardHeader className="bg-transparent border-bottom-0 pt-3 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0 text-primary">🧠 AI Incident Learning</h5>
                    <CButton color="secondary" variant="ghost" size="sm" onClick={handleRemindLater}>Remind me later</CButton>
                </div>
            </CCardHeader>
            <CCardBody>
                {/* A. RCA Verdict Bar */}
                <div className="mb-4 text-center">
                    <p className="lead mb-2">
                        System Diagnostics for <strong>{aiRootCause || 'Unknown Entity'}</strong>
                        {aiConfidence && <small className="text-muted ms-2">(Confidence: {(aiConfidence * 100).toFixed(0)}%)</small>}
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <CButton
                            color="success"
                            variant={getVerdictBtnVariant('correct')}
                            onClick={() => setVerdict('correct')}
                            className="px-4 py-2"
                        >
                            <CIcon icon={cilCheckCircle} className="me-2" /> Correct
                        </CButton>
                        <CButton
                            color="danger"
                            variant={getVerdictBtnVariant('incorrect')}
                            onClick={() => setVerdict('incorrect')}
                            className="px-4 py-2"
                        >
                            <CIcon icon={cilXCircle} className="me-2" /> Incorrect
                        </CButton>
                        <CButton
                            color="warning"
                            variant={getVerdictBtnVariant('partially_correct')}
                            onClick={() => setVerdict('partially_correct')}
                            className="px-4 py-2"
                        >
                            <CIcon icon={cilWarning} className="me-2" /> Partially Correct
                        </CButton>
                    </div>
                </div>

                {/* Conditional Fields based on Verdict */}
                {isVerdictChosen && (
                    <div className="animate__animated animate__fadeIn">

                        {needsCorrection && (
                            <>
                                <hr className="my-4" />
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        {/* B. Root Cause Selector */}
                                        <div className="mb-3">
                                            <CFormLabel className="fw-bold">Actual Root Cause <span className="text-danger">*</span></CFormLabel>
                                            <Autocomplete
                                                options={topologyNodes || []}
                                                getOptionLabel={(option) => option.name || option.id || ''}
                                                value={finalRootCause}
                                                onChange={(event, newValue) => setFinalRootCause(newValue)}
                                                renderInput={(params) => <TextField {...params} placeholder="Search entity..." size="small" />}
                                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            />
                                        </div>
                                    </CCol>
                                    <CCol md={6}>
                                        {/* C. Root Cause Type */}
                                        <div className="mb-3">
                                            <CFormLabel className="fw-bold">Root Cause Type <span className="text-danger">*</span></CFormLabel>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {rootCauseTypes.map(type => (
                                                    <CFormCheck
                                                        key={type}
                                                        type="radio"
                                                        name="rootCauseType"
                                                        id={`type-${type}`}
                                                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                                                        checked={rootCauseType === type}
                                                        onChange={() => setRootCauseType(type)}
                                                        inline
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>

                                {/* F. Why AI Was Wrong */}
                                <div className="mb-3">
                                    <CFormLabel className="fw-bold">Why was the AI wrong? (Optional)</CFormLabel>
                                    <div className="d-flex gap-3 flex-wrap">
                                        {aiWrongReasons.map(reason => (
                                            <CFormCheck
                                                key={reason.value}
                                                id={`reason-${reason.value}`}
                                                label={reason.label}
                                                checked={whyWrong.includes(reason.value)}
                                                onChange={() => toggleWhyWrong(reason.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <hr className="my-4" />

                        {/* D. Symptoms Checklist */}
                        <div className="mb-3">
                            <CFormLabel className="fw-bold">Symptoms (Observed Anomalies)</CFormLabel>
                            <Autocomplete
                                multiple
                                options={topologyNodes || []} // Using topology nodes as possible symptoms/entities
                                getOptionLabel={(option) => typeof option === 'string' ? option : (option.name || option.id || '')}
                                value={symptoms}
                                onChange={(event, newValue) => setSymptoms(newValue)}
                                freeSolo
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={typeof option === 'string' ? option : (option.name || option.id)} key={key} {...tagProps} />
                                        );
                                    })
                                }
                                renderInput={(params) => <TextField {...params} placeholder="Add symptoms..." size="small" />}
                            />
                            {existingSymptoms && existingSymptoms.length > 0 && <small className="text-muted">Pre-filled from AI analysis</small>}
                        </div>

                        {/* E. Resolution Summary */}
                        <div className="mb-3">
                            <CFormLabel className="fw-bold">Resolution Summary</CFormLabel>
                            <CFormTextarea
                                rows={2}
                                placeholder="Briefly explain how this was resolved..."
                                value={resolutionSummary}
                                onChange={(e) => setResolutionSummary(e.target.value)}
                            />
                        </div>

                        {/* G. Confidence Slider */}
                        <div className="mb-4">
                            <CFormLabel className="fw-bold d-flex justify-content-between">
                                <span>Your Confidence in this Feedback</span>
                                <span>{(confidence * 100).toFixed(0)}%</span>
                            </CFormLabel>
                            <Slider
                                value={confidence}
                                min={0.0}
                                max={1.0}
                                step={0.05}
                                onChange={(e, val) => setConfidence(val)}
                                valueLabelDisplay="auto"
                                valueLabelFormat={v => `${(v * 100).toFixed(0)}%`}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <CButton color="secondary" onClick={handleRemindLater} disabled={isSubmitting}>
                                Cancel
                            </CButton>
                            <CButton
                                color="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!isValid() || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </CButton>
                        </div>

                        {submissionError && (
                            <CAlert color="danger" className="mt-3">
                                {submissionError}
                            </CAlert>
                        )}
                    </div>
                )}
            </CCardBody>
        </CCard>
    );
};

export default IncidentFeedback;
