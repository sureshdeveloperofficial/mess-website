'use client'

import React, { useState, useMemo, useRef } from 'react'
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

    if (isLoading) return (
        <div className='min-h-screen flex items-center justify-center bg-[#FFF9F5] pt-20'>
            <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
        </div>
    )

    return (
        <main className='min-h-screen pt-32 pb-40 bg-[#FFF9F5] overflow-x-hidden'>
            <div className='container max-w-7xl mx-auto px-4 mb-20'>
                <div className='text-center'>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-primary text-sm font-black mb-4 tracking-[0.5em] uppercase'
                    >
                        Master Planning
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='text-5xl md:text-7xl font-black text-grey tracking-tighter leading-none mb-6'
                    >
                        Weekly <span className='text-primary italic'>Menu Board</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-grey/40 max-w-2xl mx-auto text-xl font-medium italic'
                    >
                        "Customize your entire week horizontally. Pick a menu and set your daily flavors
                        with the warmth of home-style cooking."
                    </motion.p>
                </div>
            </div>

            {/* Horizontal Board */}
            <div className='max-w-[100vw] overflow-x-auto pb-20 custom-scrollbar'>
                <div className='min-w-[1200px] px-8 space-y-12 pb-10'>

                    {/* Regular Menus */}
                    <div className='space-y-8'>
                        <div className='flex items-center gap-4'>
                            <h2 className='text-xs font-black uppercase tracking-[0.5em] text-grey/30 whitespace-nowrap shrink-0'>Regular Packages (Mon-Sat)</h2>
                            <div className='h-px grow bg-grey/5'></div>
                        </div>

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
                        <div className='space-y-8'>
                            <div className='flex items-center gap-4'>
                                <h2 className='text-xs font-black uppercase tracking-[0.5em] text-primary/40 whitespace-nowrap shrink-0'>Sunday Signatures</h2>
                                <div className='h-px grow bg-primary/10'></div>
                            </div>

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
                        className='fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50'
                    >
                        <div className='bg-grey/95 backdrop-blur-2xl rounded-[3rem] p-6 shadow-2xl shadow-primary/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6'>
                            <div className='flex items-center gap-8 px-6'>
                                <div>
                                    <span className='text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1'>Packages Selected</span>
                                    <p className='text-white font-bold text-lg'>
                                        {selectedMenuIds.length} Weekly Sets Saved
                                    </p>
                                </div>
                            </div>

                            <button className='w-full md:w-auto px-12 py-5 bg-primary text-grey rounded-3xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 group'>
                                Confirm Subscription
                                <Icon icon='ion:arrow-forward' className='group-hover:translate-x-2 transition-transform' />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
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
    const containerRef = useRef<HTMLDivElement>(null)

    const allDaysCompleted = menu.availableDays.every(day => !!selectedDayItems[day])

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
                flex items-stretch bg-white rounded-[3rem] overflow-hidden transition-all duration-700 border-2 relative
                ${isSelected
                    ? (isSpecial ? 'border-primary shadow-2xl shadow-primary/10' : 'border-grey shadow-2xl shadow-grey/5')
                    : 'border-grey/5 opacity-80 hover:opacity-100 hover:border-primary/20'}
            `}
        >
            {/* Left Box: Menu Title */}
            <div
                onClick={onToggle}
                className={`
                    w-80 p-10 flex flex-col justify-center cursor-pointer transition-colors border-r border-grey/5
                    ${isSelected ? (isSpecial ? 'bg-primary/5' : 'bg-grey/5') : 'bg-white'}
                `}
            >
                <div className='flex items-center gap-4 mb-4'>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${isSelected ? (isSpecial ? 'bg-primary text-grey shadow-lg' : 'bg-grey text-white shadow-lg') : 'bg-grey/5 text-grey/40'}`}>
                        <Icon icon={isSelected ? 'ion:checkmark-circle' : 'ion:add-circle-outline'} />
                    </div>
                    {isSelected && allDaysCompleted && (
                        <Icon icon='ion:star' className='text-primary text-xl animate-pulse' />
                    )}
                </div>
                <h3 className='text-2xl font-black text-grey tracking-tighter mb-1 capitalize'>{menu.name}</h3>
                <p className='text-grey/40 text-[10px] font-bold uppercase tracking-widest'>{menu.description || 'Premium Meals'}</p>
            </div>

            {/* Middle: Horizontal Days */}
            <div className={`flex flex-1 p-8 gap-6 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                {menu.availableDays.map(day => (
                    <div
                        key={day}
                        onClick={() => setSelectingDay(day)}
                        className={`
                            flex-1 min-w-[150px] p-4 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col justify-center
                            ${selectedDayItems[day]
                                ? 'bg-white border-primary/20 shadow-sm'
                                : 'bg-grey/5 border-transparent hover:border-primary/40'}
                            ${selectingDay === day ? 'ring-2 ring-primary ring-offset-4' : ''}
                        `}
                    >
                        <span className='text-[9px] font-black uppercase tracking-[0.2em] text-grey/20 mb-3 block text-center'>{day}</span>
                        {selectedDayItems[day] ? (
                            <div className='text-center space-y-2'>
                                <p className='text-xs font-black text-grey leading-tight group-hover:text-primary transition-colors h-8 flex items-center justify-center'>
                                    {menu.foodItems.find(i => i.id === selectedDayItems[day])?.name}
                                </p>
                                <div className='w-6 h-6 bg-primary/20 text-primary rounded-full mx-auto flex items-center justify-center text-[10px]'>
                                    <Icon icon='ion:checkmark' />
                                </div>
                            </div>
                        ) : (
                            <div className='text-center border-2 border-dashed border-grey/10 rounded-2xl py-4 group-hover:border-primary/30 transition-all'>
                                <Icon icon='ion:add' className='mx-auto text-grey/10 group-hover:text-primary transition-colors text-xl' />
                                <span className='text-[8px] font-black text-grey/20 uppercase tracking-widest group-hover:text-primary/40'>Select</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Selection Overlay Popover */}
            <AnimatePresence>
                {selectingDay && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className='fixed inset-4 md:inset-10 z-[60] bg-white rounded-[4rem] shadow-[0_100px_100px_-50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-grey/5'
                    >
                        <div className='flex items-center justify-between p-10 border-b border-grey/5 bg-[#FFF9F5]'>
                            <div className='flex items-center gap-8'>
                                <button
                                    onClick={() => setSelectingDay(null)}
                                    className='w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center hover:bg-primary hover:text-grey transition-all shadow-md group'
                                >
                                    <Icon icon='ion:arrow-back' className='text-3xl group-hover:-translate-x-1 transition-transform' />
                                </button>
                                <div>
                                    <h4 className='text-3xl font-black text-grey tracking-tighter'>Select for {selectingDay}</h4>
                                    <p className='text-xs font-black text-primary uppercase tracking-[0.4em]'>{menu.name} Signature Collection</p>
                                </div>
                            </div>

                            {selectedDayItems[selectingDay] && !isSpecial && (
                                <button
                                    onClick={() => { onCopyAll(selectedDayItems[selectingDay]); setSelectingDay(null) }}
                                    className='px-10 py-5 bg-primary text-grey rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-lg shadow-primary/20 transition-all flex items-center gap-3'
                                >
                                    <Icon icon='ion:copy-outline' className='text-xl' /> Bulk Select All Days
                                </button>
                            )}
                        </div>

                        <div className='flex-1 overflow-y-auto custom-scrollbar p-10 bg-white'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8'>
                                {menu.foodItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => { onSetItemForDay(selectingDay, item.id); setSelectingDay(null) }}
                                        className={`
                                            group relative p-8 rounded-[3.5rem] border-2 transition-all cursor-pointer flex flex-col items-center text-center
                                            ${selectedDayItems[selectingDay] === item.id
                                                ? 'bg-primary border-primary shadow-2xl shadow-primary/30 scale-[1.02]'
                                                : 'bg-[#FFF9F5] border-transparent hover:bg-white hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2'}
                                        `}
                                    >
                                        <div className='relative w-32 h-32 mb-8 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group-hover:rotate-3 transition-all duration-500'>
                                            <Image
                                                src={getFullImageUrl(item.image) || '/images/food/appetizer.png'}
                                                alt={item.name}
                                                fill
                                                className='object-cover'
                                            />
                                            <div className='absolute inset-0 bg-linear-to-t from-black/20 opacity-0 group-hover:opacity-100 transition-opacity'></div>
                                        </div>

                                        <h5 className={`text-lg font-black leading-tight mb-2 transition-colors ${selectedDayItems[selectingDay] === item.id ? 'text-grey' : 'text-grey group-hover:text-primary'}`}>
                                            {item.name}
                                        </h5>

                                        <div className={`mt-auto w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedDayItems[selectingDay] === item.id ? 'bg-white border-white text-primary' : 'bg-grey/5 border-grey/5 text-transparent group-hover:bg-primary group-hover:text-grey group-hover:border-primary'}`}>
                                            <Icon icon='ion:checkmark' className='text-lg' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
