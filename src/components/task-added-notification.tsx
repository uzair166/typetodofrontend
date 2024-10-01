'use client'

import { CheckCircle, X, Undo } from 'lucide-react'

interface TaskAddedNotificationProps {
  onClose: () => void
  onUndo: () => void
}

export function TaskAddedNotificationComponent({ onClose, onUndo }: TaskAddedNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Task Added</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Your task has been successfully added to the list.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onUndo}
            className="flex items-center space-x-1 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            <Undo className="w-4 h-4" />
            <span>Undo</span>
          </button>
        </div>
      </div>
      <div className="h-1 bg-violet-500 animate-shrink" />
    </div>
  )
}