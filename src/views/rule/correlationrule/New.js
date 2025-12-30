import React from 'react'
import {
    CForm, CFormLabel, CFormInput, CButton, CToaster
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
    // multi-input strings field (array)
    const [multiValues, setMultiValues] = useState([])
    const [multiInput, setMultiInput] = useState("")
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
                const payload = { groupname: name, grouptags: multiValues }
                if (timeWindow !== "") payload.groupwindow = Number(timeWindow)
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
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Tag Rule name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {/* Only keep Name and multi-values inputs per request */}
                <div className="mb-3">
                    <CFormLabel htmlFor="multiValuesInput">Additional Names (press Enter or comma to add)</CFormLabel>
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
                <div className="mb-3">
                    <CFormLabel >Values</CFormLabel>
                    {/* multi-values input already rendered above */}
                </div>
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton disabled={name == "" ? true : false} variant="outline" onClick={handleSubmit} color="primary">Add Rule</CButton>
                <CButton disabled={name == "" ? true : false} variant="outline" onClick={handleCorrelationSubmit} color="secondary">Submit to Correlation</CButton>
                <CButton variant="outline" onClick={handleBackButtonClick} color="primary">Go Back</CButton>
            </div>
        </>
    )
}

export default New