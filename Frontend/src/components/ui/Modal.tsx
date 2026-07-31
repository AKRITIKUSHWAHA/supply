import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const sizeClass = {
  sm:  'max-w-sm',
  md:  'max-w-lg',
  lg:  'max-w-2xl',
  xl:  'max-w-4xl',
  '2xl': 'max-w-6xl',
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal-panel w-full ${sizeClass[size]}`}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="btn-icon ml-4 flex-shrink-0">
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
