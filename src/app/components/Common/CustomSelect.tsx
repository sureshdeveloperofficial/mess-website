'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

export interface SelectOption {
    value: string
    label: string
    icon?: string
    dotColor?: string
    badgeStyle?: string
    description?: string
}

export interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    labelPrefix?: string
    placeholder?: string
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
    menuPlacement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export default function CustomSelect({
    value,
    onChange,
    options,
    labelPrefix = '',
    placeholder = 'Select an option...',
    disabled = false,
    size = 'sm',
    className = '',
    menuPlacement = 'bottom-right',
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const selectedOption = options.find((opt) => opt.value === value)

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-xl gap-2',
        md: 'px-4 py-2 text-sm rounded-xl gap-2.5',
        lg: 'px-5 py-2.5 text-base rounded-2xl gap-3',
    }

    const placementClasses = {
        'bottom-left': 'top-full left-0 mt-1.5 origin-top-left',
        'bottom-right': 'top-full right-0 mt-1.5 origin-top-right',
        'top-left': 'bottom-full left-0 mb-1.5 origin-bottom-left',
        'top-right': 'bottom-full right-0 mb-1.5 origin-bottom-right',
    }

    return (
        <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
            {/* Trigger Button */}
            <button
                type='button'
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center justify-between border transition-all cursor-pointer select-none font-semibold ${
                    sizeClasses[size]
                } ${
                    isOpen
                        ? 'bg-white border-primary ring-2 ring-primary/20 shadow-xs text-grey-dark'
                        : 'bg-white hover:bg-grey/5 border-grey/20 text-grey-dark hover:border-grey/30'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className='flex items-center gap-1.5 min-w-0 truncate'>
                    {selectedOption?.dotColor && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotColor}`} />
                    )}
                    {selectedOption?.icon && (
                        <Icon icon={selectedOption.icon} className='text-sm shrink-0 text-grey-muted' />
                    )}
                    <span className='truncate'>
                        {labelPrefix && <span className='text-grey-muted font-medium'>{labelPrefix}</span>}
                        <span>{selectedOption ? selectedOption.label : placeholder}</span>
                    </span>
                </div>

                <Icon
                    icon='solar:alt-arrow-down-bold'
                    className={`text-xs text-grey-muted transition-transform duration-200 shrink-0 ml-1 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                />
            </button>

            {/* Floating Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: menuPlacement.startsWith('top') ? 6 : -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: menuPlacement.startsWith('top') ? 6 : -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute z-50 min-w-[180px] w-max max-w-[280px] bg-white rounded-2xl shadow-xl border border-grey/10 py-1.5 overflow-hidden backdrop-blur-md ${
                            placementClasses[menuPlacement]
                        }`}
                    >
                        <div className='max-h-60 overflow-y-auto p-1 space-y-0.5'>
                            {options.map((option) => {
                                const isSelected = option.value === value

                                return (
                                    <button
                                        key={option.value}
                                        type='button'
                                        onClick={() => {
                                            onChange(option.value)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                                            isSelected
                                                ? 'bg-primary/10 text-grey-dark font-bold'
                                                : 'text-grey-dark hover:bg-grey/5'
                                        }`}
                                    >
                                        <div className='flex items-center gap-2 min-w-0'>
                                            {option.dotColor && (
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${option.dotColor}`} />
                                            )}
                                            {option.icon && (
                                                <Icon icon={option.icon} className='text-sm shrink-0 text-grey-muted' />
                                            )}
                                            <div className='min-w-0'>
                                                <span className='block truncate'>{option.label}</span>
                                                {option.description && (
                                                    <span className='block text-[10px] text-grey-muted font-normal truncate'>
                                                        {option.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <Icon icon='solar:check-read-bold' className='text-primary text-sm shrink-0' />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
