import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../utils'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className,
  placeholder = 'Select option'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "input input-sm flex items-center justify-between w-full min-w-[130px] bg-white text-left",
          isOpen && "border-primary-500 ring-2 ring-primary-500/20"
        )}
      >
        <span className={cn("block truncate", !selectedOption && "text-slate-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={cn("text-slate-400 ml-2 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 min-w-max bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <ul className="max-h-60 overflow-auto py-1 custom-scrollbar">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm transition-colors duration-150",
                    option.value === value 
                      ? "bg-primary-50/50 text-primary-700 font-medium" 
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.value === value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                      <Check size={14} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
