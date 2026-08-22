'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import ImageUpload from '@/app/components/Common/ImageUpload'
import { getFullImageUrl } from '@/utils/image'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'
import { StatusToggle } from '@/app/components/Admin/StatusToggle'
import { motion, AnimatePresence } from 'framer-motion'

type FoodItem = {
    id: string
    name: string
    description?: string
    price: number
    monthlyPrice?: number
    image?: string
    categoryId: string
    category: { id: string; name: string }
    isActive?: boolean
    createdAt?: string
}

type Category = {
    id: string
    name: string
    isActive?: boolean
}

const columnHelper = createColumnHelper<FoodItem>()

export default function FoodItemsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<FoodItem | null>(null)
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        monthlyPrice: '',
        image: '',
        categoryId: '',
        isActive: true,
    })

    const queryClient = useQueryClient()

    const { data: rawCategories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })

    const categories: Category[] = useMemo(() => {
        return Array.isArray(rawCategories) ? rawCategories : []
    }, [rawCategories])

    const activeCategories: Category[] = useMemo(() => {
        return categories.filter((c) => c.isActive !== false)
    }, [categories])

    const { data: foodItems = [], isLoading } = useQuery<FoodItem[]>({
        queryKey: ['food-items'],
        queryFn: async () => {
            const response = await axios.get('/api/food-items?limit=1000')
            return response.data?.data || []
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingItem) {
                return axios.put(`/api/food-items/${editingItem.id}`, data)
            }
            return axios.post('/api/food-items', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-items'] })
            toast.success(editingItem ? 'Food item updated successfully' : 'Food item created successfully')
            closeModal()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Something went wrong')
        },
    })

    // Instant status toggle mutation with optimistic update
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return axios.patch(`/api/food-items/${id}`, { isActive })
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['food-items'] })
            const previousItems = queryClient.getQueryData<FoodItem[]>(['food-items'])
            queryClient.setQueryData<FoodItem[]>(['food-items'], (old = []) =>
                old.map((item) => (item.id === id ? { ...item, isActive } : item))
            )
            return { previousItems }
        },
        onError: (err, variables, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(['food-items'], context.previousItems)
            }
            toast.error('Failed to update food item status')
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isActive ? 'Dish activated' : 'Dish deactivated')
            queryClient.invalidateQueries({ queryKey: ['food-items'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-items/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-items'] })
            toast.success('Food item deleted successfully')
            setDeletingItem(null)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete food item')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setFormData({
            name: '',
            description: '',
            price: '',
            monthlyPrice: '',
            image: '',
            categoryId: '',
            isActive: true,
        })
    }

    const openModal = (item?: FoodItem) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                name: item.name,
                description: item.description || '',
                price: item.price.toString(),
                monthlyPrice: item.monthlyPrice?.toString() || '',
                image: item.image || '',
                categoryId: item.categoryId,
                isActive: item.isActive !== false,
            })
        } else {
            setEditingItem(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                monthlyPrice: '',
                image: '',
                categoryId: activeCategories[0]?.id || '',
                isActive: true,
            })
        }
        setIsModalOpen(true)
    }

    // Filter computation
    const filteredFoodItems = useMemo(() => {
        if (activeCategoryFilter === 'all') return foodItems
        return foodItems.filter((item) => item.categoryId === activeCategoryFilter)
    }, [foodItems, activeCategoryFilter])

    // Filter options with live counts
    const filterOptions: FilterOption[] = useMemo(() => {
        const list: FilterOption[] = [
            { id: 'all', label: 'All Dishes', count: foodItems.length },
        ]

        categories.forEach((cat) => {
            const count = foodItems.filter((i) => i.categoryId === cat.id).length
            list.push({
                id: cat.id,
                label: cat.name,
                count,
            })
        })

        return list
    }, [foodItems, categories])

    const columns = useMemo(
        () => [
            columnHelper.accessor('image', {
                header: 'Dish Image',
                cell: (info) => (
                    <div className='w-12 h-12 bg-grey/5 rounded-2xl overflow-hidden relative border border-grey/10 shrink-0'>
                        {info.getValue() ? (
                            <Image
                                src={getFullImageUrl(info.getValue()!)}
                                alt=''
                                fill
                                className='object-cover'
                            />
                        ) : (
                            <div className='flex items-center justify-center h-full text-grey/30 bg-grey/5'>
                                <Icon icon='solar:gallery-bold' className='text-lg' />
                            </div>
                        )}
                    </div>
                ),
            }),
            columnHelper.accessor('name', {
                header: 'Item Details',
                cell: (info) => {
                    const row = info.row.original
                    const isActive = row.isActive !== false

                    return (
                        <div className='space-y-0.5'>
                            <span
                                className={`font-extrabold text-sm tracking-tight block ${
                                    isActive ? 'text-grey-dark' : 'text-grey-muted line-through opacity-75'
                                }`}
                            >
                                {info.getValue()}
                            </span>
                            <span className='text-xs font-semibold text-grey-muted block'>
                                {row.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('price', {
                header: 'Daily Price',
                cell: (info) => (
                    <span className='font-extrabold text-grey-dark text-sm'>
                        AED {info.getValue().toFixed(2)}
                    </span>
                ),
            }),
            columnHelper.accessor('monthlyPrice', {
                header: 'Monthly Price',
                cell: (info) => {
                    const value = info.getValue()
                    const dailyPrice = info.row.original.price
                    const displayPrice = value || dailyPrice * 25
                    return (
                        <span className='font-extrabold text-green-700 text-sm'>
                            AED {displayPrice.toFixed(2)}
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
                                title='Edit Food Item'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                            </button>
                            <button
                                type='button'
                                onClick={() => setDeletingItem(row)}
                                title='Delete Food Item'
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
                <p className='text-xs font-bold text-grey-muted'>Loading menu items...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Items</h1>
                    <p className='admin-page-subtitle'>Manage signature dishes, daily rates, and monthly pricing</p>
                </div>
                <button
                    type='button'
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>Add Food Item</span>
                </button>
            </div>

            {/* Centralized DataTable with Search, Category Filter Dropdown, Sorting & Pagination */}
            <DataTable
                data={filteredFoodItems}
                columns={columns}
                searchPlaceholder='Search food items by name, description, or category...'
                filterOptions={filterOptions}
                activeFilter={activeCategoryFilter}
                onFilterChange={setActiveCategoryFilter}
                filterVariant='dropdown'
                emptyMessage='No food items found'
                emptySubtext='Click "Add Food Item" above to add your first dish to the menu.'
                initialPageSize={5}
            />

            {/* Add / Edit Food Item Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className='bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-grey/10 overflow-hidden my-8 flex flex-col max-h-[90vh]'
                        >
                            {/* Modal Sticky Header */}
                            <div className='p-6 sm:px-8 border-b border-grey/10 flex items-center justify-between bg-white sticky top-0 z-10'>
                                <div className='flex items-center gap-3.5'>
                                    <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0'>
                                        <Icon icon='solar:cup-hot-bold-duotone' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg sm:text-xl font-extrabold text-grey-dark'>
                                            {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                                        </h3>
                                        <p className='text-xs text-grey-muted mt-0.5'>
                                            {editingItem
                                                ? 'Update dish details, prices, status, or category'
                                                : 'Create a new signature dish for daily menus & food plans'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='w-9 h-9 rounded-xl bg-grey/5 hover:bg-grey/10 text-grey-muted hover:text-grey-dark flex items-center justify-center transition-colors cursor-pointer'
                                    title='Close dialog'
                                >
                                    <Icon icon='solar:close-circle-bold' className='text-xl' />
                                </button>
                            </div>

                            {/* Modal Form Scrollable Content */}
                            <form
                                id='food-item-form'
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    mutation.mutate(formData)
                                }}
                                className='p-6 sm:p-8 overflow-y-auto flex-1 space-y-6'
                            >
                                <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                                    {/* Left Column: Dish Photo (5 cols) */}
                                    <div className='md:col-span-5 space-y-2 flex flex-col'>
                                        <label className='admin-label'>
                                            Dish Photo
                                        </label>
                                        <div className='flex-1 flex flex-col'>
                                            <ImageUpload
                                                value={formData.image}
                                                onChange={(url) => setFormData({ ...formData, image: url })}
                                            />
                                        </div>
                                        <p className='text-[11px] text-grey-muted leading-tight mt-1'>
                                            High quality square or landscape dish photos recommended (PNG, JPG, WebP).
                                        </p>
                                    </div>

                                    {/* Right Column: Dish Details (7 cols) */}
                                    <div className='md:col-span-7 space-y-4'>
                                        <div>
                                            <label className='admin-label'>
                                                Item Name *
                                            </label>
                                            <input
                                                type='text'
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className='admin-input'
                                                placeholder='e.g. Chicken Biryani, Kerala Parotta...'
                                            />
                                        </div>

                                        <div>
                                            <label className='admin-label'>
                                                Food Category *
                                            </label>
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                className='admin-input cursor-pointer'
                                            >
                                                <option value=''>Select Active Food Category</option>
                                                {activeCategories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='grid grid-cols-2 gap-4'>
                                            <div>
                                                <label className='admin-label'>
                                                    Daily Price (AED) *
                                                </label>
                                                <div className='relative'>
                                                    <input
                                                        type='number'
                                                        step='0.01'
                                                        required
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                        className='admin-input'
                                                        placeholder='12.00'
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className='admin-label'>
                                                    Monthly Rate (AED)
                                                </label>
                                                <input
                                                    type='number'
                                                    step='0.01'
                                                    value={formData.monthlyPrice}
                                                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                                    className='admin-input'
                                                    placeholder='Optional'
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className='admin-label'>
                                                Description &amp; Ingredients
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className='admin-input resize-none'
                                                placeholder='Brief description of ingredients, spices, or allergens...'
                                            />
                                        </div>

                                        {/* Status Toggle Card */}
                                        <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 flex items-center justify-between'>
                                            <div>
                                                <span className='text-xs font-bold text-grey-dark block'>
                                                    Dish Availability Status
                                                </span>
                                                <span className='text-[11px] text-grey-muted'>
                                                    Available dishes can be added to meal packages
                                                </span>
                                            </div>
                                            <StatusToggle
                                                isActive={formData.isActive}
                                                onToggle={(val) => setFormData({ ...formData, isActive: val })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Modal Sticky Footer */}
                            <div className='p-6 sm:px-8 border-t border-grey/10 bg-white flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 z-10'>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='px-6 py-2.5 bg-grey/5 text-grey-dark rounded-2xl text-xs font-bold hover:bg-grey/10 transition-all w-full sm:w-auto cursor-pointer'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    form='food-item-form'
                                    disabled={mutation.isPending || !formData.categoryId}
                                    className='admin-btn-primary px-8 py-2.5 text-xs w-full sm:w-auto'
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Icon icon='line-md:loading-loop' className='text-base' />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>{editingItem ? 'Update Food Item' : 'Save Food Item'}</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Food Item Confirmation Dialog */}
            <AnimatePresence>
                {deletingItem && (
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
                                <h3 className='text-lg font-bold text-grey-dark'>Delete Food Item</h3>
                                <p className='text-xs text-grey-muted leading-relaxed'>
                                    Are you sure you want to remove dish{' '}
                                    <strong className='text-grey-dark font-bold'>{deletingItem.name}</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className='flex justify-center gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => setDeletingItem(null)}
                                    className='px-5 py-2.5 rounded-xl border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/5 transition-all cursor-pointer'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingItem.id)}
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
