import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
} from '@coreui/react'
import { CChartLine, CChartDoughnut, CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilArrowTop,
  cilArrowBottom,
  cilWarning,
  cilCheckCircle,
  cilGraph,
  cilSpeedometer,
} from '@coreui/icons'

const Dashboard = () => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  return (
    <>
      {/* Top Stats Widgets */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="danger"
            value={
              <>
                24{' '}
                <span className="fs-6 fw-normal">
                  (5 Operational)
                </span>
              </>
            }
            title="Active Critical Alerts"
            action={
              <CIcon icon={cilWarning} className="text-white" size="xl" />
            }
            chart={
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      label: 'Alerts',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-danger'),
                      data: [65, 59, 84, 84, 51, 55, 40],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    line: { borderWidth: 2, tension: 0.4 },
                    point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
                  },
                }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="warning"
            value={
              <>
                15m{' '}
                <span className="fs-6 fw-normal">
                  (-2m <CIcon icon={cilArrowBottom} />)
                </span>
              </>
            }
            title="Mean Time To Resolve (MTTR)"
            action={
              <CIcon icon={cilSpeedometer} className="text-white" size="xl" />
            }
            chart={
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      label: 'MTTR',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-warning'),
                      data: [18, 22, 19, 15, 12, 15, 14],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    line: { borderWidth: 2, tension: 0.4 },
                    point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
                  },
                }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="success"
            value={
              <>
                98.9%{' '}
                <span className="fs-6 fw-normal">
                  (+0.1% <CIcon icon={cilArrowTop} />)
                </span>
              </>
            }
            title="System Health Score"
            action={
              <CIcon icon={cilCheckCircle} className="text-white" size="xl" />
            }
            chart={
              <CChartBar
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                  datasets: [
                    {
                      label: 'Health',
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [98, 98, 99, 98, 99, 99, 99],
                      barPercentage: 0.6,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                }}
              />
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="info"
            value="1.2M"
            title="Events Processed (24h)"
            action={
              <CIcon icon={cilGraph} className="text-white" size="xl" />
            }
            chart={
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                  datasets: [
                    {
                      label: 'Events',
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [50000, 45000, 120000, 150000, 130000, 90000, 60000],
                      fill: true,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  elements: {
                    line: { borderWidth: 2, tension: 0.4 },
                    point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
                  },
                }}
              />
            }
          />
        </CCol>
      </CRow>

      {/* Main Charts Row */}
      <CRow>
        <CCol xs={12} lg={8}>
          <CCard className="mb-4">
            <CCardHeader>Alert Volume & Anomaly Detection (Last 24h)</CCardHeader>
            <CCardBody>
              <CChartLine
                style={{ height: '300px' }}
                data={{
                  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                  datasets: [
                    {
                      label: 'Actual Volume',
                      backgroundColor: 'rgba(220, 220, 220, 0.2)',
                      borderColor: 'rgba(220, 220, 220, 1)',
                      pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                      pointBorderColor: '#fff',
                      data: [random(10, 40), random(10, 40), random(10, 40), random(10, 40), random(50, 100), random(50, 100), random(40, 80), random(40, 80), random(40, 80), random(20, 60), random(20, 60), random(10, 40)],
                    },
                    {
                      label: 'Expected Baseline',
                      backgroundColor: 'rgba(151, 187, 205, 0.2)',
                      borderColor: 'rgba(151, 187, 205, 1)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      data: [25, 25, 25, 25, 75, 75, 60, 60, 60, 40, 40, 25],
                      borderDash: [5, 5],
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={4}>
          <CCard className="mb-4">
            <CCardHeader>Alert Severity Distribution</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                style={{ height: '300px' }}
                data={{
                  labels: ['Critical', 'Warning', 'Info', 'Unknown'],
                  datasets: [
                    {
                      backgroundColor: ['#e55353', '#f9b115', '#39f', '#2eb85c'],
                      data: [15, 45, 25, 15],
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Detail Tables and Bottom Charts */}
      <CRow>
        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>Top Noisy Services</CCardHeader>
            <CCardBody>
              <CChartBar
                style={{ height: '240px' }}
                data={{
                  labels: ['payment-service', 'auth-service', 'inventory-db', 'frontend-web', 'analytics-worker'],
                  datasets: [
                    {
                      label: 'Alert Count',
                      backgroundColor: '#f87979',
                      data: [120, 95, 80, 45, 30],
                    },
                  ],
                }}
                options={{
                  indexAxis: 'y',
                  maintainAspectRatio: false,
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>Recent Critical Incidents</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Service</CTableHeaderCell>
                    <CTableHeaderCell>Summary</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>payment-gateway</CTableDataCell>
                    <CTableDataCell>High latency on API</CTableDataCell>
                    <CTableDataCell><span className="badge bg-danger">Open</span></CTableDataCell>
                    <CTableDataCell>10 mins ago</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>db-shard-01</CTableDataCell>
                    <CTableDataCell>CPU Utilization &gt; 90%</CTableDataCell>
                    <CTableDataCell><span className="badge bg-warning">Ack</span></CTableDataCell>
                    <CTableDataCell>45 mins ago</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>k8s-cluster</CTableDataCell>
                    <CTableDataCell>Node NotReady</CTableDataCell>
                    <CTableDataCell><span className="badge bg-success">Resolved</span></CTableDataCell>
                    <CTableDataCell>2 hours ago</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>auth-service</CTableDataCell>
                    <CTableDataCell>Increased 5xx errors</CTableDataCell>
                    <CTableDataCell><span className="badge bg-danger">Open</span></CTableDataCell>
                    <CTableDataCell>3 hours ago</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
