import { Outlet, useSearchParams } from 'react-router'
import { useEffect, Suspense } from 'react'
import TopBar from './TopBar'
import { useAppStore } from '../../stores/appStore'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
      Loading...
    </div>
  )
}

export default function AppLayout() {
  const [params] = useSearchParams()
  const setCustomerId = useAppStore((s) => s.setCustomerId)

  useEffect(() => {
    const id = params.get('customer')
    if (id && !isNaN(Number(id))) {
      setCustomerId(Number(id))
    } else {
      // Default customer for demo
      setCustomerId(1)
    }
  }, [params, setCustomerId])

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      <TopBar />
      <main className="flex-1 relative overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
