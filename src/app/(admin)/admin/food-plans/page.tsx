'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

type FoodItem = {
    id: string
    name: string
    price: number
    category: { name: string }
}

type FoodPlan = {
    id: string
    name: string
    description?: string
    price: number
    foodItems: FoodItem[]
}

const columnHelper = createColumnHelper<FoodPlan>()

export default function FoodPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [editingPlan, setEditingPlan] = useState<FoodPlan | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        foodItemIds: [] as string[]
    })
    const [searchTerm, setSearchTerm] = useState('')

    const queryClient = useQueryClient()

    const foodItemsQuery = useQuery({
        queryKey: ['all-food-items-for-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-items?limit=1000')
            return response.data
        },
    })
    const foodItems = foodItemsQuery.data?.data || []

    const { data: foodPlans = [], isLoading } = useQuery({
        queryKey: ['food-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-plans')
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingPlan) {
                return axios.put(`/api/food-plans/${editingPlan.id}`, data)
            }
            return axios.post('/api/food-plans', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-plans'] })
            toast.success(editingPlan ? 'Plan updated' : 'Plan created')
            closeModal()
        },
        onError: (err) => {
            console.error(err)
            toast.error('Something went wrong')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-plans/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-plans'] })
            toast.success('Food plan deleted')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setIsViewOnly(false)
        setEditingPlan(null)
        setSearchTerm('')
        setFormData({
            name: '',
            description: '',
            price: '',
            foodItemIds: []
        })
    }

    const openModal = (plan?: FoodPlan, view: boolean = false) => {
        setIsViewOnly(view)
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                foodItemIds: plan.foodItems.map(item => item.id)
            })
        }
        setIsModalOpen(true)
    }

    const toggleFoodItem = (id: string) => {
        if (isViewOnly) return
        setFormData(prev => ({
            ...prev,
            foodItemIds: prev.foodItemIds.includes(id)
                ? prev.foodItemIds.filter(itemId => itemId !== id)
                : [...prev.foodItemIds, id]
        }))
    }

    const filteredFoodItems = foodItems.filter((item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const columns = [
        columnHelper.accessor('name', {
            header: 'Plan Name',
            cell: (info) => (
                <div>
                    <div className='font-bold text-grey capitalize'>{info.getValue()}</div>
                    <div className='text-xs text-grey/40 truncate max-w-[200px]'>
                        {info.row.original.foodItems.map(i => i.name).join(', ')}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('foodItems', {
            header: 'Items Count',
            cell: (info) => (
                <span className='px-3 py-1 bg-grey/5 rounded-full text-xs font-semibold text-grey'>
                    {info.getValue().length} Items
                </span>
            ),
        }),
        columnHelper.accessor('price', {
            header: 'Plan Price',
            cell: (info) => (
                <span className='font-semibold text-primary'>
                    AED {info.getValue().toFixed(2)}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => openModal(info.row.original, true)}
                        className='p-2 text-grey/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
                        title='View Plan'
                    >
                        <Icon icon='ion:eye-outline' className='text-xl' />
                    </button>
                    <button
                        onClick={() => openModal(info.row.original)}
                        className='p-2 text-grey/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
                        title='Edit Plan'
                    >
                        <Icon icon='ion:create-outline' className='text-xl' />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this plan?')) {
                                deleteMutation.mutate(info.row.original.id)
                            }
                        }}
                        className='p-2 text-grey/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
                        title='Delete Plan'
                    >
                        <Icon icon='ion:trash-outline' className='text-xl' />
                    </button>
                </div>
            ),
        }),
    ]

    const table = useReactTable({
        data: foodPlans,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Food Plans</h3>
                    <p className='text-grey/40 text-sm'>Create bundled meal packages</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2'
                >
                    <Icon icon='ion:add-circle-outline' className='text-xl' />
                    New Plan
                </button>
            </div>

            <div className='bg-white rounded-3xl border border-grey/10 overflow-hidden shadow-sm'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead className='bg-grey/5 border-b border-grey/10'>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className='px-6 py-4 text-xs font-bold text-grey/40 uppercase tracking-wider'>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className='divide-y divide-grey/10'>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-10 text-center'>
                                        <Icon icon='line-md:loading-loop' className='text-3xl text-primary mx-auto' />
                                    </td>
                                </tr>
                            ) : foodPlans.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-10 text-center text-grey/40'>
                                        No food plans found.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className='hover:bg-grey/5 transition-colors'>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className='px-6 py-4'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto'>
                    <div className='bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8'>
                        <div className='flex items-center justify-between mb-6'>
                            <h4 className='text-xl font-bold text-grey'>
                                {isViewOnly ? 'View Food Plan' : editingPlan ? 'Edit Plan' : 'New Food Plan'}
                            </h4>
                            <button onClick={closeModal} className='text-grey/40 hover:text-grey p-1'>
                                <Icon icon='ion:close-outline' className='text-2xl' />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                mutation.mutate(formData)
                            }}
                            className='space-y-6'
                        >
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Plan Name</label>
                                        <input
                                            type='text' required value={formData.name}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='e.g. Weekly Feast'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Price (AED)</label>
                                        <input
                                            type='number' step='0.01' required value={formData.price}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className={`block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='99.00'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Description</label>
                                        <textarea
                                            rows={4} value={formData.description}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className={`block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='Briefly describe this plan...'
                                        />
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <label className='block text-sm font-medium text-grey'>Select Food Items</label>
                                        <div className='relative'>
                                            <Icon icon='ion:search-outline' className='absolute left-3 top-1/2 -translate-y-1/2 text-grey/40' />
                                            <input
                                                type='text'
                                                placeholder='Search items...'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className='pl-9 pr-4 py-1.5 text-xs border border-grey/10 rounded-lg bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-40'
                                            />
                                        </div>
                                    </div>
                                    <div className='border border-grey/10 rounded-xl bg-grey/5 p-4 h-[300px] overflow-y-auto space-y-2'>
                                        {filteredFoodItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleFoodItem(item.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl transition-all border ${formData.foodItemIds.includes(item.id)
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-white border-transparent text-grey hover:bg-grey/5'
                                                    } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className='flex flex-col'>
                                                    <span className='text-sm font-bold'>{item.name}</span>
                                                    <span className='text-[10px] opacity-60'>{item.category.name}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.foodItemIds.includes(item.id)
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-grey/10'
                                                    }`}>
                                                    {formData.foodItemIds.includes(item.id) && <Icon icon='ion:checkmark' className='text-xs' />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className='text-[10px] text-grey/40 text-center italic'>
                                        {formData.foodItemIds.length} items selected
                                    </p>
                                </div>
                            </div>

                            {!isViewOnly && (
                                <div className='flex flex-col gap-3 pt-4'>
                                    <button
                                        type='submit'
                                        disabled={mutation.isPending || formData.foodItemIds.length === 0}
                                        className='w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all'
                                    >
                                        {mutation.isPending ? 'Saving Plan...' : 'Save Food Plan'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
