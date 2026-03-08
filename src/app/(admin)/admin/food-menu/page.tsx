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

type FoodMenu = {
    id: string
    name: string
    description?: string
    price: number
    foodItems: FoodItem[]
    availableDays: string[]
}

const columnHelper = createColumnHelper<FoodMenu>()

export default function FoodMenusPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [editingMenu, setEditingMenu] = useState<FoodMenu | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        foodItemIds: [] as string[],
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as string[]
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

    const { data: foodMenus = [], isLoading } = useQuery({
        queryKey: ['food-menu'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu')
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingMenu) {
                return axios.put(`/api/food-menu/${editingMenu.id}`, data)
            }
            return axios.post('/api/food-menu', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-menu'] })
            toast.success(editingMenu ? 'Menu updated' : 'Menu created')
            closeModal()
        },
        onError: (err) => {
            console.error(err)
            toast.error('Something went wrong')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-menu/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-menu'] })
            toast.success('Food menu deleted')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setIsViewOnly(false)
        setEditingMenu(null)
        setSearchTerm('')
        setFormData({
            name: '',
            description: '',
            price: '',
            foodItemIds: [],
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        })
    }

    const openModal = (menu?: FoodMenu, view: boolean = false) => {
        setIsViewOnly(view)
        if (menu) {
            setEditingMenu(menu)
            setFormData({
                name: menu.name,
                description: menu.description || '',
                price: menu.price.toString(),
                foodItemIds: menu.foodItems.map(item => item.id),
                availableDays: menu.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
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
            header: 'Menu Price',
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
        data: foodMenus,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Food Menus</h3>
                    <p className='text-grey/40 text-sm'>Create bundled meal packages</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2'
                >
                    <Icon icon='ion:add-circle-outline' className='text-xl' />
                    New Menu
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
                            ) : foodMenus.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-10 text-center text-grey/40'>
                                        No food menus found.
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
                                {isViewOnly ? 'View Food Menu' : editingMenu ? 'Edit Menu' : 'New Food Menu'}
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
                                        <label className='block text-sm font-medium text-grey mb-2'>Menu Name</label>
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
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-3'>Plan Availability</label>
                                        <div className='flex flex-wrap gap-2'>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                <button
                                                    key={day}
                                                    type='button'
                                                    disabled={isViewOnly}
                                                    onClick={() => {
                                                        const current = [...formData.availableDays]
                                                        if (current.includes(day)) {
                                                            setFormData({ ...formData, availableDays: current.filter(d => d !== day) })
                                                        } else {
                                                            setFormData({ ...formData, availableDays: [...current, day] })
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${formData.availableDays.includes(day)
                                                        ? 'bg-primary border-primary text-white'
                                                        : 'bg-white border-grey/10 text-grey/40 hover:border-primary/30'
                                                        } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                        {formData.availableDays.length === 0 && (
                                            <p className='text-[10px] text-red-500 mt-2 font-medium'>Please select at least one day.</p>
                                        )}
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
                                        disabled={mutation.isPending || formData.foodItemIds.length === 0 || formData.availableDays.length === 0}
                                        className='w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all'
                                    >
                                        {mutation.isPending ? 'Saving Menu...' : 'Save Food Menu'}
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
