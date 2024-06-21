import React from 'react'
import {
    CForm, CFormLabel, CFormInput, CFormTextarea, CButton, CToaster
} from '@coreui/react';
import { useState, useRef } from 'react';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import useAxios from '../../../services/useAxios';
import MyToast from '../../../components/Toast'
import { useNavigate } from 'react-router-dom';


const New = () => {

    const [toast, addToast] = useState(0)
    const toaster = useRef()
    const navigate = useNavigate();

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [payload, setPayload] = useState('');
    const [endpoint, setEndpoint] = useState('');

    const api = useAxios();

    const [formattedQuery, setFormattedQuery] = useState(null);
    const fields = [
        { name: 'Entity', label: 'Entity', type: "string" },
        { name: 'Severity', label: 'Severity', type: "string" },
    ];

    const customProcessor = (rule) => {
        // Add type to each rule based on the field
        const field = fields.find(f => f.name === rule.field);
        if (field) {
            return { ...rule, type: field.type };
        }
        return rule;
    };

    const customFormatQuery = (rules) => {
        const processedRules = rules.rules.map(customProcessor);
        return formatQuery({ ...rules, rules: processedRules });
    };

    const [query, setQuery] = useState({
        combinator: 'and',
        rules: [

        ],
    });

    const handleQueryChange = (q) => {
        setQuery(q);
    };

    const handleQueryExport = () => {
        const formattedQuery = customFormatQuery(query);
        setFormattedQuery(formattedQuery);
        console.log(JSON.stringify(formattedQuery));
        const fetchData = async () => {
            try {
                const response = await api.post('/api/notifyrules', { rulename: name, ruledescription: description, ruleobject: formattedQuery.toString(), payload: payload, endpoint: endpoint });
                console.log(response.data);
                addToast(MyToast({
                    title: "Notify Rule",
                    timestamp: "Just now",
                    body: "Notify Rule added successfully",
                    color: 'success',
                    autohide: true,
                    dismissible: true
                }))
            } catch (error) {
                console.error('Error fetching data:', error);
                addToast(MyToast({
                    title: "Notify Rule",
                    timestamp: "Just now",
                    body: "Failed to add notify rule.",
                    color: 'danger',
                    autohide: true,
                    dismissible: true
                }))
            }
        };

        fetchData();
    };

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleBackButtonClick = () => {
        navigate('/rule/notifyrule/list');
    };

    return (
        <>

            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CForm>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Rule Name</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Alert Rule name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlTextarea1">Rule Description</CFormLabel>
                    <CFormTextarea id="exampleFormControlTextarea1" rows={3} placeholder="Alert Rule description" value={description} onChange={(e) => setDescription(e.target.value)}></CFormTextarea>
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlTextarea1">Notification Payload</CFormLabel>
                    <CFormTextarea id="exampleFormControlTextarea1" rows={3} placeholder="Alert Rule description" value={payload} onChange={(e) => setPayload(e.target.value)}></CFormTextarea>
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Notification Endpoint</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Webhook Endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
                </div>
                <div className="mb-3">
                    <CFormLabel >Filter alerts to notity  </CFormLabel>
                    <QueryBuilder fields={fields} query={query} onQueryChange={handleQueryChange} />
                </div>
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton disabled={name == "" || description == "" || payload == "" || query.rules == "" || endpoint == "" ? true : false} variant="outline" onClick={handleQueryExport} color="primary">Add Rule</CButton>
                <CButton variant="outline" onClick={handleBackButtonClick} color="primary">Go Back</CButton>
            </div>
        </>
    )
}

export default New