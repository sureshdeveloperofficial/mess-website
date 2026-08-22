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


type FoodItem = {
    id: string
    name: string
    description?: string
    price: number
    monthlyPrice?: number
    image?: string
    categoryId: string
    category: { name: string }
}

const columnHelper = createColumnHelper<FoodItem>()

export default function FoodItemsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        monthlyPrice: '',
        image: '',
        categoryId: '',
    })

    // Pagination State
    const [{ pageIndex, pageSize }, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    })

    const [selectedCategory, setSelectedCategory] = useState('')

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
        queryKey: ['food-items', pageIndex, pageSize, selectedCategory],
        queryFn: async () => {
            const response = await axios.get(`/api/food-items?page=${pageIndex + 1}&limit=${pageSize}&categoryId=${selectedCategory}`)
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
            monthlyPrice: '',
            image: '',
            categoryId: '',
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
            })
        }
        setIsModalOpen(true)
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
                    <div className='font-bold text-grey-dark text-sm capitalize tracking-tight'>{info.getValue()}</div>
                    <div className='text-xs font-medium text-grey-muted mt-0.5'>{info.row.original.category.name}</div>
                </div>
            ),
        }),
        columnHelper.accessor('price', {
            header: 'Daily Price',
            cell: (info) => (
                <span className='font-bold text-grey-dark text-sm'>
                    AED {info.getValue().toFixed(2)}
                </span>
            ),
        }),
        columnHelper.accessor('monthlyPrice', {
            header: 'Monthly Price',
            cell: (info) => {
                const value = info.getValue()
                const dailyPrice = info.row.original.price
                const displayPrice = value || (dailyPrice * 25)
                return (
                    <span className='font-bold text-green-600 text-sm'>
                        AED {displayPrice.toFixed(2)}
                    </span>
                )
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className='flex items-center gap-1'>
                    <button
                        onClick={() => openModal(info.row.original)}
                        className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                        title='Edit Item'
                    >
                        <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this item?')) {
                                deleteMutation.mutate(info.row.original.id)
                            }
                        }}
                        className='p-2 text-grey-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all'
                        title='Delete Item'
                    >
                        <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
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
        <div className='space-y-8'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Menu Items</h1>
                    <p className='admin-page-subtitle'>Manage your signature dishes and pricing</p>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-grey/10 shadow-sm hover:border-primary/40 transition-all'>
                        <div className='flex items-center gap-2 pr-3 border-r border-grey/10'>
                            <Icon icon='solar:filter-bold-duotone' className='text-lg text-primary' />
                            <span className='text-[10px] font-bold text-grey-muted uppercase tracking-widest'>Filter</span>
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value)
                                table.setPageIndex(0)
                            }}
                            className='bg-transparent text-xs font-bold text-grey-dark focus:outline-none min-w-[140px] cursor-pointer'
                        >
                            <option value=''>All Food Categories</option>
                            {categories.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className='admin-btn-primary'
                    >
                        <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                        <span>Add Item</span>
                    </button>
                </div>
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
                            ) : foodItems.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-12 text-center text-grey-muted text-sm font-medium'>
                                        No food items found.
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

            {/* Pagination Controls */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2'>
                <div className='text-xs font-semibold text-grey-muted'>
                    Page <span className='font-bold text-grey-dark'>{pageIndex + 1}</span> of <span className='font-bold text-grey-dark'>{totalPages || 1}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className='p-2 rounded-xl border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all'
                    >
                        <Icon icon='solar:alt-arrow-left-bold' className='text-lg text-grey-dark' />
                    </button>

                    <div className='flex items-center gap-1'>
                        {[...Array(totalPages || 1)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => table.setPageIndex(i)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${pageIndex === i
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-grey-dark hover:bg-grey/5 border border-transparent hover:border-grey/10'
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
                        <Icon icon='solar:alt-arrow-right-bold' className='text-lg text-grey-dark' />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto'>
                    <div className='bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 border border-grey/10 space-y-6'>
                        <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                            <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                                <Icon icon='solar:hamburger-menu-bold-duotone' className='text-primary text-2xl' />
                                {editingItem ? 'Edit Food Item' : 'New Dish'}
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
                                        <label className='admin-label'>Dish Name *</label>
                                        <input
                                            type='text' required value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className='admin-input'
                                            placeholder='e.g. Chicken Biryani'
                                        />
                                    </div>
                                    <div>
                                        <label className='admin-label'>Food Category *</label>
                                        <select
                                            required value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className='admin-input'
                                        >
                                            <option value=''>Select Food Category</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='admin-label'>Daily Price (AED) *</label>
                                            <input
                                                type='number' step='0.01' required value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className='admin-input'
                                                placeholder='15.00'
                                            />
                                        </div>
                                        <div>
                                            <label className='admin-label'>Monthly Price (AED)</label>
                                            <input
                                                type='number' step='0.01' value={formData.monthlyPrice}
                                                onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                                className='admin-input'
                                                placeholder='350.00'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div>
                                        <label className='admin-label'>Dish Image</label>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(path) => setFormData({ ...formData, image: path })}
                                        />
                                    </div>
                                    <div>
                                        <label className='admin-label'>Description</label>
                                        <textarea
                                            rows={4} value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className='admin-input resize-none'
                                            placeholder='Describe ingredients and special taste...'
                                        />
                                    </div>
                                </div>
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
                                            <span>Saving Dish...</span>
                                        </>
                                    ) : (
                                        <span>Save Food Item</span>
                                    )}
                                </button>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='w-full py-3 bg-grey/5 text-grey-dark rounded-xl text-sm font-bold hover:bg-grey/10 transition-all'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
