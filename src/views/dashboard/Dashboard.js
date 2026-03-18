import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsA,
  CSpinner,
} from '@coreui/react'
import { CChartLine, CChartDoughnut, CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilWarning,
  cilCheckCircle,
  cilGraph,
  cilSpeedometer,
  cilArrowTop,
  cilArrowBottom,
} from '@coreui/icons'
import useAxios from '../../services/useAxios'

const Dashboard = () => {
  const api = useAxios()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    open_incidents: 0,
    critical_active: 0,
    average_mttr_minutes: 0,
    system_health: 100,
    events_processed_24h: 0,
  })
  const [heatmap, setHeatmap] = useState([])
  const [trends, setTrends] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, heatmapRes, trendsRes] = await Promise.all([
          api.get('/api/v1/dashboard/stats'),
          api.get('/api/v1/dashboard/heatmap'),
          api.get('/api/v1/dashboard/trends'),
        ])
        setStats(statsRes.data)
        setHeatmap(heatmapRes.data)
        setTrends(trendsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <CSpinner color="primary" variant="grow" size="xl" />
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Top Stats Widgets */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 shadow-sm border-0 bg-gradient-danger glass-card"
            color="danger"
            value={
              <>
                {stats.critical_active}{' '}
                <span className="fs-6 fw-normal">
                  ({stats.open_incidents} Total Open)
                </span>
              </>
            }
            title="Active Critical Alerts"
            action={<CIcon icon={cilWarning} className="text-white opacity-50" size="xl" />}
            chart={
              <div className="mt-3 mx-3" style={{ height: '70px' }}>
                <CChartLine
                  data={{
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [
                      {
                        label: 'Critical',
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255,255,255,.55)',
                        pointBackgroundColor: getStyle('--cui-danger'),
                        data: [15, 20, 18, 25, stats.critical_active, stats.critical_active, stats.critical_active],
                        tension: 0.4,
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                    scales: { x: { display: false }, y: { display: false } },
                    elements: { point: { radius: 0 } },
                  }}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 shadow-sm border-0 bg-gradient-warning glass-card"
            color="warning"
            value={
              <>
                {Math.round(stats.average_mttr_minutes)}m{' '}
                <span className="fs-6 fw-normal">
                  (-2m <CIcon icon={cilArrowBottom} />)
                </span>
              </>
            }
            title="Mean Time To Resolve (MTTR)"
            action={<CIcon icon={cilSpeedometer} className="text-white opacity-50" size="xl" />}
            chart={
              <div className="mt-3 mx-3" style={{ height: '70px' }}>
                <CChartLine
                  data={{
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [
                      {
                        label: 'MTTR',
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255,255,255,.55)',
                        pointBackgroundColor: getStyle('--cui-warning'),
                        data: [25, 22, 19, 18, 15, 12, Math.round(stats.average_mttr_minutes)],
                        tension: 0.4,
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                    scales: { x: { display: false }, y: { display: false } },
                    elements: { point: { radius: 0 } },
                  }}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 shadow-sm border-0 bg-gradient-success glass-card"
            color="success"
            value={
              <>
                {stats.system_health}%{' '}
                <span className="fs-6 fw-normal">
                  (+0.1% <CIcon icon={cilArrowTop} />)
                </span>
              </>
            }
            title="System Health Score"
            action={<CIcon icon={cilCheckCircle} className="text-white opacity-50" size="xl" />}
            chart={
              <div className="mt-3 mx-3" style={{ height: '70px' }}>
                <CChartBar
                  data={{
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [
                      {
                        label: 'Health',
                        backgroundColor: 'rgba(255,255,255,.2)',
                        borderColor: 'rgba(255,255,255,.55)',
                        data: [98, 98.2, 98.5, 98, 98.7, 98.9, stats.system_health],
                        barPercentage: 0.6,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } },
                  }}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 shadow-sm border-0 bg-gradient-info glass-card"
            color="info"
            value={stats.events_processed_24h.toLocaleString()}
            title="Events Processed (24h)"
            action={<CIcon icon={cilGraph} className="text-white opacity-50" size="xl" />}
            chart={
              <div className="mt-3 mx-3" style={{ height: '70px' }}>
                <CChartLine
                  data={{
                    labels: trends.map((t) => t.timestamp),
                    datasets: [
                      {
                        label: 'Events',
                        backgroundColor: 'rgba(255,255,255,.2)',
                        borderColor: 'rgba(255,255,255,.55)',
                        data: trends.map((t) => t.count),
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                    scales: { x: { display: false }, y: { display: false } },
                    elements: { point: { radius: 0 } },
                  }}
                />
              </div>
            }
          />
        </CCol>
      </CRow>

      {/* Main Charts Row */}
      <CRow>
        <CCol xs={12} lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>Alert Volume & Trends (Last 24h)</span>
              <span className="text-muted small">Updated every 30s</span>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                style={{ height: '300px' }}
                data={{
                  labels: trends.map((t) => t.timestamp.includes(' ') ? t.timestamp.split(' ')[1] : t.timestamp),
                  datasets: [
                    {
                      label: 'Total Alerts',
                      backgroundColor: 'rgba(57, 159, 255, 0.2)',
                      borderColor: '#39f',
                      pointBackgroundColor: '#39f',
                      pointBorderColor: '#fff',
                      data: trends.map((t) => t.count),
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0,0,0,0.05)' },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="bg-white fw-bold">Executive Risk Heatmap</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                style={{ height: '300px' }}
                data={{
                  labels: ['Critical (P0/P1)', 'Warning (P2)', 'Info (P3/P4)'],
                  datasets: [
                    {
                      backgroundColor: ['#e55353', '#f9b115', '#3399ff'],
                      hoverBackgroundColor: ['#d93737', '#e6a110', '#2980b9'],
                      borderWidth: 0,
                      data: [
                        heatmap.reduce((acc, curr) => acc + curr.critical, 0),
                        heatmap.reduce((acc, curr) => acc + curr.warning, 0),
                        heatmap.reduce((acc, curr) => acc + curr.info, 0),
                      ],
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 20, usePointStyle: true },
                    },
                  },
                  cutout: '70%',
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Operational Service Heatmap */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="bg-white fw-bold">Operational Heatmap by Service (Top 10)</CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="px-4 py-3">Service Name</th>
                      <th className="py-3" style={{ width: '150px' }}>Critical</th>
                      <th className="py-3" style={{ width: '150px' }}>Warning</th>
                      <th className="py-3" style={{ width: '150px' }}>Info</th>
                      <th className="px-4 py-3 text-end" style={{ width: '100px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 fw-semibold">{item.service}</td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '10px' }}>
                              <div
                                className="bg-danger h-100"
                                style={{ width: `${item.total > 0 ? (item.critical / item.total) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="ms-2 small text-muted">{item.critical}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '10px' }}>
                              <div
                                className="bg-warning h-100"
                                style={{ width: `${item.total > 0 ? (item.warning / item.total) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="ms-2 small text-muted">{item.warning}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '10px' }}>
                              <div
                                className="bg-info h-100"
                                style={{ width: `${item.total > 0 ? (item.info / item.total) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="ms-2 small text-muted">{item.info}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end fw-bold">{item.total}</td>
                      </tr>
                    ))}
                    {heatmap.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No active incidents found across services.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <style dangerouslySetInnerHTML={{
        __html: `
        .bg-gradient-danger { background: linear-gradient(45deg, #e55353 0%, #d93737 100%) !important; }
        .bg-gradient-warning { background: linear-gradient(45deg, #f9b115 0%, #f6960b 100%) !important; }
        .bg-gradient-success { background: linear-gradient(45deg, #2eb85c 0%, #1b9e3e 100%) !important; }
        .bg-gradient-info { background: linear-gradient(45deg, #3399ff 0%, #2980b9 100%) !important; }
        .glass-card {
          backdrop-filter: blur(10px);
          background-opacity: 0.8;
          border-radius: 12px !important;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

export default Dashboard
