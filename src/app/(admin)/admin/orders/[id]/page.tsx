'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useState } from 'react'

type Customer = {
    id: string
    name: string
    phone: string
    email?: string
    whatsappNo?: string
}

type FoodItem = {
    id: string
    name: string
    image?: string
}

type FoodMenu = {
    id: string
    name: string
    foodItems: FoodItem[]
}

type Order = {
    id: string
    customerId: string
    customer: Customer
    address: string
    buildingName?: string
    flatRoomNumber?: string
    startDate: string
    paymentMethod: string
    deliveryLocation: string
    totalAmount: number
    status: string
    paymentStatus: string
    orderRemarks?: string
    paymentRemarks?: string
    paymentReceiptUrl?: string
    createdAt: string
    selectedMenus: FoodMenu[]
    selectionsJson: any
    activeDates: string[]
}

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const { data: order, isLoading, error } = useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await axios.get(`/api/orders/${id}`)
            return response.data
        },
        enabled: !!id,
    })

    const queryClient = useQueryClient()
    const { mutate: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: async (newData: any) => {
            const res = await axios.patch(`/api/orders/${id}`, newData)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', id] })
            toast.success('Updated successfully')
            setIsStatusModalOpen(false)
            setIsPaymentModalOpen(false)
            setReceiptFile(null)
        },
        onError: () => {
            toast.error('Failed to update')
        }
    })

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [statusValue, setStatusValue] = useState('PENDING')
    const [orderRemarks, setOrderRemarks] = useState('')

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentStatusValue, setPaymentStatusValue] = useState('PENDING')
    const [paymentRemarks, setPaymentRemarks] = useState('')
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const openStatusModal = () => {
        setStatusValue(order?.status || 'PENDING')
        setOrderRemarks(order?.orderRemarks || '')
        setIsStatusModalOpen(true)
    }

    const openPaymentModal = () => {
        setPaymentStatusValue(order?.paymentStatus || 'PENDING')
        setPaymentRemarks(order?.paymentRemarks || '')
        setReceiptFile(null) // Reset on open
        setIsPaymentModalOpen(true)
    }

    const handleSaveStatus = () => {
        updateStatus({ status: statusValue, orderRemarks })
    }

    const handleSavePayment = async () => {
        let uploadedUrl = order?.paymentReceiptUrl

        if (receiptFile) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', receiptFile)
            try {
                const res = await axios.post('/api/upload', formData)
                uploadedUrl = res.data.secure_url || res.data.path
            } catch (error) {
                toast.error('Failed to upload receipt')
                setIsUploading(false)
                return
            }
            setIsUploading(false)
        }

        updateStatus({
            paymentStatus: paymentStatusValue,
            paymentRemarks,
            paymentReceiptUrl: uploadedUrl
        })
    }

    if (isLoading) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <Icon icon='line-md:loading-loop' className='text-5xl text-primary' />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center'>
                <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500'>
                    <Icon icon='ion:alert-circle-outline' className='text-5xl' />
                </div>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Order Not Found</h3>
                    <p className='text-grey/40'>The order you are looking for does not exist or has been removed.</p>
                </div>
                <Link 
                    href='/admin/orders'
                    className='px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all'
                >
                    Back to Orders
                </Link>
            </div>
        )
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-20'>
            {/* Header / Actions */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                    <button 
                        onClick={() => router.back()}
                        className='p-3 bg-white border border-grey/10 rounded-2xl text-grey/40 hover:text-grey hover:border-grey transition-all'
                    >
                        <Icon icon='ion:arrow-back' className='text-xl' />
                    </button>
                    <div>
                        <div className='flex items-center gap-3 mb-2 flex-wrap'>
                            <span className='px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase'>
                                Order #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <button
                                onClick={openStatusModal}
                                disabled={isUpdating}
                                className={`px-4 py-2 rounded-full text-[10px] font-black border disabled:opacity-50 transition-all text-center flex items-center gap-2 ${
                                    {
                                        PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100',
                                        CONFIRMED: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100',
                                        CANCELLED: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100',
                                    }[order.status] || 'bg-grey/5 text-grey/60 border-grey/10 hover:bg-grey/10'
                                }`}
                            >
                                Status: {order.status}
                                <Icon icon="ion:chevron-down" className="text-sm opacity-50" />
                            </button>

                            <button
                                onClick={openPaymentModal}
                                disabled={isUpdating}
                                className={`px-4 py-2 rounded-full text-[10px] font-black border disabled:opacity-50 transition-all text-center flex items-center gap-2 ${
                                    {
                                        PENDING: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
                                        PAID: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
                                        FAILED: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100',
                                    }[order.paymentStatus || 'PENDING'] || 'bg-grey/5 text-grey/60 border-grey/10 hover:bg-grey/10'
                                }`}
                            >
                                Payment: {order.paymentStatus || 'PENDING'}
                                <Icon icon="ion:chevron-down" className="text-sm opacity-50" />
                            </button>
                            
                            {isUpdating && <Icon icon="line-md:loading-loop" className="text-primary text-xl ml-2" />}
                        </div>
                        <h2 className='text-3xl font-black text-grey uppercase tracking-tighter'>Order View</h2>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    <button 
                        onClick={() => window.print()}
                        className='px-6 py-3 bg-white border border-grey/10 text-grey rounded-2xl font-bold hover:bg-grey/5 transition-all flex items-center gap-2'
                    >
                        <Icon icon='ion:print-outline' className='text-xl' />
                        Print View
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Left Column: Customer & Delivery */}
                <div className='lg:col-span-1 space-y-8'>
                    {/* Customer Info */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-6'>
                        <div className='flex items-center gap-3 pb-4 border-b border-grey/5'>
                            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                <Icon icon='ion:person-outline' className='text-xl' />
                            </div>
                            <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Customer Info</h3>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Name</p>
                                <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey capitalize'>{order.customer.name}</div>
                            </div>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Phone & WhatsApp</p>
                                <div className='flex gap-2 font-bold'>
                                    <div className='flex-1 p-4 bg-grey/5 rounded-2xl text-grey'>{order.customer.phone}</div>
                                    {order.customer.whatsappNo && (
                                        <div className='w-14 p-4 bg-green-50 rounded-2xl text-green-600 flex items-center justify-center'>
                                            <Icon icon='ion:logo-whatsapp' className='text-xl' />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {order.customer.email && (
                                <div>
                                    <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Email</p>
                                    <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey truncate'>{order.customer.email}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Delivery Details */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-6'>
                        <div className='flex items-center gap-3 pb-4 border-b border-grey/5'>
                            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                <Icon icon='ion:location-outline' className='text-xl' />
                            </div>
                            <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Delivery Specs</h3>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Full Address</p>
                                <div className='p-5 bg-grey/5 rounded-2xl font-bold text-grey leading-relaxed'>
                                    {order.address}
                                    {order.buildingName && (
                                        <span className='block text-primary text-sm mt-1'>Building: {order.buildingName}</span>
                                    )}
                                    {order.flatRoomNumber && (
                                        <span className='block text-primary text-sm mt-1'>Flat/Room: {order.flatRoomNumber}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Drop-off Location</p>
                                <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey capitalize'>
                                    {order.deliveryLocation.replace(/_/g, ' ')}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Subscription & Schedule */}
                <div className='lg:col-span-2 space-y-8'>
                    {/* Subscription Summary Cards */}
                    <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        <div className='bg-white p-6 rounded-4xl border border-grey/5 shadow-sm'>
                            <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-2'>Subscribed Days</p>
                            <p className='text-4xl font-black text-primary'>{order.activeDates.length} <span className='text-sm font-bold text-grey'>Days</span></p>
                            <p className='text-xs text-grey/40 mt-1'>Starting {format(new Date(order.startDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className='bg-white p-6 rounded-4xl border border-grey/5 shadow-sm'>
                            <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-2'>Daily Rate</p>
                            <p className='text-4xl font-black text-grey'>{(order.totalAmount / order.activeDates.length).toFixed(1)} <span className='text-sm font-bold text-grey'>AED</span></p>
                            <p className='text-xs text-grey/40 mt-1'>Average per meal day</p>
                        </div>
                        <div className='bg-primary p-6 rounded-4xl shadow-lg shadow-primary/20 flex flex-col justify-center text-white'>
                            <p className='text-[10px] font-black text-white/50 uppercase tracking-widest mb-1'>Total Billing</p>
                            <p className='text-4xl font-black text-white'>{order.totalAmount.toFixed(2)} <span className='text-sm font-bold text-white/80'>AED</span></p>
                        </div>
                    </section>

                    {/* Daily Schedule */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-8'>
                        <div className='flex items-center justify-between gap-3 pb-6 border-b border-grey/5'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                    <Icon icon='ion:calendar-number-outline' className='text-xl' />
                                </div>
                                <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Daily Food Schedule</h3>
                            </div>
                            <div className='hidden sm:flex items-center gap-2 px-4 py-2 bg-grey/5 rounded-xl text-[10px] font-black text-grey/40 uppercase tracking-widest'>
                                <Icon icon='ion:information-circle-outline' className='text-lg' />
                                Full Monthly View
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4'>
                            {order.activeDates.sort().map((dateStr, idx) => {
                                const date = new Date(dateStr)
                                const fullDayName = format(date, 'EEEE')
                                const dailyItems: any[] = []
                                
                                order.selectedMenus.forEach(menu => {
                                    const menuSelections = (order.selectionsJson as any)[menu.id] || {}
                                    const itemId = menuSelections[fullDayName]
                                    if (itemId) {
                                        const item = (menu as any).foodItems.find((fi: any) => fi.id === itemId)
                                        if (item) {
                                            dailyItems.push({
                                                ...item,
                                                menuName: menu.name
                                            })
                                        }
                                    }
                                })

                                return (
                                    <motion.div 
                                        key={dateStr}
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className='group bg-grey/5 p-5 rounded-4xl border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300 shadow-xs hover:shadow-lg'
                                    >
                                        <div className='flex items-center justify-between mb-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-[#FF6B3E] text-[10px] font-black uppercase tracking-widest leading-none mb-1'>
                                                    {format(date, 'MMM dd')}
                                                </span>
                                                <span className='text-grey font-black text-lg leading-none'>
                                                    {fullDayName}
                                                </span>
                                            </div>
                                            <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xs text-grey group-hover:bg-primary group-hover:text-white transition-all'>
                                                <Icon icon='ion:restaurant-outline' className='text-xl' />
                                            </div>
                                        </div>

                                        <div className='space-y-3'>
                                            {dailyItems.length > 0 ? (
                                                dailyItems.map((item, idxx) => (
                                                    <div key={`${dateStr}-${idxx}`} className='flex items-start gap-3 bg-white/50 group-hover:bg-grey/5 p-3 rounded-2xl transition-colors'>
                                                        <div className='w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0' />
                                                        <div className='flex flex-col'>
                                                            <span className='text-sm font-black text-grey leading-tight'>{item.name}</span>
                                                            <span className='text-[8px] font-black text-grey/40 uppercase tracking-widest mt-0.5'>{item.menuName}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='text-xs text-grey/30 italic px-2'>No menu items selected for this day.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isStatusModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-grey/40 backdrop-blur-sm'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className='bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-grey/5'
                        >
                            <div className='p-8 space-y-6'>
                                <div className='flex justify-between items-center'>
                                    <h3 className='text-2xl font-black text-grey uppercase tracking-tighter'>Update Status</h3>
                                    <button onClick={() => setIsStatusModalOpen(false)} className='w-10 h-10 bg-grey/5 rounded-full flex items-center justify-center text-grey/40 hover:text-grey hover:bg-grey/10 transition-all'>
                                        <Icon icon='ion:close' className='text-xl' />
                                    </button>
                                </div>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1'>Fulfillment Status</label>
                                        <select
                                            value={statusValue}
                                            onChange={(e) => setStatusValue(e.target.value)}
                                            className='w-full p-4 bg-grey/5 rounded-2xl font-bold text-grey outline-none border border-transparent focus:border-primary/20 appearance-none'
                                        >
                                            <option value="PENDING">Pending Setup</option>
                                            <option value="CONFIRMED">Food Delivery Confirmed</option>
                                            <option value="CANCELLED">Order Cancelled</option>
                                        </select>
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1'>Order Remarks</label>
                                        <textarea
                                            value={orderRemarks}
                                            onChange={(e) => setOrderRemarks(e.target.value)}
                                            rows={3}
                                            placeholder='Add any internal notes about fulfillment...'
                                            className='w-full p-4 bg-grey/5 rounded-2xl text-sm font-medium text-grey outline-none border border-transparent focus:border-primary/20 resize-none'
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveStatus}
                                    disabled={isUpdating}
                                    className='w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50'
                                >
                                    {isUpdating ? <Icon icon="line-md:loading-loop" className='text-xl' /> : 'Save Status Update'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isPaymentModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-grey/40 backdrop-blur-sm'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className='bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-grey/5 max-h-[90vh] overflow-y-auto'
                        >
                            <div className='p-8 space-y-6'>
                                <div className='flex justify-between items-center'>
                                    <h3 className='text-2xl font-black text-grey uppercase tracking-tighter'>Payment Log</h3>
                                    <button onClick={() => setIsPaymentModalOpen(false)} className='w-10 h-10 bg-grey/5 rounded-full flex items-center justify-center text-grey/40 hover:text-grey hover:bg-grey/10 transition-all'>
                                        <Icon icon='ion:close' className='text-xl' />
                                    </button>
                                </div>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1'>Payment Status</label>
                                        <select
                                            value={paymentStatusValue}
                                            onChange={(e) => setPaymentStatusValue(e.target.value)}
                                            className='w-full p-4 bg-grey/5 rounded-2xl font-bold text-grey outline-none border border-transparent focus:border-primary/20 appearance-none'
                                        >
                                            <option value="PENDING">Awaiting Payment</option>
                                            <option value="PAID">Successfully Paid</option>
                                            <option value="FAILED">Payment Failed/Rejected</option>
                                        </select>
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1'>Payment Remarks</label>
                                        <textarea
                                            value={paymentRemarks}
                                            onChange={(e) => setPaymentRemarks(e.target.value)}
                                            rows={2}
                                            placeholder='Reference ID, reason for failure, etc.'
                                            className='w-full p-4 bg-grey/5 rounded-2xl text-sm font-medium text-grey outline-none border border-transparent focus:border-primary/20 resize-none'
                                        />
                                    </div>
                                    
                                    <div className='space-y-2 pt-2'>
                                        <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1'>Upload Receipt</label>
                                        
                                        {order?.paymentReceiptUrl && !receiptFile && (
                                            <div className='p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between mb-2'>
                                                <div className='flex items-center gap-2 text-blue-600'>
                                                    <Icon icon='ion:document-attach-outline' className='text-xl' />
                                                    <span className='text-xs font-bold'>Existing Receipt</span>
                                                </div>
                                                <a href={order.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className='text-[10px] font-black uppercase tracking-widest bg-blue-100 px-3 py-1.5 rounded-full text-blue-700 hover:bg-blue-200 transition-colors'>View</a>
                                            </div>
                                        )}

                                        <label className='w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-grey/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center group'>
                                            <Icon icon='ion:cloud-upload-outline' className='text-3xl text-grey/30 group-hover:text-primary mb-2 transition-colors' />
                                            <span className='text-xs font-black text-grey uppercase tracking-widest bg-grey/5 px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors'>Choose File</span>
                                            {receiptFile && <span className='text-xs text-primary font-bold mt-3 truncate w-full px-4'>{receiptFile.name}</span>}
                                            <input type='file' className='hidden' accept='image/*,.pdf' onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSavePayment}
                                    disabled={isUpdating || isUploading}
                                    className='w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50'
                                >
                                    {(isUpdating || isUploading) ? <Icon icon="line-md:loading-loop" className='text-xl' /> : 'Confirm Payment Log'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
