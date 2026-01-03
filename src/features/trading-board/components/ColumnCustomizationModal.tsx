import { useState, useEffect } from 'react'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type {
  ColumnId,
  TradingBoardColumnPreferences,
} from '../types/columnTypes'
import {
  COLUMN_DEFINITIONS as COL_DEFS,
  DEFAULT_COLUMN_ORDER as DEFAULT_ORDER,
} from '../types/columnTypes'
import { columnPreferencesService } from '../services/columnPreferencesService'

interface ColumnCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preferences: TradingBoardColumnPreferences) => void
}

interface SortableColumnItemProps {
  id: ColumnId
  label: string
  visible: boolean
  onToggle: (id: ColumnId) => void
}

const SortableColumnItem = ({ id, label, visible, onToggle }: SortableColumnItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-white border rounded-lg mb-2 ${
        isDragging ? 'shadow-lg' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <label className="flex items-center space-x-2 flex-1 cursor-pointer">
          <input
            type="checkbox"
            checked={visible}
            onChange={() => onToggle(id)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </label>
      </div>
    </div>
  )
}

export const ColumnCustomizationModal = ({
  isOpen,
  onClose,
  onSave,
}: ColumnCustomizationModalProps) => {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_ORDER)
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(
    new Set(DEFAULT_ORDER)
  )
  const [isLoading, setIsLoading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isOpen) {
      loadPreferences()
    }
  }, [isOpen])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      const preferences = await columnPreferencesService.getColumnPreferences()
      setColumnOrder(preferences.columnOrder || DEFAULT_ORDER)
      setVisibleColumns(new Set(preferences.visibleColumns || DEFAULT_ORDER))
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as ColumnId)
        const newIndex = items.indexOf(over.id as ColumnId)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleToggleColumn = (id: ColumnId) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const preferences: TradingBoardColumnPreferences = {
        visibleColumns: Array.from(visibleColumns),
        columnOrder: columnOrder,
      }
      await columnPreferencesService.saveColumnPreferences(preferences)
      onSave(preferences)
      onClose()
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save column preferences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setColumnOrder([...DEFAULT_ORDER])
    setVisibleColumns(new Set(DEFAULT_ORDER))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Customize Columns</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <p className="text-sm text-slate-600 mb-4">
            Drag and drop to reorder columns. Check/uncheck to show or hide columns.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columnOrder}
                strategy={verticalListSortingStrategy}
              >
                {columnOrder.map((columnId) => (
                  <SortableColumnItem
                    key={columnId}
                    id={columnId}
                    label={COL_DEFS[columnId].label}
                    visible={visibleColumns.has(columnId)}
                    onToggle={handleToggleColumn}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

