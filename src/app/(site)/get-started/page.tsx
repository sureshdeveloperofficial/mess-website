'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { getFullImageUrl } from '@/utils/image'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    monthlyPrice?: number
}

type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    availableDays: string[]
    foodItems: FoodItem[]
}

export default function GetStartedPage() {
    const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([])
    // State: menuId -> { dayName: itemId }
    const [selectedItemIds, setSelectedItemIds] = useState<Record<string, Record<string, string>>>({})

    const { data: menus = [], isLoading } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-menu'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu')
            return response.data
        },
    })

    const regularMenus = menus.filter(m => !m.availableDays.includes('Sunday') || m.availableDays.length > 1)
    const sundayMenus = menus.filter(m => m.availableDays.includes('Sunday') && m.availableDays.length === 1)

    const toggleMenu = (menuId: string) => {
        setSelectedMenuIds(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        )
    }

    const setItemForDay = (menuId: string, day: string, itemId: string) => {
        setSelectedItemIds(prev => ({
            ...prev,
            [menuId]: {
                ...(prev[menuId] || {}),
                [day]: itemId
            }
        }))
    }

    const copyToAllDays = (menuId: string, itemId: string) => {
        const menu = menus.find(m => m.id === menuId)
        if (!menu) return

        const newDaySelections: Record<string, string> = {}
        menu.availableDays.forEach(day => {
            newDaySelections[day] = itemId
        })

        setSelectedItemIds(prev => ({
            ...prev,
            [menuId]: newDaySelections
        }))
    }

    const calculateMenuTotal = (menuId: string) => {
        const menu = menus.find(m => m.id === menuId)
        if (!menu) return 0
        const daySelections = selectedItemIds[menuId] || {}
        return Object.values(daySelections).reduce((acc, itemId) => {
            const item = menu.foodItems.find(i => i.id === itemId)
            return acc + (item?.price || 0) * 25 // Monthly estimate: daily price * ~avg days in month
        }, 0)
    }

    const totalPrice = useMemo(() => {
        return selectedMenuIds.reduce((acc, id) => {
            return acc + calculateMenuTotal(id)
        }, 0)
    }, [selectedMenuIds, selectedItemIds, menus])

    if (isLoading) return (
        <div className='min-h-screen flex items-center justify-center bg-[#FFFBF7]'>
            <div className='relative'>
                <div className='w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                    <Icon icon="ion:fast-food" className="text-primary text-2xl animate-pulse" />
                </div>
            </div>
        </div>
    )

    return (
        <main className='min-h-screen pt-32 pb-48 bg-[#FFFBF7] overflow-x-hidden selection:bg-primary/20'>
            {/* Header Section */}
            <div className='container max-w-7xl mx-auto px-6 mb-16'>
                <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
                    <div className='max-w-2xl text-left'>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='flex items-center gap-3 mb-6'
                        >
                            <span className='h-px w-10 bg-primary/40'></span>
                            <span className='text-primary text-sm font-black tracking-[0.4em] uppercase'>Custom Subscription</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='text-6xl md:text-8xl font-black text-grey tracking-tighter leading-none mb-8'
                        >
                            Weekly <span className='text-primary italic relative'>
                                Board
                                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                                </svg>
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className='text-grey/50 text-xl font-medium leading-relaxed'
                        >
                            Tailor your taste. Select your package, pick your daily dishes, and enjoy the convenience of automated home-style mess.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='bg-white p-8 rounded-[2.5rem] border border-grey/5 shadow-2xl shadow-grey/5 hidden lg:block'
                    >
                        <div className='flex items-center gap-6'>
                            <div className='w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                                <Icon icon="ion:calendar-outline" className="text-2xl" />
                            </div>
                            <div>
                                <p className='text-xs font-black text-grey/40 uppercase tracking-widest mb-1'>Billing Cycle</p>
                                <p className='text-grey font-bold'>Monthly Subscription</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Horizontal Board */}
            <div className='max-w-[100vw] overflow-x-auto pb-10 custom-scrollbar'>
                <div className='min-w-[1300px] px-8 space-y-16'>

                    {/* Regular Menus */}
                    <div className='space-y-10'>
                        <SectionHeader title="Weekly Packages" subtitle="Monday to Saturday" />

                        {regularMenus.map((menu, idx) => (
                            <MenuHorizontalStrip
                                key={menu.id}
                                menu={menu}
                                isSelected={selectedMenuIds.includes(menu.id)}
                                onToggle={() => toggleMenu(menu.id)}
                                selectedDayItems={selectedItemIds[menu.id] || {}}
                                onSetItemForDay={(day, itemId) => setItemForDay(menu.id, day, itemId)}
                                onCopyAll={(itemId) => copyToAllDays(menu.id, itemId)}
                                index={idx}
                            />
                        ))}
                    </div>

                    {/* Sunday Specials */}
                    {sundayMenus.length > 0 && (
                        <div className='space-y-10'>
                            <SectionHeader title="Sunday Gems" subtitle="Exclusive Signatures" isSpecial />

                            {sundayMenus.map((menu, idx) => (
                                <MenuHorizontalStrip
                                    key={menu.id}
                                    menu={menu}
                                    isSelected={selectedMenuIds.includes(menu.id)}
                                    onToggle={() => toggleMenu(menu.id)}
                                    selectedDayItems={selectedItemIds[menu.id] || {}}
                                    onSetItemForDay={(day, itemId) => setItemForDay(menu.id, day, itemId)}
                                    onCopyAll={(itemId) => copyToAllDays(menu.id, itemId)}
                                    index={idx}
                                    isSpecial
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Checkout Bar */}
            <AnimatePresence>
                {selectedMenuIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className='fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-50'
                    >
                        <div className='bg-grey/95 backdrop-blur-3xl rounded-[3.5rem] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8'>
                            <div className='flex items-center gap-10 px-6'>
                                <div className='hidden sm:flex items-center gap-4'>
                                    <div className='w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-grey'>
                                        <Icon icon="ion:cart" className="text-xl" />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black text-white/40 uppercase tracking-[0.2em]'>Selection</p>
                                        <p className='text-white font-bold'>{selectedMenuIds.length} Packages</p>
                                    </div>
                                </div>
                                <div className='h-10 w-px bg-white/10 hidden sm:block'></div>
                                <div>
                                    <span className='text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-1'>Monthly Total</span>
                                    <p className='text-white font-black text-3xl tracking-tighter'>
                                        ₹ {totalPrice.toLocaleString()} <span className='text-sm text-white/40 font-medium'>/mo</span>
                                    </p>
                                </div>
                            </div>

                            <button className='w-full md:w-auto px-12 py-6 bg-primary text-grey rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-4 group'>
                                Finalize Order
                                <Icon icon='ion:arrow-forward' className='group-hover:translate-x-2 transition-transform' />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

function SectionHeader({ title, subtitle, isSpecial }: { title: string, subtitle: string, isSpecial?: boolean }) {
    return (
        <div className='flex items-center gap-6'>
            <div className='flex-col'>
                <h2 className={`text-sm font-black uppercase tracking-[0.6em] whitespace-nowrap ${isSpecial ? 'text-primary' : 'text-grey/30'}`}>{title}</h2>
                <p className='text-[10px] font-bold text-grey/20 uppercase tracking-[0.4em] mt-1'>{subtitle}</p>
            </div>
            <div className={`h-px grow ${isSpecial ? 'bg-primary/20' : 'bg-grey/5'}`}></div>
        </div>
    )
}

function MenuHorizontalStrip({
    menu,
    isSelected,
    onToggle,
    selectedDayItems,
    onSetItemForDay,
    onCopyAll,
    index,
    isSpecial
}: {
    menu: FoodMenu,
    isSelected: boolean,
    onToggle: () => void,
    selectedDayItems: Record<string, string>,
    onSetItemForDay: (day: string, itemId: string) => void,
    onCopyAll: (itemId: string) => void,
    index: number,
    isSpecial?: boolean
}) {
    const [selectingDay, setSelectingDay] = useState<string | null>(null)

    const menuPriceTotal = Object.values(selectedDayItems).reduce((acc, itemId) => {
        if (!itemId) return acc
        const item = menu.foodItems.find(i => i.id === itemId)
        return acc + (item?.price || 0) * 25
    }, 0)

    const hasSelections = Object.values(selectedDayItems).some(id => !!id)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
                flex flex-col md:flex-row bg-white rounded-[4rem] overflow-hidden transition-all duration-500 border-2
                ${isSelected
                    ? (isSpecial ? 'border-primary ring-4 ring-primary/5 shadow-2xl shadow-primary/10' : 'border-grey ring-4 ring-grey/5 shadow-2xl shadow-grey/5')
                    : 'border-grey/10 border-dashed opacity-90 hover:opacity-100 hover:border-primary/40'}
            `}
        >
            {/* Left Box: Menu Title + Selection-based Pricing */}
            <div
                onClick={onToggle}
                className={`
                    w-full md:w-1/4 p-10 flex flex-col justify-center cursor-pointer transition-all border-r border-grey/5
                    ${isSelected ? (isSpecial ? 'bg-primary/5' : 'bg-grey/5') : 'bg-white'}
                `}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all ${isSelected ? (isSpecial ? 'bg-primary text-grey' : 'bg-grey text-white') : 'bg-[#FFF9F5] text-grey/20'}`}>
                    <Icon icon={isSelected ? 'ion:checkmark-done' : 'ion:add'} className='text-2xl' />
                </div>
                <h3 className='text-4xl font-black text-grey tracking-tighter mb-2 capitalize'>{menu.name}</h3>
                <p className='text-[10px] font-bold text-grey/30 uppercase tracking-[0.3em] leading-relaxed mb-8'>
                    {menu.name} selection based on chosen flavors.
                </p>
                <div>
                    {hasSelections ? (
                        <div className='flex items-baseline gap-2'>
                            <span className='text-4xl font-black text-grey tracking-tighter'>₹ {menuPriceTotal.toLocaleString()}</span>
                            <span className='text-[10px] font-black text-grey/20 uppercase tracking-widest'>/ Month</span>
                        </div>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 rounded-full bg-primary animate-pulse' />
                            <p className='text-primary text-[10px] font-black uppercase tracking-widest'>Pick your dishes</p>
                        </div>
                    )}
                    <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20'>
                        <Icon icon='ion:flash' className='text-primary text-[10px]' />
                        <span className='text-[9px] font-black text-primary uppercase tracking-widest'>Selection Total</span>
                    </div>
                </div>
            </div>

            {/* Middle: Horizontal Days */}
            <div className={`flex flex-1 p-10 gap-8 overflow-x-auto custom-scrollbar transition-all duration-700 ${isSelected ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                {menu.availableDays.map(day => (
                    <motion.div
                        key={day}
                        onClick={() => setSelectingDay(day)}
                        whileHover={{ y: -5 }}
                        className={`
                            flex-1 min-w-[200px] p-2 rounded-[3.5rem] border-2 transition-all cursor-pointer group relative flex flex-col items-center
                            ${selectedDayItems[day]
                                ? (isSpecial ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' : 'bg-grey/5 border-grey shadow-xl shadow-grey/5')
                                : 'bg-grey/5 border-transparent hover:bg-white hover:border-primary/20'}
                            ${selectingDay === day ? 'ring-2 ring-primary ring-offset-8' : ''}
                        `}
                    >
                        <div className='w-full text-center pt-6 pb-4'>
                            <span className='text-[10px] font-black uppercase tracking-[0.3em] text-grey/20 group-hover:text-primary/40 transition-colors uppercase'>{day.substring(0, 3)}</span>
                        </div>

                        <div className='flex-1 w-full flex flex-col items-center justify-center p-4 relative group/card'>
                            {selectedDayItems[day] ? (
                                <>
                                    {/* Quick Clear Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSetItemForDay(day, '') }}
                                        className='absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all z-10 hover:scale-110 shadow-lg'
                                        title="Clear selection"
                                    >
                                        <Icon icon="ion:trash-outline" />
                                    </button>

                                    <div className='relative w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-white shadow-inner group-hover/card:scale-110 transition-transform duration-500'>
                                        <Image
                                            src={getFullImageUrl(menu.foodItems.find(i => i.id === selectedDayItems[day])?.image) || '/images/food/appetizer.png'}
                                            alt="dish"
                                            fill
                                            className='object-cover'
                                        />
                                    </div>
                                    <p className='text-sm font-black text-grey text-center leading-tight mb-2 px-2 h-10 flex items-center justify-center'>
                                        {menu.foodItems.find(i => i.id === selectedDayItems[day])?.name}
                                    </p>
                                    <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-grey shadow-lg shadow-primary/30'>
                                        <Icon icon='ion:checkmark' className='text-sm' />
                                    </div>
                                </>
                            ) : (
                                <div className='flex flex-col items-center gap-4'>
                                    <div className='w-20 h-20 rounded-full border-2 border-dashed border-grey/10 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all'>
                                        <Icon icon='ion:restaurant-outline' className='text-2xl text-grey/10 group-hover:text-primary transition-colors' />
                                    </div>
                                    <span className='text-[9px] font-black text-grey/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors'>Set Flavor</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Selection Overlay Popover */}
            <AnimatePresence>
                {selectingDay && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className='fixed inset-0 z-[100] bg-grey/40 flex items-center justify-center p-6 md:p-12'
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className='w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-[4rem] shadow-[0_100px_100px_-50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20'
                        >
                            <div className='flex items-center justify-between p-12 border-b border-grey/5 bg-linear-to-b from-[#FFFBF7] to-white'>
                                <div className='flex items-center gap-10'>
                                    <button
                                        onClick={() => setSelectingDay(null)}
                                        className='w-20 h-20 rounded-[2.5rem] bg-white border border-grey/10 flex items-center justify-center hover:bg-grey hover:text-white transition-all shadow-xl group'
                                    >
                                        <Icon icon='ion:close' className='text-3xl transition-transform group-hover:rotate-90' />
                                    </button>
                                    <div>
                                        <div className='flex items-center gap-4 mb-2'>
                                            <span className='px-4 py-1 bg-primary text-grey text-[10px] font-black uppercase tracking-widest rounded-full'>{selectingDay}</span>
                                            <h4 className='text-4xl font-black text-grey tracking-tighter capitalize'>{menu.name}</h4>
                                        </div>
                                        <p className='text-sm font-bold text-grey/40 uppercase tracking-[0.4em]'>Choose your signature signature flavor</p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-4'>
                                    {selectedDayItems[selectingDay] && (
                                        <button
                                            onClick={() => { onSetItemForDay(selectingDay, ''); setSelectingDay(null) }}
                                            className='px-10 py-6 bg-red-50 text-red-500 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 border border-red-100'
                                        >
                                            <Icon icon='ion:trash-outline' className='text-xl' /> Clear Selection
                                        </button>
                                    )}
                                    {selectedDayItems[selectingDay] && !isSpecial && (
                                        <button
                                            onClick={() => { onCopyAll(selectedDayItems[selectingDay]); setSelectingDay(null) }}
                                            className='px-12 py-6 bg-grey text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-grey shadow-2xl transition-all flex items-center gap-4 group'
                                        >
                                            <Icon icon='ion:copy-outline' className='text-2xl group-hover:scale-110 transition-transform' />
                                            Apply to All Days
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className='flex-1 overflow-y-auto custom-scrollbar p-12 bg-white'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10'>
                                    {menu.foodItems.map(item => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => { onSetItemForDay(selectingDay, item.id); setSelectingDay(null) }}
                                            className={`
                                                group relative p-10 rounded-[4rem] border-2 transition-all cursor-pointer flex flex-col items-center text-center
                                                ${selectedDayItems[selectingDay] === item.id
                                                    ? 'bg-primary border-primary shadow-[0_30px_60px_-15px_rgba(250,203,21,0.5)]'
                                                    : 'bg-[#FFFBF7] border-transparent hover:bg-white hover:border-primary/40 hover:shadow-2xl'}
                                            `}
                                        >
                                            <div className='relative w-40 h-40 mb-10 rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white group-hover:-rotate-3 transition-all duration-700'>
                                                <Image
                                                    src={getFullImageUrl(item.image) || '/images/food/appetizer.png'}
                                                    alt={item.name}
                                                    fill
                                                    className='object-cover transform group-hover:scale-110 transition-transform duration-1000'
                                                />
                                            </div>

                                            <div className='flex-1 w-full space-y-4 mb-8'>
                                                <h5 className={`text-2xl font-black leading-tight tracking-tight transition-colors ${selectedDayItems[selectingDay] === item.id ? 'text-grey' : 'text-grey group-hover:text-primary'}`}>
                                                    {item.name}
                                                </h5>

                                                <div className='flex flex-col gap-3'>
                                                    {/* Price Badge */}
                                                    <div className={`px-4 py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDayItems[selectingDay] === item.id ? 'bg-white/20' : 'bg-primary/10'}`}>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedDayItems[selectingDay] === item.id ? 'text-grey/60' : 'text-grey/40'}`}>Monthly Rate</span>
                                                        <span className={`text-xl font-black ${selectedDayItems[selectingDay] === item.id ? 'text-grey' : 'text-primary'}`}>₹{item.monthlyPrice || (item.price * 25).toLocaleString()}</span>
                                                    </div>

                                                    {/* Daily Indicator */}
                                                    <div className={`text-xs font-bold flex items-center justify-center gap-1.5 ${selectedDayItems[selectingDay] === item.id ? 'text-grey/70' : 'text-grey/60'}`}>
                                                        <Icon icon="ion:flash" className="text-primary text-sm" />
                                                        ₹{item.price} <span className="text-[10px] font-medium uppercase tracking-tighter italic">per day equiv.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${selectedDayItems[selectingDay] === item.id ? 'bg-white border-white text-primary' : 'bg-grey/10 border-transparent text-transparent group-hover:bg-primary group-hover:text-grey group-hover:border-primary'}`}>
                                                <Icon icon='ion:checkmark' className='text-2xl' />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
