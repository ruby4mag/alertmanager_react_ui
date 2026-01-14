import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../../services/useAxios';
import {
    CForm, CFormLabel, CFormInput, CButton, CToaster
} from '@coreui/react';
import MyToast from '../../../components/Toast';

const CorrelationRuleView = () => {
    const api = useAxios();
    const navigate = useNavigate();
    const { id } = useParams();

    const [toast, addToast] = useState(0);
    const toaster = useRef();

    const [name, setName] = useState("");
    const [data, setData] = useState(null);
    const [multiValues, setMultiValues] = useState([]);
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
            setData(data);
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
                        disabled
                        type="text"
                        id="ruleNameInput"
                        placeholder="Correlation Rule name"
                        value={name}
                    />
                </div>

                <div className="mb-3">
                    <CFormLabel>Correlation Method</CFormLabel>
                    <div className="form-control" style={{ background: '#f8f9fa' }}>
                        {name && !multiValues.length && !timeWindow && loading ? "Loading..." :
                            (multiValues.length > 0 && (!data?.correlation_mode || data.correlation_mode === 'TAG_BASED')) ? 'Tag-based' : 'Similarity-based'}
                    </div>
                </div>

                {(!data?.correlation_mode || data.correlation_mode === 'TAG_BASED') && (
                    <div className="mb-3">
                        <CFormLabel htmlFor="multiValuesInput">Tag Selection</CFormLabel>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {multiValues.length > 0 ? multiValues.map((v, idx) => (
                                <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>{v}</span>
                                </div>
                            )) : <span style={{ color: '#888' }}>No tags selected</span>}
                        </div>
                    </div>
                )}

                {data?.correlation_mode === 'SIMILARITY' && (
                    <>
                        <div className="mb-3">
                            <CFormLabel>Scope Filters</CFormLabel>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {data.scope_tags && data.scope_tags.length > 0 ? data.scope_tags.map((v, idx) => (
                                    <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px' }}>{v}</span>
                                    </div>
                                )) : <span style={{ color: '#888' }}>No scope filters (Global)</span>}
                            </div>
                        </div>

                        <div className="mb-3">
                            <CFormLabel>Similarity Configuration</CFormLabel>

                            <div className="mb-2">
                                <small className="text-muted">Fields:</small>
                                <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {data.similarity?.fields && data.similarity.fields.length > 0 ? data.similarity.fields.map((v, idx) => (
                                        <div key={idx} style={{ padding: '6px 8px', background: '#e9ecef', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px' }}>{v}</span>
                                        </div>
                                    )) : <span style={{ color: '#888' }}>-</span>}
                                </div>
                            </div>

                            <div>
                                <small className="text-muted">Sensitivity Threshold:</small>
                                <div className="ms-2 d-inline-block fw-bold">{data.similarity?.threshold ?? 0.8}</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="mb-3">
                    <CFormLabel htmlFor="timeWindowInput">Time Window (minutes)</CFormLabel>
                    <CFormInput
                        disabled
                        id="timeWindowInput"
                        type="number"
                        placeholder="Enter time window in minutes"
                        value={timeWindow}
                    />
                </div>
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton variant="outline" onClick={handleBackButtonClick} color="info">Go Back</CButton>
            </div>
        </>
    );
};

export default CorrelationRuleView;
