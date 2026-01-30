# PagerDuty Section Added to Alert Details Page

## Overview
A new **PagerDuty Incident** section has been added to the Alert Details page (`Detail.js`) to display PagerDuty-related information when available.

## Location
The PagerDuty section appears in the left column of the alert details page, positioned between:
- **Additional Details** card (above)
- **Alert Notes** card (below)

## Display Logic
The PagerDuty section is **conditionally rendered** and only appears when the alert data contains at least one of the following fields:
- `pagerduty_incident_id`
- `pagerduty_service`
- `pagerduty_escalation_policy`

## Fields Displayed

### Header Section
The card header displays "PagerDuty Incident" along with visual badges for:
- **Priority Badge**: Color-coded based on priority level
  - `P1` → Red (danger)
  - `P2` → Orange (warning)
  - `P3` → Blue (info)
  - Other → Gray (secondary)
- **Urgency Badge**: Color-coded based on urgency
  - `high` → Red (danger)
  - `low` → Gray (secondary)

### Body Section
The card body displays the following information in a table format:

| Field | API Field Name | Display |
|-------|---------------|---------|
| **Incident Number** | `pagerduty_incident_number` | Displayed with `#` prefix (e.g., #1138) |
| **Incident ID** | `pagerduty_incident_id` | Raw incident ID (e.g., Q3TT68ZI73LANF) |
| **Service** | `pagerduty_service` | Service name (e.g., "SN: Jira Application") |
| **Escalation Policy** | `pagerduty_escalation_policy` | Policy name (e.g., "SN:IT-Apps-MVP-ITES") |
| **Incident Link** | `pagerduty_html_url` | Clickable link "View in PagerDuty" |

All fields are conditionally rendered - they only appear if the data is present.

## Sample Data Structure

Based on the provided API response, the PagerDuty fields in the alert payload are:

```json
{
  "pagerduty_incident_number": 1138,
  "pagerduty_incident_id": "Q3TT68ZI73LANF",
  "pagerduty_priority": "P3",
  "pagerduty_urgency": "low",
  "pagerduty_html_url": "https://wdc-ops-sandbox.pagerduty.com/incidents/Q3TT68ZI73LANF",
  "pagerduty_service": "SN: Jira Application",
  "pagerduty_escalation_policy": "SN:IT-Apps-MVP-ITES"
}
```

## Visual Design

### Card Styling
- Background color: `#f2f7f8` (light blue-gray, matching other cards)
- Max height: `250px` with vertical scrolling if content exceeds
- Margin bottom: `mb-4` (spacing between cards)

### Header Styling
- Flexbox layout with 8px gap between elements
- Badges displayed inline with the title
- Priority and urgency badges provide quick visual indicators

### Table Styling
- Small table variant for compact display
- Two-column layout: Label | Value
- Consistent with other detail cards on the page

## User Experience

### When PagerDuty Data Exists
Users will see:
1. A dedicated PagerDuty section with clear visual indicators (priority/urgency badges)
2. All relevant incident information in an organized table
3. A direct link to view the full incident in PagerDuty

### When PagerDuty Data Doesn't Exist
The section is completely hidden - no empty state or placeholder is shown.

## Integration with Child Alerts

The PagerDuty section works seamlessly with grouped alerts:
- **Parent Alert**: Shows its own PagerDuty incident details if available
- **Child Alerts**: Each child alert in the sample data has its own PagerDuty incident
- Users can click on child alerts in the "Related Events" tab to view their individual PagerDuty incidents

## Code Changes

**File Modified**: `/opt/alertninja/alertmanager_react_ui/src/views/alert/Detail.js`

**Lines Added**: ~65 lines of JSX code

**Key Features**:
- Conditional rendering based on data availability
- Color-coded priority and urgency badges
- Responsive table layout
- Clickable link to PagerDuty incident
- Consistent styling with existing UI components

## Testing Recommendations

1. **Test with PagerDuty data**: Verify all fields display correctly
2. **Test without PagerDuty data**: Confirm section is hidden
3. **Test partial data**: Verify individual fields render independently
4. **Test priority colors**: Check P1, P2, P3, and other priorities
5. **Test urgency colors**: Check high and low urgency badges
6. **Test link**: Verify PagerDuty URL opens in new tab
7. **Test with child alerts**: Navigate to child alerts and verify their PagerDuty data

## Future Enhancements (Optional)

1. **Status Badge**: Add incident status (triggered, acknowledged, resolved)
2. **Assignee Information**: Display who is assigned to the incident
3. **Timeline**: Show when the incident was created/acknowledged/resolved
4. **Actions**: Add quick actions like "Acknowledge in PagerDuty" or "Add Note"
5. **Sync Status**: Show if the incident is in sync with PagerDuty
