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
                    <div className='font-bold text-grey-dark text-sm capitalize tracking-tight'>{info.getValue()}</div>
                    <div className='text-xs font-medium text-grey-muted truncate max-w-[220px] mt-0.5'>
                        {info.row.original.foodItems.map(i => i.name).join(', ')}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('foodItems', {
            header: 'Items Count',
            cell: (info) => (
                <span className='admin-badge'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                    {info.getValue().length} Items
                </span>
            ),
        }),
        columnHelper.accessor('price', {
            header: 'Menu Price',
            cell: (info) => (
                <span className='font-bold text-grey-dark text-sm'>
                    AED {info.getValue().toFixed(2)}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className='flex items-center gap-1'>
                    <button
                        onClick={() => openModal(info.row.original, true)}
                        className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                        title='View Plan'
                    >
                        <Icon icon='solar:eye-bold-duotone' className='text-lg' />
                    </button>
                    <button
                        onClick={() => openModal(info.row.original)}
                        className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                        title='Edit Plan'
                    >
                        <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this plan?')) {
                                deleteMutation.mutate(info.row.original.id)
                            }
                        }}
                        className='p-2 text-grey-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all'
                        title='Delete Plan'
                    >
                        <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
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
        <div className='space-y-8'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Menus</h1>
                    <p className='admin-page-subtitle'>Create bundled meal packages and subscription plans</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>New Menu</span>
                </button>
            </div>

            <div className='bg-white rounded-3xl border border-grey/10 overflow-hidden shadow-sm'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead className='bg-grey/5 border-b border-grey/10'>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className='px-6 py-4 text-xs font-bold text-grey/60 uppercase tracking-wider'>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className='divide-y divide-grey/10'>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-12 text-center'>
                                        <Icon icon='line-md:loading-loop' className='text-3xl text-primary mx-auto' />
                                    </td>
                                </tr>
                            ) : foodMenus.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-12 text-center text-grey-muted text-sm font-medium'>
                                        No food menus found.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className='hover:bg-grey/5 transition-colors'>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className='px-6 py-4 align-middle'>
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
                    <div className='bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 border border-grey/10 space-y-6'>
                        <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                            <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                                <Icon icon='solar:calendar-bold-duotone' className='text-primary text-2xl' />
                                {isViewOnly ? 'View Food Menu' : editingMenu ? 'Edit Menu' : 'New Food Menu'}
                            </h4>
                            <button onClick={closeModal} className='text-grey-muted hover:text-grey p-1.5 rounded-xl hover:bg-grey/5 transition-colors'>
                                <Icon icon='solar:close-circle-bold' className='text-2xl' />
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
                                        <label className='admin-label'>Menu Name *</label>
                                        <input
                                            type='text' required value={formData.name}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='e.g. Weekly Feast'
                                        />
                                    </div>
                                    <div>
                                        <label className='admin-label'>Price (AED) *</label>
                                        <input
                                            type='number' step='0.01' required value={formData.price}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className={`admin-input ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='99.00'
                                        />
                                    </div>
                                    <div>
                                        <label className='admin-label'>Description</label>
                                        <textarea
                                            rows={3} value={formData.description}
                                            readOnly={isViewOnly}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className={`admin-input resize-none ${isViewOnly ? 'cursor-default' : ''}`}
                                            placeholder='Briefly describe this plan...'
                                        />
                                    </div>
                                    <div>
                                        <label className='admin-label'>Plan Availability</label>
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
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${formData.availableDays.includes(day)
                                                        ? 'bg-primary border-primary text-white shadow-xs'
                                                        : 'bg-white border-grey/10 text-grey-muted hover:border-primary/40'
                                                        } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <label className='admin-label mb-0'>Select Food Items</label>
                                        <div className='relative'>
                                            <Icon icon='solar:magnifer-bold' className='absolute left-3 top-1/2 -translate-y-1/2 text-grey-muted text-xs' />
                                            <input
                                                type='text'
                                                placeholder='Search items...'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className='pl-8 pr-3 py-1 text-xs border border-grey/15 rounded-lg bg-grey/5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 w-36 font-medium'
                                            />
                                        </div>
                                    </div>
                                    <div className='border border-grey/10 rounded-2xl bg-grey/5 p-3 h-[280px] overflow-y-auto space-y-2'>
                                        {filteredFoodItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleFoodItem(item.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl transition-all border ${formData.foodItemIds.includes(item.id)
                                                    ? 'bg-primary/10 border-primary text-grey-dark font-bold'
                                                    : 'bg-white border-transparent text-grey-dark hover:bg-grey/5 font-semibold'
                                                    } ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className='flex flex-col'>
                                                    <span className='text-xs font-bold'>{item.name}</span>
                                                    <span className='text-[10px] text-grey-muted font-normal'>{item.category.name}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.foodItemIds.includes(item.id)
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-grey/20'
                                                    }`}>
                                                    {formData.foodItemIds.includes(item.id) && <Icon icon='solar:check-read-bold' className='text-xs' />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className='text-xs font-bold text-grey-muted text-center'>
                                        {formData.foodItemIds.length} items selected
                                    </p>
                                </div>
                            </div>

                            {!isViewOnly && (
                                <div className='flex flex-col gap-3 pt-2'>
                                    <button
                                        type='submit'
                                        disabled={mutation.isPending || formData.foodItemIds.length === 0 || formData.availableDays.length === 0}
                                        className='admin-btn-primary w-full py-3.5'
                                    >
                                        {mutation.isPending ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-xl' />
                                                <span>Saving Menu...</span>
                                            </>
                                        ) : (
                                            <span>Save Food Menu</span>
                                        )}
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
