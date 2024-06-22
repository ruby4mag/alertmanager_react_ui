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
    const [tagName, setTagName] = useState("")
    const [selectedOption, setSelectedOption] = useState("");
    const [fieldExtraction, setFieldExtraction] = useState("")
    const [tagValue, setTagValue] = useState("")

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
                const response = await api.post('/api/tagrules', { rulename: name, ruledescription: description, ruleobject: formattedQuery.toString(), fieldname: selectedOption, fieldextraction: fieldExtraction, tagname: tagName, tagvalue: tagValue });
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
                console.error('Error fetching data:', error);
                addToast(MyToast({
                    title: "Tag Rule",
                    timestamp: "Just now",
                    body: "Failed to add tag rule.",
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
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlTextarea1">Rule Description</CFormLabel>
                    <CFormTextarea id="exampleFormControlTextarea1" rows={3} placeholder="Tag Rule description" value={description} onChange={(e) => setDescription(e.target.value)}></CFormTextarea>
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Tag Name</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Tag Rule name" value={tagName} onChange={(e) => setTagName(e.target.value)} />
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlTextarea1">Feild To Extract From</CFormLabel>
                    <select value={selectedOption} onChange={handleSelectChange} className="form-select" aria-label="Default select example">
                        <option value="" >Select Field</option>
                        <option value="Entity">Entity</option>
                        <option value="Severity">Severity</option>
                        <option value="AlertSummary">Alert Summary</option>
                    </select>
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Regex to extract</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Enter regex to extract" value={fieldExtraction} onChange={(e) => setFieldExtraction(e.target.value)} />
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="exampleFormControlInput1">Tag Value</CFormLabel>
                    <CFormInput type="text" id="exampleFormControlInput1" placeholder="Tag Rule name" value={tagValue} onChange={(e) => setTagValue(e.target.value)} />
                </div>
                <div className="mb-3">
                    <CFormLabel >Tag Rule </CFormLabel>
                    <QueryBuilder fields={fields} query={query} onQueryChange={handleQueryChange} />
                </div>
            </CForm>

            <div style={{ display: 'flex', gap: '10px' }}>
                <CButton disabled={name == "" || description == "" || selectedOption == "" || query.rules == "" || tagName == "" || fieldExtraction == "" ? true : false} variant="outline" onClick={handleQueryExport} color="primary">Add Rule</CButton>
                <CButton variant="outline" onClick={handleBackButtonClick} color="primary">Go Back</CButton>
            </div>
        </>
    )
}

export default New