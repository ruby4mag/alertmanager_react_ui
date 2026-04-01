import React from 'react';
import { CCard, CCardBody, CTooltip, CBadge } from '@coreui/react';
import { Link } from 'react-router-dom';
import './Timeline.css';

const HorizontalTimeline = ({ mainAlert, childAlerts, events }) => {
    // Combine main alert and child alerts into a single timeline list
    let allEvents = [];
    if (events) {
        allEvents = [...events].map(e => ({
            ...e,
            time: e.alertfirsttime ? new Date(e.alertfirsttime) : new Date(),
        }));
    } else if (mainAlert) {
        allEvents = [
            ...(childAlerts || []).map(alert => ({
                ...alert,
                isMain: false,
                time: alert.alertfirsttime ? new Date(alert.alertfirsttime) : new Date(),
            }))
        ];
    } else {
        return null;
    }



    // Sort events by time
    allEvents.sort((a, b) => a.time - b.time);

    const getSeverityColor = (severity) => {
        const sev = severity ? severity.toUpperCase() : '';
        if (sev === 'CRITICAL') return 'danger';
        if (sev === 'WARN' || sev === 'WARNING') return 'warning';
        if (sev === 'INFO') return 'info';
        return 'secondary';
    };

    const formatDiff = (current, previous) => {
        if (!previous) return '';
        const diffInSeconds = Math.floor((current - previous) / 1000);
        if (diffInSeconds < 0) return '';
        if (diffInSeconds < 60) return `+${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `+${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `+${diffInHours}h`;
    };


    return (
        <div className="timeline-container">
            <div className="timeline-horizontal">
                <div className="timeline-line"></div>
                {allEvents.map((event, index) => (
                    <div key={event._id || index} className="timeline-item">
                        <div className="timeline-dot-container">

                            <CTooltip
                                content={
                                    <div className="p-2">
                                        <strong>{event.entity}</strong><br />
                                        <small>{event.alertsummary}</small><br />
                                        <small className="text-muted">{event.alertfirsttime}</small>
                                    </div>
                                }
                            >
                                <div
                                    className={`timeline-dot bg-${getSeverityColor(event.severity)} ${event.isMain ? 'main-dot' : ''}`}
                                >
                                    <span className="dot-time-diff">
                                        {formatDiff(event.time, index > 0 ? allEvents[index - 1].time : null)}
                                    </span>
                                    {event.isMain && !formatDiff(event.time, index > 0 ? allEvents[index - 1].time : null) && <div className="dot-inner"></div>}
                                </div>

                            </CTooltip>
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-time text-muted small">
                                {new Date(event.alertfirsttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <Link
                                to={`/alert/details/${event._id}`}
                                className={`timeline-label text-truncate ${event.isMain ? 'fw-bold' : ''}`}
                                title={event.entity}
                            >
                                {event.entity}
                            </Link>
                            <div className="timeline-status mt-1">
                                <CBadge color={getSeverityColor(event.severity)} size="sm">
                                    {event.severity}
                                </CBadge>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalTimeline;
