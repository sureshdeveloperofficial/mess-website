'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface FoodItem {
    id: string
    name: string
    image?: string
}

interface FoodMenu {
    id: string
    name: string
    price: number
    foodItems: FoodItem[]
}

interface Order {
    id: string
    address: string
    buildingName?: string
    flatRoomNumber?: string
    deliveryLocation: string
    startDate: string
    totalAmount: number
    paymentMethod: string
    paymentStatus: string
    status: string
    createdAt: string
    activeDates: string[]
    selectedMenus: FoodMenu[]
    selectionsJson: any
}

interface CustomerDetails {
    id: string
    name: string
    phone: string
    email: string | null
    whatsappNo: string | null
    createdAt: string
    updatedAt: string
    totalSpent: number
    _count: {
        orders: number
    }
    orders: Order[]
}

export default function CustomerProfilePage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const queryClient = useQueryClient()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        whatsappNo: '',
    })

    // Fetch Customer Details
    const { data: customer, isLoading, error } = useQuery<CustomerDetails>({
        queryKey: ['admin-customer-details', id],
        queryFn: async () => {
            const response = await axios.get(`/api/admin/customers/${id}`)
            return response.data
        },
        enabled: !!id,
    })

    // Update Customer Mutation
    const updateMutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            const response = await axios.patch(`/api/admin/customers/${id}`, updatedData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customer-details', id] })
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
            toast.success('Customer profile updated!')
            setIsEditModalOpen(false)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to update customer')
        },
    })

    const openEditModal = () => {
        if (!customer) return
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            whatsappNo: customer.whatsappNo || '',
        })
        setIsEditModalOpen(true)
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate(formData)
    }

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[450px] gap-3'>
                <Icon icon='line-md:loading-loop' className='text-4xl text-primary' />
                <p className='text-xs font-bold text-grey-muted'>Loading customer profile...</p>
            </div>
        )
    }

    if (error || !customer) {
        return (
            <div className='max-w-xl mx-auto py-16 text-center space-y-4'>
                <div className='w-16 h-16 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center text-3xl'>
                    <Icon icon='solar:danger-circle-bold' />
                </div>
                <h2 className='text-xl font-bold text-grey-dark'>Customer Profile Not Found</h2>
                <p className='text-xs text-grey-muted'>
                    The customer record you are trying to view does not exist or has been removed.
                </p>
                <Link
                    href='/admin/customers'
                    className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl text-xs'
                >
                    <Icon icon='solar:alt-arrow-left-bold' />
                    <span>Return to Customer Directory</span>
                </Link>
            </div>
        )
    }

    const initials = customer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

    const ordersCount = customer.orders?.length || 0
    const totalSpent = customer.totalSpent || 0
    const avgOrderValue = ordersCount > 0 ? totalSpent / ordersCount : 0

    return (
        <div className='space-y-8 pb-16 max-w-7xl mx-auto'>
            {/* Top Navigation Bar */}
            <div className='flex items-center justify-between'>
                <Link
                    href='/admin/customers'
                    className='inline-flex items-center gap-2 text-xs font-bold text-grey-muted hover:text-grey-dark transition-colors px-3 py-2 rounded-xl bg-white border border-grey/10 shadow-xs'
                >
                    <Icon icon='solar:alt-arrow-left-bold' className='text-xs' />
                    <span>Back to Directory</span>
                </Link>

                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={openEditModal}
                        className='px-4 py-2 bg-white hover:bg-grey/5 border border-grey/10 rounded-xl text-xs font-bold text-grey-dark transition-all flex items-center gap-1.5 shadow-xs cursor-pointer'
                    >
                        <Icon icon='solar:pen-bold-duotone' className='text-sm text-primary' />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Customer Profile Header Banner */}
            <div className='bg-white rounded-3xl p-8 border border-grey/10 shadow-sm'>
                <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                    {/* Left: Avatar & Bio */}
                    <div className='flex items-start sm:items-center gap-5'>
                        <div className='w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 text-primary font-black text-2xl flex items-center justify-center shrink-0 shadow-sm'>
                            {initials || <Icon icon='solar:user-bold' />}
                        </div>
                        <div className='space-y-1.5'>
                            <div className='flex flex-wrap items-center gap-3'>
                                <h1 className='text-2xl font-extrabold text-grey-dark tracking-tight'>{customer.name}</h1>
                                <span className='px-2.5 py-0.5 rounded-lg bg-grey/5 border border-grey/10 text-[11px] font-mono font-bold text-grey-muted'>
                                    ID: {customer.id}
                                </span>
                            </div>

                            <p className='text-xs text-grey-muted flex items-center gap-2'>
                                <Icon icon='solar:calendar-bold-duotone' className='text-sm text-primary' />
                                <span>
                                    Customer since{' '}
                                    {format(new Date(customer.createdAt), 'dd MMMM yyyy (hh:mm a)')}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Action Contact Buttons */}
                    <div className='flex flex-wrap items-center gap-3'>
                        {/* Direct Call */}
                        <a
                            href={`tel:${customer.phone}`}
                            className='px-4 py-2.5 bg-grey/5 hover:bg-primary/10 hover:text-grey-dark border border-grey/10 rounded-2xl text-xs font-bold text-grey-dark transition-all flex items-center gap-2'
                        >
                            <Icon icon='solar:phone-calling-bold-duotone' className='text-base text-primary' />
                            <span>Call ({customer.phone})</span>
                        </a>

                        {/* WhatsApp Direct Chat */}
                        {customer.whatsappNo && (
                            <a
                                href={`https://wa.me/${customer.whatsappNo.replace(/[^0-9]/g, '')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2'
                            >
                                <Icon icon='logos:whatsapp-icon' className='text-base' />
                                <span>WhatsApp Chat</span>
                            </a>
                        )}

                        {/* Direct Email */}
                        {customer.email && (
                            <a
                                href={`mailto:${customer.email}`}
                                className='px-4 py-2.5 bg-grey/5 hover:bg-grey/10 border border-grey/10 rounded-2xl text-xs font-bold text-grey-dark transition-all flex items-center gap-2'
                            >
                                <Icon icon='solar:letter-bold-duotone' className='text-base text-primary' />
                                <span>Send Email</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Lifetime Metrics Overview */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* Metric 1: Total Orders */}
                <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span className='admin-label mb-0'>Total Subscriptions</span>
                        <div className='w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg'>
                            <Icon icon='solar:cart-large-bold-duotone' />
                        </div>
                    </div>
                    <div className='text-2xl font-extrabold text-grey-dark'>
                        {ordersCount}{' '}
                        <span className='text-xs font-semibold text-grey-muted'>
                            {ordersCount === 1 ? 'Plan' : 'Plans'}
                        </span>
                    </div>
                </div>

                {/* Metric 2: Total Spent */}
                <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span className='admin-label mb-0'>Lifetime Spend</span>
                        <div className='w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-lg'>
                            <Icon icon='solar:wallet-money-bold-duotone' />
                        </div>
                    </div>
                    <div className='text-2xl font-extrabold text-grey-dark'>
                        AED {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Metric 3: Average Order Value */}
                <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span className='admin-label mb-0'>Average Order</span>
                        <div className='w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg'>
                            <Icon icon='solar:chart-2-bold-duotone' />
                        </div>
                    </div>
                    <div className='text-2xl font-extrabold text-grey-dark'>
                        AED {avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Metric 4: Customer Status */}
                <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span className='admin-label mb-0'>Account Status</span>
                        <div className='w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg'>
                            <Icon icon='solar:shield-check-bold-duotone' />
                        </div>
                    </div>
                    <div className='text-lg font-extrabold text-grey-dark flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                        <span>Active Member</span>
                    </div>
                </div>
            </div>

            {/* Full Order & Subscription History Section */}
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:receipt-list-bold-duotone' className='text-primary text-2xl' />
                            <span>Subscriptions &amp; Orders History</span>
                        </h2>
                        <p className='text-xs text-grey-muted'>
                            All recorded meal plans and order packages placed by {customer.name}
                        </p>
                    </div>

                    <Link
                        href={`/admin/orders?search=${encodeURIComponent(customer.phone)}`}
                        className='text-xs font-bold text-primary hover:underline flex items-center gap-1'
                    >
                        <span>Search in Orders</span>
                        <Icon icon='solar:arrow-right-bold' />
                    </Link>
                </div>

                {customer.orders.length === 0 ? (
                    <div className='bg-white rounded-3xl p-12 border border-grey/10 shadow-sm text-center space-y-3'>
                        <div className='w-14 h-14 bg-grey/5 text-grey-muted rounded-3xl mx-auto flex items-center justify-center text-2xl border border-grey/10'>
                            <Icon icon='solar:box-minimalistic-broken' />
                        </div>
                        <h3 className='text-base font-bold text-grey-dark'>No Orders Placed Yet</h3>
                        <p className='text-xs text-grey-muted max-w-sm mx-auto'>
                            This customer has registered an account but has not completed any meal subscription checkouts yet.
                        </p>
                    </div>
                ) : (
                    <div className='admin-card p-0 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='border-b border-grey/10 bg-grey/5'>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Order ID &amp; Date
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Plan Details
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Delivery Location
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Payment
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Status
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark'>
                                            Total Amount
                                        </th>
                                        <th className='py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark text-right'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-grey/10'>
                                    {customer.orders.map((order) => {
                                        const planName =
                                            order.selectedMenus?.[0]?.name ||
                                            (order.selectionsJson ? 'Custom Meal Selection' : 'Standard Meal Plan')

                                        return (
                                            <tr key={order.id} className='hover:bg-primary/[0.03] transition-colors'>
                                                {/* ID & Date */}
                                                <td className='py-4 px-6'>
                                                    <div className='space-y-0.5'>
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className='font-bold text-xs text-grey-dark hover:text-primary transition-colors font-mono block'
                                                        >
                                                            #{order.id.substring(0, 8)}
                                                        </Link>
                                                        <span className='text-[10px] text-grey-muted block'>
                                                            {format(new Date(order.createdAt), 'dd MMM yyyy')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Plan Details */}
                                                <td className='py-4 px-6'>
                                                    <div className='space-y-1'>
                                                        <span className='font-extrabold text-xs text-grey-dark block'>
                                                            {planName}
                                                        </span>
                                                        <span className='text-[10px] text-grey-muted block'>
                                                            Starts: {format(new Date(order.startDate), 'dd MMM yyyy')} (
                                                            {order.activeDates?.length || 30} days)
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Delivery Location */}
                                                <td className='py-4 px-6'>
                                                    <div className='space-y-0.5 max-w-[200px]'>
                                                        <span className='text-xs font-bold text-grey-dark line-clamp-1'>
                                                            {order.deliveryLocation || 'UAE Location'}
                                                        </span>
                                                        <span className='text-[10px] text-grey-muted line-clamp-1'>
                                                            {order.address}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Payment Method & Status */}
                                                <td className='py-4 px-6'>
                                                    <div className='space-y-1'>
                                                        <span className='text-[10px] font-bold uppercase tracking-wider text-grey-muted block'>
                                                            {order.paymentMethod}
                                                        </span>
                                                        <span
                                                            className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                                                                order.paymentStatus === 'PAID'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                            }`}
                                                        >
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Order Status */}
                                                <td className='py-4 px-6'>
                                                    <span
                                                        className={`admin-badge ${
                                                            order.status === 'CONFIRMED'
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : order.status === 'CANCELLED'
                                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                order.status === 'CONFIRMED'
                                                                    ? 'bg-green-600'
                                                                    : order.status === 'CANCELLED'
                                                                    ? 'bg-red-600'
                                                                    : 'bg-amber-500'
                                                            }`}
                                                        />
                                                        {order.status}
                                                    </span>
                                                </td>

                                                {/* Total Amount */}
                                                <td className='py-4 px-6'>
                                                    <span className='font-extrabold text-sm text-grey-dark'>
                                                        AED {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className='py-4 px-6 text-right'>
                                                    <div className='flex items-center justify-end gap-2'>
                                                        <Link
                                                            href={`/invoice/${order.id}`}
                                                            target='_blank'
                                                            title='View Official Invoice'
                                                            className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                                                        >
                                                            <Icon icon='solar:printer-bold-duotone' className='text-lg' />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className='px-3 py-1.5 bg-grey/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-grey-dark transition-all flex items-center gap-1'
                                                        >
                                                            <span>Details</span>
                                                            <Icon icon='solar:arrow-right-bold' className='text-xs' />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Customer Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className='bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-grey/10 space-y-6'
                        >
                            <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl'>
                                        <Icon icon='solar:user-bold-duotone' />
                                    </div>
                                    <div>
                                        <h2 className='text-lg font-bold text-grey-dark'>Edit Customer Profile</h2>
                                        <p className='text-xs text-grey-muted'>Modify personal details and contacts</p>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => setIsEditModalOpen(false)}
                                    className='text-grey-muted hover:text-grey-dark p-2 rounded-xl'
                                >
                                    <Icon icon='solar:close-circle-bold' className='text-xl' />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className='space-y-4'>
                                <div>
                                    <label className='admin-label'>Full Name *</label>
                                    <input
                                        type='text'
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className='admin-input'
                                    />
                                </div>

                                <div>
                                    <label className='admin-label'>Phone Number *</label>
                                    <input
                                        type='tel'
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className='admin-input'
                                    />
                                </div>

                                <div>
                                    <label className='admin-label'>WhatsApp Number</label>
                                    <input
                                        type='tel'
                                        value={formData.whatsappNo}
                                        onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                                        className='admin-input'
                                    />
                                </div>

                                <div>
                                    <label className='admin-label'>Email Address</label>
                                    <input
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className='admin-input'
                                    />
                                </div>

                                <div className='flex justify-end gap-3 pt-4 border-t border-grey/10'>
                                    <button
                                        type='button'
                                        onClick={() => setIsEditModalOpen(false)}
                                        className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={updateMutation.isPending}
                                        className='admin-btn-primary'
                                    >
                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
