import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilPuzzle,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = {
  user:
    [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,

      },
      {
        component: CNavTitle,
        name: 'Dashboards',
      },
      {
        component: CNavItem,
        name: 'Alert Dashboard',
        to: '/alert/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Change Risks',
        to: '/risk/changes',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },

      {
        component: CNavTitle,
        name: 'manage',
      },

      {
        component: CNavGroup,
        name: 'CONFIGURATION',
        to: '/rule',
        icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Alert Configuration',
            to: '/rule/alertrule/list',
          },
          {
            component: CNavItem,
            name: 'Notifications',
            to: '/rule/notifyrule/list',
          },
          {
            component: CNavItem,
            name: 'Tags',
            to: '/rule/tagrule/list',
          },
          {
            component: CNavItem,
            name: 'Correlation Rules',
            to: '/rule/correlationrule/list',
          },
        ],
      },

    ],
  admin:
    [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,

      },
      {
        component: CNavTitle,
        name: 'Dashboards',
      },
      {
        component: CNavItem,
        name: 'Alert Dashboard',
        to: '/alert/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Change Risks',
        to: '/risk/changes',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },

      {
        component: CNavTitle,
        name: 'manage',
      },

      {
        component: CNavGroup,
        name: 'CONFIGURATION',
        to: '/rule',
        icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Alert Configuration',
            to: '/rule/alertrule/list',
          },
          {
            component: CNavItem,
            name: 'Notifications',
            to: '/rule/notifyrule/list',
          },
          {
            component: CNavItem,
            name: 'Tags',
            to: '/rule/tagrule/list',
          },
          {
            component: CNavItem,
            name: 'Users',
            to: '/rule/notifyrule/list',
          },
          {
            component: CNavItem,
            name: 'Correlation Rules',
            to: '/rule/correlationrule/list',
          },
        ],
      },

      {
        component: CNavItem,
        name: 'Docs',
        href: 'https://spogworks.com',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },
    ],
}

export default _nav
