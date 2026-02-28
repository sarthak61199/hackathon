import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import AppLayout from './components/layout/AppLayout'

const MapView = lazy(() => import('./pages/MapView'))
const AnalyticsView = lazy(() => import('./pages/AnalyticsView'))

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <MapView /> },
      { path: '/analytics', element: <AnalyticsView /> },
    ],
  },
])
