import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../../services/useAxios';
import {
    CForm, CFormLabel, CFormInput, CButton, CToaster
} from '@coreui/react';
import MyToast from '../../../components/Toast';
import useCheckPermission from '../../../services/useCheckPermission';

const CorrelationRuleEdit = () => {
    const api = useAxios();
    const navigate = useNavigate();
    const { id } = useParams();

    const checkPermission = useCheckPermission("CorrelationRuleEdit");
    useEffect(() => {
        checkPermission("CorrelationRuleEdit")
    }, [checkPermission]);

    const [toast, addToast] = useState(0);
    const toaster = useRef();

    const [name, setName] = useState("");
    const [multiValues, setMultiValues] = useState([]);
    const [multiInput, setMultiInput] = useState("");
    const [timeWindow, setTimeWindow] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/api/correlationrules/${id}`);
            console.log(response.data);
            const data = response.data;
            setName(data.groupname || "");
            setMultiValues(data.grouptags || []);
            setTimeWindow(data.groupwindow || "");
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            addToast(MyToast({
                title: "Error",
                body: "Failed to fetch correlation rule data.",
                color: 'danger',
                autohide: true,
                dismissible: true
            }));
        }
    };

    const handleUpdate = () => {
        const updateData = async () => {
            try {
                const payload = { groupname: name, grouptags: multiValues };
                if (timeWindow !== "") payload.groupwindow = Number(timeWindow);

                const response = await api.put(`/api/correlationrules/${id}`, payload);
                console.log(response.data);
                addToast(MyToast({
                    title: "Correlation Rule",
                    timestamp: "Just now",
                    body: "Correlation Rule updated successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }));
            } catch (error) {
                console.error('Error updating correlation rule:', error);
                addToast(MyToast({
                    title: "Correlation Rule",
                    timestamp: "Just now",
                    body: "Failed to update correlation rule.",
                    color: 'danger',
                    autohide: true,
                    dismissible: true
                }));
            }
        };
        updateData();
    };

    const handleBackButtonClick = () => {
        navigate('/rule/correlationrule/list');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CForm>
                <div className="mb-3">
                    <CFormLabel htmlFor="ruleNameInput">Rule Name</CFormLabel>
                    <CFormInput
                        type="text"
                        id="ruleNameInput"
                        placeholder="Correlation Rule name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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
                                e.preventDefault();
                                const val = multiInput.trim();
                                if (val && !multiValues.includes(val)) {
                                    setMultiValues((prev) => [...prev, val]);
                                }
                                setMultiInput('');
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
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton disabled={name === ""} variant="outline" onClick={handleUpdate} color="primary">Update Rule</CButton>
                <CButton variant="outline" onClick={handleBackButtonClick} color="secondary">Go Back</CButton>
            </div>
        </>
    );
};

export default CorrelationRuleEdit;
