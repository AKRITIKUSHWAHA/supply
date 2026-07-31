import React, { useState } from 'react'
import { Settings as SettingsIcon, Key, Server, Clock, Mail, Bell, Shield, Globe } from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'

export const Settings: React.FC = () => {
  const [tab, setTab] = useState('general')

  const tabs = [
    { id: 'general',       label: 'General' },
    { id: 'api',           label: 'API Keys' },
    { id: 'ftp',           label: 'FTP Config' },
    { id: 'scheduler',     label: 'Scheduler' },
    { id: 'email',         label: 'Email' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security',      label: 'Security' },
  ]

  return (
    <div>
      <SectionHeader
        title="Settings"
        subtitle="Platform configuration and system preferences"
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="max-w-2xl">
        {tab === 'general' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Globe size={16} className="text-primary-600 dark:text-primary-400" /> General Settings</h3>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Platform Name</label><input className="input" defaultValue="SupplyBridge Enterprise PIM" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Default Currency</label><select className="select"><option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — British Pound</option></select></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Default Timezone</label><select className="select"><option>UTC</option><option>US/Eastern</option><option>US/Pacific</option><option>Europe/London</option></select></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Date Format</label><select className="select"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="maintenance" className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
              <label htmlFor="maintenance" className="text-sm text-slate-700 dark:text-slate-200">Enable Maintenance Mode</label>
            </div>
            <button className="btn-primary">Save General Settings</button>
          </div>
        )}

        {tab === 'api' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Key size={16} className="text-primary-600 dark:text-primary-400" /> API Keys</h3>
            <div className="space-y-3">
              {[
                { label: 'Platform API Key', value: 'sb_live_k3y_••••••••••••••••••••1234', active: true },
                { label: 'Webhook Secret',   value: 'whsec_••••••••••••••••••••••••••5678', active: true },
                { label: 'Internal API Key', value: 'sb_int_••••••••••••••••••••••••9012', active: false },
              ].map(key => (
                <div key={key.label} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{key.label}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${key.active ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                      {key.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg block">{key.value}</code>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-secondary btn-sm">Reveal</button>
                    <button className="btn-secondary btn-sm">Regenerate</button>
                    <button className="btn-ghost btn-sm text-rose-600 dark:text-rose-400">Revoke</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary btn-sm"><Key size={13} /> Generate New API Key</button>
          </div>
        )}

        {tab === 'ftp' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Server size={16} className="text-primary-600 dark:text-primary-400" /> FTP Configuration</h3>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Max Concurrent FTP Connections</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Connection Timeout (seconds)</label><input className="input" type="number" defaultValue="60" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Max File Size (MB)</label><input className="input" type="number" defaultValue="500" /></div>
            <div className="flex items-center gap-3"><input type="checkbox" id="passiveFtp" className="rounded dark:bg-slate-900 dark:border-slate-700" defaultChecked /><label htmlFor="passiveFtp" className="text-sm text-slate-700 dark:text-slate-200">Default to Passive Mode</label></div>
            <div className="flex items-center gap-3"><input type="checkbox" id="ftpSsl" className="rounded dark:bg-slate-900 dark:border-slate-700" defaultChecked /><label htmlFor="ftpSsl" className="text-sm text-slate-700 dark:text-slate-200">Require SSL/TLS</label></div>
            <button className="btn-primary">Save FTP Settings</button>
          </div>
        )}

        {tab === 'scheduler' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Clock size={16} className="text-primary-600 dark:text-primary-400" /> Scheduler Configuration</h3>
            {[
              { label: 'Inventory Sync Schedule', default: 'Every 6 hours' },
              { label: 'Pricing Sync Schedule',   default: 'Every 12 hours' },
              { label: 'Image Sync Schedule',     default: 'Daily at midnight' },
              { label: 'Website Sync Schedule',   default: 'Every 12 hours' },
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
            <button className="btn-primary">Save Scheduler Settings</button>
          </div>
        )}

        {tab === 'email' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Mail size={16} className="text-primary-600 dark:text-primary-400" /> Email Configuration</h3>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">SMTP Host</label><input className="input" placeholder="smtp.sendgrid.net" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">SMTP Username</label><input className="input" placeholder="apikey" /></div>
              <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Port</label><input className="input" placeholder="587" /></div>
            </div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">SMTP Password</label><input className="input" type="password" placeholder="••••••••" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">From Address</label><input className="input" placeholder="noreply@supplybridge.io" /></div>
            <div className="flex gap-2">
              <button className="btn-primary">Save Email Settings</button>
              <button className="btn-secondary">Send Test Email</button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="card p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Bell size={16} className="text-primary-600 dark:text-primary-400" /> Notification Preferences</h3>
            {[
              { label: 'Sync job failures', sub: 'Notify when any sync job fails' },
              { label: 'Validation errors', sub: 'Notify when products fail validation' },
              { label: 'Supplier disconnected', sub: 'Notify when a supplier connection drops' },
              { label: 'Daily summary', sub: 'Daily email digest of platform activity' },
              { label: 'Import completed', sub: 'Notify on successful product imports' },
              { label: 'Queue overload', sub: 'Notify when import queue exceeds 80% capacity' },
            ].map(n => (
              <label key={n.label} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 mt-0.5" defaultChecked />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400">{n.sub}</p>
                </div>
              </label>
            ))}
            <button className="btn-primary">Save Notification Settings</button>
          </div>
        )}

        {tab === 'security' && (
          <div className="card p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><Shield size={16} className="text-primary-600 dark:text-primary-400" /> Security Settings</h3>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Session Timeout (minutes)</label><input className="input" type="number" defaultValue="60" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Max Login Attempts</label><input className="input" type="number" defaultValue="5" /></div>
            <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Lockout Duration (minutes)</label><input className="input" type="number" defaultValue="30" /></div>
            {[
              { id: 'mfa',       label: 'Require Multi-Factor Authentication', sub: 'Force MFA for all users' },
              { id: 'ipWhitelist', label: 'Enable IP Whitelist', sub: 'Restrict access to specific IP ranges' },
              { id: 'auditLog',  label: 'Enable Audit Logging', sub: 'Log all user actions for compliance' },
            ].map(s => (
              <label key={s.id} className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <input type="checkbox" id={s.id} className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 mt-0.5" defaultChecked />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400">{s.sub}</p>
                </div>
              </label>
            ))}
            <button className="btn-primary">Save Security Settings</button>
          </div>
        )}
      </div>
    </div>
  )
}
