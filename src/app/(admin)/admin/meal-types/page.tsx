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

type MealType = {
    id: string
    name: string
    icon?: string
    isActive?: boolean
    _count?: { foodMenus: number }
    createdAt: string
}

const columnHelper = createColumnHelper<MealType>()

const ICON_PRESETS = [
    { label: 'Sunrise (Breakfast)', icon: 'solar:sunrise-bold-duotone' },
    { label: 'Sun (Lunch)', icon: 'solar:sun-bold-duotone' },
    { label: 'Moon (Dinner)', icon: 'solar:moon-stars-bold-duotone' },
    { label: 'Cup / Drink', icon: 'solar:cup-hot-bold-duotone' },
    { label: 'Burger / Snack', icon: 'solar:hamburger-menu-bold-duotone' },
    { label: 'Clock', icon: 'solar:clock-circle-bold-duotone' },
]

export default function MealTypesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMealType, setEditingMealType] = useState<MealType | null>(null)
    const [name, setName] = useState('')
    const [icon, setIcon] = useState('solar:cup-hot-bold-duotone')
    const [isActive, setIsActive] = useState(true)
    const [deletingMealType, setDeletingMealType] = useState<MealType | null>(null)
    const [activeFilter, setActiveFilter] = useState<string>('all')

    const queryClient = useQueryClient()

    const { data: rawMealTypes = [], isLoading } = useQuery<MealType[]>({
        queryKey: ['meal-types'],
        queryFn: async () => {
            const response = await axios.get('/api/meal-types')
            return response.data
        },
    })

    const mealTypes = useMemo(() => Array.isArray(rawMealTypes) ? rawMealTypes : [], [rawMealTypes])

    const mutation = useMutation({
        mutationFn: async (data: { name: string; icon?: string; isActive?: boolean; id?: string }) => {
            if (data.id) {
                return axios.put(`/api/meal-types/${data.id}`, { name: data.name, icon: data.icon, isActive: data.isActive })
            }
            return axios.post('/api/meal-types', { name: data.name, icon: data.icon, isActive: data.isActive })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-types'] })
            toast.success(editingMealType ? 'Meal type updated successfully' : 'Meal type created successfully')
            closeModal()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Something went wrong')
        },
    })

    // Instant status toggle mutation with optimistic update
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return axios.patch(`/api/meal-types/${id}`, { isActive })
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['meal-types'] })
            const previous = queryClient.getQueryData<MealType[]>(['meal-types'])
            queryClient.setQueryData<MealType[]>(['meal-types'], (old = []) =>
                old.map((item) => (item.id === id ? { ...item, isActive } : item))
            )
            return { previous }
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['meal-types'], context.previous)
            }
            toast.error('Failed to update meal type status')
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isActive ? 'Meal type activated' : 'Meal type deactivated')
            queryClient.invalidateQueries({ queryKey: ['meal-types'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/meal-types/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-types'] })
            toast.success('Meal type deleted successfully')
            setDeletingMealType(null)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete meal type')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingMealType(null)
        setName('')
        setIcon('solar:cup-hot-bold-duotone')
        setIsActive(true)
    }

    const openModal = (item?: MealType) => {
        if (item) {
            setEditingMealType(item)
            setName(item.name)
            setIcon(item.icon || 'solar:cup-hot-bold-duotone')
            setIsActive(item.isActive !== false)
        } else {
            setEditingMealType(null)
            setName('')
            setIcon('solar:cup-hot-bold-duotone')
            setIsActive(true)
        }
        setIsModalOpen(true)
    }

    // Filter computation
    const filteredMealTypes = useMemo(() => {
        if (activeFilter === 'active') {
            return mealTypes.filter((c) => c.isActive !== false)
        }
        if (activeFilter === 'inactive') {
            return mealTypes.filter((c) => c.isActive === false)
        }
        return mealTypes
    }, [mealTypes, activeFilter])

    const filterOptions: FilterOption[] = useMemo(() => {
        const activeCount = mealTypes.filter((c) => c.isActive !== false).length
        const inactiveCount = mealTypes.filter((c) => c.isActive === false).length

        return [
            { id: 'all', label: 'All Meal Types', count: mealTypes.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'inactive', label: 'Inactive', count: inactiveCount },
        ]
    }, [mealTypes])

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Meal Type',
                cell: (info) => {
                    const name = info.getValue()
                    const row = info.row.original
                    const isItemActive = row.isActive !== false
                    const itemIcon = row.icon || 'solar:cup-hot-bold-duotone'

                    return (
                        <div className='flex items-center gap-3.5'>
                            <div
                                className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-xl shrink-0 font-bold ${
                                    isItemActive
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-grey/10 border-grey/20 text-grey-muted'
                                }`}
                            >
                                <Icon icon={itemIcon} />
                            </div>
                            <span
                                className={`font-extrabold text-sm tracking-tight block ${
                                    isItemActive ? 'text-grey-dark' : 'text-grey-muted line-through opacity-75'
                                }`}
                            >
                                {name}
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('_count.foodMenus', {
                header: 'Attached Plans',
                cell: (info) => {
                    const count = info.getValue() || 0
                    return (
                        <span className='admin-badge'>
                            <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                            {count} {count === 1 ? 'Plan' : 'Plans'}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: (info) => {
                    const row = info.row.original
                    const isItemActive = info.getValue() !== false

                    return (
                        <StatusToggle
                            isActive={isItemActive}
                            onToggle={(newStatus) =>
                                toggleStatusMutation.mutate({ id: row.id, isActive: newStatus })
                            }
                            isLoading={
                                toggleStatusMutation.isPending &&
                                toggleStatusMutation.variables?.id === row.id
                            }
                        />
                    )
                },
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created Date',
                cell: (info) => (
                    <span className='text-xs font-semibold text-grey-muted'>
                        {new Date(info.getValue()).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => {
                    const row = info.row.original
                    return (
                        <div className='flex items-center gap-1.5'>
                            <button
                                type='button'
                                onClick={() => openModal(row)}
                                title='Edit Meal Type'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                            </button>
                            <button
                                type='button'
                                onClick={() => setDeletingMealType(row)}
                                title='Delete Meal Type'
                                className='p-2 text-grey-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
                            </button>
                        </div>
                    )
                },
            }),
        ],
        [toggleStatusMutation]
    )

    if (isLoading) {
        return (
            <div className='min-h-[50vh] flex flex-col items-center justify-center gap-3'>
                <Icon icon='line-md:loading-loop' className='text-4xl text-primary' />
                <p className='text-xs font-bold text-grey-muted'>Loading meal types...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Meal Types</h1>
                    <p className='admin-page-subtitle'>Manage meal serving schedules (Breakfast, Lunch, Dinner, etc.)</p>
                </div>
                <button
                    type='button'
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>Add Meal Type</span>
                </button>
            </div>

            {/* Centralized DataTable with Search, Status Filter, Sorting, and Pagination */}
            <DataTable
                data={filteredMealTypes}
                columns={columns}
                searchPlaceholder='Search meal types...'
                filterOptions={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                emptyMessage='No meal types found'
                emptySubtext='Click "Add Meal Type" above to create your first meal schedule.'
                initialPageSize={5}
            />

            {/* Add / Edit Meal Type Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className='bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-grey/10'
                        >
                            <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                                <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                                    <Icon icon='solar:clock-circle-bold-duotone' className='text-primary text-2xl' />
                                    {editingMealType ? 'Edit Meal Type' : 'New Meal Type'}
                                </h4>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='text-grey-muted hover:text-grey-dark p-1.5 rounded-xl hover:bg-grey/5 transition-colors cursor-pointer'
                                >
                                    <Icon icon='solar:close-circle-bold' className='text-2xl' />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    mutation.mutate({
                                        name,
                                        icon,
                                        isActive,
                                        id: editingMealType?.id,
                                    })
                                }}
                                className='space-y-5'
                            >
                                <div>
                                    <label className='admin-label'>Meal Type Name *</label>
                                    <input
                                        type='text'
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className='admin-input'
                                        placeholder='e.g. Breakfast, Lunch, Dinner, Snacks...'
                                    />
                                </div>

                                {/* Icon Selector */}
                                <div>
                                    <label className='admin-label'>Icon Style</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {ICON_PRESETS.map((preset) => (
                                            <button
                                                key={preset.icon}
                                                type='button'
                                                onClick={() => setIcon(preset.icon)}
                                                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                                    icon === preset.icon
                                                        ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                                        : 'bg-grey/5 border-grey/10 text-grey-muted hover:border-primary/40'
                                                }`}
                                            >
                                                <Icon icon={preset.icon} className='text-xl' />
                                                <span className='text-[10px] truncate max-w-[80px]'>{preset.label.split(' ')[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 flex items-center justify-between'>
                                    <div>
                                        <span className='text-xs font-bold text-grey-dark block'>
                                            Meal Type Status
                                        </span>
                                        <span className='text-[11px] text-grey-muted'>
                                            Active meal types appear when creating food plans
                                        </span>
                                    </div>
                                    <StatusToggle
                                        isActive={isActive}
                                        onToggle={setIsActive}
                                    />
                                </div>

                                <div className='flex flex-col gap-3 pt-2'>
                                    <button
                                        type='submit'
                                        disabled={mutation.isPending}
                                        className='admin-btn-primary w-full py-3.5'
                                    >
                                        {mutation.isPending ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-xl' />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <span>Save Meal Type</span>
                                        )}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={closeModal}
                                        className='w-full py-3 bg-grey/5 text-grey-dark rounded-xl text-sm font-bold hover:bg-grey/10 transition-all cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {deletingMealType && (
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
                                <h3 className='text-lg font-bold text-grey-dark'>Delete Meal Type</h3>
                                <p className='text-xs text-grey-muted leading-relaxed'>
                                    Are you sure you want to delete meal type{' '}
                                    <strong className='text-grey-dark font-bold'>{deletingMealType.name}</strong>?
                                </p>
                            </div>

                            <div className='flex justify-center gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => setDeletingMealType(null)}
                                    className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all cursor-pointer'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingMealType.id)}
                                    className='px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer'
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
