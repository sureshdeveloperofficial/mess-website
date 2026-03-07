'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import ImageUpload from '@/app/components/Common/ImageUpload'
import { getFullImageUrl } from '@/utils/image'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

type Option = {
    id?: string
    name: string
    price: number
}

type FoodItem = {
    id: string
    name: string
    description?: string
    price: number
    image?: string
    categoryId: string
    category: { name: string }
    options: Option[]
}

const columnHelper = createColumnHelper<FoodItem>()

export default function FoodItemsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        categoryId: '',
        options: [] as Option[]
    })

    // Pagination State
    const [{ pageIndex, pageSize }, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    })

    const pagination = {
        pageIndex,
        pageSize,
    }

    const queryClient = useQueryClient()

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })

    const { data: { data: foodItems = [], totalPages = 0 } = {}, isLoading } = useQuery({
        queryKey: ['food-items', pageIndex, pageSize],
        queryFn: async () => {
            const response = await axios.get(`/api/food-items?page=${pageIndex + 1}&limit=${pageSize}`)
            return response.data
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
            toast.success(editingItem ? 'Item updated' : 'Item created')
            closeModal()
        },
        onError: (err) => {
            console.error(err)
            toast.error('Something went wrong')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/food-items/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-items'] })
            toast.success('Food item deleted')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setFormData({
            name: '',
            description: '',
            price: '',
            image: '',
            categoryId: '',
            options: []
        })
    }

    const openModal = (item?: FoodItem) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                name: item.name,
                description: item.description || '',
                price: item.price.toString(),
                image: item.image || '',
                categoryId: item.categoryId,
                options: item.options.map(o => ({ name: o.name, price: o.price }))
            })
        }
        setIsModalOpen(true)
    }

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: '', price: 0 }]
        }))
    }

    const updateOption = (index: number, field: 'name' | 'price', value: string) => {
        const updatedOptions = [...formData.options]
        if (field === 'price') {
            updatedOptions[index].price = parseFloat(value) || 0
        } else {
            updatedOptions[index].name = value
        }
        setFormData({ ...formData, options: updatedOptions })
    }

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }))
    }

    const columns = [
        columnHelper.accessor('image', {
            header: 'Image',
            cell: (info) => (
                <div className='w-12 h-12 bg-grey/5 rounded-xl overflow-hidden relative'>
                    {info.getValue() ? (
                        <Image src={getFullImageUrl(info.getValue()!)} alt='' fill className='object-cover' />
                    ) : (
                        <div className='flex items-center justify-center h-full text-grey/20'>
                            <Icon icon='ion:image-outline' className='text-xl' />
                        </div>
                    )}
                </div>
            )
        }),
        columnHelper.accessor('name', {
            header: 'Item Details',
            cell: (info) => (
                <div>
                    <div className='font-bold text-grey capitalize'>{info.getValue()}</div>
                    <div className='text-xs text-grey/40'>{info.row.original.category.name}</div>
                </div>
            ),
        }),
        columnHelper.accessor('price', {
            header: 'Price',
            cell: (info) => (
                <span className='font-semibold text-primary'>
                    ${info.getValue().toFixed(2)}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => openModal(info.row.original)}
                        className='p-2 text-grey/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
                    >
                        <Icon icon='ion:create-outline' className='text-xl' />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this item?')) {
                                deleteMutation.mutate(info.row.original.id)
                            }
                        }}
                        className='p-2 text-grey/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
                    >
                        <Icon icon='ion:trash-outline' className='text-xl' />
                    </button>
                </div>
            ),
        }),
    ]

    const table = useReactTable({
        data: foodItems,
        columns,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    })

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Food Menu Items</h3>
                    <p className='text-grey/40 text-sm'>Manage your signature dishes</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2'
                >
                    <Icon icon='ion:add-circle-outline' className='text-xl' />
                    Add Item
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
                            ) : foodItems.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-10 text-center text-grey/40'>
                                        No food items found.
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

            {/* Pagination Controls */}
            <div className='flex items-center justify-between mt-6 px-2'>
                <div className='text-sm text-grey/40'>
                    Page <span className='font-bold text-grey'>{pageIndex + 1}</span> of <span className='font-bold text-grey'>{totalPages}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className='p-2 rounded-xl border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all'
                    >
                        <Icon icon='ion:chevron-back-outline' className='text-xl text-grey' />
                    </button>

                    <div className='flex items-center gap-1'>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => table.setPageIndex(i)}
                                className={`w-10 h-10 rounded-xl font-bold transition-all ${pageIndex === i
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-grey hover:bg-grey/5 border border-transparent hover:border-grey/10'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className='p-2 rounded-xl border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all'
                    >
                        <Icon icon='ion:chevron-forward-outline' className='text-xl text-grey' />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto'>
                    <div className='bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8'>
                        <div className='flex items-center justify-between mb-6'>
                            <h4 className='text-xl font-bold text-grey'>
                                {editingItem ? 'Edit Item' : 'New Dish'}
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
                                        <label className='block text-sm font-medium text-grey mb-2'>Item Name</label>
                                        <input
                                            type='text' required value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className='block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                            placeholder='e.g. Classic Burger'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Category</label>
                                        <select
                                            required value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className='block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        >
                                            <option value=''>Select Category</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Price ($)</label>
                                        <input
                                            type='number' step='0.01' required value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className='block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                            placeholder='15.99'
                                        />
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Dish Image</label>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(path) => setFormData({ ...formData, image: path })}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-grey mb-2'>Description</label>
                                        <textarea
                                            rows={5} value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className='block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none'
                                            placeholder='Tell something about this dish...'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-4'>
                                    <label className='block text-sm font-medium text-grey'>Extra Options / Variants</label>
                                    <button type='button' onClick={addOption} className='text-xs text-primary font-bold flex items-center gap-1 hover:underline'>
                                        <Icon icon='ion:add-outline' /> Add Option
                                    </button>
                                </div>
                                <div className='space-y-3'>
                                    {formData.options.map((opt, index) => (
                                        <div key={index} className='flex items-center gap-2'>
                                            <input
                                                placeholder='Name (e.g. Extra Cheese)'
                                                value={opt.name}
                                                onChange={(e) => updateOption(index, 'name', e.target.value)}
                                                className='flex-1 px-3 py-2 border border-grey/10 rounded-lg text-sm bg-grey/5'
                                            />
                                            <input
                                                type='number' step='0.01' placeholder='Price'
                                                value={opt.price}
                                                onChange={(e) => updateOption(index, 'price', e.target.value)}
                                                className='w-24 px-3 py-2 border border-grey/10 rounded-lg text-sm bg-grey/5'
                                            />
                                            <button onClick={() => removeOption(index)} type='button' className='text-red-400 hover:text-red-600 p-2'>
                                                <Icon icon='ion:close-circle-outline' className='text-xl' />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.options.length === 0 && <p className='text-xs text-grey/20 italic'>No options added yet.</p>}
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 pt-4'>
                                <button
                                    type='submit'
                                    disabled={mutation.isPending}
                                    className='w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all'
                                >
                                    {mutation.isPending ? 'Saving Dish...' : 'Save Food Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
