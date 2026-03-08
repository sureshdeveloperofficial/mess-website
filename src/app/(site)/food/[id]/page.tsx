'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFullImageUrl } from '@/utils/image'
import { useParams, useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
import {
    format,
    addMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isBefore,
    startOfToday,
    differenceInDays,
    addDays,
    isWithinInterval,
    isToday
} from 'date-fns'
import { useMotionValue, useSpring } from 'framer-motion'

const MagneticButton = ({ children, onClick, className, disabled }: { children: React.ReactNode, onClick?: () => void, className?: string, disabled?: boolean }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springOptions = { stiffness: 150, damping: 15 }
    const springX = useSpring(x, springOptions)
    const springY = useSpring(y, springOptions)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!buttonRef.current || disabled) return
        const { clientX, clientY } = e
        const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2
        const distanceX = clientX - centerX
        const distanceY = clientY - centerY
        x.set(distanceX * 0.35)
        y.set(distanceY * 0.35)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={className}
        >
            {children}
        </motion.button>
    )
}

type FoodOption = {
    id: string
    name: string
    price: number
}

type FoodItem = {
    id: string
    name: string
    description: string | null
    price: number
    monthlyPrice: number | null
    image: string | null
    category: { name: string }
    options: FoodOption[]
}

const PREMIUM_IMAGES = [
    '/images/food/biryani_premium.png',
    '/images/food/parotta.png',
    '/images/food/appetizer.png',
    '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

export default function FoodSelectionPage() {
    const { id } = useParams()
    const router = useRouter()

    // Date Selection State
    const [range, setRange] = useState<{ start: Date | null, end: Date | null }>({
        start: null,
        end: null
    })
    const [hoverDate, setHoverDate] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))

    const { data: item, isLoading, error } = useQuery<FoodItem>({
        queryKey: ['food-item-select', id],
        queryFn: async () => {
            const response = await axios.get(`/api/food-items/${id}`)
            return response.data
        },
        enabled: !!id
    })

    const daysSelected = useMemo(() => {
        if (range.start && range.end) {
            const allDays = eachDayOfInterval({ start: range.start, end: range.end })
            return allDays.length
        }
        return 0
    }, [range])

    const totalPrice = useMemo(() => {
        if (!item || daysSelected === 0) return 0
        // Calculate based on monthly price if available, otherwise daily
        const dailyRate = item.monthlyPrice ? item.monthlyPrice / 25 : item.price
        return dailyRate * daysSelected
    }, [item, daysSelected])

    const handleDateClick = (date: Date) => {
        if (isBefore(date, startOfToday())) return

        if (!range.start || (range.start && range.end)) {
            setRange({ start: date, end: null })
        } else if (range.start && !range.end) {
            if (isBefore(date, range.start)) {
                setRange({ start: date, end: range.start })
            } else {
                setRange({ ...range, end: date })
            }
        }
    }

    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        // Adjust to start of week (Sunday)
        const startVisible = addDays(start, -start.getDay())
        const endVisible = addDays(end, 6 - end.getDay())

        return eachDayOfInterval({ start: startVisible, end: endVisible })
    }, [currentMonth])

    if (isLoading) return (
        <div className='min-h-screen pt-32 flex items-center justify-center bg-[#FFF9F5]'>
            <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
        </div>
    )

    if (error || !item) return (
        <div className='min-h-screen pt-32 flex flex-col items-center justify-center bg-[#FFF9F5]'>
            <h1 className='text-3xl font-black text-grey mb-6'>Dish Not Found</h1>
            <button onClick={() => router.back()} className='px-8 py-3 bg-primary text-white rounded-full font-black'>Back</button>
        </div>
    )

    return (
        <main className='min-h-screen pt-24 pb-32 bg-[#FFF9F5]'>
            <div className='container max-w-7xl mx-auto px-4'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-start'>

                    {/* Left Side: Premium Item View (5 cols) */}
                    <div className='lg:col-span-12 xl:col-span-5 space-y-8'>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='relative aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-6 md:border-12 border-white group'
                        >
                            <Image
                                src={getFullImageUrl(item.image) || PREMIUM_IMAGES[0]}
                                alt={item.name}
                                fill
                                className='object-cover transition-transform duration-[2s] group-hover:scale-110'
                            />
                            <div className='absolute inset-0 bg-linear-to-t from-grey/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>

                            <div className='absolute top-8 left-8 py-2 px-6 bg-white/90 backdrop-blur-xl rounded-full border border-white'>
                                <span className='text-[10px] font-black uppercase tracking-[0.3em] text-primary'>{item.category.name}</span>
                            </div>
                        </motion.div>

                        <div className='px-4 space-y-6'>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='text-5xl md:text-7xl font-black text-grey tracking-tighter leading-none'
                            >
                                {item.name.split(' ').map((word, i) => (
                                    <span key={i} className={i === 0 ? 'text-primary' : 'ml-2'}>{word}</span>
                                ))}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className='text-grey/50 text-xl font-medium italic leading-relaxed border-l-4 border-primary/20 pl-6'
                            >
                                "{item.description || "A masterfully crafted selection for the discerning palette."}"
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='flex items-center gap-8 py-8 border-y border-grey/5'
                            >
                                <div>
                                    <span className='text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-1'>Monthly Value</span>
                                    <p className='text-2xl font-black text-primary flex items-baseline gap-1'>
                                        <span className='text-xs opacity-50 font-black tracking-widest'>AED</span>
                                        {item.monthlyPrice?.toFixed(0) || (item.price * 25).toFixed(0)}
                                    </p>
                                </div>
                            </motion.div>

                            {item.options.length > 0 && (
                                <div className='pt-4 space-y-4'>
                                    <h4 className='text-xs font-black uppercase tracking-[0.2em] text-grey/30'>Customize Your Experience</h4>
                                    <div className='flex flex-wrap gap-3'>
                                        {item.options.map(opt => (
                                            <div key={opt.id} className='px-6 py-3 bg-white rounded-2xl border border-grey/5 flex items-center gap-3 hover:border-primary/30 transition-all cursor-pointer group shadow-sm'>
                                                <span className='text-sm font-bold text-grey group-hover:text-primary transition-colors'>{opt.name}</span>
                                                <div className='w-px h-4 bg-grey/10'></div>
                                                <span className='text-xs font-black text-primary'>+AED {opt.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Premium Calendar & Purchase (7 cols) */}
                    <div className='lg:col-span-12 xl:col-span-7 space-y-12'>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-white rounded-[4rem] p-8 md:p-12 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.05)] border border-white flex flex-col'
                        >
                            <div className='flex flex-col md:flex-row items-center justify-between mb-12 gap-8'>
                                <div>
                                    <h2 className='text-3xl font-black text-grey tracking-tight mb-2'>Select Your Dates</h2>
                                    <p className='text-grey/40 font-medium'>Choose a range to enjoy our authentic home flavors.</p>
                                </div>
                                <div className='flex items-center gap-4 bg-grey/5 p-2 rounded-3xl border border-grey/5'>
                                    <button
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                                        className='w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all'
                                    >
                                        <Icon icon='ion:chevron-back' />
                                    </button>
                                    <span className='px-6 font-black uppercase tracking-widest text-xs text-grey w-32 text-center'>
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </span>
                                    <button
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        className='w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all'
                                    >
                                        <Icon icon='ion:chevron-forward' />
                                    </button>
                                </div>
                            </div>

                            {/* Premium Calendar Grid */}
                            <div className='grid grid-cols-7 gap-2 md:gap-4 mb-12'>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className='text-center py-2'>
                                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-grey/20'>{day}</span>
                                    </div>
                                ))}
                                {calendarDays.map((date, i) => {
                                    const isSelected = (range.start && isSameDay(date, range.start)) || (range.end && isSameDay(date, range.end))
                                    const isInRange = range.start && range.end && isWithinInterval(date, { start: range.start, end: range.end })
                                    const isSunday = date.getDay() === 0
                                    const isDisabled = isBefore(date, startOfToday())
                                    const isTodayDate = isToday(date)
                                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()

                                    return (
                                        <div
                                            key={date.toString()}
                                            onClick={() => handleDateClick(date)}
                                            onMouseEnter={() => setHoverDate(date)}
                                            onMouseLeave={() => setHoverDate(null)}
                                            className={`
                                                relative h-12 md:h-16 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300
                                                ${isDisabled ? 'opacity-30 cursor-not-allowed bg-grey/5' : 'hover:scale-105'}
                                                ${isSelected ? 'bg-primary text-white shadow-lg z-10 opacity-100' : ''}
                                                ${isInRange && !isSelected ? 'bg-primary/10 text-primary' : ''}
                                                ${!isCurrentMonth && !isSelected && !isInRange ? 'opacity-10' : ''}
                                                ${!isSelected && !isInRange && !isDisabled ? 'hover:bg-grey/5' : ''}
                                            `}
                                        >
                                            <span className={`text-sm md:text-lg font-black ${isSelected ? 'scale-110' : ''}`}>
                                                {format(date, 'd')}
                                            </span>
                                            {isTodayDate && !isSelected && (
                                                <div className='absolute bottom-2 w-1.5 h-1.5 bg-primary rounded-full'></div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Premium Selection Summary Card */}
                            <div className='mt-10 relative group'>
                                <div className='absolute inset-0 bg-primary/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000'></div>
                                <div className='relative bg-white/60 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-8 xl:p-12 border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.03)] flex flex-col xl:flex-row items-stretch gap-8 xl:gap-10'>

                                    <div className='flex-1 flex flex-col sm:flex-row flex-wrap items-center justify-center xl:justify-start gap-8 md:gap-12'>
                                        <div className='flex items-center gap-4 sm:gap-5'>
                                            <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                                                <Icon icon='ion:calendar-number-outline' className='text-xl sm:text-2xl' />
                                            </div>
                                            <div className='min-w-0'>
                                                <span className='text-[9px] sm:text-[10px] font-black text-grey/30 uppercase tracking-[0.2em] block mb-1 truncate'>Subscription Period</span>
                                                <div className='flex items-baseline gap-2'>
                                                    <span className='text-2xl sm:text-3xl font-black text-grey leading-none'>{daysSelected}</span>
                                                    <span className='text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest'>Service Days</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='w-px h-12 bg-grey/5 hidden sm:block shrink-0'></div>

                                        <div className='flex items-center gap-4 sm:gap-5'>
                                            <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-grey/5 flex items-center justify-center text-grey/40 shrink-0'>
                                                <Icon icon='ion:time-outline' className='text-xl sm:text-2xl' />
                                            </div>
                                            <div className='min-w-0'>
                                                <span className='text-[9px] sm:text-[10px] font-black text-grey/30 uppercase tracking-[0.2em] block mb-1 truncate'>Service Cycle</span>
                                                <p className='text-xs sm:text-sm font-black text-grey tracking-wide uppercase flex items-center gap-2 sm:gap-3 whitespace-nowrap overflow-hidden'>
                                                    {range.start ? format(range.start, 'MMM dd') : 'Select Start'}
                                                    <Icon icon='ion:shuffle-outline' className='text-primary text-base sm:text-lg opacity-40 shrink-0' />
                                                    {range.end ? format(range.end, 'MMM dd') : 'Select End'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='relative w-full xl:w-64 overflow-hidden group/price flex shrink-0'>
                                        <div className='absolute inset-0 bg-[#2D2A26] rounded-4xl transform scale-100 group-hover/price:scale-[1.02] transition-transform duration-700'></div>
                                        <div className='relative z-10 w-full px-8 py-6 sm:px-10 sm:py-8 flex flex-col items-center justify-center text-center'>
                                            <p className='text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/30 mb-2 whitespace-nowrap'>Total Execution</p>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest'>AED</span>
                                                <span className='text-4xl sm:text-5xl font-black text-white tracking-tighter'>
                                                    {totalPrice.toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover/price:bg-primary/20 transition-colors'></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Final Action - Premium Checkout Button */}
                        <div className='pt-4'>
                            <MagneticButton
                                disabled={!range.start || !range.end}
                                className={`
                                    w-full py-10 rounded-[3rem] font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-6 relative overflow-hidden group
                                    ${range.start && range.end
                                        ? 'bg-primary text-grey shadow-primary/20 hover:shadow-primary/40'
                                        : 'bg-grey/5 text-grey/20 cursor-not-allowed shadow-none border border-black/5'
                                    }
                                `}
                            >
                                <span className='relative z-10 transition-transform duration-500 group-hover:scale-110'>Continue to Subscription</span>
                                <Icon icon='ion:chevron-forward-circle' className='relative z-10 text-3xl transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110' />

                                {range.start && range.end && (
                                    <>
                                        {/* Premium Shimmer & Glow */}
                                        <div className='absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out'></div>
                                        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-r from-transparent via-white/10 to-transparent transition-opacity duration-700'></div>
                                    </>
                                )}
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    )
}
