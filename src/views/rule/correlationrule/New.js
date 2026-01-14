import React from 'react'
import {
    CForm, CFormLabel, CFormInput, CButton, CToaster, CTooltip
} from '@coreui/react';
import { useState, useRef } from 'react';
// (Removed QueryBuilder - this form now only has Name and multi-value inputs)
import useAxios from '../../../services/useAxios';
import MyToast from '../../../components/Toast'
import { useNavigate } from 'react-router-dom';


const New = () => {

    const [toast, addToast] = useState(0)
    const toaster = useRef()
    const navigate = useNavigate();

    const [name, setName] = useState("")

    // Tag-based state
    const [multiValues, setMultiValues] = useState([])
    const [multiInput, setMultiInput] = useState("")

    // Similarity-based state
    const [correlationMode, setCorrelationMode] = useState("TAG_BASED") // TAG_BASED | SIMILARITY
    const [scopeTags, setScopeTags] = useState([])
    const [scopeInput, setScopeInput] = useState("")

    // Similarity Fields state
    const [fieldsTags, setFieldsTags] = useState([])
    const [fieldsInput, setFieldsInput] = useState("")

    const [similarityThreshold, setSimilarityThreshold] = useState(0.8)

    const [timeWindow, setTimeWindow] = useState("")

    const api = useAxios();

    const handleSubmit = () => {
        const fetchData = async () => {
            try {
                const payload = { groupname: name, grouptags: multiValues }
                // include timeWindow if provided (as number)
                if (timeWindow !== "") payload.groupwindow = Number(timeWindow)
                const response = await api.post('/api/tagrules', payload);
                console.log(response.data);
                addToast(MyToast({
                    title: "Tag Rule",
                    timestamp: "Just now",
                    body: "Tag Rule added successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
            } catch (error) {
                console.error('Error submitting data:', error);
                addToast(MyToast({
                    title: "Tag Rule",
                    timestamp: "Just now",
                    body: "Failed to add tag rule.",
                    color: 'danger',
                    autohide: true,
                    dismissible: true
                }))
            }
        }
        fetchData()
    }

    // submit to correlationrules endpoint
    const handleCorrelationSubmit = () => {
        const fetchData = async () => {
            try {
                let payload = {};

                if (correlationMode === 'TAG_BASED') {
                    payload = {
                        groupname: name,
                        grouptags: multiValues,
                        correlation_mode: "TAG_BASED"
                    };
                } else {
                    payload = {
                        groupname: name,
                        correlation_mode: "SIMILARITY",
                        scope_tags: scopeTags,
                        similarity: {
                            fields: fieldsTags,
                            threshold: Number(similarityThreshold)
                        }
                    };
                }

                if (timeWindow !== "") payload.groupwindow = Number(timeWindow)
                // Map to time_window_minutes for the backend if needed, but keeping groupwindow for consistency with existing code
                if (timeWindow !== "") payload.time_window_minutes = Number(timeWindow)

                const response = await api.post('/api/correlationrules', payload);
                console.log(response.data);
                addToast(MyToast({
                    title: "Correlation Rule",
                    timestamp: "Just now",
                    body: "Correlation rule submitted successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
            } catch (error) {
                console.error('Error submitting correlation rule:', error);
                addToast(MyToast({
                    title: "Correlation Rule",
                    timestamp: "Just now",
                    body: "Failed to submit correlation rule.",
                    color: 'danger',
                    autohide: true,
                    dismissible: true
                }))
            }
        }
        fetchData()
    }

    const handleBackButtonClick = () => {
        navigate('/rule/tagrule/list');
    };

    return (
        <>

            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CForm>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Rule Name</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="mb-4">
                    <CFormLabel>Correlation Method</CFormLabel>
                    <div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="correlationMode"
                                id="modeTag"
                                value="TAG_BASED"
                                checked={correlationMode === 'TAG_BASED'}
                                onChange={() => setCorrelationMode('TAG_BASED')}
                            />
                            <label className="form-check-label" htmlFor="modeTag">Tag-based</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="correlationMode"
                                id="modeSim"
                                value="SIMILARITY"
                                checked={correlationMode === 'SIMILARITY'}
                                onChange={() => setCorrelationMode('SIMILARITY')}
                            />
                            <label className="form-check-label" htmlFor="modeSim">Similarity-based</label>
                        </div>
                    </div>
                </div>

                {correlationMode === 'TAG_BASED' && (
                    <div className="mb-3">
                        <CFormLabel htmlFor="multiValuesInput">Tag Selection (Additional Names)</CFormLabel>
                        <CFormInput
                            id="multiValuesInput"
                            type="text"
                            placeholder="Type and press Enter or comma"
                            value={multiInput}
                            onChange={(e) => setMultiInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    const val = multiInput.trim()
                                    if (val && !multiValues.includes(val)) {
                                        setMultiValues((prev) => [...prev, val])
                                    }
                                    setMultiInput('')
                                }
                            }}
                        />
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {multiValues.map((v, idx) => (
                                <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>{v}</span>
                                    <button type="button" onClick={() => setMultiValues((prev) => prev.filter((x) => x !== v))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {correlationMode === 'SIMILARITY' && (
                    <div className="p-3 mb-3 border rounded bg-light">
                        <h6 className="mb-3">Scope Filters</h6>
                        <div className="mb-3">
                            <p className="text-muted small mb-1">Limit similarity comparison to events with matching values for:</p>
                            <CFormInput
                                id="scopeInput"
                                type="text"
                                placeholder="e.g. service, environment..."
                                value={scopeInput}
                                onChange={(e) => setScopeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault()
                                        const val = scopeInput.trim()
                                        if (val && !scopeTags.includes(val)) {
                                            setScopeTags((prev) => [...prev, val])
                                        }
                                        setScopeInput('')
                                    }
                                }}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {scopeTags.map((v, idx) => (
                                    <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>{v}</span>
                                        <button type="button" onClick={() => setScopeTags((prev) => prev.filter((x) => x !== v))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h6 className="mb-3">Similarity Configuration</h6>
                        <div className="mb-3">
                            <p className="text-muted small mb-1">
                                Similarity based on
                                <CTooltip content="Similarity groups alerts with similar meaning, not exact matches">
                                    <span style={{ cursor: 'help', textDecoration: 'underline dotted', marginLeft: '5px' }}>(?)</span>
                                </CTooltip>:
                            </p>
                            <CFormInput
                                id="fieldsInput"
                                type="text"
                                placeholder="e.g. summary, description..."
                                value={fieldsInput}
                                onChange={(e) => setFieldsInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault()
                                        const val = fieldsInput.trim()
                                        if (val && !fieldsTags.includes(val)) {
                                            setFieldsTags((prev) => [...prev, val])
                                        }
                                        setFieldsInput('')
                                    }
                                }}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {fieldsTags.map((v, idx) => (
                                    <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>{v}</span>
                                        <button type="button" onClick={() => setFieldsTags((prev) => prev.filter((x) => x !== v))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="simThreshold" className="form-label d-flex justify-content-between">
                                <span>Similarity sensitivity</span>
                                <span>{similarityThreshold}</span>
                            </label>
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted">Strict</span>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0.5"
                                    max="1.0"
                                    step="0.01"
                                    id="simThreshold"
                                    value={similarityThreshold}
                                    onChange={(e) => setSimilarityThreshold(e.target.value)}
                                />
                                <span className="small text-muted">Loose</span>
                            </div>
                        </div>

                        <div className="alert alert-info">
                            <strong>Preview Example:</strong><br />
                            "Disk latency high on node-12"
                            will group with
                            "High IO wait detected on node-14"
                        </div>
                    </div>
                )}

                <div className="mb-3">
                    <CFormLabel htmlFor="timeWindowInput">Time Window (minutes)</CFormLabel>
                    <CFormInput
                        id="timeWindowInput"
                        type="number"
                        min="0"
                        placeholder="Enter time window in minutes"
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(e.target.value)}
                    />
                </div>
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton disabled={name == "" ? true : false} variant="outline" onClick={handleSubmit} color="primary">Add Tag Rule</CButton>
                <CButton disabled={name == "" ? true : false} variant="outline" onClick={handleCorrelationSubmit} color="secondary">Submit to Correlation</CButton>
                <CButton variant="outline" onClick={handleBackButtonClick} color="primary">Go Back</CButton>
            </div>
        </>
    )
}

export default New