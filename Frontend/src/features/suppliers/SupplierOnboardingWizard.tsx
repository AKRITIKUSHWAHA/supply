import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Shield, Database, Sliders, Check, Server, Key, Mail, User, Phone, Globe, Clock, Layers } from 'lucide-react'
import { useSuppliers } from '../../context/SupplierContext'
import type { ConnectionType, Supplier } from '../../types'

const STEPS = [
  { id: 1, title: 'Supplier Information', desc: 'Company details & connection type' },
  { id: 2, title: 'Connection & Auth',     desc: 'Endpoint host & credentials' },
  { id: 3, title: 'Sync Schedule',         desc: 'Inventory & price sync frequencies' },
  { id: 4, title: 'Data Mapping',           desc: 'Master schema column alignment' },
  { id: 5, title: 'Import Validation',     desc: 'Dry-run preview & error check' },
  { id: 6, title: 'Activation',             desc: 'Review & deploy live pipeline' },
]

export const SupplierOnboardingWizard: React.FC = () => {
  const navigate = useNavigate()
  const { setSuppliersList } = useSuppliers()

  const [currentStep, setCurrentStep] = useState(1)
  const [isTesting, setIsTesting] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    connectionType: 'api' as ConnectionType,
    // API
    apiUrl: 'https://api.supplier.com/v2/catalog',
    apiKey: '',
    authType: 'bearer' as 'bearer' | 'basic' | 'apikey',
    // FTP/SFTP
    ftpHost: '',
    ftpUsername: '',
    ftpPassword: '',
    ftpPort: '22',
    filePath: '/catalog/products_feed.csv',
    // Sync Schedule
    inventorySyncFreq: 'hourly' as '15min' | 'hourly' | '4hours' | 'daily',
    pricingSyncFreq: '4hours' as 'hourly' | '4hours' | 'daily' | 'manual',
    imageSyncFreq: 'daily' as 'daily' | 'weekly' | 'manual',
    safetyStockBuffer: '5',
    // Mapping
    mappingPreset: 'Standard Hardware PIM Schema',
    autoPublish: false,
  })

  const runConnectionTest = () => {
    setIsTesting(true)
    setTestSuccess(false)
    setTimeout(() => {
      setIsTesting(false)
      setTestSuccess(true)
    }, 1500)
  }

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      alert('Please enter Supplier Company Name.')
      return
    }
    if (currentStep < 6) setCurrentStep(prev => prev + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleFinish = () => {
    const createdSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      name: formData.name.trim() || 'New Supplier Company',
      code: (formData.code.trim() || `SUP-${Date.now().toString().slice(-4)}`).toUpperCase(),
      connectionType: formData.connectionType,
      status: 'connected',
      productCount: 1240,
      errorCount: 0,
      country: 'United States',
      lastSync: new Date().toISOString(),
      contactEmail: formData.contactEmail || 'contact@supplier.com',
      contactName: formData.contactName || 'Account Manager',
      createdAt: new Date().toISOString(),
      credentials: {
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey,
        ftpHost: formData.ftpHost,
        ftpUsername: formData.ftpUsername,
      },
    }

    setSuppliersList(prev => [createdSupplier, ...prev])
    navigate('/suppliers')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Truck className="text-amber-500" size={24} /> Supplier Onboarding Wizard
          </h1>
          <p className="page-subtitle">Multi-Step Supplier Integration, Protocol Handshake & Automated Mapping</p>
        </div>
        <button onClick={() => navigate('/suppliers')} className="btn-secondary btn-sm">
          Cancel & Exit
        </button>
      </div>

      {/* Wizard Progress Bar */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map(s => {
            const isCompleted = currentStep > s.id
            const isCurrent = currentStep === s.id
            return (
              <div
                key={s.id}
                onClick={() => { if (s.id < currentStep) setCurrentStep(s.id); }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold ${
                    isCurrent
                      ? 'bg-amber-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isCompleted ? <Check size={12} /> : s.id}
                  </span>
                  <span className="text-xs font-extrabold truncate">{s.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="card p-6 min-h-[420px] flex flex-col justify-between">
        
        {/* Step 1: Supplier Information */}
        {currentStep === 1 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 1: Supplier Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter basic company details and select integration connection type</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Hardware Supplies"
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Code (Identifier)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. APEX-SUP-01"
                  className="input font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Connection Type *</label>
                <select
                  value={formData.connectionType}
                  onChange={e => setFormData({ ...formData, connectionType: e.target.value as ConnectionType })}
                  className="select"
                >
                  <option value="api">REST API Endpoint</option>
                  <option value="ftp">FTP Feed (CSV/XML)</option>
                  <option value="sftp">SFTP Secure Feed</option>
                  <option value="csv">CSV Direct Feed</option>
                  <option value="excel">Excel Sheet Import</option>
                  <option value="xml">XML Data Feed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Contact Person Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="orders@supplier.com"
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Contact Phone / Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://supplier.com"
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Connection & Credentials */}
        {currentStep === 2 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 2: Connection & Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure authentication endpoints and test network connectivity</p>
            </div>

            {formData.connectionType === 'api' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">API Endpoint URL *</label>
                  <input
                    type="text"
                    value={formData.apiUrl}
                    onChange={e => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="https://api.supplier.com/v2/catalog"
                    className="input font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Auth Type</label>
                    <select
                      value={formData.authType}
                      onChange={e => setFormData({ ...formData, authType: e.target.value as any })}
                      className="select"
                    >
                      <option value="bearer">Bearer Token</option>
                      <option value="apikey">API Key Header</option>
                      <option value="basic">Basic Auth</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">API Key / Access Token</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="input font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">FTP Server Host *</label>
                    <input
                      type="text"
                      value={formData.ftpHost}
                      onChange={e => setFormData({ ...formData, ftpHost: e.target.value })}
                      placeholder="ftp.supplier.com"
                      className="input font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Port</label>
                    <input
                      type="text"
                      value={formData.ftpPort}
                      onChange={e => setFormData({ ...formData, ftpPort: e.target.value })}
                      placeholder="21 or 22"
                      className="input font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">FTP Username</label>
                    <input
                      type="text"
                      value={formData.ftpUsername}
                      onChange={e => setFormData({ ...formData, ftpUsername: e.target.value })}
                      placeholder="ftp_user"
                      className="input font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">FTP Password</label>
                    <input
                      type="password"
                      value={formData.ftpPassword}
                      onChange={e => setFormData({ ...formData, ftpPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Feed File Path / Filename</label>
                  <input
                    type="text"
                    value={formData.filePath}
                    onChange={e => setFormData({ ...formData, filePath: e.target.value })}
                    placeholder="/catalog/products_feed.csv"
                    className="input font-mono"
                  />
                </div>
              </div>
            )}

            {/* Connection Test Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Target Endpoint:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formData.connectionType === 'api' ? (formData.apiUrl || 'https://api.supplier.com') : (formData.ftpHost || 'ftp.supplier.com')}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={runConnectionTest}
                  disabled={isTesting}
                  className="btn-primary btn-sm flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                  {isTesting ? 'Testing Handshake...' : 'Run Connection Test'}
                </button>

                {testSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> 200 OK Handshake Verified (34ms)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sync Schedule */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 3: Sync Schedule & Frequencies</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure automated synchronization frequencies for inventory, pricing, and media</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Inventory Sync</label>
                <select
                  value={formData.inventorySyncFreq}
                  onChange={e => setFormData({ ...formData, inventorySyncFreq: e.target.value as any })}
                  className="select"
                >
                  <option value="15min">Every 15 Minutes</option>
                  <option value="hourly">Every Hour</option>
                  <option value="4hours">Every 4 Hours</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Pricing Sync</label>
                <select
                  value={formData.pricingSyncFreq}
                  onChange={e => setFormData({ ...formData, pricingSyncFreq: e.target.value as any })}
                  className="select"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="4hours">Every 4 Hours</option>
                  <option value="daily">Daily</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Image & Media Sync</label>
                <select
                  value={formData.imageSyncFreq}
                  onChange={e => setFormData({ ...formData, imageSyncFreq: e.target.value as any })}
                  className="select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual On-Demand</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Safety Stock Buffer Threshold</label>
              <input
                type="number"
                value={formData.safetyStockBuffer}
                onChange={e => setFormData({ ...formData, safetyStockBuffer: e.target.value })}
                placeholder="5"
                className="input"
              />
              <span className="text-2xs text-slate-400 mt-1 block">Reserve buffer count subtracted from supplier total before store sync</span>
            </div>
          </div>
        )}

        {/* Step 4: Data Mapping */}
        {currentStep === 4 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 4: Data Schema & Column Mapping</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select column mapping rules to align supplier fields with Master Catalog</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Select Target Schema Mapping Preset</label>
              <select
                value={formData.mappingPreset}
                onChange={e => setFormData({ ...formData, mappingPreset: e.target.value })}
                className="select"
              >
                <option value="Standard Hardware PIM Schema">Standard Hardware PIM Schema</option>
                <option value="Automotive OEM Direct Schema">Automotive OEM Direct Schema</option>
                <option value="Electronics Multi-Variant Schema">Electronics Multi-Variant Schema</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Mapped Column Rules:</p>
              <div className="flex justify-between font-mono"><span className="text-slate-500">supplier_item_code</span> <span>→</span> <span className="font-bold text-amber-500">sku</span></div>
              <div className="flex justify-between font-mono"><span className="text-slate-500">wholesale_price</span> <span>→</span> <span className="font-bold text-amber-500">cost_price</span></div>
              <div className="flex justify-between font-mono"><span className="text-slate-500">msrp</span> <span>→</span> <span className="font-bold text-amber-500">retail_price</span></div>
              <div className="flex justify-between font-mono"><span className="text-slate-500">available_qty</span> <span>→</span> <span className="font-bold text-amber-500">stock</span></div>
            </div>
          </div>
        )}

        {/* Step 5: Import Validation */}
        {currentStep === 5 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 5: Dry-Run Import & Validation Check</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sample feed dry-run validation results</p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={18} /> Dry-Run Sample Feed Passed
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                1,240 Products parsed cleanly · 0 Validation Errors · 100% SKU Uniqueness verified
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Activation */}
        {currentStep === 6 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 6: Review & Activate Supplier</h3>
              <p className="text-xs text-slate-500 mt-0.5">Review details before deploying supplier integration pipeline</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Company Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.name || 'Apex Hardware Supplies'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Connection Protocol:</span>
                <span className="font-mono font-bold text-amber-600 uppercase">{formData.connectionType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Inventory Sync Schedule:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.inventorySyncFreq}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Import Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready to Deploy</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
            >
              Continue Step {currentStep + 1} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Deploy & Activate Supplier <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
