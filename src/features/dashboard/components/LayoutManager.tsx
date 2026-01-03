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

interface LayoutManagerProps {
  currentLayout: LayoutConfig
  onApplyTemplate: (templateId: string) => void
  onReset: () => void
  onExport: () => void
  onImport: (file: File) => void
  onClose: () => void
}

export const LayoutManager = ({
  currentLayout,
  onApplyTemplate,
  onReset,
  onExport,
  onImport,
  onClose,
}: LayoutManagerProps) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'import-export'>('templates')

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

              {/* Import section */}
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
