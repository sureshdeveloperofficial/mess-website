'use client'

import { useState, useMemo, useEffect } from 'react'
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

type MealType = {
    id: string
    name: string
    icon?: string
    isActive?: boolean
}

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
    scheduleJson?: any | null
    mealTypeId?: string | null
    mealType?: MealType | null
    isActive?: boolean
    createdAt?: string
}

const columnHelper = createColumnHelper<FoodMenu>()

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function FoodPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [editingPlan, setEditingPlan] = useState<FoodMenu | null>(null)
    const [activeMealTypeFilter, setActiveMealTypeFilter] = useState<string>('all')
    
    // Modal internal schedule navigation states
    const [currentDayTab, setCurrentDayTab] = useState<string>('Monday')
    const [currentMealTab, setCurrentMealTab] = useState<string>('')
    const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Form data with day-wise & meal-type-wise schedule
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        selectedMealTypeIds: [] as string[],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as string[],
        // Structure: Record<DayName, Record<MealTypeId, string[]>>
        schedule: {} as Record<string, Record<string, string[]>>,
        isActive: true,
    })

    const queryClient = useQueryClient()

    // 1. Fetch Meal Types
    const { data: rawMealTypes = [] } = useQuery<MealType[]>({
        queryKey: ['meal-types'],
        queryFn: async () => {
            const response = await axios.get('/api/meal-types')
            return response.data
        },
    })
    const mealTypes = useMemo(() => Array.isArray(rawMealTypes) ? rawMealTypes : [], [rawMealTypes])
    const activeMealTypes = useMemo(() => mealTypes.filter((m) => m.isActive !== false), [mealTypes])
    const mealTypeMap = useMemo(() => new Map(activeMealTypes.map((mt) => [mt.id, mt])), [activeMealTypes])

    // 2. Fetch Categories
    const { data: rawCategories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })
    const categories = useMemo(() => Array.isArray(rawCategories) ? rawCategories : [], [rawCategories])
    const activeCategories = useMemo(() => categories.filter((c) => c.isActive !== false), [categories])

    // 3. Fetch All Food Items
    const foodItemsQuery = useQuery({
        queryKey: ['all-food-items-for-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-items?limit=1000')
            return response.data
        },
    })
    const rawFoodItems = foodItemsQuery.data?.data || []
    const allFoodItems: FoodItem[] = useMemo(() => Array.isArray(rawFoodItems) ? rawFoodItems : [], [rawFoodItems])
    const foodItemsMap = useMemo(() => new Map(allFoodItems.map((item) => [item.id, item])), [allFoodItems])

    // Only active dishes are eligible to be picked for food plans
    const activeFoodItems = useMemo(() => {
        return allFoodItems.filter((i) => i.isActive !== false)
    }, [allFoodItems])

    // 4. Fetch Food Plans
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

    // Synchronize default meal tab if currentMealTab is not in selectedMealTypeIds
    useEffect(() => {
        if (formData.selectedMealTypeIds.length > 0) {
            if (!formData.selectedMealTypeIds.includes(currentMealTab)) {
                setCurrentMealTab(formData.selectedMealTypeIds[0])
            }
        } else if (activeMealTypes.length > 0 && !currentMealTab) {
            setCurrentMealTab(activeMealTypes[0].id)
        }
    }, [formData.selectedMealTypeIds, activeMealTypes, currentMealTab])

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                name: data.name,
                description: data.description,
                price: data.price,
                mealTypeId: data.selectedMealTypeIds[0] || null,
                availableDays: data.availableDays,
                scheduleJson: data.schedule,
                isActive: data.isActive,
            }
            if (editingPlan) {
                return axios.put(`/api/food-menu/${editingPlan.id}`, payload)
            }
            return axios.post('/api/food-menu', payload)
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
        setCurrentDayTab('Monday')
        setCurrentMealTab(activeMealTypes[0]?.id || '')
        setFormData({
            name: '',
            description: '',
            price: '',
            selectedMealTypeIds: activeMealTypes.length > 0 ? [activeMealTypes[0].id] : [],
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            schedule: {},
            isActive: true,
        })
    }

    const openModal = (plan?: FoodMenu, view: boolean = false) => {
        setIsViewOnly(view)
        setSearchTerm('')
        setModalCategoryFilter('all')
        if (plan) {
            setEditingPlan(plan)
            const days = plan.availableDays || [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ]
            setCurrentDayTab(days[0] || 'Monday')

            // Build hierarchical schedule: Record<Day, Record<MealTypeId, string[]>>
            const parsedSchedule: Record<string, Record<string, string[]>> = {}
            ALL_DAYS.forEach((d) => {
                parsedSchedule[d] = {}
            })

            const primaryMealId = plan.mealTypeId || activeMealTypes[0]?.id || 'meal_001'
            const detectedMealTypeIds = new Set<string>()
            if (plan.mealTypeId) detectedMealTypeIds.add(plan.mealTypeId)

            if (plan.scheduleJson && typeof plan.scheduleJson === 'object') {
                ALL_DAYS.forEach((d) => {
                    const dayVal = plan.scheduleJson[d]
                    if (Array.isArray(dayVal)) {
                        // Legacy flat day array: map to primary meal type
                        parsedSchedule[d][primaryMealId] = [...dayVal]
                        detectedMealTypeIds.add(primaryMealId)
                    } else if (dayVal && typeof dayVal === 'object') {
                        // Nested day -> mealTypeId -> items
                        Object.keys(dayVal).forEach((mtId) => {
                            if (Array.isArray(dayVal[mtId])) {
                                parsedSchedule[d][mtId] = [...dayVal[mtId]]
                                if (dayVal[mtId].length > 0) detectedMealTypeIds.add(mtId)
                            }
                        })
                    }
                })
            } else {
                // Fallback: legacy attached dishes
                const fallbackIds = (plan.foodItems || []).map((item) => item.id)
                days.forEach((d) => {
                    parsedSchedule[d][primaryMealId] = [...fallbackIds]
                })
                detectedMealTypeIds.add(primaryMealId)
            }

            const initialMealTypeIds =
                detectedMealTypeIds.size > 0
                    ? Array.from(detectedMealTypeIds)
                    : activeMealTypes.length > 0
                    ? [activeMealTypes[0].id]
                    : []

            setCurrentMealTab(initialMealTypeIds[0] || '')

            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                selectedMealTypeIds: initialMealTypeIds,
                availableDays: days,
                schedule: parsedSchedule,
                isActive: plan.isActive !== false,
            })
        } else {
            setEditingPlan(null)
            const initialMealTypeIds = activeMealTypes.length > 0 ? [activeMealTypes[0].id] : []
            setCurrentDayTab('Monday')
            setCurrentMealTab(initialMealTypeIds[0] || '')

            const blankSchedule: Record<string, Record<string, string[]>> = {}
            ALL_DAYS.forEach((d) => {
                blankSchedule[d] = {}
            })

            setFormData({
                name: '',
                description: '',
                price: '',
                selectedMealTypeIds: initialMealTypeIds,
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                schedule: blankSchedule,
                isActive: true,
            })
        }
        setIsModalOpen(true)
    }

    // Toggle meal type inclusion in the plan
    const toggleMealTypeInclusion = (mtId: string) => {
        if (isViewOnly) return
        setFormData((prev) => {
            const current = [...prev.selectedMealTypeIds]
            let next: string[]
            if (current.includes(mtId)) {
                if (current.length === 1) {
                    toast.error('Plan must include at least 1 meal type')
                    return prev
                }
                next = current.filter((id) => id !== mtId)
            } else {
                next = [...current, mtId]
            }
            return { ...prev, selectedMealTypeIds: next }
        })
    }

    // Toggle active day in plan
    const toggleActiveDay = (day: string) => {
        if (isViewOnly) return
        setFormData((prev) => {
            const current = [...prev.availableDays]
            if (current.includes(day)) {
                const nextDays = current.filter((d) => d !== day)
                return { ...prev, availableDays: nextDays }
            } else {
                return { ...prev, availableDays: [...current, day] }
            }
        })
    }

    // Toggle dish for the specific [CurrentDay][CurrentMealType]
    const toggleDishForCurrentSlot = (dishId: string) => {
        if (isViewOnly || !currentMealTab) return
        setFormData((prev) => {
            const daySchedule = { ...(prev.schedule[currentDayTab] || {}) }
            const slotDishes = daySchedule[currentMealTab] ? [...daySchedule[currentMealTab]] : []

            const nextSlotDishes = slotDishes.includes(dishId)
                ? slotDishes.filter((id) => id !== dishId)
                : [...slotDishes, dishId]

            daySchedule[currentMealTab] = nextSlotDishes

            return {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [currentDayTab]: daySchedule,
                },
            }
        })
    }

    // Copy entire current day schedule across all active days
    const copyCurrentDayToAllDays = () => {
        if (isViewOnly) return
        const currentDayData = formData.schedule[currentDayTab] || {}
        let hasAnyDishes = false
        Object.values(currentDayData).forEach((arr) => {
            if (Array.isArray(arr) && arr.length > 0) hasAnyDishes = true
        })

        if (!hasAnyDishes) {
            toast.error(`No dishes selected for ${currentDayTab} to copy`)
            return
        }

        setFormData((prev) => {
            const updatedSchedule = { ...prev.schedule }
            prev.availableDays.forEach((day) => {
                const clonedDay: Record<string, string[]> = {}
                Object.keys(currentDayData).forEach((mtId) => {
                    clonedDay[mtId] = [...(currentDayData[mtId] || [])]
                })
                updatedSchedule[day] = clonedDay
            })
            return { ...prev, schedule: updatedSchedule }
        })
        toast.success(`Copied ${currentDayTab}'s full schedule to all active days!`)
    }

    // Copy just the current meal type (e.g. Lunch) across all active days
    const copyCurrentMealToAllDays = () => {
        if (isViewOnly || !currentMealTab) return
        const currentMealDishes = formData.schedule[currentDayTab]?.[currentMealTab] || []
        const currentMealName = mealTypeMap.get(currentMealTab)?.name || 'Meal'

        if (currentMealDishes.length === 0) {
            toast.error(`No dishes selected for ${currentDayTab} ${currentMealName} to copy`)
            return
        }

        setFormData((prev) => {
            const updatedSchedule = { ...prev.schedule }
            prev.availableDays.forEach((day) => {
                const dayObj = { ...(updatedSchedule[day] || {}) }
                dayObj[currentMealTab] = [...currentMealDishes]
                updatedSchedule[day] = dayObj
            })
            return { ...prev, schedule: updatedSchedule }
        })
        toast.success(`Copied ${currentMealName} menu to all active days!`)
    }

    // Clear current day & meal slot
    const clearCurrentSlot = () => {
        if (isViewOnly || !currentMealTab) return
        setFormData((prev) => {
            const daySchedule = { ...(prev.schedule[currentDayTab] || {}) }
            daySchedule[currentMealTab] = []
            return {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [currentDayTab]: daySchedule,
                },
            }
        })
        const currentMealName = mealTypeMap.get(currentMealTab)?.name || 'Meal'
        toast.success(`Cleared ${currentDayTab} ${currentMealName}`)
    }

    // Total unique dishes count across all days & meal types
    const totalUniqueDishes = useMemo(() => {
        const set = new Set<string>()
        formData.availableDays.forEach((day) => {
            const dayObj = formData.schedule[day] || {}
            Object.values(dayObj).forEach((arr) => {
                if (Array.isArray(arr)) {
                    arr.forEach((id) => set.add(id))
                }
            })
        })
        return set.size
    }, [formData.availableDays, formData.schedule])

    // Current day's total dishes across all its meal types
    const currentDayTotalCount = useMemo(() => {
        let count = 0
        const dayObj = formData.schedule[currentDayTab] || {}
        Object.values(dayObj).forEach((arr) => {
            if (Array.isArray(arr)) count += arr.length
        })
        return count
    }, [formData.schedule, currentDayTab])

    // Current active slot's selected dish IDs
    const currentSlotSelectedIds = useMemo(() => {
        if (!currentMealTab) return []
        return formData.schedule[currentDayTab]?.[currentMealTab] || []
    }, [formData.schedule, currentDayTab, currentMealTab])

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

    // Filter computation for table based on Meal Type
    const filteredPlans = useMemo(() => {
        if (activeMealTypeFilter === 'all') return foodPlans
        return foodPlans.filter((m) => {
            if (m.mealTypeId === activeMealTypeFilter) return true
            const matchedType = activeMealTypes.find((mt) => mt.id === activeMealTypeFilter)
            if (matchedType && m.name.toLowerCase().includes(matchedType.name.toLowerCase())) return true
            return false
        })
    }, [foodPlans, activeMealTypeFilter, activeMealTypes])

    // Filter options with live counts for Meal Types
    const filterOptions: FilterOption[] = useMemo(() => {
        const list: FilterOption[] = [
            { id: 'all', label: 'All Plans', count: foodPlans.length },
        ]

        activeMealTypes.forEach((mt) => {
            const count = foodPlans.filter((p) => {
                if (p.mealTypeId === mt.id) return true
                if (p.name.toLowerCase().includes(mt.name.toLowerCase())) return true
                return false
            }).length

            list.push({
                id: mt.id,
                label: mt.name,
                count,
            })
        })

        return list
    }, [foodPlans, activeMealTypes])

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Food Plan Name',
                cell: (info) => {
                    const row = info.row.original
                    const isActive = row.isActive !== false
                    const days = row.availableDays || []
                    const items = row.foodItems || []
                    const mealType = row.mealType || activeMealTypes.find(mt => row.name.toLowerCase().includes(mt.name.toLowerCase()))

                    let scheduleText = `${days.length} Days/Wk`
                    if (days.length === 6 && !days.includes('Sunday')) scheduleText = '6 Days (Mon–Sat)'
                    else if (days.length === 7) scheduleText = '7 Days (All Week)'
                    else if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) scheduleText = '5 Days (Mon–Fri)'

                    return (
                        <div className='space-y-1'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <span
                                    className={`font-extrabold text-sm capitalize tracking-tight ${
                                        isActive ? 'text-grey-dark' : 'text-grey-muted line-through opacity-75'
                                    }`}
                                >
                                    {info.getValue()}
                                </span>
                                {mealType && (
                                    <span className='px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/20'>
                                        <Icon icon={mealType.icon || 'solar:clock-circle-bold'} className='text-xs' />
                                        <span>{mealType.name}</span>
                                    </span>
                                )}
                                <span className='px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold'>
                                    {scheduleText}
                                </span>
                            </div>
                            <div className='text-xs font-medium text-grey-muted truncate max-w-[280px]'>
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
                cell: (info) => {
                    const price = info.getValue() || 0
                    return (
                        <span className='font-extrabold text-grey-dark text-sm block'>
                            AED {price.toFixed(2)}
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
        [toggleStatusMutation, activeMealTypes]
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
                    <p className='admin-page-subtitle'>Create bundled meal packages, weekly passes, and day-by-day meal schedules</p>
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

            {/* Centralized DataTable Component with Meal Type Tabs, Search, and Pagination */}
            <DataTable
                data={filteredPlans}
                columns={columns}
                searchPlaceholder='Search food plans by name or included dishes...'
                filterOptions={filterOptions}
                activeFilter={activeMealTypeFilter}
                onFilterChange={setActiveMealTypeFilter}
                filterVariant='tabs'
                emptyMessage='No food plans found'
                emptySubtext='Click "New Food Plan" above to create your first subscription plan.'
                initialPageSize={5}
            />

            {/* Expansive Landscape Day & Meal-Type Schedule Builder Modal (max-w-7xl) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className='bg-white rounded-3xl max-w-7xl w-full shadow-2xl border border-grey/10 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[94vh]'
                        >
                            {/* Sticky Modal Header */}
                            <div className='p-6 sm:px-8 border-b border-grey/10 flex items-center justify-between bg-white sticky top-0 z-10'>
                                <div className='flex items-center gap-3.5'>
                                    <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0'>
                                        <Icon icon='solar:calendar-bold-duotone' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg sm:text-xl font-extrabold text-grey-dark'>
                                            {isViewOnly ? 'View Food Plan Schedule' : editingPlan ? 'Edit Food Plan & Daily Schedule' : 'Create Food Plan & Daily Schedule'}
                                        </h3>
                                        <p className='text-xs text-grey-muted mt-0.5'>
                                            {isViewOnly
                                                ? 'Inspect package details, daily meal rotation, and dish selections'
                                                : 'Configure plan pricing, active days, and customize dishes for each meal type and day'}
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
                                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
                                    {/* Left Column: Plan Settings & Summary */}
                                    <div className='lg:col-span-5 xl:col-span-4 space-y-4'>
                                        <div>
                                            <label className='admin-label'>Food Plan Name *</label>
                                            <input
                                                type='text'
                                                required
                                                value={formData.name}
                                                readOnly={isViewOnly}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                                placeholder='e.g. Executive Full Day (Lunch + Dinner)'
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

                                        {/* Plan Availability Status Toggle */}
                                        <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 flex items-center justify-between'>
                                            <div>
                                                <span className='text-xs font-bold text-grey-dark block'>
                                                    Plan Availability Status
                                                </span>
                                                <span className='text-[11px] text-grey-muted'>
                                                    Active plans are open for customer subscriptions
                                                </span>
                                            </div>
                                            <StatusToggle
                                                isActive={formData.isActive}
                                                onToggle={(val) => setFormData({ ...formData, isActive: val })}
                                                disabled={isViewOnly}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className='admin-label'>Plan Description</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                readOnly={isViewOnly}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`admin-input resize-none ${isViewOnly ? 'cursor-default' : ''}`}
                                                placeholder='Describe the package, meal timings, or special diet highlights...'
                                            />
                                        </div>

                                        {/* Weekly Schedule Summary Card */}
                                        <div className='p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2'>
                                            <div className='flex items-center justify-between text-xs font-bold text-grey-dark'>
                                                <span className='flex items-center gap-1.5'>
                                                    <Icon icon='solar:clipboard-list-bold-duotone' className='text-primary text-base' />
                                                    Weekly Schedule Matrix
                                                </span>
                                                <span className='text-primary font-extrabold'>
                                                    {totalUniqueDishes} Unique Dishes
                                                </span>
                                            </div>
                                            <div className='space-y-1.5 text-[11px] pt-1 border-t border-primary/10 text-grey-muted font-medium max-h-40 overflow-y-auto'>
                                                {formData.availableDays.length === 0 ? (
                                                    <p className='text-[11px] text-grey-muted italic py-1'>No active serving days selected.</p>
                                                ) : (
                                                    formData.availableDays.map((day) => {
                                                        const dayObj = formData.schedule[day] || {}
                                                        const mealSummaries = formData.selectedMealTypeIds.map((mtId) => {
                                                            const mtName = mealTypeMap.get(mtId)?.name || 'Meal'
                                                            const count = (dayObj[mtId] || []).length
                                                            return `${count} ${mtName}`
                                                        })

                                                        return (
                                                            <div
                                                                key={day}
                                                                onClick={() => setCurrentDayTab(day)}
                                                                className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                                                                    currentDayTab === day ? 'bg-primary/15 font-bold text-primary' : 'hover:bg-primary/10'
                                                                }`}
                                                            >
                                                                <span className='font-bold'>{day.slice(0, 3)}:</span>
                                                                <span className='truncate text-[10px]'>{mealSummaries.join(' • ')}</span>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: 2-Level Day & Meal Type Schedule Workstation */}
                                    <div className='lg:col-span-7 xl:col-span-8 space-y-3 flex flex-col'>
                                        {/* Level 1: Day Tabs Bar */}
                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <label className='admin-label mb-0 text-sm font-extrabold flex items-center gap-2'>
                                                        <span>1. Serving Days ({formData.availableDays.length}/7 Active)</span>
                                                    </label>
                                                    {!isViewOnly && (
                                                        <button
                                                            type='button'
                                                            onClick={() => toggleActiveDay(currentDayTab)}
                                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                                                                formData.availableDays.includes(currentDayTab)
                                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                                                                    : 'bg-grey/10 border-grey/20 text-grey-muted hover:border-primary/40'
                                                            }`}
                                                            title='Toggle whether this day is included in the plan'
                                                        >
                                                            {formData.availableDays.includes(currentDayTab) ? '✓ Serving Active' : '+ Include Day'}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                {!isViewOnly && (
                                                    <div className='flex items-center gap-1.5'>
                                                        <button
                                                            type='button'
                                                            onClick={copyCurrentDayToAllDays}
                                                            className='px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer'
                                                            title={`Copy all meals of ${currentDayTab} to other active days`}
                                                        >
                                                            <Icon icon='solar:copy-bold-duotone' className='text-xs' />
                                                            <span>Copy Day</span>
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={copyCurrentMealToAllDays}
                                                            className='px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer'
                                                            title={`Copy only ${mealTypeMap.get(currentMealTab)?.name || 'current meal'} to all active days`}
                                                        >
                                                            <Icon icon='solar:calendar-date-bold-duotone' className='text-xs' />
                                                            <span>Copy {mealTypeMap.get(currentMealTab)?.name || 'Meal'}</span>
                                                        </button>
                                                        {currentSlotSelectedIds.length > 0 && (
                                                            <button
                                                                type='button'
                                                                onClick={clearCurrentSlot}
                                                                className='px-2 py-1 text-[11px] font-bold rounded-lg text-grey-muted hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer'
                                                                title='Clear current meal dishes'
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Day Tabs */}
                                            <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5'>
                                                {ALL_DAYS.map((day) => {
                                                    const isDayActive = formData.availableDays.includes(day)
                                                    const isSelectedTab = currentDayTab === day
                                                    
                                                    let dayDishCount = 0
                                                    const dayObj = formData.schedule[day] || {}
                                                    Object.values(dayObj).forEach((arr) => {
                                                        if (Array.isArray(arr)) dayDishCount += arr.length
                                                    })

                                                    return (
                                                        <button
                                                            key={day}
                                                            type='button'
                                                            onClick={() => setCurrentDayTab(day)}
                                                            className={`flex-1 py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer select-none min-w-[54px] ${
                                                                isSelectedTab
                                                                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20 scale-[1.03]'
                                                                    : isDayActive
                                                                    ? 'bg-primary/5 border-primary/20 text-primary hover:border-primary/40'
                                                                    : 'bg-grey/5 border-grey/15 text-grey-muted/60 opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <div className='flex items-center gap-1'>
                                                                <span>{day.slice(0, 3)}</span>
                                                                {isDayActive && (
                                                                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' title='Active Day' />
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                                                    isSelectedTab
                                                                        ? 'bg-white/20 text-white'
                                                                        : dayDishCount > 0
                                                                        ? 'bg-primary/20 text-primary'
                                                                        : 'bg-grey/20 text-grey-muted'
                                                                }`}
                                                            >
                                                                {isDayActive ? `${dayDishCount} dishes` : 'Off'}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Level 2: Meal Type Sub-Tabs for Current Day */}
                                        <div className='space-y-1.5 pt-0.5'>
                                            <div className='flex items-center justify-between'>
                                                <label className='admin-label mb-0 text-xs flex items-center gap-1.5 font-bold'>
                                                    <span>2. Select Meal Slot ({formData.selectedMealTypeIds.length} in plan)</span>
                                                </label>
                                                {!isViewOnly && currentMealTab && (
                                                    <button
                                                        type='button'
                                                        onClick={() => toggleMealTypeInclusion(currentMealTab)}
                                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                                                            formData.selectedMealTypeIds.includes(currentMealTab)
                                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-800'
                                                                : 'bg-grey/10 border-grey/20 text-grey-muted hover:border-amber-500/40'
                                                        }`}
                                                        title='Include or exclude this meal slot from the plan'
                                                    >
                                                        {formData.selectedMealTypeIds.includes(currentMealTab)
                                                            ? '✓ Included in Plan'
                                                            : '+ Include in Plan'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className='flex items-center gap-1.5 overflow-x-auto'>
                                                {activeMealTypes.map((mt) => {
                                                    const isSelectedMeal = currentMealTab === mt.id
                                                    const isIncluded = formData.selectedMealTypeIds.includes(mt.id)
                                                    const count = (formData.schedule[currentDayTab]?.[mt.id] || []).length

                                                    return (
                                                        <button
                                                            key={mt.id}
                                                            type='button'
                                                            onClick={() => {
                                                                setCurrentMealTab(mt.id)
                                                                if (!isIncluded && !isViewOnly) {
                                                                    toggleMealTypeInclusion(mt.id)
                                                                }
                                                            }}
                                                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer select-none ${
                                                                isSelectedMeal
                                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs font-extrabold'
                                                                    : isIncluded
                                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 hover:bg-amber-500/20'
                                                                    : 'bg-grey/5 border-grey/15 text-grey-muted/60 opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <Icon icon={mt.icon || 'solar:clock-circle-bold'} className='text-sm' />
                                                            <span>{mt.name}</span>
                                                            <span
                                                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                                                    isSelectedMeal
                                                                        ? 'bg-white/25 text-white'
                                                                        : isIncluded
                                                                        ? 'bg-amber-500/20 text-amber-950'
                                                                        : 'bg-grey/20 text-grey-muted'
                                                                }`}
                                                            >
                                                                {isIncluded ? count : 'Off'}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Dish Search & Category Filter */}
                                        <div className='grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-0.5'>
                                            <div className='sm:col-span-6 relative'>
                                                <Icon
                                                    icon='solar:magnifer-bold'
                                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-grey-muted text-sm'
                                                />
                                                <input
                                                    type='text'
                                                    placeholder={`Search dishes for ${currentDayTab} ${mealTypeMap.get(currentMealTab)?.name || ''}...`}
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

                                        {/* Scrollable Dish Selection List for Current Slot */}
                                        <div className='border border-grey/10 rounded-2xl bg-grey/5 p-3 h-[360px] xl:h-[400px] overflow-y-auto'>
                                            {filteredPickableDishes.length === 0 ? (
                                                <div className='h-full flex flex-col items-center justify-center text-center p-4 text-grey-muted'>
                                                    <Icon icon='solar:box-minimalistic-bold-duotone' className='text-3xl mb-1 text-grey/30' />
                                                    <p className='text-xs font-bold'>No active dishes match your filter</p>
                                                    <p className='text-[11px] text-grey-muted mt-0.5'>Try changing the search keyword or category.</p>
                                                </div>
                                            ) : (
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                                                    {filteredPickableDishes.map((item) => {
                                                        const isChecked = currentSlotSelectedIds.includes(item.id)
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => toggleDishForCurrentSlot(item.id)}
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
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selection Summary Footer */}
                                        <div className='p-3 bg-grey/5 rounded-xl border border-grey/10 flex items-center justify-between text-xs font-bold text-grey-dark'>
                                            <span>
                                                {currentDayTab} • {mealTypeMap.get(currentMealTab)?.name || 'Meal'}:{' '}
                                                <strong className='text-primary'>{currentSlotSelectedIds.length} dishes</strong>
                                            </span>
                                            <span className='text-[11px] text-grey-muted'>
                                                Total plan dishes: <strong className='text-grey-dark'>{totalUniqueDishes} distinct items</strong>
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
                                        disabled={mutation.isPending || totalUniqueDishes === 0 || formData.availableDays.length === 0 || formData.selectedMealTypeIds.length === 0}
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
