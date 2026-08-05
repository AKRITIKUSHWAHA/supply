import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Key, Server, Clock, Mail, Bell, Shield, Globe, Copy, Check, AlertCircle, Plus, RefreshCw, X, Trash2, QrCode, Lock, Eye, Send, Filter, CheckCircle2 } from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'

interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  status: string
  expiresAt: string | null
  createdAt: string
}

interface AuditLogItem {
  id: string
  action: string
  details: string
  ipAddress: string
  entityType?: string
  entityId?: string
  oldData?: string
  newData?: string
  createdAt: string
  user?: { name: string; email: string }
}

interface IpItem {
  id: string
  ipAddress: string
  description: string
  status: string
  createdAt: string
}

export const Settings: React.FC = () => {
  const [tab, setTab] = useState('general')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // General Settings state
  const [platformName, setPlatformName] = useState('SupplyBridge Enterprise PIM')
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Email Config state
  const [emailProvider, setEmailProvider] = useState('SMTP')
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUsername, setSmtpUsername] = useState('apikey')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('notifications@supplybridge.io')
  const [smtpFromName, setSmtpFromName] = useState('SupplyBridge Enterprise PIM')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  // Security state (2FA, IP Whitelist, Session, Password Expiry)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('30')
  const [passwordExpiryDays, setPasswordExpiryDays] = useState('90')
  const [ipWhitelistingEnabled, setIpWhitelistingEnabled] = useState(false)
  const [ipList, setIpList] = useState<IpItem[]>([])
  const [showAddIpModal, setShowAddIpModal] = useState(false)
  const [newIpAddress, setNewIpAddress] = useState('')
  const [newIpDesc, setNewIpDesc] = useState('')

  // 2FA Modal state
  const [show2FaModal, setShow2FaModal] = useState(false)
  const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('')
  const [twoFactorSecret, setTwoFactorSecret] = useState('')
  const [totpInputCode, setTotpInputCode] = useState('')
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false)
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [selectedLogDiff, setSelectedLogDiff] = useState<AuditLogItem | null>(null)
  const [logSearch, setLogSearch] = useState('')
  const [logActionFilter, setLogActionFilter] = useState('all')

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([])
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyExpiry, setNewKeyExpiry] = useState('90')
  const [secretDisplayModal, setSecretDisplayModal] = useState<{ title: string; secret: string } | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings')
      const data = await res.json()
      if (data) {
        if (data.platformName) setPlatformName(data.platformName)
        if (data.currency) setCurrency(data.currency)
        if (data.timezone) setTimezone(data.timezone)
        if (data.dateFormat) setDateFormat(data.dateFormat)
        if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode)
        if (data.emailProvider) setEmailProvider(data.emailProvider)
        if (data.smtpHost) setSmtpHost(data.smtpHost)
        if (data.smtpPort) setSmtpPort(data.smtpPort)
        if (data.smtpUsername) setSmtpUsername(data.smtpUsername)
        if (data.sessionTimeoutMinutes) setSessionTimeoutMinutes(data.sessionTimeoutMinutes)
        if (data.passwordExpiryDays) setPasswordExpiryDays(data.passwordExpiryDays)
        if (data.ipWhitelistingEnabled !== undefined) setIpWhitelistingEnabled(data.ipWhitelistingEnabled)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const fetchApiKeys = async () => {
    setLoadingKeys(true)
    try {
      const res = await fetch('http://localhost:5000/api/apikeys')
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data)
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err)
    } finally {
      setLoadingKeys(false)
    }
  }

  const fetchIpWhitelist = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/security/ip-whitelist')
      if (res.ok) {
        const data = await res.json()
        setIpList(data.ips || [])
        setIpWhitelistingEnabled(data.enabled || false)
      }
    } catch (err) {
      console.error('Failed to fetch IP Whitelist:', err)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const url = new URL('http://localhost:5000/api/security/audit-logs')
      if (logSearch) url.searchParams.append('search', logSearch)
      if (logActionFilter !== 'all') url.searchParams.append('action', logActionFilter)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchApiKeys()
    fetchIpWhitelist()
    fetchAuditLogs()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGeneral(true)
    setSaveError(null)

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          currency,
          timezone,
          dateFormat,
          maintenanceMode,
          emailProvider,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          sessionTimeoutMinutes,
          passwordExpiryDays,
          ipWhitelistingEnabled,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update settings')
      }

      setToastMessage('Settings saved successfully!')
      window.dispatchEvent(new Event('supplybridge_settings_updated'))
      await fetchSettings()
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setSaveError(err.message || 'Failed to save settings. Please try again.')
    } finally {
      setSavingGeneral(false)
    }
  }

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true)
    try {
      const res = await fetch('http://localhost:5000/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: smtpFromEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setToastMessage(`Test email sent via ${emailProvider}!`)
      } else {
        alert(data.error || 'Failed to send test email')
      }
    } catch (err) {
      console.error('Test email error:', err)
    } finally {
      setSendingTestEmail(false)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // 2FA Handlers
  const handleStart2FA = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/security/2fa/setup', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setTwoFactorSecret(data.secret)
        setTwoFactorQrUrl(data.qrCodeUrl)
        setShow2FaModal(true)
        setTwoFactorError(null)
      }
    } catch (err) {
      console.error('2FA setup error:', err)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setTwoFactorError(null)

    try {
      const res = await fetch('http://localhost:5000/api/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpInputCode, secret: twoFactorSecret }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsTwoFactorVerified(true)
        setShow2FaModal(false)
        setToastMessage('2FA enabled successfully!')
        setTimeout(() => setToastMessage(null), 3000)
      } else {
        setTwoFactorError(data.error || 'Invalid 6-digit code')
      }
    } catch (err) {
      setTwoFactorError('Failed to verify code. Please try again.')
    }
  }

  // IP Whitelist Handlers
  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIpAddress.trim()) return

    try {
      const res = await fetch('http://localhost:5000/api/security/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: newIpAddress, description: newIpDesc }),
      })
      if (res.ok) {
        setShowAddIpModal(false)
        setNewIpAddress('')
        setNewIpDesc('')
        fetchIpWhitelist()
        setToastMessage('IP added to whitelist!')
        setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error('Add IP error:', err)
    }
  }

  const handleDeleteIp = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/security/ip-whitelist/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchIpWhitelist()
      }
    } catch (err) {
      console.error('Delete IP error:', err)
    }
  }

  // API Key Handlers
  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    try {
      const res = await fetch('http://localhost:5000/api/apikeys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          expirationDays: Number(newKeyExpiry),
          scopes: ['read', 'write'],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setShowGenerateModal(false)
        setNewKeyName('')
        fetchApiKeys()
        setSecretDisplayModal({
          title: `API Key Created: ${data.apiKey.name}`,
          secret: data.apiKey.secretKey,
        })
      }
    } catch (err) {
      console.error('Failed to generate key:', err)
    }
  }

  const handleRevokeApiKey = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/apikeys/${id}/revoke`, { method: 'PUT' })
      if (res.ok) {
        setToastMessage('API Key revoked')
        fetchApiKeys()
        setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err)
    }
  }

  const handleRegenerateApiKey = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/apikeys/${id}/regenerate`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        fetchApiKeys()
        setSecretDisplayModal({
          title: `Credential Rotated for: ${name}`,
          secret: data.apiKey.secretKey,
        })
      }
    } catch (err) {
      console.error('Failed to regenerate API key:', err)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/apikeys/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setToastMessage('API Key deleted')
        fetchApiKeys()
        setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error('Failed to delete API key:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const tabs = [
    { id: 'general',       label: 'General' },
    { id: 'security',      label: 'Security & 2FA' },
    { id: 'email',         label: 'Email Provider' },
    { id: 'api',           label: 'API Keys' },
    { id: 'ftp',           label: 'FTP Config' },
    { id: 'scheduler',     label: 'Scheduler' },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <div>
      <SectionHeader
        title="Settings & System Governance"
        subtitle="Configure platform parameters, dynamic security policies, email providers, and schedulers"
      />

      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="max-w-4xl">
        {/* TAB 1: GENERAL SETTINGS */}
        {tab === 'general' && (
          <form onSubmit={handleSaveSettings} className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Globe size={16} className="text-primary-600 dark:text-primary-400" /> General Settings</h3>
            
            {saveError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" /> {saveError}
              </div>
            )}

            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Platform Name</label><input className="input" value={platformName} onChange={e => setPlatformName(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Default Currency</label><select className="select" value={currency} onChange={e => setCurrency(e.target.value)}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British Pound</option></select></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Default Timezone</label><select className="select" value={timezone} onChange={e => setTimezone(e.target.value)}><option value="UTC">UTC</option><option value="US/Eastern">US/Eastern</option><option value="US/Pacific">US/Pacific</option><option value="Europe/London">Europe/London</option></select></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Date Format</label><select className="select" value={dateFormat} onChange={e => setDateFormat(e.target.value)}><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="maintenance" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer" />
              <label htmlFor="maintenance" className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">Enable Maintenance Mode (Restricts non-admin access)</label>
            </div>
            <button
              type="submit"
              disabled={savingGeneral}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {savingGeneral ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving Settings...
                </>
              ) : (
                'Save General Settings'
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SECURITY & 2FA */}
        {tab === 'security' && (
          <div className="space-y-6">
            {/* 2FA Card */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Shield size={18} className="text-purple-600 dark:text-purple-400" /> Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enforce 6-digit TOTP verification (Google Authenticator / Microsoft Auth) for administrator logins.</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isTwoFactorVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'}`}>
                  {isTwoFactorVerified ? '2FA Enabled' : '2FA Recommended'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-600 dark:text-slate-300">Protect account with Authenticator App</span>
                <button onClick={handleStart2FA} className="btn-primary btn-sm flex items-center gap-1.5">
                  <QrCode size={14} /> Setup 2FA Authenticator
                </button>
              </div>
            </div>

            {/* Session Timeout & Password Expiry */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock size={18} className="text-blue-600 dark:text-blue-400" /> Session & Password Rotation Policies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Inactivity Session Timeout (Minutes)</label>
                  <input className="input" type="number" value={sessionTimeoutMinutes} onChange={e => setSessionTimeoutMinutes(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Configurable Password Expiration (Days)</label>
                  <input className="input" type="number" value={passwordExpiryDays} onChange={e => setPasswordExpiryDays(e.target.value)} />
                </div>
              </div>
              <button onClick={handleSaveSettings} className="btn-secondary btn-sm">Save Security Rules</button>
            </div>

            {/* IP Whitelisting Manager */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe size={18} className="text-teal-600 dark:text-teal-400" /> IP Whitelisting Protection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Restrict API & Admin portal access to whitelisted IP addresses/ranges.</p>
                </div>
                <button onClick={() => setShowAddIpModal(true)} className="btn-primary btn-sm flex items-center gap-1">
                  <Plus size={14} /> Add Whitelisted IP
                </button>
              </div>

              <div className="space-y-2">
                {ipList.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No IP rules defined. Localhost (127.0.0.1) is allowed by default.</p>
                ) : (
                  ipList.map(ip => (
                    <div key={ip.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ip.ipAddress}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">— {ip.description}</span>
                      </div>
                      <button onClick={() => handleDeleteIp(ip.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Logs Tracker */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600 dark:text-indigo-400" /> Audit Log Tracker (Old vs New Data Diff)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive immutable log of user activities and data changes.</p>
                </div>
                <button onClick={fetchAuditLogs} className="btn-secondary btn-xs flex items-center gap-1">
                  <RefreshCw size={13} /> Refresh Logs
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3 text-right">Data Changes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs.slice(0, 8).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{log.user?.name || 'System Admin'}</td>
                        <td className="p-3"><span className="font-semibold text-primary-600 dark:text-primary-400">{log.action}</span></td>
                        <td className="p-3 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setSelectedLogDiff(log)} className="btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 ml-auto">
                            <Eye size={12} /> View Diff
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC EMAIL PROVIDER */}
        {tab === 'email' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
                <Mail size={16} className="text-primary-600 dark:text-primary-400" /> Configurable Email Provider
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch email gateways dynamically without requiring code changes.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Active Email Provider</label>
              <select className="select font-medium" value={emailProvider} onChange={e => setEmailProvider(e.target.value)}>
                <option value="SMTP">Standard SMTP Relay</option>
                <option value="SENDGRID">SendGrid (API / SMTP Driver)</option>
                <option value="SES">Amazon SES (AWS SDK)</option>
                <option value="MICROSOFT365">Microsoft 365 / Outlook</option>
              </select>
            </div>

            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Mail Server Host</label><input className="input" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.sendgrid.net" /></div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Username / API Key Name</label><input className="input" value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} placeholder="apikey" /></div>
              <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Port</label><input className="input" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" /></div>
            </div>

            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Password / Secret API Token (Encrypted)</label><input className="input" type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••••••••••" /></div>
            
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">From Email Address</label><input className="input" value={smtpFromEmail} onChange={e => setSmtpFromEmail(e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">From Sender Name</label><input className="input" value={smtpFromName} onChange={e => setSmtpFromName(e.target.value)} /></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveSettings} className="btn-primary">Save Email Settings</button>
              <button onClick={handleSendTestEmail} disabled={sendingTestEmail} className="btn-secondary flex items-center gap-1.5">
                {sendingTestEmail ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: API KEYS */}
        {tab === 'api' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Key size={16} className="text-primary-600 dark:text-primary-400" /> API Keys Lifecycle
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage encrypted keys, rotation policies, and expiration status.</p>
              </div>
              <button onClick={() => setShowGenerateModal(true)} className="btn-primary btn-sm flex items-center gap-1.5">
                <Plus size={14} /> Generate API Key
              </button>
            </div>

            <div className="space-y-3">
              {loadingKeys ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500">
                  No API keys generated yet. Click "Generate API Key" to create one.
                </div>
              ) : (
                apiKeys.map(key => (
                  <div key={key.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{key.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Expires: {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                        key.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : key.status === 'revoked'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {key.status}
                      </span>
                    </div>

                    <code className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg block">
                      {key.keyPrefix}
                    </code>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex gap-1.5">
                        {key.scopes.map(s => (
                          <span key={s} className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {key.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleRegenerateApiKey(key.id, key.name)}
                              className="btn-secondary btn-xs flex items-center gap-1"
                              title="Rotate secret without code changes"
                            >
                              <RefreshCw size={12} /> Regenerate
                            </button>
                            <button
                              onClick={() => handleRevokeApiKey(key.id)}
                              className="btn-ghost btn-xs text-rose-600 dark:text-rose-400"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="btn-ghost btn-xs text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: FTP CONFIG */}
        {tab === 'ftp' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Server size={16} className="text-primary-600 dark:text-primary-400" /> Supplier-Specific FTP Configuration</h3>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Max Concurrent FTP Connections</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Connection Timeout (seconds)</label><input className="input" type="number" defaultValue="60" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Max File Size (MB)</label><input className="input" type="number" defaultValue="500" /></div>
            <div className="flex items-center gap-3"><input type="checkbox" id="passiveFtp" className="rounded dark:bg-slate-900 dark:border-slate-700" defaultChecked /><label htmlFor="passiveFtp" className="text-sm text-slate-700 dark:text-slate-200">Default to Passive Mode</label></div>
            <div className="flex items-center gap-3"><input type="checkbox" id="ftpSsl" className="rounded dark:bg-slate-900 dark:border-slate-700" defaultChecked /><label htmlFor="ftpSsl" className="text-sm text-slate-700 dark:text-slate-200">Require SSL/TLS</label></div>
            <button onClick={handleSaveSettings} className="btn-primary">Save FTP Settings</button>
          </div>
        )}

        {/* TAB 6: GRANULAR SCHEDULER */}
        {tab === 'scheduler' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Clock size={16} className="text-primary-600 dark:text-primary-400" /> Granular Synchronization Scheduler</h3>
            {[
              { label: 'Inventory Sync Schedule (Independent per Supplier)', default: 'Every 6 hours' },
              { label: 'Pricing Sync Schedule (Independent per Supplier)',   default: 'Every 12 hours' },
              { label: 'Image Sync Schedule',     default: 'Daily at midnight' },
              { label: 'Storefront Sync Schedule (Anchorage Medical)',   default: 'Every 12 hours' },
              { label: 'Storefront Sync Schedule (Anchorage Unlimited)', default: 'Every 6 hours' },
              { label: 'Full Catalog Sync',       default: 'Weekly (Sunday 02:00)' },
            ].map(s => (
              <div key={s.label}>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">{s.label}</label>
                <select className="select">
                  <option>Every hour</option>
                  <option>Every 6 hours</option>
                  <option>Every 12 hours</option>
                  <option>Daily at midnight</option>
                  <option>Weekly (Sunday 02:00)</option>
                  <option>Custom CRON</option>
                </select>
              </div>
            ))}
            <button onClick={handleSaveSettings} className="btn-primary">Save Scheduler Settings</button>
          </div>
        )}
      </div>

      {/* 2FA SETUP MODAL */}
      {show2FaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleVerify2FA} className="max-w-md w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <QrCode size={18} className="text-purple-600" /> Setup 2FA Authenticator
              </h3>
              <button type="button" onClick={() => setShow2FaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">Scan this QR code with Google Authenticator or Microsoft Authenticator app:</p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="w-36 h-36 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center">
                <QrCode size={120} className="text-slate-900" />
              </div>
              <code className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-purple-600 dark:text-purple-300 font-bold">{twoFactorSecret}</code>
            </div>

            {twoFactorError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} /> {twoFactorError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Enter 6-Digit Authenticator Code</label>
              <input
                className="input font-mono text-center tracking-widest text-base font-bold"
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                value={totpInputCode}
                onChange={e => setTotpInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Enter code from Authenticator app (or demo test code: <strong className="text-purple-600 font-mono">123456</strong>)
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShow2FaModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Verify & Enable 2FA</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD IP WHITELIST MODAL */}
      {showAddIpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddIp} className="max-w-md w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Globe size={18} className="text-teal-600" /> Whitelist IP Address
              </h3>
              <button type="button" onClick={() => setShowAddIpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">IP Address / CIDR Range</label>
              <input className="input font-mono" placeholder="e.g. 192.168.1.100" value={newIpAddress} onChange={e => setNewIpAddress(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Description / Label</label>
              <input className="input" placeholder="e.g. HQ Office Gateway IP" value={newIpDesc} onChange={e => setNewIpDesc(e.target.value)} />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddIpModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add IP Rule</button>
            </div>
          </form>
        </div>
      )}

      {/* AUDIT LOG DIFF MODAL */}
      {selectedLogDiff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" /> Audit Log Data Diff
              </h3>
              <button onClick={() => setSelectedLogDiff(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <div><strong>Action:</strong> {selectedLogDiff.action}</div>
              <div><strong>User:</strong> {selectedLogDiff.user?.name} ({selectedLogDiff.user?.email})</div>
              <div><strong>IP Address:</strong> {selectedLogDiff.ipAddress}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedLogDiff.createdAt).toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[11px] font-bold text-rose-600 block mb-1">Old Data (Before)</label>
                <pre className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl overflow-x-auto max-h-48 border border-rose-200 dark:border-rose-900/60">
                  {selectedLogDiff.oldData ? JSON.stringify(JSON.parse(selectedLogDiff.oldData), null, 2) : 'No previous data'}
                </pre>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-600 block mb-1">New Data (After)</label>
                <pre className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl overflow-x-auto max-h-48 border border-emerald-200 dark:border-emerald-900/60">
                  {selectedLogDiff.newData ? JSON.stringify(JSON.parse(selectedLogDiff.newData), null, 2) : 'No new data'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedLogDiff(null)} className="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* API KEY SECRET DISPLAY MODAL */}
      {secretDisplayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check size={18} /> {secretDisplayModal.title}
              </h3>
              <button onClick={() => setSecretDisplayModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span><strong>Save this key now!</strong> Secrets are encrypted and will never be shown again.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Secret API Key</label>
              <div className="flex gap-2">
                <input readOnly className="input font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-950" value={secretDisplayModal.secret} />
                <button onClick={() => copyToClipboard(secretDisplayModal.secret)} className="btn-primary btn-sm flex items-center gap-1 shrink-0">
                  {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSecret ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSecretDisplayModal(null)} className="btn-secondary w-full">I have safely saved this key</button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE API KEY MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleGenerateApiKey} className="max-w-md w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key size={18} className="text-primary-600" /> Generate New API Key
              </h3>
              <button type="button" onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Key Label / Name</label>
              <input className="input" placeholder="e.g., Shopify Storefront Middleware Key" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Expiration Period</label>
              <select className="select" value={newKeyExpiry} onChange={e => setNewKeyExpiry(e.target.value)}>
                <option value="30">30 Days</option>
                <option value="90">90 Days (Recommended)</option>
                <option value="365">1 Year</option>
                <option value="0">Never Expire</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Generate Key</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
