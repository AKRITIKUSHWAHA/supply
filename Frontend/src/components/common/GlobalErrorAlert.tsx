import React, { useState, useEffect } from 'react'
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react'

export interface AlertEvent {
  id: string
  title: string
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

declare global {
  interface Window {
    showErrorAlert: (message: string, title?: string) => void
    showSuccessAlert: (message: string, title?: string) => void
    showWarningAlert: (message: string, title?: string) => void
  }
}

export const GlobalErrorAlertContainer: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertEvent[]>([])

  const addAlert = (message: string, title: string = 'System Alert', type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    const id = Math.random().toString(36).substring(2, 9)
    const newAlert: AlertEvent = { id, title, message, type }

    setAlerts(prev => [newAlert, ...prev].slice(0, 4)) // Keep max 4 floating alerts

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      removeAlert(id)
    }, 6000)
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  useEffect(() => {
    // Expose global alert helpers on window object
    window.showErrorAlert = (message: string, title: string = 'Error Occurred') => {
      addAlert(message, title, 'error')
    }

    window.showSuccessAlert = (message: string, title: string = 'Success') => {
      addAlert(message, title, 'success')
    }

    window.showWarningAlert = (message: string, title: string = 'Warning') => {
      addAlert(message, title, 'warning')
    }

    // Window global error listener (Catches unhandled runtime JS crashes)
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('[GlobalErrorAlert] Unhandled Exception:', event.error || event.message)
      const errorMsg = event.message || 'An unexpected client runtime exception occurred.'
      window.showErrorAlert(errorMsg, 'Application Runtime Error')
    }

    // Window global unhandled promise rejection listener
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalErrorAlert] Unhandled Rejection:', event.reason)
      const reasonMsg = typeof event.reason === 'string' 
        ? event.reason 
        : event.reason?.message || 'Async promise execution encountered an error.'
      window.showErrorAlert(reasonMsg, 'Unhandled API / Async Rejection')
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-[90vw] sm:w-[420px] pointer-events-none">
      {alerts.map(alert => {
        const isError = alert.type === 'error'
        const isWarning = alert.type === 'warning'
        const isSuccess = alert.type === 'success'

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
              isError
                ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-900/30'
                : isWarning
                ? 'bg-amber-900/95 text-white border-amber-700 shadow-amber-900/30'
                : isSuccess
                ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-900/30'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-900/30'
            }`}
          >
            <div className="p-2 rounded-lg shrink-0 bg-white/10 mt-0.5">
              {isError && <AlertTriangle size={20} className="text-rose-200" />}
              {isWarning && <AlertTriangle size={20} className="text-amber-200" />}
              {isSuccess && <CheckCircle size={20} className="text-emerald-200" />}
              {!isError && !isWarning && !isSuccess && <Info size={20} className="text-slate-200" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-extrabold text-sm tracking-wide leading-tight mb-1 text-white">
                {alert.title}
              </h4>
              <p className="text-xs text-slate-100/90 leading-normal break-words font-medium">
                {alert.message}
              </p>
            </div>

            <button
              onClick={() => removeAlert(alert.id)}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
              title="Dismiss Alert"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
