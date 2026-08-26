'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'
import { StatusToggle } from '@/app/components/Admin/StatusToggle'
import { motion, AnimatePresence } from 'framer-motion'

export interface DeliveryAreaItem {
    id: string
    name: string
    status: 'active' | 'coming_soon' | 'inactive'
    timing: string
    isPopular: boolean
    notes?: string
    sortOrder: number
    createdAt: string
    updatedAt: string
}

const columnHelper = createColumnHelper<DeliveryAreaItem>()

const TIMING_PRESETS = [
    'Breakfast, Lunch & Dinner',
    'Lunch & Dinner',
    'Dinner Only',
    'Breakfast & Lunch',
    'Custom Timings',
]

export default function AdminDeliveryAreasPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<DeliveryAreaItem | null>(null)
    const [deletingArea, setDeletingArea] = useState<DeliveryAreaItem | null>(null)
    const [activeFilter, setActiveFilter] = useState<string>('all')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        status: 'active' as 'active' | 'coming_soon' | 'inactive',
        timing: 'Breakfast, Lunch & Dinner',
        isPopular: false,
        notes: '',
        sortOrder: 0,
    })

    const queryClient = useQueryClient()

    const { data: deliveryAreas = [], isLoading } = useQuery<DeliveryAreaItem[]>({
        queryKey: ['delivery-areas'],
        queryFn: async () => {
            const response = await axios.get('/api/delivery-areas')
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: typeof formData & { id?: string }) => {
            if (data.id) {
                return axios.put(`/api/delivery-areas/${data.id}`, data)
            }
            return axios.post('/api/delivery-areas', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-areas'] })
            toast.success(editingArea ? 'Delivery area updated successfully' : 'Delivery area added successfully')
            closeModal()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Something went wrong')
        },
    })

    // Instant toggle active/inactive mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
            return axios.put(`/api/delivery-areas/${id}`, { status: newStatus })
        },
        onMutate: async ({ id, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ['delivery-areas'] })
            const prev = queryClient.getQueryData<DeliveryAreaItem[]>(['delivery-areas'])
            if (prev) {
                queryClient.setQueryData<DeliveryAreaItem[]>(
                    ['delivery-areas'],
                    prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
                )
            }
            return { prev }
        },
        onError: (_err, _vars, context) => {
            if (context?.prev) {
                queryClient.setQueryData(['delivery-areas'], context.prev)
            }
            toast.error('Failed to update area status')
        },
        onSuccess: () => {
            toast.success('Status updated', { duration: 1500 })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-areas'] })
        },
    })

    // Instant toggle popular tag mutation
    const togglePopularMutation = useMutation({
        mutationFn: async ({ id, isPopular }: { id: string; isPopular: boolean }) => {
            return axios.put(`/api/delivery-areas/${id}`, { isPopular })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-areas'] })
            toast.success('Popular tag updated', { duration: 1500 })
        },
        onError: () => {
            toast.error('Failed to update popular tag')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/delivery-areas/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-areas'] })
            toast.success('Delivery area deleted successfully')
            setDeletingArea(null)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete delivery area')
        },
    })

    const openCreateModal = () => {
        setEditingArea(null)
        setFormData({
            name: '',
            status: 'active',
            timing: 'Breakfast, Lunch & Dinner',
            isPopular: false,
            notes: '',
            sortOrder: deliveryAreas.length + 1,
        })
        setIsModalOpen(true)
    }

    const openEditModal = (area: DeliveryAreaItem) => {
        setEditingArea(area)
        setFormData({
            name: area.name,
            status: area.status,
            timing: area.timing,
            isPopular: area.isPopular,
            notes: area.notes || '',
            sortOrder: area.sortOrder ?? 0,
        })
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingArea(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            toast.error('Please enter an area name')
            return
        }
        mutation.mutate({
            ...formData,
            id: editingArea?.id,
        })
    }

    // Filter tabs calculation
    const filterOptions: FilterOption[] = useMemo(() => {
        const activeCount = deliveryAreas.filter(a => a.status === 'active').length
        const comingSoonCount = deliveryAreas.filter(a => a.status === 'coming_soon').length
        const popularCount = deliveryAreas.filter(a => a.isPopular).length

        return [
            { id: 'all', label: 'All Zones', count: deliveryAreas.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'coming_soon', label: 'Coming Soon', count: comingSoonCount },
            { id: 'popular', label: 'Popular Tags', count: popularCount },
        ]
    }, [deliveryAreas])

    // Filtered data based on selected tab
    const filteredAreas = useMemo(() => {
        if (activeFilter === 'active') {
            return deliveryAreas.filter(a => a.status === 'active')
        }
        if (activeFilter === 'coming_soon') {
            return deliveryAreas.filter(a => a.status === 'coming_soon')
        }
        if (activeFilter === 'popular') {
            return deliveryAreas.filter(a => a.isPopular)
        }
        return deliveryAreas
    }, [deliveryAreas, activeFilter])

    // Stats cards data
    const stats = useMemo(() => {
        const total = deliveryAreas.length
        const active = deliveryAreas.filter(a => a.status === 'active').length
        const comingSoon = deliveryAreas.filter(a => a.status === 'coming_soon').length
        const popular = deliveryAreas.filter(a => a.isPopular).length
        return { total, active, comingSoon, popular }
    }, [deliveryAreas])

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Area Name',
            cell: info => {
                const area = info.row.original
                return (
                    <div className='flex items-center gap-3'>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            area.status === 'active'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : area.status === 'coming_soon'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-grey/10 text-grey-muted'
                        }`}>
                            <Icon icon='solar:map-point-wave-bold-duotone' />
                        </div>
                        <div>
                            <div className='font-bold text-grey-dark text-sm flex items-center gap-2'>
                                {info.getValue()}
                                {area.isPopular && (
                                    <span className='px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center gap-1'>
                                        <Icon icon='solar:star-bold' className='text-amber-500 text-xs' />
                                        Popular
                                    </span>
                                )}
                            </div>
                            {area.notes && (
                                <p className='text-xs text-grey-muted mt-0.5 line-clamp-1 max-w-[260px]'>{area.notes}</p>
                            )}
                        </div>
                    </div>
                )
            },
        }),
        columnHelper.accessor('timing', {
            header: 'Delivery Timing',
            cell: info => (
                <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-primary/20 text-xs font-bold text-grey-dark'>
                    <Icon icon='solar:clock-circle-bold-duotone' className='text-primary text-sm shrink-0' />
                    {info.getValue() || 'Lunch & Dinner'}
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const area = info.row.original
                if (area.status === 'coming_soon') {
                    return (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold'>
                            <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse' />
                            Coming Soon
                        </span>
                    )
                }

                return (
                    <StatusToggle
                        isActive={area.status === 'active'}
                        isLoading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === area.id}
                        onToggle={(active) => {
                            toggleStatusMutation.mutate({
                                id: area.id,
                                newStatus: active ? 'active' : 'inactive'
                            })
                        }}
                    />
                )
            },
        }),
        columnHelper.accessor('isPopular', {
            header: 'Search Tag Pill',
            cell: info => {
                const area = info.row.original
                return (
                    <button
                        onClick={() => togglePopularMutation.mutate({ id: area.id, isPopular: !area.isPopular })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            area.isPopular
                                ? 'bg-primary/15 text-grey-dark border-primary/30 hover:bg-primary/25'
                                : 'bg-grey/5 text-grey-muted border-grey/15 hover:bg-grey/10'
                        }`}
                        title='Click to toggle quick search pill tag'
                    >
                        <Icon
                            icon={area.isPopular ? 'solar:star-bold' : 'solar:star-linear'}
                            className={area.isPopular ? 'text-amber-500 text-sm' : 'text-grey-muted text-sm'}
                        />
                        {area.isPopular ? 'Shown on Site' : 'Hidden'}
                    </button>
                )
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => {
                const area = info.row.original
                return (
                    <div className='flex items-center justify-end gap-1.5'>
                        <button
                            onClick={() => openEditModal(area)}
                            className='p-2 rounded-xl text-grey-muted hover:text-primary hover:bg-primary/10 transition-colors'
                            title='Edit Area'
                        >
                            <Icon icon='solar:pen-2-bold-duotone' className='text-lg' />
                        </button>
                        <button
                            onClick={() => setDeletingArea(area)}
                            className='p-2 rounded-xl text-grey-muted hover:text-red-600 hover:bg-red-50 transition-colors'
                            title='Delete Area'
                        >
                            <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
                        </button>
                    </div>
                )
            },
        }),
    ], [toggleStatusMutation, togglePopularMutation])

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-extrabold text-grey-dark tracking-tight flex items-center gap-2.5'>
                        <Icon icon='solar:map-point-wave-bold-duotone' className='text-primary text-3xl' />
                        Delivery Areas
                    </h1>
                    <p className='text-sm text-grey-muted font-medium mt-1'>
                        Manage Dubai delivery locations, service timings, and search coverage pills shown to customers.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer shrink-0'
                >
                    <Icon icon='solar:add-circle-bold' className='text-lg' />
                    Add Delivery Area
                </button>
            </div>

            {/* KPI Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0'>
                        <Icon icon='solar:map-point-bold-duotone' />
                    </div>
                    <div>
                        <div className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Total Areas</div>
                        <div className='text-2xl font-extrabold text-grey-dark mt-0.5'>{stats.total}</div>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0'>
                        <Icon icon='solar:check-circle-bold-duotone' />
                    </div>
                    <div>
                        <div className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Active Delivery</div>
                        <div className='text-2xl font-extrabold text-emerald-600 mt-0.5'>{stats.active}</div>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0'>
                        <Icon icon='solar:hourglass-bold-duotone' />
                    </div>
                    <div>
                        <div className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Coming Soon</div>
                        <div className='text-2xl font-extrabold text-amber-600 mt-0.5'>{stats.comingSoon}</div>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0'>
                        <Icon icon='solar:star-bold-duotone' />
                    </div>
                    <div>
                        <div className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Popular Tag Pills</div>
                        <div className='text-2xl font-extrabold text-purple-600 mt-0.5'>{stats.popular}</div>
                    </div>
                </div>
            </div>

            {/* DataTable */}
            {isLoading ? (
                <div className='bg-white rounded-3xl border border-grey/10 p-12 text-center'>
                    <Icon icon='line-md:loading-loop' className='text-4xl text-primary mx-auto mb-3 animate-spin' />
                    <p className='text-sm font-bold text-grey-muted'>Loading delivery zones...</p>
                </div>
            ) : (
                <DataTable
                    data={filteredAreas}
                    columns={columns}
                    searchPlaceholder='Search by area name, timing or notes...'
                    filterOptions={filterOptions}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    emptyMessage='No delivery areas found'
                    emptySubtext='Click "Add Delivery Area" above to create your first delivery coverage zone'
                    initialPageSize={10}
                />
            )}

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className='bg-white rounded-3xl border border-grey/10 shadow-2xl w-full max-w-lg overflow-hidden'
                        >
                            <div className='p-6 border-b border-grey/10 flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl'>
                                        <Icon icon='solar:map-point-wave-bold-duotone' />
                                    </div>
                                    <h2 className='text-lg font-extrabold text-grey-dark'>
                                        {editingArea ? 'Edit Delivery Area' : 'Add New Delivery Area'}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className='p-2 rounded-xl text-grey-muted hover:text-grey-dark hover:bg-grey/5 transition-colors'
                                >
                                    <Icon icon='solar:close-circle-bold' className='text-xl' />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                                <div>
                                    <label className='block text-xs font-bold text-grey-dark uppercase tracking-wider mb-1.5'>
                                        Area Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder='e.g., Al Quoz, Downtown Dubai, Al Nahda'
                                        className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/15 text-sm font-semibold text-grey-dark placeholder:text-grey-muted focus:outline-none focus:border-primary focus:bg-white transition-all'
                                    />
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-xs font-bold text-grey-dark uppercase tracking-wider mb-1.5'>
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/15 text-sm font-semibold text-grey-dark focus:outline-none focus:border-primary focus:bg-white transition-all'
                                        >
                                            <option value='active'>Active (Deliveries On)</option>
                                            <option value='coming_soon'>Coming Soon</option>
                                            <option value='inactive'>Inactive (Paused)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-bold text-grey-dark uppercase tracking-wider mb-1.5'>
                                            Sort Order
                                        </label>
                                        <input
                                            type='number'
                                            value={formData.sortOrder}
                                            onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/15 text-sm font-semibold text-grey-dark focus:outline-none focus:border-primary focus:bg-white transition-all'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-xs font-bold text-grey-dark uppercase tracking-wider mb-1.5'>
                                        Delivery Timing
                                    </label>
                                    <div className='space-y-2'>
                                        <input
                                            type='text'
                                            value={formData.timing}
                                            onChange={e => setFormData({ ...formData, timing: e.target.value })}
                                            placeholder='e.g., Breakfast, Lunch & Dinner'
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/15 text-sm font-semibold text-grey-dark placeholder:text-grey-muted focus:outline-none focus:border-primary focus:bg-white transition-all'
                                        />
                                        <div className='flex flex-wrap gap-1.5'>
                                            {TIMING_PRESETS.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    type='button'
                                                    onClick={() => setFormData({ ...formData, timing: preset })}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                        formData.timing === preset
                                                            ? 'bg-primary/20 text-grey-dark border-primary/40'
                                                            : 'bg-grey/5 text-grey-muted border-grey/10 hover:bg-grey/10'
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-xs font-bold text-grey-dark uppercase tracking-wider mb-1.5'>
                                        Internal Notes / Landmarks
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder='Optional notes on building clusters, routes, or dispatch times...'
                                        className='w-full px-4 py-2.5 rounded-xl bg-grey/5 border border-grey/15 text-sm font-medium text-grey-dark placeholder:text-grey-muted focus:outline-none focus:border-primary focus:bg-white transition-all'
                                    />
                                </div>

                                <div className='pt-2 border-t border-grey/10 flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <input
                                            type='checkbox'
                                            id='isPopular'
                                            checked={formData.isPopular}
                                            onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                                            className='w-4 h-4 text-primary accent-primary rounded cursor-pointer'
                                        />
                                        <label htmlFor='isPopular' className='text-xs font-bold text-grey-dark cursor-pointer'>
                                            Highlight as Popular Tag Pill (Homepage / Search)
                                        </label>
                                    </div>
                                </div>

                                <div className='flex items-center justify-end gap-3 pt-4 border-t border-grey/10'>
                                    <button
                                        type='button'
                                        onClick={closeModal}
                                        className='px-5 py-2.5 rounded-xl text-grey-dark font-bold text-sm hover:bg-grey/5 transition-colors'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={mutation.isPending}
                                        className='px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50'
                                    >
                                        {mutation.isPending ? 'Saving...' : editingArea ? 'Update Area' : 'Create Area'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingArea && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className='bg-white rounded-3xl border border-grey/10 shadow-2xl w-full max-w-md p-6'
                        >
                            <div className='w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4'>
                                <Icon icon='solar:trash-bin-trash-bold-duotone' />
                            </div>
                            <h3 className='text-lg font-extrabold text-grey-dark mb-1'>Delete Delivery Area?</h3>
                            <p className='text-sm text-grey-muted mb-6 leading-relaxed'>
                                Are you sure you want to remove <span className='font-bold text-grey-dark'>{deletingArea.name}</span>? Customers searching for this area will no longer see it as an active delivery zone.
                            </p>
                            <div className='flex items-center justify-end gap-3'>
                                <button
                                    onClick={() => setDeletingArea(null)}
                                    className='px-5 py-2.5 rounded-xl text-grey-dark font-bold text-sm hover:bg-grey/5 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(deletingArea.id)}
                                    disabled={deleteMutation.isPending}
                                    className='px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50'
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Zone'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
