'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getFullImageUrl } from '@/utils/image'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'
import { StatusToggle } from '@/app/components/Admin/StatusToggle'
import { motion, AnimatePresence } from 'framer-motion'

type FoodItem = {
    id: string
    name: string
    price: number
    monthlyPrice?: number
    image?: string
    categoryId: string
    category: { id: string; name: string; isActive?: boolean }
    isActive?: boolean
}

type Category = {
    id: string
    name: string
    isActive?: boolean
}

type FoodMenu = {
    id: string
    name: string
    description?: string
    price: number
    foodItems: FoodItem[]
    availableDays: string[]
    isActive?: boolean
    createdAt?: string
}

const columnHelper = createColumnHelper<FoodMenu>()

export default function FoodPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [editingPlan, setEditingPlan] = useState<FoodMenu | null>(null)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    
    // Modal internal dish filter states
    const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        foodItemIds: [] as string[],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as string[],
        isActive: true,
    })

    const queryClient = useQueryClient()

    // 1. Fetch Categories
    const { data: rawCategories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })
    const categories = useMemo(() => Array.isArray(rawCategories) ? rawCategories : [], [rawCategories])
    const activeCategories = useMemo(() => categories.filter((c) => c.isActive !== false), [categories])

    // 2. Fetch All Food Items
    const foodItemsQuery = useQuery({
        queryKey: ['all-food-items-for-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-items?limit=1000')
            return response.data
        },
    })
    const rawFoodItems = foodItemsQuery.data?.data || []
    const allFoodItems: FoodItem[] = useMemo(() => Array.isArray(rawFoodItems) ? rawFoodItems : [], [rawFoodItems])

    // Only active dishes are eligible to be picked for food plans
    const activeFoodItems = useMemo(() => {
        return allFoodItems.filter((i) => i.isActive !== false)
    }, [allFoodItems])

    // 3. Fetch Food Plans (backend model: foodMenu)
    const { data: rawFoodMenus = [], isLoading } = useQuery<FoodMenu[]>({
        queryKey: ['food-menu'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu')
            return response.data
        },
    })

    const foodPlans: FoodMenu[] = useMemo(() => {
        return Array.isArray(rawFoodMenus) ? rawFoodMenus : []
    }, [rawFoodMenus])

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingPlan) {
                return axios.put(`/api/food-menu/${editingPlan.id}`, data)
            }
            return axios.post('/api/food-menu', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-menu'] })
            toast.success(editingPlan ? 'Food plan updated successfully' : 'Food plan created successfully')
            closeModal()
        },
        onError: (err) => {
            console.error(err)
            toast.error('Something went wrong')
        },
    })

    // Instant status toggle mutation with optimistic update
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return axios.patch(`/api/food-menu/${id}`, { isActive })
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['food-menu'] })
            const previousMenus = queryClient.getQueryData<FoodMenu[]>(['food-menu'])
            queryClient.setQueryData<FoodMenu[]>(['food-menu'], (old = []) => {
                if (!Array.isArray(old)) return []
                return old.map((menu) => (menu.id === id ? { ...menu, isActive } : menu))
            })
            return { previousMenus }
        },
        onError: (err, variables, context) => {
            if (context?.previousMenus) {
                queryClient.setQueryData(['food-menu'], context.previousMenus)
            }
            toast.error('Failed to update food plan status')
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isActive ? 'Food plan activated' : 'Food plan deactivated')
            queryClient.invalidateQueries({ queryKey: ['food-menu'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-menu/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-menu'] })
            toast.success('Food plan deleted successfully')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to delete food plan')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setIsViewOnly(false)
        setEditingPlan(null)
        setSearchTerm('')
        setModalCategoryFilter('all')
        setFormData({
            name: '',
            description: '',
            price: '',
            foodItemIds: [],
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            isActive: true,
        })
    }

    const openModal = (plan?: FoodMenu, view: boolean = false) => {
        setIsViewOnly(view)
        setSearchTerm('')
        setModalCategoryFilter('all')
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                foodItemIds: (plan.foodItems || []).map((item) => item.id),
                availableDays: plan.availableDays || [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                ],
                isActive: plan.isActive !== false,
            })
        } else {
            setEditingPlan(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                foodItemIds: [],
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                isActive: true,
            })
        }
        setIsModalOpen(true)
    }

    const toggleFoodItem = (id: string) => {
        if (isViewOnly) return
        setFormData((prev) => ({
            ...prev,
            foodItemIds: prev.foodItemIds.includes(id)
                ? prev.foodItemIds.filter((itemId) => itemId !== id)
                : [...prev.foodItemIds, id],
        }))
    }

    // Filter selectable dishes inside modal by active category and search
    const filteredPickableDishes = useMemo(() => {
        return activeFoodItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.category?.name && item.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
            
            const matchesCategory =
                modalCategoryFilter === 'all' || item.categoryId === modalCategoryFilter

            return matchesSearch && matchesCategory
        })
    }, [activeFoodItems, searchTerm, modalCategoryFilter])

    // Filter computation for table
    const filteredPlans = useMemo(() => {
        if (activeFilter === 'active') {
            return foodPlans.filter((m) => m.isActive !== false)
        }
        if (activeFilter === 'inactive') {
            return foodPlans.filter((m) => m.isActive === false)
        }
        return foodPlans
    }, [foodPlans, activeFilter])

    const filterOptions: FilterOption[] = useMemo(() => {
        const activeCount = foodPlans.filter((m) => m.isActive !== false).length
        const inactiveCount = foodPlans.filter((m) => m.isActive === false).length

        return [
            { id: 'all', label: 'All Plans', count: foodPlans.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'inactive', label: 'Inactive', count: inactiveCount },
        ]
    }, [foodPlans])

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Food Plan Name',
                cell: (info) => {
                    const row = info.row.original
                    const isActive = row.isActive !== false
                    const items = row.foodItems || []

                    return (
                        <div>
                            <div
                                className={`font-extrabold text-sm capitalize tracking-tight ${
                                    isActive ? 'text-grey-dark' : 'text-grey-muted line-through opacity-75'
                                }`}
                            >
                                {info.getValue()}
                            </div>
                            <div className='text-xs font-medium text-grey-muted truncate max-w-[260px] mt-0.5'>
                                {items.length > 0
                                    ? items.map((i) => i.name).join(', ')
                                    : 'No items attached'}
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('foodItems', {
                header: 'Included Dishes',
                cell: (info) => {
                    const count = info.getValue()?.length || 0
                    return (
                        <span className='admin-badge'>
                            <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                            {count} {count === 1 ? 'Dish' : 'Dishes'}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('price', {
                header: 'Monthly Price',
                cell: (info) => (
                    <span className='font-extrabold text-grey-dark text-sm'>
                        AED {(info.getValue() || 0).toFixed(2)}
                    </span>
                ),
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
                cell: (info) => (
                    <div className='flex items-center gap-1'>
                        <button
                            type='button'
                            onClick={() => openModal(info.row.original, true)}
                            className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            title='View Food Plan'
                        >
                            <Icon icon='solar:eye-bold-duotone' className='text-lg' />
                        </button>
                        <button
                            type='button'
                            onClick={() => openModal(info.row.original)}
                            className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            title='Edit Food Plan'
                        >
                            <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                if (confirm('Delete this food plan?')) {
                                    deleteMutation.mutate(info.row.original.id)
                                }
                            }}
                            className='p-2 text-grey-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer'
                            title='Delete Food Plan'
                        >
                            <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
                        </button>
                    </div>
                ),
            }),
        ],
        [toggleStatusMutation]
    )

    if (isLoading) {
        return (
            <div className='min-h-[50vh] flex flex-col items-center justify-center gap-3'>
                <Icon icon='line-md:loading-loop' className='text-4xl text-primary' />
                <p className='text-xs font-bold text-grey-muted'>Loading food plans...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Page Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Plans</h1>
                    <p className='admin-page-subtitle'>Create bundled meal packages and subscription food plans</p>
                </div>
                <button
                    type='button'
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>New Food Plan</span>
                </button>
            </div>

            {/* Centralized DataTable Component with Status Filters, Search, and Pagination */}
            <DataTable
                data={filteredPlans}
                columns={columns}
                searchPlaceholder='Search food plans by name or included dishes...'
                filterOptions={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                emptyMessage='No food plans found'
                emptySubtext='Click "New Food Plan" above to create your first subscription plan.'
                initialPageSize={5}
            />

            {/* Expansive Landscape Add / Edit Food Plan Modal (max-w-5xl) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className='bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-grey/10 overflow-hidden my-8 flex flex-col max-h-[92vh]'
                        >
                            {/* Sticky Modal Header */}
                            <div className='p-6 sm:px-8 border-b border-grey/10 flex items-center justify-between bg-white sticky top-0 z-10'>
                                <div className='flex items-center gap-3.5'>
                                    <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0'>
                                        <Icon icon='solar:calendar-bold-duotone' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg sm:text-xl font-extrabold text-grey-dark'>
                                            {isViewOnly ? 'View Food Plan' : editingPlan ? 'Edit Food Plan' : 'Create New Food Plan'}
                                        </h3>
                                        <p className='text-xs text-grey-muted mt-0.5'>
                                            {isViewOnly
                                                ? 'Inspect package details and included active dishes'
                                                : 'Configure plan pricing, active dishes, and availability schedule'}
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

                            {/* Modal Form Content - 2 Column Landscape Workstation */}
                            <form
                                id='food-plan-form'
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    mutation.mutate(formData)
                                }}
                                className='p-6 sm:p-8 overflow-y-auto flex-1 space-y-6'
                            >
                                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                                    {/* Left Column (5 cols): Plan Settings & Balanced Summary */}
                                    <div className='lg:col-span-5 space-y-4 flex flex-col justify-between'>
                                        <div className='space-y-4'>
                                            <div>
                                                <label className='admin-label'>Food Plan Name *</label>
                                                <input
                                                    type='text'
                                                    required
                                                    value={formData.name}
                                                    readOnly={isViewOnly}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                                    placeholder='e.g. Executive Lunch & Dinner Plan'
                                                />
                                            </div>

                                            <div>
                                                <label className='admin-label'>Monthly Price (AED) *</label>
                                                <div className='relative'>
                                                    <input
                                                        type='number'
                                                        step='0.01'
                                                        required
                                                        value={formData.price}
                                                        readOnly={isViewOnly}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                        className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                                        placeholder='250.00'
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className='admin-label'>Plan Description</label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.description}
                                                    readOnly={isViewOnly}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className={`admin-input resize-none ${isViewOnly ? 'cursor-default' : ''}`}
                                                    placeholder='Describe the package, delivery timing, or audience...'
                                                />
                                            </div>

                                            {/* Plan Status Card */}
                                            <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 flex items-center justify-between'>
                                                <div>
                                                    <span className='text-xs font-bold text-grey-dark block'>
                                                        Plan Availability Status
                                                    </span>
                                                    <span className='text-[11px] text-grey-muted'>
                                                        Active plans are available for subscriptions
                                                    </span>
                                                </div>
                                                <StatusToggle
                                                    isActive={formData.isActive}
                                                    onToggle={(val) => setFormData({ ...formData, isActive: val })}
                                                    disabled={isViewOnly}
                                                />
                                            </div>

                                            {/* Plan Availability Schedule */}
                                            <div>
                                                <label className='admin-label'>Available Days ({formData.availableDays.length}/7 Days)</label>
                                                <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5'>
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                                        const isSelected = formData.availableDays.includes(day)
                                                        return (
                                                            <button
                                                                key={day}
                                                                type='button'
                                                                disabled={isViewOnly}
                                                                onClick={() => {
                                                                    const current = [...formData.availableDays]
                                                                    if (current.includes(day)) {
                                                                        setFormData({ ...formData, availableDays: current.filter((d) => d !== day) })
                                                                    } else {
                                                                        setFormData({ ...formData, availableDays: [...current, day] })
                                                                    }
                                                                }}
                                                                className={`py-2 px-1 rounded-xl text-[11px] font-extrabold border transition-all text-center ${
                                                                    isSelected
                                                                        ? 'bg-primary border-primary text-white shadow-xs shadow-primary/20 scale-[1.02]'
                                                                        : 'bg-white border-grey/15 text-grey-muted hover:border-primary/30'
                                                                } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                            >
                                                                {day.slice(0, 3)}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Balanced Plan Summary Card (Fills lower left space nicely) */}
                                        <div className='p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-amber-500/10 border border-primary/20 space-y-2 mt-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-bold text-grey-muted uppercase tracking-wider'>
                                                    Plan Summary
                                                </span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-grey/20 text-grey-muted'}`}>
                                                    {formData.isActive ? 'Active Plan' : 'Inactive Plan'}
                                                </span>
                                            </div>
                                            <div className='flex items-baseline justify-between pt-1'>
                                                <span className='text-xs font-bold text-grey-dark'>
                                                    {formData.foodItemIds.length} Dishes Attached
                                                </span>
                                                <span className='text-base font-extrabold text-primary'>
                                                    AED {parseFloat(formData.price || '0').toFixed(2)}
                                                    <span className='text-[10px] font-bold text-grey-muted ml-1'>/ mo</span>
                                                </span>
                                            </div>
                                            <p className='text-[11px] text-grey-muted leading-tight'>
                                                Serving on: {formData.availableDays.map(d => d.slice(0,3)).join(', ') || 'No days selected'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column (7 cols): Interactive Dish Picker */}
                                    <div className='lg:col-span-7 space-y-3 flex flex-col'>
                                        {/* Dish Picker Top Controls */}
                                        <div className='space-y-2.5'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <label className='admin-label mb-0 text-sm'>
                                                        Select Active Dishes
                                                    </label>
                                                    <span className='px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-extrabold'>
                                                        {formData.foodItemIds.length} Selected
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Search Bar & Active Category Dropdown */}
                                            <div className='grid grid-cols-1 sm:grid-cols-12 gap-2.5'>
                                                <div className='sm:col-span-6 relative'>
                                                    <Icon
                                                        icon='solar:magnifer-bold'
                                                        className='absolute left-3 top-1/2 -translate-y-1/2 text-grey-muted text-sm'
                                                    />
                                                    <input
                                                        type='text'
                                                        placeholder='Search dishes...'
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className='w-full pl-9 pr-3 py-2 text-xs border border-grey/15 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 font-medium'
                                                    />
                                                    {searchTerm && (
                                                        <button
                                                            type='button'
                                                            onClick={() => setSearchTerm('')}
                                                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-grey-muted hover:text-grey-dark'
                                                        >
                                                            <Icon icon='solar:close-circle-bold' className='text-xs' />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className='sm:col-span-6'>
                                                    <select
                                                        value={modalCategoryFilter}
                                                        onChange={(e) => setModalCategoryFilter(e.target.value)}
                                                        className='w-full px-3 py-2 text-xs border border-grey/15 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 font-bold text-grey-dark cursor-pointer'
                                                    >
                                                        <option value='all'>All Active Categories ({activeCategories.length})</option>
                                                        {activeCategories.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scrollable Dish Selection List (h-[380px]) */}
                                        <div className='border border-grey/10 rounded-2xl bg-grey/5 p-3 h-[380px] overflow-y-auto space-y-2'>
                                            {filteredPickableDishes.length === 0 ? (
                                                <div className='h-full flex flex-col items-center justify-center text-center p-4 text-grey-muted'>
                                                    <Icon icon='solar:box-minimalistic-bold-duotone' className='text-3xl mb-1 text-grey/30' />
                                                    <p className='text-xs font-bold'>No active dishes match your filter</p>
                                                    <p className='text-[11px] text-grey-muted mt-0.5'>Try changing the search keyword or category.</p>
                                                </div>
                                            ) : (
                                                filteredPickableDishes.map((item) => {
                                                    const isChecked = formData.foodItemIds.includes(item.id)
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => toggleFoodItem(item.id)}
                                                            className={`flex items-center justify-between p-3 rounded-2xl transition-all border select-none ${
                                                                isChecked
                                                                    ? 'bg-primary/10 border-primary shadow-xs'
                                                                    : 'bg-white border-grey/10 hover:border-primary/40 hover:bg-white/80'
                                                            } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                        >
                                                            <div className='flex items-center gap-3 min-w-0'>
                                                                {/* Dish Image Thumbnail */}
                                                                <div className='w-10 h-10 rounded-xl bg-grey/10 overflow-hidden relative shrink-0 border border-grey/10'>
                                                                    {item.image ? (
                                                                        <Image
                                                                            src={getFullImageUrl(item.image)}
                                                                            alt=''
                                                                            fill
                                                                            className='object-cover'
                                                                        />
                                                                    ) : (
                                                                        <div className='flex items-center justify-center h-full text-grey-muted/50'>
                                                                            <Icon icon='solar:gallery-bold' className='text-sm' />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className='min-w-0'>
                                                                    <span className='text-xs font-extrabold text-grey-dark block truncate'>
                                                                        {item.name}
                                                                    </span>
                                                                    <div className='flex items-center gap-2 mt-0.5'>
                                                                        <span className='text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10'>
                                                                            {item.category?.name || 'Dish'}
                                                                        </span>
                                                                        <span className='text-[11px] font-extrabold text-grey-muted'>
                                                                            AED {item.price.toFixed(2)}/day
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Checkbox Icon */}
                                                            <div
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                                    isChecked
                                                                        ? 'border-primary bg-primary text-white scale-105'
                                                                        : 'border-grey/30 bg-white'
                                                                }`}
                                                            >
                                                                {isChecked && (
                                                                    <Icon icon='solar:check-read-bold' className='text-xs' />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        {/* Selection Summary Footer */}
                                        <div className='p-3 bg-grey/5 rounded-xl border border-grey/10 flex items-center justify-between text-xs font-bold text-grey-dark'>
                                            <span>
                                                Selected Dishes: <strong className='text-primary'>{formData.foodItemIds.length}</strong>
                                            </span>
                                            <span className='text-[11px] text-grey-muted'>
                                                Only active items appear on subscription plans
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Sticky Modal Footer */}
                            <div className='p-6 sm:px-8 border-t border-grey/10 bg-white flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 z-10'>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='px-6 py-2.5 bg-grey/5 text-grey-dark rounded-2xl text-xs font-bold hover:bg-grey/10 transition-all w-full sm:w-auto cursor-pointer'
                                >
                                    {isViewOnly ? 'Close' : 'Cancel'}
                                </button>
                                {!isViewOnly && (
                                    <button
                                        type='submit'
                                        form='food-plan-form'
                                        disabled={mutation.isPending || formData.foodItemIds.length === 0 || formData.availableDays.length === 0}
                                        className='admin-btn-primary px-8 py-2.5 text-xs w-full sm:w-auto'
                                    >
                                        {mutation.isPending ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-base' />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <span>{editingPlan ? 'Update Food Plan' : 'Save Food Plan'}</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
