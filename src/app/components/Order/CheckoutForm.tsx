'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { getFullImageUrl } from '@/utils/image'

import { useSession } from 'next-auth/react'

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

type CheckoutFormProps = {
    selectedMenuIds: string[]
    selectionsJson: Record<string, Record<string, string>>
    totalPrice: number
}

export default function CheckoutForm({ selectedMenuIds, selectionsJson, totalPrice }: CheckoutFormProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [includeSundays, setIncludeSundays] = useState(true)
    const [activeDates, setActiveDates] = useState<string[]>([])

    const { data: menus = [] } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-menu'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu')
            return response.data
        },
    })

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        whatsappNo: '',
        address: '',
        buildingName: '',
        flatRoomNumber: '',
        startDate: new Date().toISOString().split('T')[0],
        deliveryLocation: 'inside_room',
        brunchLunchLocation: '',
        dinnerLocation: '',
        paymentMethod: 'COD',
    })

    // Load persisted form data or pre-fill from session
    React.useEffect(() => {
        const savedFormData = localStorage.getItem('checkout_form_data')
        if (savedFormData) {
            try {
                const parsed = JSON.parse(savedFormData)
                setFormData(prev => ({ ...prev, ...parsed }))
                localStorage.removeItem('checkout_form_data') // Clear once loaded
            } catch (error) {
                console.error('Failed to parse saved form data:', error)
            }
        } else if (session?.user) {
            setFormData(prev => ({
                ...prev,
                customerName: session.user.name || prev.customerName,
                customerEmail: session.user.email || prev.customerEmail,
                customerPhone: (session.user as any)?.phone || prev.customerPhone,
            }))
        }
    }, [session])

    const calculateSubscriptionDetails = () => {
        if (!formData.startDate) return { workDays: 26, sundays: [], fullSchedule: [] }

        const start = new Date(formData.startDate)
        const daysInMonth = 30
        const sundays: string[] = []
        let workDays = 0
        const workDayDates: string[] = []
        const availableDatesList: string[] = []
        const fullSchedule: any[] = []

        const selectedMenusList = menus.filter(m => selectedMenuIds.includes(m.id))

        for (let i = 0; i < daysInMonth; i++) {
            const current = new Date(start)
            current.setDate(start.getDate() + i)
            const dayName = current.toLocaleDateString('en-US', { weekday: 'long' })
            const dateString = current.toISOString().split('T')[0]

            // Find items for this day across all selected menus
            const dayItems: any[] = []
            selectedMenuIds.forEach(menuId => {
                const daySelections = selectionsJson[menuId] || {}
                const itemId = daySelections[dayName]
                if (itemId) {
                    const menu = menus.find(m => m.id === menuId)
                    const item = menu?.foodItems.find(fi => fi.id === itemId)
                    if (item) {
                        dayItems.push({
                            ...item,
                            menuName: menu?.name
                        })
                    }
                }
            })

            // Check if this day is available in at least one selected menu's availableDays
            const isMenuAvailable = selectedMenusList.some(m => m.availableDays.includes(dayName))

            const dayInfo = {
                date: dateString,
                dayName,
                isSunday: dayName === 'Sunday',
                items: dayItems,
                selectable: isMenuAvailable
            }

            fullSchedule.push(dayInfo)

            if (dayName === 'Sunday') {
                sundays.push(dateString)
            } else {
                workDays++
                workDayDates.push(dateString)
            }

            if (isMenuAvailable) {
                availableDatesList.push(dateString)
            }
        }

        return { workDays, sundays, fullSchedule, workDayDates, availableDatesList }
    }

    const { workDays = 0, sundays = [], fullSchedule = [], workDayDates = [], availableDatesList = [] } = calculateSubscriptionDetails()

    // Initialize/Update activeDates when start date or selections change
    React.useEffect(() => {
        // By default, select all available dates
        setActiveDates(availableDatesList)
    }, [formData.startDate, selectedMenuIds.join(',')])

    // Real-time calculated price
    const calculateFinalPrice = () => {
        // Base daily rate logic can be refined, for now sticking to the existing logic
        const baseDailyRate = totalPrice / 25
        return Math.round(activeDates.length * baseDailyRate)
    }

    const finalPrice = calculateFinalPrice()

    const toggleDate = (date: string, isSelectable: boolean) => {
        if (!isSelectable) return
        setActiveDates(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (status === 'unauthenticated') {
            toast.error('Please sign in to complete your order')
            localStorage.setItem('checkout_form_data', JSON.stringify(formData))
            router.push(`/signin?callbackUrl=/checkout`)
            return
        }

        setLoading(true)

        try {
            await axios.post('/api/orders', {
                ...formData,
                totalAmount: finalPrice,
                menuIds: selectedMenuIds,
                selectionsJson,
                includeSundays,
                sundaysCount: sundays.length,
                activeDates
            })
            toast.success('Order placed successfully!')
            localStorage.removeItem('order_selection') // Clear cart/selection on success
            router.push('/checkout/success')
        } catch (error: any) {
            console.error('Submission error:', error)
            toast.error(error.response?.data?.error || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-grey/5">
            <div className="bg-primary p-8 text-grey">
                <h2 className="text-3xl font-black tracking-tight mb-2">Finalize Your Order</h2>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Complete your subscription details</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                {/* Personal Info */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:person-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Customer Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Name *</label>
                            <input
                                required
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Phone Number *</label>
                            <input
                                required
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="+971 XXX XXX XXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">WhatsApp Number</label>
                            <input
                                name="whatsappNo"
                                value={formData.whatsappNo}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="+971 XXX XXX XXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Email Address</label>
                            <input
                                type="email"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-grey/5" />

                {/* Delivery Address */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:location-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Delivery Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Address *</label>
                            <textarea
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey min-h-[100px]"
                                placeholder="Building No, Street, Landmark..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Building Name / City Name</label>
                            <input
                                name="buildingName"
                                value={formData.buildingName}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Enter building or city"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Flat / Room Number</label>
                            <input
                                name="flatRoomNumber"
                                value={formData.flatRoomNumber}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="e.g. 402, Block A"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-grey/5" />

                {/* Monthly Subscription Calendar */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Icon icon="ion:calendar-number-outline" className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-grey uppercase tracking-wider">Subscription Calendar</h3>
                                    <p className="text-[10px] font-bold text-grey/30 uppercase tracking-widest">30 Days Full Schedule View</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white border-2 border-grey/5 p-1 pl-4 rounded-2xl">
                                <span className="text-[10px] font-black text-grey/40 uppercase tracking-widest whitespace-nowrap">Start Date</span>
                                <input
                                    required
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="bg-transparent py-2 pr-4 outline-hidden font-bold text-grey text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-grey/5 p-2 rounded-2xl self-start md:self-auto">
                            <span className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-2">Include Sundays</span>
                            <button
                                type="button"
                                onClick={() => {
                                    const availableSundays = sundays.filter(s => availableDatesList.includes(s))
                                    if (activeDates.filter(d => sundays.includes(d)).length === availableSundays.length) {
                                        setActiveDates(prev => prev.filter(d => !sundays.includes(d)))
                                        setIncludeSundays(false)
                                    } else {
                                        setActiveDates(prev => Array.from(new Set([...prev, ...availableSundays])))
                                        setIncludeSundays(true)
                                    }
                                }}
                                className={`w-14 h-8 rounded-full transition-all relative ${activeDates.some(d => sundays.includes(d)) ? 'bg-primary' : 'bg-grey/20'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${activeDates.some(d => sundays.includes(d)) ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {fullSchedule.map((day, idx) => {
                            const isSelected = activeDates.includes(day.date)
                            const dateObj = new Date(day.date)
                            const isSelectable = day.selectable

                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    onClick={() => toggleDate(day.date, isSelectable)}
                                    className={`
                                        p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center
                                        ${!isSelectable
                                            ? 'bg-grey/5 border-transparent opacity-20 grayscale cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5 cursor-pointer'
                                                : 'bg-grey/5 border-transparent opacity-40 hover:opacity-100 cursor-pointer'}
                                    `}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-grey/30'}`}>
                                            {day.dayName.substring(0, 3)}
                                        </span>
                                        <span className={`text-2xl font-black ${isSelected ? 'text-grey' : 'text-grey/40'}`}>{dateObj.getDate()}</span>
                                        <span className="text-[8px] font-bold text-grey/40 uppercase tracking-tighter">
                                            {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Items for this day */}
                                    <div className="w-full space-y-2">
                                        {!isSelectable ? (
                                            <div className="flex flex-col items-center gap-1 opacity-40">
                                                <Icon icon="ion:ban-outline" className="text-xl" />
                                                <span className="text-[7px] font-black uppercase tracking-tighter">Off Day</span>
                                            </div>
                                        ) : day.items.length > 0 ? (
                                            day.items.map((item: any) => (
                                                <div key={item.id} className="group relative">
                                                    <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden border-2 border-white shadow-xs">
                                                        <Image
                                                            src={getFullImageUrl(item.image) || '/images/food/appetizer.png'}
                                                            alt={item.name}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <p className="text-[8px] font-black text-grey mt-1 line-clamp-1 group-hover:line-clamp-none bg-white/80 absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 rounded-full whitespace-nowrap shadow-xs opacity-0 group-hover:opacity-100 transition-all z-10">
                                                        {item.name}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-12 h-12 mx-auto border-2 border-dashed border-grey/5 rounded-xl flex items-center justify-center">
                                                <Icon icon="ion:restaurant-outline" className="text-grey/10" />
                                            </div>
                                        )}
                                    </div>

                                    {isSelectable && (
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-grey' : 'bg-grey/10 text-transparent'}`}>
                                            <Icon icon="ion:checkmark" className="text-[10px]" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>

                    <p className="text-[10px] font-bold text-grey/30 text-center uppercase tracking-widest italic pt-4">
                        * Work Days (Mon-Sat) use your weekly selection. Sundays are individually customizable.
                    </p>
                </section>

                <hr className="border-grey/5" />

                {/* Preferences */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:settings-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Service Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Default Drop Location</label>
                            <select
                                name="deliveryLocation"
                                value={formData.deliveryLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey appearance-none"
                            >
                                <option value="inside_room">Inside My Room</option>
                                <option value="outside_room">Outside My Room</option>
                                <option value="security_desk">Security Desk</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Brunch & Lunch Delivery Location</label>
                            <input
                                name="brunchLunchLocation"
                                value={formData.brunchLunchLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Specific instructions for lunch"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Dinner Delivery Location</label>
                            <input
                                name="dinnerLocation"
                                value={formData.dinnerLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Specific instructions for dinner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Payment Method *</label>
                            <select
                                required
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey appearance-none"
                            >
                                <option value="COD">Cash on Delivery (COD)</option>
                                <option value="BANK">Bank Transfer</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Pricing Summary */}
                <div className="bg-grey/95 rounded-[2.5rem] p-8 mt-12 text-white border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
                        {/* Selected Days Statistics */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selected Workdays</span>
                                <span className="text-sm font-black text-primary">{activeDates.filter(d => !sundays.includes(d)).length} Days</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selected Sundays</span>
                                <span className="text-sm font-black text-primary">{activeDates.filter(d => sundays.includes(d)).length} Days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Active Days</span>
                                <span className="text-sm font-black text-white">{activeDates.length} Days</span>
                            </div>
                        </div>

                        <div className="h-12 w-px bg-white/10 hidden md:block mx-auto"></div>

                        {/* Final Billing */}
                        <div className="flex items-center justify-between md:justify-end gap-8">
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                                    <Icon
                                        icon={formData.paymentMethod === 'BANK' ? 'ion:business-outline' : 'ion:card-outline'}
                                        className="text-2xl"
                                    />
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Method</p>
                                    <p className="text-xs font-bold text-white whitespace-nowrap">
                                        {formData.paymentMethod === 'BANK' ? 'Bank Transfer' : 'Cash on Delivery'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Monthly Billing Total</p>
                                <p className="text-white font-black text-4xl tracking-tighter">AED {finalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-grey/40 text-center uppercase tracking-[0.3em]">
                        Our agent will call you to confirm the order within 24 hours.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/get-started')}
                            className="flex-1 py-6 border-2 border-grey/10 text-grey font-black rounded-[2rem] hover:bg-grey hover:text-white transition-all flex items-center justify-center gap-3 group"
                        >
                            <Icon icon="ion:arrow-back" className="group-hover:-translate-x-1 transition-transform" />
                            PREVIOUS STEP
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-6 bg-primary text-grey rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-8 h-8 border-4 border-grey/20 border-t-grey rounded-full animate-spin" />
                            ) : (
                                <>
                                    SUBMIT ORDER NOW
                                    <Icon icon="ion:arrow-forward" className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
