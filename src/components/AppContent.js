import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { CToaster } from '@coreui/react';

// routes config
import routes from '../routes'
import { useState, useEffect, useRef } from 'react';

const AppContent = () => {
  const toaster = useRef()
  const [toast, addToast] = useState(0)
  return (
    <div className="px-4"  >
      <CToaster ref={toaster} push={toast} placement="top-end" />
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)
