import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { username, password })
      const { token, role } = response.data
      login(token, role, username)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center"
      style={{
        background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://www.splunk.com/content/dam/splunk-blogs/images/media_1ad0e73fe5a9597fd5a517b6e3c8d9ba5efa2b654.webp?width=1200&format=pjpg&optimize=medium")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Abstract Background Shapes - Removed for cleaner NOC look */}

      <CContainer style={{ zIndex: 1 }}>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={4}>
            <CCard
              className="border-0 shadow-lg"
              style={{
                borderRadius: '1.5rem',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CCardBody className="p-5">
                <div className="text-center mb-5">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Western_Digital_logo.svg/2560px-Western_Digital_logo.svg.png"
                    alt="Western Digital"
                    style={{ height: '80px', marginBottom: '1.5rem' }}
                  />
                  <h3 className="fw-bold mb-2" style={{ color: 'rgb(94, 83, 167)' }}>WD OpsGenie</h3>
                </div>

                <CForm>
                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-light border-end-0 rounded-start-pill ps-3">
                      <CIcon icon={cilUser} className="text-secondary" />
                    </CInputGroupText>
                    <CFormInput
                      className="bg-light border-start-0 rounded-end-pill py-2"
                      placeholder="Username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ boxShadow: 'none' }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-light border-end-0 rounded-start-pill ps-3">
                      <CIcon icon={cilLockLocked} className="text-secondary" />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      className="bg-light border-start-0 rounded-end-pill py-2"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ boxShadow: 'none' }}
                    />
                  </CInputGroup>

                  <CRow className="mb-4">
                    <CCol xs={6} className="d-flex align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                          style={{ borderColor: '#cbd5e1' }}
                        />
                        <label className="form-check-label small text-secondary" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                    </CCol>

                  </CRow>

                  <div className="d-grid gap-2">
                    <CButton
                      onClick={handleLogin}
                      color="primary"
                      className="rounded-pill py-2 fw-bold text-uppercase"
                      style={{
                        background: 'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)',
                        border: 'none',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Login
                    </CButton>
                  </div>


                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
