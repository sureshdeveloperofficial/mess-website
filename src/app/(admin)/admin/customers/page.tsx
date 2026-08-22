'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'

interface Customer {
    id: string
    name: string
    phone: string
    email: string | null
    whatsappNo: string | null
    createdAt: string
    updatedAt: string
    totalOrders: number
    totalSpent: number
    latestOrderDate: string | null
    _count?: {
        orders: number
    }
}

const columnHelper = createColumnHelper<Customer>()

export default function CustomersPage() {
    const queryClient = useQueryClient()
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [activeFilter, setActiveFilter] = useState<string>('all')

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

    // Form inputs state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        whatsappNo: '',
    })

    // Fetch Customers
    const { data: rawCustomers = [], isLoading } = useQuery<Customer[]>({
        queryKey: ['admin-customers'],
        queryFn: async () => {
            const response = await axios.get('/api/admin/customers')
            return response.data
        },
    })

    // Normalise customers count
    const customers = useMemo(() => {
        return rawCustomers.map((c) => ({
            ...c,
            totalOrders: c.totalOrders ?? c._count?.orders ?? 0,
            totalSpent: c.totalSpent ?? 0,
        }))
    }, [rawCustomers])

    // Filter computation
    const filteredCustomers = useMemo(() => {
        if (activeFilter === 'with_orders') {
            return customers.filter((c) => c.totalOrders > 0)
        }
        if (activeFilter === 'zero_orders') {
            return customers.filter((c) => c.totalOrders === 0)
        }
        return customers
    }, [customers, activeFilter])

    // Filter options configuration
    const filterOptions: FilterOption[] = useMemo(() => {
        const withOrdersCount = customers.filter((c) => c.totalOrders > 0).length
        const zeroOrdersCount = customers.filter((c) => c.totalOrders === 0).length

        return [
            { id: 'all', label: 'All Members', count: customers.length },
            { id: 'with_orders', label: 'Subscribers (1+ Orders)', count: withOrdersCount },
            { id: 'zero_orders', label: 'No Orders Yet', count: zeroOrdersCount },
        ]
    }, [customers])

    // Create Customer Mutation
    const createMutation = useMutation({
        mutationFn: async (newCustomerData: typeof formData) => {
            const response = await axios.post('/api/admin/customers', newCustomerData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
            toast.success('Customer registered successfully!')
            setIsAddModalOpen(false)
            resetForm()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to register customer')
        },
    })

    // Edit Customer Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
            const response = await axios.patch(`/api/admin/customers/${id}`, data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
            toast.success('Customer details updated successfully!')
            setEditingCustomer(null)
            resetForm()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to update customer')
        },
    })

    // Delete Customer Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`/api/admin/customers/${id}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
            toast.success('Customer deleted successfully')
            setDeletingCustomer(null)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete customer')
        },
    })

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            whatsappNo: '',
        })
    }

    const openCreateModal = () => {
        resetForm()
        setIsAddModalOpen(true)
    }

    const openEditModal = (customer: Customer) => {
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            whatsappNo: customer.whatsappNo || '',
        })
        setEditingCustomer(customer)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data: formData })
        } else {
            createMutation.mutate(formData)
        }
    }

    // Helper: copy phone to whatsapp field
    const handleCopyPhoneToWhatsApp = () => {
        setFormData((prev) => ({ ...prev, whatsappNo: prev.phone }))
    }

    // Table Column Definitions
    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Customer Details',
                cell: (info) => {
                    const row = info.row.original
                    const initials = row.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()

                    return (
                        <div className='flex items-center gap-3.5'>
                            <div className='w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 shadow-xs'>
                                {initials || <Icon icon='solar:user-bold' className='text-lg' />}
                            </div>
                            <div className='min-w-0'>
                                <Link
                                    href={`/admin/customers/${row.id}`}
                                    className='font-extrabold text-sm text-grey-dark hover:text-primary transition-colors line-clamp-1 block'
                                    title='View Customer Profile'
                                >
                                    {row.name}
                                </Link>
                                <span className='text-[10px] font-mono text-grey-muted'>
                                    ID: {row.id.substring(0, 8)}
                                </span>
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('phone', {
                header: 'Phone & WhatsApp',
                cell: (info) => {
                    const row = info.row.original
                    return (
                        <div className='space-y-1'>
                            <a
                                href={`tel:${row.phone}`}
                                className='flex items-center gap-1.5 text-xs font-bold text-grey-dark hover:text-primary transition-colors'
                            >
                                <Icon icon='solar:phone-bold' className='text-grey-muted text-xs' />
                                <span>{row.phone}</span>
                            </a>
                            {row.whatsappNo ? (
                                <a
                                    href={`https://wa.me/${row.whatsappNo.replace(/[^0-9]/g, '')}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-1.5 text-[11px] font-bold text-green-600 hover:underline'
                                    title='Chat on WhatsApp'
                                >
                                    <Icon icon='logos:whatsapp-icon' className='text-xs' />
                                    <span>{row.whatsappNo}</span>
                                </a>
                            ) : (
                                <span className='text-[10px] text-grey-muted/60 italic block'>No WhatsApp</span>
                            )}
                        </div>
                    )
                },
            }),
            columnHelper.accessor('email', {
                header: 'Email Address',
                cell: (info) => {
                    const email = info.getValue()
                    return email ? (
                        <a
                            href={`mailto:${email}`}
                            className='text-xs font-semibold text-grey-muted hover:text-primary transition-colors line-clamp-1 max-w-[200px] block'
                            title={email}
                        >
                            {email}
                        </a>
                    ) : (
                        <span className='text-xs text-grey-muted/50 font-medium'>—</span>
                    )
                },
            }),
            columnHelper.accessor('totalOrders', {
                header: 'Orders & Plans',
                cell: (info) => {
                    const row = info.row.original
                    const hasOrders = row.totalOrders > 0

                    return (
                        <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                                <span
                                    className={`admin-badge ${
                                        hasOrders ? 'bg-primary/15 text-grey-dark' : 'bg-grey/5 text-grey-muted'
                                    }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            hasOrders ? 'bg-primary' : 'bg-grey-muted'
                                        }`}
                                    />
                                    {row.totalOrders} {row.totalOrders === 1 ? 'Plan' : 'Plans'}
                                </span>
                            </div>
                            {row.totalSpent > 0 && (
                                <span className='text-[11px] font-extrabold text-grey-dark block'>
                                    AED {row.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            )}
                        </div>
                    )
                },
            }),
            columnHelper.accessor('createdAt', {
                header: 'Joined Date',
                cell: (info) => (
                    <div className='space-y-0.5'>
                        <span className='text-xs font-bold text-grey-dark block'>
                            {new Date(info.getValue()).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                        <span className='text-[10px] text-grey-muted'>
                            {new Date(info.getValue()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => {
                    const row = info.row.original
                    return (
                        <div className='flex items-center gap-1.5'>
                            {/* View Customer Details */}
                            <Link
                                href={`/admin/customers/${row.id}`}
                                title='View Full Profile & Orders'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                            >
                                <Icon icon='solar:eye-bold-duotone' className='text-lg' />
                            </Link>

                            {/* View Orders directly */}
                            <Link
                                href={`/admin/orders?search=${encodeURIComponent(row.phone)}`}
                                title='View Customer Orders'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                            >
                                <Icon icon='solar:cart-large-bold' className='text-base' />
                            </Link>

                            {/* Edit Customer */}
                            <button
                                type='button'
                                onClick={() => openEditModal(row)}
                                title='Edit Customer Details'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                            </button>

                            {/* Delete Customer */}
                            <button
                                type='button'
                                onClick={() => setDeletingCustomer(row)}
                                title='Delete Customer'
                                className='p-2 text-grey-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
                            </button>
                        </div>
                    )
                },
            }),
        ],
        []
    )

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[420px] gap-3'>
                <Icon icon='line-md:loading-loop' className='text-4xl text-primary' />
                <p className='text-xs font-bold text-grey-muted'>Loading customers directory...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Page Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Customer Directory</h1>
                    <p className='admin-page-subtitle'>
                        Manage, filter, and inspect all registered restaurant members and subscribers
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    <button
                        type='button'
                        onClick={openCreateModal}
                        className='admin-btn-primary flex items-center gap-2'
                    >
                        <Icon icon='solar:user-plus-bold-duotone' className='text-xl' />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            {/* Reusable DataTable Component */}
            <DataTable
                data={filteredCustomers}
                columns={columns}
                searchPlaceholder='Search by name, phone, or email...'
                filterOptions={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                emptyMessage='No customers found'
                emptySubtext='Try adjusting your search criteria or add a new customer.'
                initialPageSize={10}
            />

            {/* Add / Edit Customer Modal */}
            <AnimatePresence>
                {(isAddModalOpen || editingCustomer) && (
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
                                        <h2 className='text-lg font-bold text-grey-dark'>
                                            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                                        </h2>
                                        <p className='text-xs text-grey-muted'>
                                            {editingCustomer
                                                ? 'Update customer contact details'
                                                : 'Register a new customer account'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setIsAddModalOpen(false)
                                        setEditingCustomer(null)
                                        resetForm()
                                    }}
                                    className='text-grey-muted hover:text-grey-dark p-2 rounded-xl'
                                >
                                    <Icon icon='solar:close-circle-bold' className='text-xl' />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className='space-y-4'>
                                {/* Full Name */}
                                <div>
                                    <label className='admin-label'>Full Name *</label>
                                    <input
                                        type='text'
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder='e.g. John Doe'
                                        className='admin-input'
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className='admin-label'>Phone Number *</label>
                                    <input
                                        type='tel'
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder='e.g. +971 50 123 4567'
                                        className='admin-input'
                                    />
                                </div>

                                {/* WhatsApp Number with copy helper */}
                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='admin-label mb-0'>WhatsApp Number</label>
                                        {formData.phone && (
                                            <button
                                                type='button'
                                                onClick={handleCopyPhoneToWhatsApp}
                                                className='text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer'
                                            >
                                                <Icon icon='solar:copy-bold' />
                                                <span>Same as Phone</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type='tel'
                                        value={formData.whatsappNo}
                                        onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                                        placeholder='e.g. +971 50 123 4567'
                                        className='admin-input'
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className='admin-label'>Email Address</label>
                                    <input
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder='e.g. customer@example.com'
                                        className='admin-input'
                                    />
                                </div>

                                <div className='flex justify-end gap-3 pt-4 border-t border-grey/10'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setIsAddModalOpen(false)
                                            setEditingCustomer(null)
                                            resetForm()
                                        }}
                                        className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className='admin-btn-primary'
                                    >
                                        {createMutation.isPending || updateMutation.isPending ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-lg' />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <span>{editingCustomer ? 'Update Customer' : 'Create Customer'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Customer Confirmation Modal */}
            <AnimatePresence>
                {deletingCustomer && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className='bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-grey/10 space-y-6 text-center'
                        >
                            <div className='w-14 h-14 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center text-2xl border border-red-100'>
                                <Icon icon='solar:danger-triangle-bold-duotone' />
                            </div>

                            <div className='space-y-2'>
                                <h3 className='text-lg font-bold text-grey-dark'>Delete Customer Record</h3>
                                <p className='text-xs text-grey-muted leading-relaxed'>
                                    Are you sure you want to delete{' '}
                                    <strong className='text-grey-dark font-bold'>{deletingCustomer.name}</strong>?
                                    {deletingCustomer.totalOrders > 0 && (
                                        <span className='block text-red-600 font-bold mt-1'>
                                            Warning: This customer has {deletingCustomer.totalOrders} orders that will also be removed.
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className='flex justify-center gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => setDeletingCustomer(null)}
                                    className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingCustomer.id)}
                                    className='px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/20 disabled:opacity-50'
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
