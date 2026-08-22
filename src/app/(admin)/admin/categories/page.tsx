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

type Category = {
    id: string
    name: string
    isActive?: boolean
    _count?: { foodItems: number }
    createdAt: string
}

const columnHelper = createColumnHelper<Category>()

export default function CategoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categoryName, setCategoryName] = useState('')
    const [categoryIsActive, setCategoryIsActive] = useState(true)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [activeFilter, setActiveFilter] = useState<string>('all')

    const queryClient = useQueryClient()

    const { data: categories = [], isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: { name: string; isActive?: boolean; id?: string }) => {
            if (data.id) {
                return axios.put(`/api/categories/${data.id}`, { name: data.name, isActive: data.isActive })
            }
            return axios.post('/api/categories', { name: data.name, isActive: data.isActive })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success(editingCategory ? 'Food category updated successfully' : 'Food category created successfully')
            closeModal()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Something went wrong')
        },
    })

    // Instant status toggle mutation with optimistic update
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return axios.patch(`/api/categories/${id}`, { isActive })
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] })
            const previousCategories = queryClient.getQueryData<Category[]>(['categories'])
            queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
                old.map((cat) => (cat.id === id ? { ...cat, isActive } : cat))
            )
            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories'], context.previousCategories)
            }
            toast.error('Failed to update category status')
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isActive ? 'Category activated' : 'Category deactivated')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/categories/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success('Food category deleted successfully')
            setDeletingCategory(null)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete category')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
        setCategoryName('')
        setCategoryIsActive(true)
    }

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setCategoryName(category.name)
            setCategoryIsActive(category.isActive !== false)
        } else {
            setEditingCategory(null)
            setCategoryName('')
            setCategoryIsActive(true)
        }
        setIsModalOpen(true)
    }

    // Filter computation
    const filteredCategories = useMemo(() => {
        if (activeFilter === 'active') {
            return categories.filter((c) => c.isActive !== false)
        }
        if (activeFilter === 'inactive') {
            return categories.filter((c) => c.isActive === false)
        }
        return categories
    }, [categories, activeFilter])

    const filterOptions: FilterOption[] = useMemo(() => {
        const activeCount = categories.filter((c) => c.isActive !== false).length
        const inactiveCount = categories.filter((c) => c.isActive === false).length

        return [
            { id: 'all', label: 'All Categories', count: categories.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'inactive', label: 'Inactive', count: inactiveCount },
        ]
    }, [categories])

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Food Category Name',
                cell: (info) => {
                    const name = info.getValue()
                    const row = info.row.original
                    const isActive = row.isActive !== false

                    return (
                        <div className='flex items-center gap-3'>
                            <div
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 font-bold ${
                                    isActive
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-grey/10 border-grey/20 text-grey-muted'
                                }`}
                            >
                                <Icon icon='solar:list-bold' />
                            </div>
                            <div className='space-y-0.5'>
                                <span
                                    className={`font-extrabold text-sm tracking-tight block ${
                                        isActive ? 'text-grey-dark' : 'text-grey-muted line-through opacity-75'
                                    }`}
                                >
                                    {name}
                                </span>
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('_count.foodItems', {
                header: 'Items Count',
                cell: (info) => {
                    const count = info.getValue() || 0
                    return (
                        <span className='admin-badge'>
                            <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                            {count} {count === 1 ? 'item' : 'items'}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: (info) => {
                    const row = info.row.original
                    const isActive = info.getValue() !== false

                    return (
                        <StatusToggle
                            isActive={isActive}
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
                header: 'Created At',
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
                                title='Edit Food Category'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                            </button>
                            <button
                                type='button'
                                onClick={() => setDeletingCategory(row)}
                                title='Delete Food Category'
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
                <p className='text-xs font-bold text-grey-muted'>Loading categories...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Categories</h1>
                    <p className='admin-page-subtitle'>Manage restaurant food categories and menu groupings</p>
                </div>
                <button
                    type='button'
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>Add Food Category</span>
                </button>
            </div>

            {/* Centralized DataTable with Search, Status Filter, Sorting, and Pagination */}
            <DataTable
                data={filteredCategories}
                columns={columns}
                searchPlaceholder='Search food categories...'
                filterOptions={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                emptyMessage='No food categories found'
                emptySubtext='Click "Add Food Category" above to create your first category.'
                initialPageSize={5}
            />

            {/* Add / Edit Category Modal */}
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
                                    <Icon icon='solar:list-bold-duotone' className='text-primary text-2xl' />
                                    {editingCategory ? 'Edit Food Category' : 'New Food Category'}
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
                                        name: categoryName,
                                        isActive: categoryIsActive,
                                        id: editingCategory?.id,
                                    })
                                }}
                                className='space-y-6'
                            >
                                <div>
                                    <label className='admin-label'>Food Category Name *</label>
                                    <input
                                        type='text'
                                        required
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className='admin-input'
                                        placeholder='e.g. Biryani, Breakfast, Chappathi...'
                                    />
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 flex items-center justify-between'>
                                    <div>
                                        <span className='text-xs font-bold text-grey-dark block'>
                                            Category Status
                                        </span>
                                        <span className='text-[11px] text-grey-muted'>
                                            Active categories appear on customer menus
                                        </span>
                                    </div>
                                    <StatusToggle
                                        isActive={categoryIsActive}
                                        onToggle={setCategoryIsActive}
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
                                            <span>Save Food Category</span>
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

            {/* Delete Category Confirmation Dialog */}
            <AnimatePresence>
                {deletingCategory && (
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
                                <h3 className='text-lg font-bold text-grey-dark'>Delete Food Category</h3>
                                <p className='text-xs text-grey-muted leading-relaxed'>
                                    Are you sure you want to delete category{' '}
                                    <strong className='text-grey-dark font-bold'>{deletingCategory.name}</strong>?
                                    {deletingCategory._count?.foodItems && deletingCategory._count.foodItems > 0 && (
                                        <span className='block text-red-600 font-bold mt-1'>
                                            Warning: This category contains {deletingCategory._count.foodItems} dishes that will also be deleted.
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className='flex justify-center gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => setDeletingCategory(null)}
                                    className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all cursor-pointer'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingCategory.id)}
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
