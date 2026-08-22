'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

interface StatusToggleProps {
    isActive: boolean
    onToggle: (newStatus: boolean) => void
    isLoading?: boolean
    disabled?: boolean
    showLabel?: boolean
    activeLabel?: string
    inactiveLabel?: string
    size?: 'sm' | 'md'
}

export function StatusToggle({
    isActive,
    onToggle,
    isLoading = false,
    disabled = false,
    showLabel = true,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
    size = 'sm',
}: StatusToggleProps) {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled || isLoading) return
        onToggle(!isActive)
    }

    return (
        <div className='inline-flex items-center gap-2 select-none'>
            <button
                type='button'
                role='switch'
                aria-checked={isActive}
                disabled={disabled || isLoading}
                onClick={handleToggle}
                className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    size === 'sm' ? 'w-11 h-6' : 'w-13 h-7'
                } ${isActive ? 'bg-green-500' : 'bg-grey/25'}`}
                title={isActive ? 'Click to deactivate' : 'Click to activate'}
            >
                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`bg-white rounded-full shadow-md flex items-center justify-center ${
                        size === 'sm' ? 'w-4.5 h-4.5 mx-0.5' : 'w-5.5 h-5.5 mx-0.5'
                    } ${isActive ? 'translate-x-5 text-green-600' : 'translate-x-0 text-grey-muted'}`}
                >
                    {isLoading ? (
                        <Icon icon='line-md:loading-loop' className='text-[10px] animate-spin' />
                    ) : isActive ? (
                        <Icon icon='solar:check-read-bold' className='text-[10px]' />
                    ) : (
                        <Icon icon='solar:close-circle-bold' className='text-[10px]' />
                    )}
                </motion.div>
            </button>

            {showLabel && (
                <span
                    onClick={handleToggle}
                    className={`text-xs font-bold transition-colors cursor-pointer ${
                        isActive ? 'text-green-700' : 'text-grey-muted'
                    }`}
                >
                    {isActive ? activeLabel : inactiveLabel}
                </span>
            )}
        </div>
    )
}
