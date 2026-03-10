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

    // Load state from localStorage on mount
    React.useEffect(() => {
        const savedSelection = localStorage.getItem('order_selection')
        if (savedSelection) {
            try {
                const { menuIds, selections } = JSON.parse(savedSelection)
                if (menuIds) setSelectedMenuIds(menuIds)
                if (selections) setSelectedItemIds(selections)
            } catch (error) {
                console.error('Failed to parse saved selection:', error)
            }
        }
    }, [])

    // Save state to localStorage whenever it changes
    React.useEffect(() => {
        if (selectedMenuIds.length > 0) {
            const selection = {
                menuIds: selectedMenuIds,
                selections: selectedItemIds,
                totalPrice: totalPrice,
            }
            localStorage.setItem('order_selection', JSON.stringify(selection))
        }
    }, [selectedMenuIds, selectedItemIds, totalPrice])

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
            <div className='max-w-full overflow-x-auto pb-10 custom-scrollbar scroll-smooth'>
                <div className='min-w-[1240px] max-w-7xl mx-auto px-6 space-y-12'>

                    {/* Regular Menus */}
                    <div className='space-y-8'>
                        <SectionHeader title="Weekly Subscriptions" subtitle="Standard Plan Selection" />

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
                                        AED {totalPrice.toLocaleString()} <span className='text-sm text-white/40 font-medium'>/mo</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const selection = {
                                        menuIds: selectedMenuIds,
                                        selections: selectedItemIds,
                                        totalPrice: totalPrice,
                                    }
                                    localStorage.setItem('order_selection', JSON.stringify(selection))
                                    window.location.href = '/checkout'
                                }}
                                className='w-full md:w-auto px-12 py-6 bg-primary text-grey rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-4 group'
                            >
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
            {/* Left Box: Menu Title + Pricing */}
            <div
                onClick={onToggle}
                className={`
                    w-full md:w-[320px] p-8 flex flex-col justify-center cursor-pointer transition-all border-b md:border-b-0 md:border-r border-grey/5 relative group/sidebar
                    ${isSelected ? (isSpecial ? 'bg-primary/5' : 'bg-grey/5') : 'bg-white hover:bg-grey/5'}
                `}
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transform group-hover/sidebar:scale-110 ${isSelected ? (isSpecial ? 'bg-primary text-grey' : 'bg-grey text-white') : 'bg-[#FFF9F5] text-grey/20'}`}>
                    <Icon icon={isSelected ? 'ion:checkmark-done' : 'ion:add'} className='text-xl' />
                </div>

                <div className='space-y-1'>
                    <h3 className='text-3xl font-black text-grey tracking-tight capitalize leading-none'>{menu.name}</h3>
                    <p className='text-[9px] font-bold text-grey/30 uppercase tracking-[0.2em] leading-relaxed'>
                        Signature flavor selection
                    </p>
                </div>

                <div className='mt-8 pt-8 border-t border-grey/5'>
                    {hasSelections ? (
                        <div className='flex flex-col'>
                            <div className='flex items-baseline gap-1'>
                                <span className='text-3xl font-black text-grey tracking-tighter'>AED {menuPriceTotal.toLocaleString()}</span>
                                <span className='text-[9px] font-black text-grey/20 uppercase tracking-widest'>/mo</span>
                            </div>
                            <div className='flex items-center gap-2 mt-2'>
                                <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                                <span className='text-[8px] font-black text-primary uppercase tracking-widest'>Plan Active</span>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center gap-2 text-primary'>
                            <Icon icon='ion:sparkles-outline' className='text-xs animate-pulse' />
                            <p className='text-[9px] font-black uppercase tracking-widest'>Configure your menu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle: Grid Days - All Days Clearly Viewable */}
            <div className={`flex-1 p-6 md:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 transition-all duration-700 ${isSelected ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                {menu.availableDays.map(day => (
                    <motion.div
                        key={day}
                        onClick={() => setSelectingDay(day)}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`
                            h-full min-h-[220px] p-2 rounded-[2.5rem] border-2 transition-all cursor-pointer group relative flex flex-col items-center justify-between
                            ${selectedDayItems[day]
                                ? (isSpecial ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-grey/5 border-grey shadow-lg shadow-grey/5')
                                : 'bg-grey/5 border-transparent hover:bg-white hover:border-primary/20 hover:shadow-xl'}
                            ${selectingDay === day ? 'ring-2 ring-primary ring-offset-4' : ''}
                        `}
                    >
                        <div className='pt-4 pb-2'>
                            <span className='text-[9px] font-black uppercase tracking-[0.2em] text-grey/30 group-hover:text-primary transition-colors'>{day.substring(0, 3)}</span>
                        </div>

                        <div className='flex-1 w-full flex flex-col items-center justify-center p-2 relative group/card'>
                            {selectedDayItems[day] ? (
                                <div className='flex flex-col items-center text-center'>
                                    {/* Action Buttons Layer */}
                                    <div className='absolute inset-0 z-10 opacity-0 group-hover/card:opacity-100 transition-all flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs rounded-[2rem]'>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSetItemForDay(day, '') }}
                                            className='w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 shadow-lg mb-2'
                                            title="Clear"
                                        >
                                            <Icon icon="ion:trash-outline" className='text-lg' />
                                        </button>
                                        <div className='px-3 py-1 bg-grey text-white text-[8px] font-black uppercase rounded-full'>Change</div>
                                    </div>

                                    <div className='relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white shadow-md'>
                                        <Image
                                            src={getFullImageUrl(menu.foodItems.find(i => i.id === selectedDayItems[day])?.image) || '/images/food/appetizer.png'}
                                            alt="dish"
                                            fill
                                            className='object-cover'
                                        />
                                    </div>
                                    <p className='text-[10px] font-black text-grey leading-tight px-1 line-clamp-2 min-h-[24px]'>
                                        {menu.foodItems.find(i => i.id === selectedDayItems[day])?.name}
                                    </p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center gap-3'>
                                    <div className='w-16 h-16 rounded-full border border-dashed border-grey/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary group-hover:border-solid transition-all'>
                                        <Icon icon='ion:restaurant-outline' className='text-xl text-grey/20 group-hover:text-primary' />
                                    </div>
                                    <span className='text-[8px] font-bold text-grey/20 uppercase tracking-widest group-hover:text-primary'>Choose</span>
                                </div>
                            )}
                        </div>

                        <div className='pb-4'>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedDayItems[day] ? 'bg-primary text-grey shadow-md' : 'bg-grey/5 text-transparent border border-grey/5'}`}>
                                <Icon icon='ion:checkmark' className='text-[10px]' />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Selection Overlay Popover */}
            <AnimatePresence>
                {selectingDay && (
                    <MenuSelectionPopover
                        menu={menu}
                        selectingDay={selectingDay}
                        onClose={() => setSelectingDay(null)}
                        selectedItemId={selectedDayItems[selectingDay]}
                        onSelectItem={(itemId) => {
                            onSetItemForDay(selectingDay, itemId)
                            setSelectingDay(null)
                        }}
                        onClear={() => {
                            onSetItemForDay(selectingDay, '')
                            setSelectingDay(null)
                        }}
                        onCopyAll={(itemId) => {
                            onCopyAll(itemId)
                            setSelectingDay(null)
                        }}
                        isSpecial={isSpecial}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function MenuSelectionPopover({
    menu,
    selectingDay,
    onClose,
    selectedItemId,
    onSelectItem,
    onClear,
    onCopyAll,
    isSpecial
}: {
    menu: FoodMenu,
    selectingDay: string,
    onClose: () => void,
    selectedItemId: string | undefined,
    onSelectItem: (itemId: string) => void,
    onClear: () => void,
    onCopyAll: (itemId: string) => void,
    isSpecial?: boolean
}) {
    const [currentPage, setCurrentPage] = useState(1)
    const [showAll, setShowAll] = useState(false)
    const itemsPerPage = 12

    const displayedItems = showAll
        ? menu.foodItems
        : menu.foodItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const totalPages = Math.ceil(menu.foodItems.length / itemsPerPage)

    return (
        <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className='fixed inset-0 z-[100] bg-grey/40 flex items-center justify-center p-4 md:p-8'
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className='w-full max-w-7xl h-full max-h-[95vh] bg-white rounded-[3rem] shadow-[0_100px_100px_-50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20'
            >
                {/* Header */}
                <div className='flex flex-col md:flex-row items-center justify-between p-6 md:p-8 border-b border-grey/5 bg-linear-to-b from-[#FFFBF7] to-white gap-6'>
                    <div className='flex items-center gap-6'>
                        <button
                            onClick={onClose}
                            className='w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-white border border-grey/10 flex items-center justify-center hover:bg-grey hover:text-white transition-all shadow-lg group'
                        >
                            <Icon icon='ion:close' className='text-2xl transition-transform group-hover:rotate-90' />
                        </button>
                        <div>
                            <div className='flex items-center gap-3 mb-1'>
                                <span className='px-3 py-0.5 bg-primary text-grey text-[10px] font-black uppercase tracking-widest rounded-full'>{selectingDay}</span>
                                <h4 className='text-2xl md:text-3xl font-black text-grey tracking-tighter capitalize'>{menu.name}</h4>
                            </div>
                            <p className='text-[10px] font-bold text-grey/40 uppercase tracking-[0.3em]'>Choose your favorite flavor</p>
                        </div>
                    </div>

                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        {/* Show All Toggle */}
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border ${showAll ? 'bg-primary border-primary text-grey' : 'bg-white border-grey/10 text-grey/40 hover:border-primary/40'}`}
                        >
                            <Icon icon={showAll ? 'ion:grid' : 'ion:list'} className='text-lg' />
                            {showAll ? 'View Paginated' : 'Show All Items'}
                        </button>

                        {selectedItemId && (
                            <button
                                onClick={onClear}
                                className='px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-100'
                            >
                                <Icon icon='ion:trash-outline' className='text-lg' /> Clear
                            </button>
                        )}
                        {selectedItemId && !isSpecial && (
                            <button
                                onClick={() => onCopyAll(selectedItemId)}
                                className='px-8 py-3 bg-grey text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-grey shadow-xl transition-all flex items-center gap-3 group'
                            >
                                <Icon icon='ion:copy-outline' className='text-xl group-hover:scale-110 transition-transform' />
                                Copy to All
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Content */}
                <div className='flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-white'>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                        {displayedItems.map(item => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -5 }}
                                onClick={() => onSelectItem(item.id)}
                                className={`
                                    group relative p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-center text-center
                                    ${selectedItemId === item.id
                                        ? 'bg-primary border-primary shadow-[0_20px_40px_-10px_rgba(250,203,21,0.4)]'
                                        : 'bg-[#FFFBF7] border-transparent hover:bg-white hover:border-primary/40 hover:shadow-xl'}
                                `}
                            >
                                <div className='relative w-24 h-24 md:w-32 md:h-32 mb-6 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group-hover:-rotate-2 transition-all duration-500'>
                                    <Image
                                        src={getFullImageUrl(item.image) || '/images/food/appetizer.png'}
                                        alt={item.name}
                                        fill
                                        className='object-cover transform group-hover:scale-110 transition-transform duration-1000'
                                    />
                                </div>

                                <div className='flex-1 w-full space-y-3 mb-4'>
                                    <h5 className={`text-base font-black leading-tight tracking-tight transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center ${selectedItemId === item.id ? 'text-grey' : 'text-grey group-hover:text-primary'}`}>
                                        {item.name}
                                    </h5>

                                    <div className='flex flex-col gap-2'>
                                        <div className={`px-3 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${selectedItemId === item.id ? 'bg-white/20' : 'bg-primary/5'}`}>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${selectedItemId === item.id ? 'text-grey/60' : 'text-grey/40'}`}>Monthly</span>
                                            <span className={`text-sm font-black ${selectedItemId === item.id ? 'text-grey' : 'text-primary'}`}>AED {item.monthlyPrice || (item.price * 25).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedItemId === item.id ? 'bg-white border-white text-primary' : 'bg-grey/10 border-transparent text-transparent group-hover:bg-primary group-hover:text-grey'}`}>
                                    <Icon icon='ion:checkmark' className='text-lg' />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {displayedItems.length === 0 && (
                        <div className='h-full flex flex-col items-center justify-center py-20 text-grey/20'>
                            <Icon icon="ion:restaurant-outline" className="text-8xl mb-4" />
                            <p className='text-xl font-bold italic'>No items found for this menu.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!showAll && totalPages > 1 && (
                    <div className='p-6 border-t border-grey/5 bg-[#FFFBF7] flex items-center justify-center gap-8'>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${currentPage === 1 ? 'border-grey/5 text-grey/10 cursor-not-allowed' : 'border-grey/10 text-grey hover:border-primary hover:bg-primary'}`}
                        >
                            <Icon icon='ion:chevron-back' className='text-xl' />
                        </button>

                        <div className='flex items-center gap-3'>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-grey text-white scale-110' : 'bg-white border border-grey/5 text-grey/40 hover:border-primary'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${currentPage === totalPages ? 'border-grey/5 text-grey/10 cursor-not-allowed' : 'border-grey/10 text-grey hover:border-primary hover:bg-primary'}`}
                        >
                            <Icon icon='ion:chevron-forward' className='text-xl' />
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
