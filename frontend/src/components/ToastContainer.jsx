import { motion, AnimatePresence } from 'framer-motion'
import '../styles/components/Toast.css'

const Toast = ({ message, type, onRemove }) => {
    return (
        <motion.div
            className={`toast toast-${type}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
            <div className="toast-content">
                {type === 'success' && (
                    <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
                <span>{message}</span>
            </div>
            <button className="toast-close" onClick={onRemove} aria-label="Close">
                ×
            </button>
        </motion.div>
    )
}

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default ToastContainer
