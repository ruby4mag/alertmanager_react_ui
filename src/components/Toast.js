import React from 'react'
import {
    CToaster, CToast, CToastHeader, CToastBody
} from '@coreui/react';

const MyToast = ({
    title,
    timestamp,
    body,
    autohide,
    dismissible,
    color
}) => {
    return (
        <CToast autohide={autohide} color={color} >
            <CToastHeader closeButton={dismissible}>
                <strong className="me-auto">{title}</strong>
            </CToastHeader>
            <CToastBody>{body}</CToastBody>
        </CToast>
    )
}

export default MyToast;