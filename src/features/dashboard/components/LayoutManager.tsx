import { useState } from 'react'
import { LayoutConfig } from '@/shared/types/layoutTypes'
import { layoutService } from '../services/layoutService'
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface LayoutManagerProps {
  currentLayout: LayoutConfig
  onApplyTemplate: (templateId: string) => void
  onReset: () => void
  onExport: () => void
  onImport: (file: File) => void
  onShareLayout: (isPublic: boolean, expiresInDays: number) => Promise<{ code: string; expiresAt: string }>
  onImportByCode: (code: string) => Promise<LayoutConfig>
  onApplyImportedLayout: (layout: LayoutConfig) => void
  onClose: () => void
}

export const LayoutManager = ({
  currentLayout,
  onApplyTemplate,
  onReset,
  onExport,
  onImport,
  onShareLayout,
  onImportByCode,
  onApplyImportedLayout,
  onClose,
}: LayoutManagerProps) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'import-export'>('templates')
  const [shareExpiresInDays, setShareExpiresInDays] = useState(30)
  const [shareIsPublic, setShareIsPublic] = useState(false)
  const [shareResult, setShareResult] = useState<{ code: string; expiresAt: string } | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importedLayout, setImportedLayout] = useState<LayoutConfig | null>(null)

  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onImport(file)
      }
    }
    input.click()
  }

  const templates = layoutService.getTemplates()

  const handleShareLayout = async () => {
    try {
      setShareLoading(true)
      const result = await onShareLayout(shareIsPublic, shareExpiresInDays)
      setShareResult(result)
      toast.success('Share code created')
    } catch (error) {
      console.error('Error sharing layout:', error)
      toast.error('Failed to create share code')
    } finally {
      setShareLoading(false)
    }
  }

  const handleImportByCode = async () => {
    const trimmed = importCode.trim()
    if (!/^[a-zA-Z0-9]{10,12}$/.test(trimmed)) {
      toast.error('Code không hợp lệ (10-12 ký tự)')
      return
    }

    try {
      setImportLoading(true)
      const layout = await onImportByCode(trimmed)
      setImportedLayout(layout)
      toast.success('Layout loaded from code')
    } catch (error) {
      console.error('Error importing by code:', error)
      toast.error('Code không tồn tại hoặc đã hết hạn')
    } finally {
      setImportLoading(false)
    }
  }

  const handleApplyImportedLayout = () => {
    if (!importedLayout) return
    onApplyImportedLayout(importedLayout)
  }

  const handleCopyCode = async () => {
    if (!shareResult?.code) return
    try {
      await navigator.clipboard.writeText(shareResult.code)
      toast.success('Code copied')
    } catch (error) {
      console.error('Error copying code:', error)
      toast.error('Failed to copy code')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Squares2X2Icon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Layout Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import-export'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Import / Export
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Choose a Layout Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        currentLayout.id === template.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                      onClick={() => onApplyTemplate(template.id)}
                    >
                      {/* Template preview placeholder */}
                      <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                        <Squares2X2Icon className="h-12 w-12 text-slate-400" />
                      </div>
                      
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {template.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {template.config.widgets.length} widgets
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={onReset}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>Reset to Default Layout</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="space-y-6">
              {/* Share section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Share Layout
                </h3>
                <p className="text-slate-600 mb-4">
                  Generate a share code for your current layout.
                </p>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={shareExpiresInDays}
                      onChange={(e) => setShareExpiresInDays(Number(e.target.value))}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                    <label className="flex items-center space-x-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={shareIsPublic}
                        onChange={(e) => setShareIsPublic(e.target.checked)}
                      />
                      <span>Public</span>
                    </label>
                  </div>
                  <button
                    onClick={handleShareLayout}
                    disabled={shareLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    <span>{shareLoading ? 'Sharing...' : 'Share Layout'}</span>
                  </button>
                  {shareResult && (
                    <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Share code:</span>
                        <span className="font-mono text-slate-900">{shareResult.code}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Expires at:</span>
                        <span className="text-slate-900">
                          {new Date(shareResult.expiresAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="px-3 py-1 text-xs bg-slate-200 rounded-lg hover:bg-slate-300"
                      >
                        Copy code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Export section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Export Layout
                </h3>
                <p className="text-slate-600 mb-4">
                  Download your current layout configuration as a JSON file.
                </p>
                <button
                  onClick={onExport}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Export Current Layout</span>
                </button>
              </div>

              {/* Import section (file) */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Import Layout
                </h3>
                <p className="text-slate-600 mb-4">
                  Upload a previously exported layout configuration file.
                </p>
                <button
                  onClick={handleImportClick}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>Import Layout from File</span>
                </button>
              </div>

              {/* Import by code */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Import by Code
                </h3>
                <p className="text-slate-600 mb-4">
                  Enter a share code to import a layout.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="Enter share code"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleImportByCode}
                    disabled={importLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {importLoading ? 'Importing...' : 'Import'}
                  </button>
                </div>

                {importedLayout && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Layout name:</span>
                      <span className="text-slate-900">{importedLayout.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Widgets:</span>
                      <span className="text-slate-900">{importedLayout.widgets.length}</span>
                    </div>
                    <button
                      onClick={handleApplyImportedLayout}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Apply Layout
                    </button>
                  </div>
                )}
              </div>

              {/* Current layout info */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Current Layout Info
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Layout Name:</span>
                    <span className="font-medium text-slate-900">{currentLayout.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Widgets:</span>
                    <span className="font-medium text-slate-900">
                      {currentLayout.widgets.length} total ({currentLayout.widgets.filter(w => w.visible).length} visible)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Grid Columns:</span>
                    <span className="font-medium text-slate-900">{currentLayout.cols}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Draggable:</span>
                    <span className="font-medium text-slate-900">
                      {currentLayout.isDraggable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Resizable:</span>
                    <span className="font-medium text-slate-900">
                      {currentLayout.isResizable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
