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
    days?: number
    servingCount?: number
    isActive?: boolean
    availableDays?: string[]
    scheduleJson?: any
    features?: string[]
    isPopular?: boolean
    badgeText?: string
    mealTypeId?: string | null
    mealType?: MealType | null
    foodItems?: FoodItem[]
    createdAt?: string
}

const columnHelper = createColumnHelper<FoodMenu>()

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function FoodPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [editingPlan, setEditingPlan] = useState<FoodMenu | null>(null)
    const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all')
    
    // Modal internal schedule navigation states
    const [currentDayTab, setCurrentDayTab] = useState<string>('Monday')
    const [currentMealTab, setCurrentMealTab] = useState<string>('')
    const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [newFeatureText, setNewFeatureText] = useState('')

    // Form data with day-wise & meal-type-wise schedule
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        days: '30',
        servingCount: 1 as 1 | 2 | 3,
        selectedMealTypeIds: [] as string[],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as string[],
        // Structure: Record<DayName, Record<MealTypeId, string[]>>
        schedule: {} as Record<string, Record<string, string[]>>,
        features: [] as string[],
        isPopular: false,
        badgeText: 'Most Popular',
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
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
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
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
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
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
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
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        placeholderData: (previousData) => previousData,
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
            const parsedDays = parseInt(data.days?.toString() || '30', 10) || 30
            const parsedServingCount = parseInt(data.servingCount?.toString() || '1', 10) || 1
            const payload = {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                days: parsedDays,
                servingCount: parsedServingCount,
                mealTypeId: data.selectedMealTypeIds[0] || null,
                availableDays: data.availableDays,
                scheduleJson: data.schedule,
                features: data.features,
                isPopular: data.isPopular,
                badgeText: data.badgeText,
                isActive: data.isActive,
            }
            if (data.planId) {
                return axios.put(`/api/food-menu/${data.planId}`, payload)
            }
            return axios.post('/api/food-menu', payload)
        },
        onMutate: async (data: any) => {
            await queryClient.cancelQueries({ queryKey: ['food-menu'] })
            const previousMenus = queryClient.getQueryData<FoodMenu[]>(['food-menu'])

            // Extract all food items from schedule
            const selectedDishIds = new Set<string>()
            if (data.schedule && typeof data.schedule === 'object') {
                Object.values(data.schedule).forEach((dayObj: any) => {
                    if (dayObj && typeof dayObj === 'object') {
                        Object.values(dayObj).forEach((dishArr: any) => {
                            if (Array.isArray(dishArr)) {
                                dishArr.forEach((id: string) => selectedDishIds.add(id))
                            }
                        })
                    }
                })
            }
            const attachedFoodItems = Array.from(selectedDishIds)
                .map((id) => foodItemsMap.get(id))
                .filter(Boolean) as FoodItem[]

            const optimisticPlan: FoodMenu = {
                id: data.planId ? data.planId : `temp-${Date.now()}`,
                name: data.name,
                description: data.description,
                price: parseFloat(data.price) || 0,
                days: parseInt(data.days?.toString() || '30', 10) || 30,
                servingCount: parseInt(data.servingCount?.toString() || '1', 10) || 1,
                mealTypeId: data.selectedMealTypeIds[0] || null,
                mealType: activeMealTypes.find((m) => m.id === data.selectedMealTypeIds[0]) || null,
                availableDays: data.availableDays,
                scheduleJson: data.schedule,
                features: data.features,
                isPopular: data.isPopular,
                badgeText: data.badgeText,
                isActive: data.isActive,
                foodItems: attachedFoodItems,
            }

            queryClient.setQueryData<FoodMenu[]>(['food-menu'], (old = []) => {
                if (!Array.isArray(old)) return [optimisticPlan]
                if (data.planId) {
                    return old.map((p) => (p.id === data.planId ? { ...p, ...optimisticPlan } : p))
                }
                return [optimisticPlan, ...old]
            })

            closeModal()
            return { previousMenus }
        },
        onError: (err, _, context) => {
            if (context?.previousMenus) {
                queryClient.setQueryData(['food-menu'], context.previousMenus)
            }
            console.error(err)
            toast.error('Failed to save food plan')
        },
        onSuccess: (response, variables) => {
            const serverData = response?.data
            if (serverData && serverData.id) {
                queryClient.setQueryData<FoodMenu[]>(['food-menu'], (old = []) => {
                    if (!Array.isArray(old)) return [serverData]
                    if (variables?.planId) {
                        return old.map((p) => (p.id === variables.planId ? { ...p, ...serverData } : p))
                    }
                    return old.map((p) => (p.id.startsWith('temp-') ? serverData : p))
                })
            }
            toast.success(variables?.planId ? 'Food plan updated successfully' : 'Food plan created successfully')
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
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-menu/${id}`)
        },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ['food-menu'] })
            const previousMenus = queryClient.getQueryData<FoodMenu[]>(['food-menu'])
            queryClient.setQueryData<FoodMenu[]>(['food-menu'], (old = []) => {
                if (!Array.isArray(old)) return []
                return old.filter((menu) => menu.id !== id)
            })
            return { previousMenus }
        },
        onError: (err: any, _, context) => {
            if (context?.previousMenus) {
                queryClient.setQueryData(['food-menu'], context.previousMenus)
            }
            toast.error(err.response?.data?.error || 'Failed to delete food plan')
        },
        onSuccess: () => {
            toast.success('Food plan deleted successfully')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setIsViewOnly(false)
        setEditingPlan(null)
        setSearchTerm('')
        setNewFeatureText('')
        setModalCategoryFilter('all')
        setCurrentDayTab('Monday')
        setCurrentMealTab(activeMealTypes[0]?.id || '')
        setFormData({
            name: '',
            description: '',
            price: '',
            days: '30',
            servingCount: 1,
            selectedMealTypeIds: activeMealTypes.map((m) => m.id),
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            schedule: {},
            features: [],
            isPopular: false,
            badgeText: 'Most Popular',
            isActive: true,
        })
    }

    const handleAddFeature = () => {
        if (!newFeatureText.trim() || isViewOnly) return
        setFormData((prev) => ({
            ...prev,
            features: [...prev.features, newFeatureText.trim()],
        }))
        setNewFeatureText('')
    }

    const handleRemoveFeature = (index: number) => {
        if (isViewOnly) return
        setFormData((prev) => ({
            ...prev,
            features: prev.features.filter((_, idx) => idx !== index),
        }))
    }

    const handleLoadDefaultFeatures = () => {
        if (isViewOnly) return
        const sc = formData.servingCount
        const defaults = [
            sc === 1
                ? 'Choose Any 1 Meal/Day (Breakfast / Lunch / Dinner)'
                : sc === 2
                ? 'Choose Any 2 Meals/Day (Breakfast / Lunch / Dinner)'
                : 'Includes All 3 Meals/Day (Breakfast / Lunch / Dinner)',
            'Daily rotating South Indian & Kerala menu',
            'Free doorstep delivery to your room/flat',
            'Non-Veg, Veg & Fish rotation options',
            'Flexible pause & resume when travelling',
        ]
        setFormData((prev) => ({ ...prev, features: defaults }))
        toast.success('Loaded suggested feature checklist!')
    }

    const resolveMealTypeId = (rawKey: string, availableMealTypes: MealType[]): string | null => {
        if (!rawKey) return null
        // 1. Direct ID match
        const direct = availableMealTypes.find((m) => m.id === rawKey)
        if (direct) return direct.id
        // 2. Case-insensitive name match
        const byName = availableMealTypes.find((m) => m.name.trim().toLowerCase() === rawKey.trim().toLowerCase())
        if (byName) return byName.id
        // 3. Partial name match
        const partial = availableMealTypes.find((m) =>
            rawKey.toLowerCase().includes(m.name.toLowerCase()) ||
            m.name.toLowerCase().includes(rawKey.toLowerCase())
        )
        if (partial) return partial.id
        return null
    }

    const openModal = (plan?: FoodMenu, view: boolean = false) => {
        setIsViewOnly(view)
        setSearchTerm('')
        setNewFeatureText('')
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
                'Sunday',
            ]
            setCurrentDayTab(days[0] || 'Monday')

            // Build hierarchical schedule: Record<Day, Record<MealTypeId, string[]>>
            const parsedSchedule: Record<string, Record<string, string[]>> = {}
            ALL_DAYS.forEach((d) => {
                parsedSchedule[d] = {}
            })

            const primaryMealId = resolveMealTypeId(plan.mealTypeId || '', activeMealTypes) || (activeMealTypes.length > 0 ? activeMealTypes[0].id : '')
            const detectedMealTypeIds = new Set<string>()
            if (primaryMealId) detectedMealTypeIds.add(primaryMealId)

            if (plan.scheduleJson && typeof plan.scheduleJson === 'object') {
                ALL_DAYS.forEach((d) => {
                    const dayVal = plan.scheduleJson[d]
                    if (Array.isArray(dayVal)) {
                        // Legacy flat day array: map to primary meal type
                        if (primaryMealId) {
                            parsedSchedule[d][primaryMealId] = [...dayVal]
                            detectedMealTypeIds.add(primaryMealId)
                        }
                    } else if (dayVal && typeof dayVal === 'object') {
                        // Nested day -> mealTypeId / mealName -> items
                        Object.keys(dayVal).forEach((rawKey) => {
                            if (rawKey === 'features' || rawKey === 'isPopular' || rawKey === 'badgeText') return // skip meta keys
                            const resolvedId = resolveMealTypeId(rawKey, activeMealTypes) || rawKey
                            if (Array.isArray(dayVal[rawKey])) {
                                parsedSchedule[d][resolvedId] = [
                                    ...(parsedSchedule[d][resolvedId] || []),
                                    ...dayVal[rawKey],
                                ]
                                if (dayVal[rawKey].length > 0) detectedMealTypeIds.add(resolvedId)
                            }
                        })
                    }
                })
            } else {
                // Fallback: legacy attached dishes
                const fallbackIds = (plan.foodItems || []).map((item) => item.id)
                days.forEach((d) => {
                    if (primaryMealId) {
                        parsedSchedule[d][primaryMealId] = [...fallbackIds]
                    }
                })
                if (primaryMealId) detectedMealTypeIds.add(primaryMealId)
            }

            // Normalize detected meal types to active meal types IDs
            let initialMealTypeIds = Array.from(detectedMealTypeIds)
                .map((raw) => resolveMealTypeId(raw, activeMealTypes) || raw)
                .filter((id) => activeMealTypes.some((m) => m.id === id))

            const planServingCount = ((plan.servingCount as any) || 1) as 1 | 2 | 3
            if (planServingCount === 3 || initialMealTypeIds.length === 0) {
                initialMealTypeIds = activeMealTypes.map((m) => m.id)
            }

            const selectedFirstMeal = initialMealTypeIds.find((id) => activeMealTypes.some((m) => m.id === id)) || activeMealTypes[0]?.id || ''
            setCurrentMealTab(selectedFirstMeal)

            const initialFeatures = Array.isArray(plan.features) && plan.features.length > 0
                ? plan.features
                : (Array.isArray(plan.scheduleJson?.features) && plan.scheduleJson.features.length > 0
                    ? plan.scheduleJson.features
                    : [
                        plan.servingCount === 1
                            ? 'Choose Any 1 Meal/Day (Breakfast / Lunch / Dinner)'
                            : plan.servingCount === 2
                            ? 'Choose Any 2 Meals/Day (Breakfast / Lunch / Dinner)'
                            : 'Includes All 3 Meals/Day (Breakfast / Lunch / Dinner)',
                        'Daily rotating South Indian & Kerala menu',
                        'Free doorstep delivery to your room/flat',
                        'Non-Veg, Veg & Fish rotation options',
                        'Flexible pause & resume when travelling',
                    ])

            const isPop = Boolean(plan.isPopular ?? plan.scheduleJson?.isPopular)
            const badge = plan.badgeText || plan.scheduleJson?.badgeText || (isPop ? 'Most Popular' : 'Most Popular')

            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                days: (plan.days || 30).toString(),
                servingCount: planServingCount,
                selectedMealTypeIds: initialMealTypeIds,
                availableDays: days,
                schedule: parsedSchedule,
                features: initialFeatures,
                isPopular: isPop,
                badgeText: badge,
                isActive: plan.isActive !== false,
            })
        } else {
            setEditingPlan(null)
            const initialMealTypeIds = activeMealTypes.map((m) => m.id)
            setCurrentDayTab('Monday')
            setCurrentMealTab(initialMealTypeIds[0] || '')

            const blankSchedule: Record<string, Record<string, string[]>> = {}
            ALL_DAYS.forEach((d) => {
                blankSchedule[d] = {}
            })

            const blankFeatures = [
                'Choose Any 1 Meal/Day (Breakfast / Lunch / Dinner)',
                'Daily rotating South Indian & Kerala menu',
                'Free doorstep delivery to your room/flat',
                'Non-Veg, Veg & Fish rotation options',
                'Flexible pause & resume when travelling',
            ]

            setFormData({
                name: '',
                description: '',
                price: '',
                days: '30',
                servingCount: 1,
                selectedMealTypeIds: initialMealTypeIds,
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                schedule: blankSchedule,
                features: blankFeatures,
                isPopular: false,
                badgeText: 'Most Popular',
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

            // Auto-include currentDayTab in availableDays if not already present
            const nextAvailableDays = prev.availableDays.includes(currentDayTab)
                ? prev.availableDays
                : [...prev.availableDays, currentDayTab]

            // Auto-include currentMealTab in selectedMealTypeIds if not already present
            const nextMealTypeIds = prev.selectedMealTypeIds.includes(currentMealTab)
                ? prev.selectedMealTypeIds
                : [...prev.selectedMealTypeIds, currentMealTab]

            return {
                ...prev,
                availableDays: nextAvailableDays,
                selectedMealTypeIds: nextMealTypeIds,
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

    // Filter computation for table based on Status (All, Active, Inactive)
    const filteredPlans = useMemo(() => {
        if (activeStatusFilter === 'active') {
            return foodPlans.filter((p) => p.isActive !== false)
        }
        if (activeStatusFilter === 'inactive') {
            return foodPlans.filter((p) => p.isActive === false)
        }
        return foodPlans
    }, [foodPlans, activeStatusFilter])

    // Filter options with live counts for Status (All Plans, Active, Inactive)
    const filterOptions: FilterOption[] = useMemo(() => {
        const activeCount = foodPlans.filter((p) => p.isActive !== false).length
        const inactiveCount = foodPlans.filter((p) => p.isActive === false).length

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
                    const mealType = row.mealType || activeMealTypes.find(mt => row.name.toLowerCase().includes(mt.name.toLowerCase()))

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
                                <span className='px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 text-[10px] font-extrabold border border-emerald-500/20'>
                                    {row.servingCount || 1} Time Plan
                                </span>
                                <span className='px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 text-[10px] font-extrabold border border-blue-500/20'>
                                    {row.days || 30} Days
                                </span>
                                {(row.isPopular || row.scheduleJson?.isPopular) && (
                                    <span className='px-2 py-0.5 rounded-md bg-amber-400 text-grey-dark text-[10px] font-extrabold flex items-center gap-1 shadow-xs'>
                                        <Icon icon='solar:star-bold' className='text-xs text-grey-dark' />
                                        <span>{row.badgeText || row.scheduleJson?.badgeText || 'Most Popular'}</span>
                                    </span>
                                )}
                            </div>
                            <div className='text-xs font-medium text-grey-muted truncate max-w-[320px]'>
                                {row.description || (items.length > 0 ? items.map((i) => i.name).join(', ') : 'No description set')}
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
                header: 'Plan Price',
                cell: (info) => {
                    const price = info.getValue() || 0
                    const row = info.row.original
                    return (
                        <div>
                            <span className='font-extrabold text-grey-dark text-sm block'>
                                AED {price.toFixed(2)}
                            </span>
                            <span className='text-[10px] text-grey-muted font-bold block'>
                                per {row.days || 30} days
                            </span>
                        </div>
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

    if (isLoading && foodPlans.length === 0) {
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

            {/* Centralized DataTable Component with Status Tabs (All, Active, Inactive), Search, and Pagination */}
            <DataTable
                data={filteredPlans}
                columns={columns}
                searchPlaceholder='Search food plans by name or included dishes...'
                filterOptions={filterOptions}
                activeFilter={activeStatusFilter}
                onFilterChange={setActiveStatusFilter}
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
                                    mutation.mutate({ ...formData, planId: editingPlan?.id || null })
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

                                        {/* Pricing & Plan Days (No. of Days) */}
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                            <div>
                                                <label className='admin-label'>Plan Price (AED) *</label>
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

                                            <div>
                                                <label className='admin-label'>No. of Days (Validity) *</label>
                                                <input
                                                    type='number'
                                                    min='1'
                                                    max='365'
                                                    required
                                                    value={formData.days}
                                                    readOnly={isViewOnly}
                                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                                    className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                                    placeholder='30'
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

                                        {/* Featured / Most Popular Ribbon Badge Toggle */}
                                        <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 space-y-2.5'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <span className='text-xs font-bold text-grey-dark flex items-center gap-1.5'>
                                                        <Icon icon='solar:star-bold' className='text-amber-500 text-sm' />
                                                        <span>Featured / Most Popular Badge</span>
                                                    </span>
                                                    <span className='text-[11px] text-grey-muted block mt-0.5'>
                                                        Highlights this plan with a ribbon on website cards
                                                    </span>
                                                </div>
                                                <StatusToggle
                                                    isActive={formData.isPopular}
                                                    onToggle={(val) => setFormData({ ...formData, isPopular: val })}
                                                    disabled={isViewOnly}
                                                />
                                            </div>

                                            {formData.isPopular && (
                                                <div className='pt-2 space-y-1.5 border-t border-grey/10 mt-1'>
                                                    <div className='flex items-center justify-between'>
                                                        <label className='admin-label text-[11px] mb-0'>Ribbon Badge Text</label>
                                                        <span className='text-[10px] text-grey-muted'>Type any custom tag</span>
                                                    </div>
                                                    <input
                                                        type='text'
                                                        value={formData.badgeText}
                                                        readOnly={isViewOnly}
                                                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                                                        className={`admin-input text-xs py-2 ${isViewOnly ? 'cursor-default' : ''}`}
                                                        placeholder='e.g. Most Popular, Best Value, Chef Special...'
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <div className='flex items-center justify-between mb-1.5'>
                                                <label className='admin-label mb-0'>Plan Description</label>
                                                <span className='text-[10px] text-grey-muted'>
                                                    {formData.description.length}/200 chars
                                                </span>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                readOnly={isViewOnly}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`admin-input resize-none text-xs leading-relaxed ${isViewOnly ? 'cursor-default' : ''}`}
                                                placeholder='Describe the package, meal timings, or special diet highlights...'
                                            />
                                        </div>

                                        {/* Servings No. (Meals Per Day) Selection */}
                                        <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 space-y-2.5'>
                                            <div className='flex items-center justify-between'>
                                                <label className='admin-label mb-0 text-xs font-black uppercase tracking-wider text-grey-dark'>
                                                    Serving No. (Meals Per Day) *
                                                </label>
                                                <span className='px-2.5 py-0.5 rounded-full bg-primary/20 text-grey-dark font-extrabold text-[10px] border border-primary/30'>
                                                    {formData.servingCount} Time Plan
                                                </span>
                                            </div>

                                            <div className='grid grid-cols-3 gap-2'>
                                                {([1, 2, 3] as const).map((num) => {
                                                    const isSelected = formData.servingCount === num
                                                    return (
                                                        <button
                                                            key={num}
                                                            type='button'
                                                            disabled={isViewOnly}
                                                            onClick={() => {
                                                                setFormData((prev) => {
                                                                    let newSelectedMealTypes = [...prev.selectedMealTypeIds]
                                                                    if (num === 3) {
                                                                        newSelectedMealTypes = activeMealTypes.map((m) => m.id)
                                                                    } else if (newSelectedMealTypes.length === 0) {
                                                                        newSelectedMealTypes = activeMealTypes.slice(0, num).map((m) => m.id)
                                                                    }
                                                                    return {
                                                                        ...prev,
                                                                        servingCount: num,
                                                                        selectedMealTypeIds: newSelectedMealTypes,
                                                                    }
                                                                })
                                                            }}
                                                            className={`py-2.5 px-2 rounded-xl text-xs font-black text-center transition-all cursor-pointer border ${
                                                                isSelected
                                                                    ? 'bg-primary text-grey-dark border-primary shadow-xs scale-[1.02]'
                                                                    : 'bg-white text-grey-muted border-grey/10 hover:border-primary/40 hover:text-grey-dark'
                                                            }`}
                                                        >
                                                            <span>{num} Time</span>
                                                            <span className='block text-[10px] font-bold opacity-75'>
                                                                {num === 1 ? '1 Meal/Day' : num === 2 ? '2 Meals/Day' : '3 Meals/Day'}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <p className='text-[11px] text-grey-muted font-medium'>
                                                {formData.servingCount === 1 && "Customer can choose any 1 meal slot (e.g. Lunch or Dinner) when ordering."}
                                                {formData.servingCount === 2 && "Customer can choose any 2 meal slots (e.g. Lunch + Dinner) when ordering."}
                                                {formData.servingCount === 3 && "Customer gets all 3 meal slots (Breakfast + Lunch + Dinner) when ordering."}
                                            </p>
                                        </div>

                                        {/* Plan Highlights & Feature Checklist */}
                                        <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/10 space-y-2.5'>
                                            <div className='flex items-center justify-between'>
                                                <label className='admin-label mb-0 text-xs font-black uppercase tracking-wider text-grey-dark flex items-center gap-1.5'>
                                                    <Icon icon='solar:checklist-minimalistic-bold-duotone' className='text-primary text-base' />
                                                    <span>Card Feature Highlights ({formData.features.length})</span>
                                                </label>
                                                {!isViewOnly && (
                                                    <button
                                                        type='button'
                                                        onClick={handleLoadDefaultFeatures}
                                                        className='text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer'
                                                        title='Reset to recommended feature checklist'
                                                    >
                                                        <Icon icon='solar:restart-bold' />
                                                        <span>Auto-Fill</span>
                                                    </button>
                                                )}
                                            </div>

                                            <p className='text-[11px] text-grey-muted'>
                                                Bullet points displayed on the website card for this meal plan:
                                            </p>

                                            {/* Existing feature bullet items */}
                                            <div className='space-y-1.5 max-h-48 overflow-y-auto pr-1'>
                                                {formData.features.map((feat, idx) => (
                                                    <div
                                                        key={idx}
                                                        className='flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-grey/10 text-xs font-medium text-grey-dark group'
                                                    >
                                                        <div className='flex items-start gap-2 min-w-0'>
                                                            <div className='w-4 h-4 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                                                                <Icon icon='solar:check-read-bold' className='text-[10px]' />
                                                            </div>
                                                            <span className='leading-tight break-words text-[11px] font-semibold text-grey-dark'>
                                                                {feat}
                                                            </span>
                                                        </div>
                                                        {!isViewOnly && (
                                                            <button
                                                                type='button'
                                                                onClick={() => handleRemoveFeature(idx)}
                                                                className='text-grey-muted hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0 cursor-pointer'
                                                                title='Remove highlight'
                                                            >
                                                                <Icon icon='solar:trash-bin-trash-bold' className='text-xs' />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {formData.features.length === 0 && (
                                                    <div className='p-3 bg-white rounded-xl border border-dashed border-grey/20 text-center text-xs text-grey-muted'>
                                                        No custom highlights added. Standard automatic points will be used.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add new feature input */}
                                            {!isViewOnly && (
                                                <div className='flex items-center gap-1.5 pt-1'>
                                                    <input
                                                        type='text'
                                                        value={newFeatureText}
                                                        onChange={(e) => setNewFeatureText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleAddFeature()
                                                            }
                                                        }}
                                                        placeholder='e.g. Free Friday Biryani included...'
                                                        className='w-full px-3 py-2 bg-white border border-grey/15 focus:border-primary rounded-xl text-xs outline-hidden text-grey-dark placeholder:text-grey-muted'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={handleAddFeature}
                                                        className='px-3 py-2 bg-primary hover:bg-primary/90 text-grey-dark font-bold rounded-xl text-xs shrink-0 transition-all cursor-pointer'
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            )}
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
                                                </div>

                                                {/* Action Buttons */}
                                                {!isViewOnly && currentSlotSelectedIds.length > 0 && (
                                                    <div className='flex items-center gap-1.5'>
                                                        <button
                                                            type='button'
                                                            onClick={clearCurrentSlot}
                                                            className='px-2 py-1 text-[11px] font-bold rounded-lg text-grey-muted hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer'
                                                            title='Clear current meal dishes'
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Day Tabs - 7 Col Grid for Instant Visibility on all Screen Sizes */}
                                            <div className='grid grid-cols-7 gap-1 sm:gap-1.5'>
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
                                                            className={`w-full py-2 px-0.5 sm:px-1 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer select-none ${
                                                                isSelectedTab
                                                                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20 scale-[1.02]'
                                                                    : isDayActive
                                                                    ? 'bg-primary/5 border-primary/20 text-primary hover:border-primary/40'
                                                                    : 'bg-grey/5 border-grey/15 text-grey-muted/60 opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <div className='flex items-center gap-1 max-w-full px-0.5'>
                                                                <span className='truncate text-[11px] sm:text-xs tracking-tight font-extrabold'>{day}</span>
                                                                {isDayActive && (
                                                                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0' title='Active Day' />
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-[10px] min-w-[20px] h-[18px] px-1.5 rounded-full font-black flex items-center justify-center ${
                                                                    isSelectedTab
                                                                        ? 'bg-white/25 text-white'
                                                                        : dayDishCount > 0
                                                                        ? 'bg-primary/20 text-primary'
                                                                        : 'bg-grey/20 text-grey-muted'
                                                                }`}
                                                            >
                                                                {isDayActive ? dayDishCount : 'Off'}
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
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            formData.selectedMealTypeIds.includes(currentMealTab)
                                                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                                                : 'bg-grey/10 border-grey/20 text-grey-dark hover:bg-amber-500/20'
                                                        }`}
                                                        title='Include or exclude this meal slot from the plan'
                                                    >
                                                        {formData.selectedMealTypeIds.includes(currentMealTab) ? (
                                                            <>
                                                                <Icon icon='solar:check-circle-bold' className='text-sm' />
                                                                <span>Slot Included</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon icon='solar:add-circle-bold' className='text-sm' />
                                                                <span>+ Include Slot</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Meal Type Tabs - Responsive Grid */}
                                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
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
                                                            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer select-none ${
                                                                isSelectedMeal
                                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs font-extrabold'
                                                                    : isIncluded
                                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 hover:bg-amber-500/20'
                                                                    : 'bg-grey/5 border-grey/15 text-grey-muted/60 opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <Icon icon={mt.icon || 'solar:clock-circle-bold'} className='text-sm shrink-0' />
                                                            <span className='truncate'>{mt.name}</span>
                                                            <span
                                                                className={`text-[10px] min-w-[20px] h-[18px] px-1.5 rounded-full font-black flex items-center justify-center shrink-0 ${
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
