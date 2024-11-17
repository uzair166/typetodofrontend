import { CheckCircle, X, Undo, Info, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export type NotificationVariant = 'success' | 'info' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  variant: NotificationVariant
  onUndo?: () => void
}

const variantStyles = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    progressBar: 'bg-green-500'
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    progressBar: 'bg-blue-500'
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    progressBar: 'bg-red-500'
  }
} as const

const MAX_VISIBLE_NOTIFICATIONS = 2;

function SingleNotification({ 
  notification,
  onRemove 
}: { 
  notification: Notification
  onRemove: (id: string) => void 
}) {
  const [isExiting, setIsExiting] = useState(false)
  const { id, title, message, variant, onUndo } = notification

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, 4800)

    return () => clearTimeout(exitTimer)
  }, [])

  useEffect(() => {
    if (isExiting) {
      const removeTimer = setTimeout(() => {
        onRemove(id)
      }, 200)
      return () => clearTimeout(removeTimer)
    }
  }, [isExiting, id, onRemove])

  const handleClose = () => {
    setIsExiting(true)
  }

  const handleUndo = () => {
    if (onUndo) {
      onUndo()
      setIsExiting(true)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      onAnimationComplete={() => {
        if (isExiting) {
          onRemove(id)
        }
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {variantStyles[variant].icon}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {message}
        </p>
        {onUndo && (
          <div className="flex justify-end">
            <button
              onClick={handleUndo}
              className="flex items-center space-x-1 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
            >
              <Undo className="w-4 h-4" />
              <span>Undo</span>
            </button>
          </div>
        )}
      </div>
      <motion.div 
        className={`h-1 ${variantStyles[variant].progressBar}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  )
}

function NotificationCounter({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center"
    >
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        +{count} more notification{count !== 1 ? 's' : ''}
      </span>
    </motion.div>
  );
}

export function NotificationContainer({ 
  notifications,
  onClose 
}: { 
  notifications: Notification[]
  onClose: (id: string) => void 
}) {
  const visibleNotifications = notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
  const remainingCount = Math.max(0, notifications.length - MAX_VISIBLE_NOTIFICATIONS);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleNotifications.map((notification) => (
          <SingleNotification
            key={notification.id}
            notification={notification}
            onRemove={onClose}
          />
        ))}
        {remainingCount > 0 && (
          <NotificationCounter key="counter" count={remainingCount} />
        )}
      </AnimatePresence>
    </div>
  );
}