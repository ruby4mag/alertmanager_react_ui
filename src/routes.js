import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Governace
const AccessDenied = React.lazy(() => import('./components/AccessDenied'))



// Alert
const AlertDashboard = React.lazy(() => import('./views/alert/Dashboard'))
const AlertDetail = React.lazy(() => import('./views/alert/Detail'))


// Rules
const AlertRuleList = React.lazy(() => import('./views/rule/alertrule/List'))
const AlertRuleNew = React.lazy(() => import('./views/rule/alertrule/New'))
const AlertRuleEdit = React.lazy(() => import('./views/rule/alertrule/Edit'))
const AlertRuleView = React.lazy(() => import('./views/rule/alertrule/View'))

const NotifyRuleList = React.lazy(() => import('./views/rule/notifyrule/List'))
const NotifyRuleNew = React.lazy(() => import('./views/rule/notifyrule/New'))
const NotifyRuleEdit = React.lazy(() => import('./views/rule/notifyrule/Edit'))
const NotifyRuleView = React.lazy(() => import('./views/rule/notifyrule/View'))

const TagRuleList = React.lazy(() => import('./views/rule/tagrule/List'))
const TagRuleNew = React.lazy(() => import('./views/rule/tagrule/New'))
const TagRuleEdit = React.lazy(() => import('./views/rule/tagrule/Edit'))
const TagRuleView = React.lazy(() => import('./views/rule/tagrule/View'))

const CorrelationRuleList = React.lazy(() => import('./views/rule/correlationrule/List'))
const CorrelationRuleNew = React.lazy(() => import('./views/rule/correlationrule/New'))
const CorrelationRuleEdit = React.lazy(() => import('./views/rule/correlationrule/Edit'))
const CorrelationRuleView = React.lazy(() => import('./views/rule/correlationrule/View'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const ChangeRiskList = React.lazy(() => import('./views/risk/ChangeRiskList'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/risk/changes', name: 'Change Risk', element: ChangeRiskList },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/alert', name: 'Base', element: Cards, exact: true },
  { path: '/alert/dashboard', name: 'AlertDashboard', element: AlertDashboard },
  { path: "/alert/details/:id", name: 'AlertRuleList', element: AlertDetail },

  { path: '/rule/alertrule/list', name: 'AlertRuleList', element: AlertRuleList },
  { path: '/rule/alertrule/new', name: 'AlertRuleList', element: AlertRuleNew },
  { path: "/rule/alertrule/edit/:id", name: 'AlertRuleList', element: AlertRuleEdit, roles: ['admin'] },
  { path: "/rule/alertrule/view/:id", name: 'AlertRuleList', element: AlertRuleView },

  { path: '/rule/notifyrule/list', name: 'NotifyRuleList', element: NotifyRuleList },
  { path: '/rule/notifyrule/new', name: 'NotifyRuleList', element: NotifyRuleNew },
  { path: "/rule/notifyrule/edit/:id", name: 'NotifyRuleList', element: NotifyRuleEdit, roles: ['admin'] },
  { path: "/rule/notifyrule/view/:id", name: 'NotifyRuleList', element: NotifyRuleView },

  { path: '/rule/tagrule/list', name: 'TagRuleList', element: TagRuleList },
  { path: '/rule/tagrule/new', name: 'TagRuleList', element: TagRuleNew },
  { path: "/rule/tagrule/edit/:id", name: 'TagRuleList', element: TagRuleEdit, roles: ['admin'] },
  { path: "/rule/tagrule/view/:id", name: 'TagRuleList', element: TagRuleView },

  { path: '/rule/correlationrule/list', name: 'CorrelationRuleList', element: CorrelationRuleList },
  { path: '/rule/correlationrule/new', name: 'CorrelationRuleList', element: CorrelationRuleNew },
  { path: "/rule/correlationrule/edit/:id", name: 'CorrelationRuleList', element: CorrelationRuleEdit, roles: ['admin'] },
  { path: "/rule/correlationrule/view/:id", name: 'CorrelationRuleList', element: CorrelationRuleView },

  { path: "/accessdenied", name: 'NotifyRuleList', element: AccessDenied },

]

export default routes
