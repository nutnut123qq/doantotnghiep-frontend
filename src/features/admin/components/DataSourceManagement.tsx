import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { dataSourceService } from '../services/dataSourceService'
import type { DataSource, DataSourceType } from '@/shared/types/dataSourceTypes'
import {
  DATA_SOURCE_TYPE_LABELS,
  CONNECTION_STATUS_LABELS,
  CONNECTION_STATUS_COLORS,
  ConnectionStatus,
} from '@/shared/types/dataSourceTypes'

export function DataSourceManagement() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    try {
      setIsLoading(true)
      const sources = await dataSourceService.getAll()
      setDataSources(sources)
    } catch (error) {
      console.error('Error loading data sources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id)
      await dataSourceService.testConnection(id)
      await loadDataSources() // Reload to get updated status
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Failed to test connection')
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) {
      return
    }

    try {
      await dataSourceService.delete(id)
      await loadDataSources()
    } catch (error) {
      console.error('Error deleting data source:', error)
      alert('Failed to delete data source')
    }
  }

  const handleToggleActive = async (source: DataSource) => {
    try {
      await dataSourceService.update(source.id, { isActive: !source.isActive })
      await loadDataSources()
    } catch (error) {
      console.error('Error updating data source:', error)
      alert('Failed to update data source')
    }
  }

  const groupedSources = dataSources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = []
    }
    acc[source.type].push(source)
    return acc
  }, {} as Record<DataSourceType, DataSource[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Configuration</h2>
          <p className="text-sm text-slate-600 mt-1">Manage data sources for News, Stock, Financial Reports, and Events</p>
        </div>
        <button
          onClick={() => {
            setEditingSource(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Data Source</span>
        </button>
      </div>

      {Object.entries(groupedSources).map(([type, sources]) => (
        <div key={type} className="bg-white rounded-lg shadow border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">
              {DATA_SOURCE_TYPE_LABELS[Number(type) as DataSourceType]} Sources
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {sources.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                No data sources configured
              </div>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-semibold text-slate-900">{source.name}</h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            CONNECTION_STATUS_COLORS[source.status]
                          }`}
                        >
                          {source.status === ConnectionStatus.Connected ? (
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircleIcon className="h-3 w-3 mr-1" />
                          )}
                          {CONNECTION_STATUS_LABELS[source.status]}
                        </span>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={source.isActive}
                            onChange={() => handleToggleActive(source)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-600">Active</span>
                        </label>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{source.url}</p>
                      {source.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{source.errorMessage}</p>
                      )}
                      {source.lastChecked && (
                        <p className="text-xs text-slate-500 mt-1">
                          Last checked: {new Date(source.lastChecked).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestConnection(source.id)}
                        disabled={testingId === source.id}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {testingId === source.id ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSource(source)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <DataSourceModal
          source={editingSource}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSource(null)
          }}
          onSave={async () => {
            await loadDataSources()
            setIsModalOpen(false)
            setEditingSource(null)
          }}
        />
      )}
    </div>
  )
}

interface DataSourceModalProps {
  source: DataSource | null
  onClose: () => void
  onSave: () => void
}

function DataSourceModal({ source, onSave, onClose }: DataSourceModalProps) {
  const [formData, setFormData] = useState({
    name: source?.name || '',
    type: source?.type || 1,
    url: source?.url || '',
    apiKey: source?.apiKey || '',
    isActive: source?.isActive ?? true,
    config: source?.config || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      if (source) {
        await dataSourceService.update(source.id, formData)
      } else {
        await dataSourceService.create(formData)
      }
      onSave()
    } catch (error) {
      console.error('Error saving data source:', error)
      alert('Failed to save data source')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {source ? 'Edit Data Source' : 'Add Data Source'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>News</option>
                <option value={2}>Stock</option>
                <option value={3}>Financial Report</option>
                <option value={4}>Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">API Key (Optional)</label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

