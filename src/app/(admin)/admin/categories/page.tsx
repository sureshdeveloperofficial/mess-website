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

type Category = {
    id: string
    name: string
    _count: { foodItems: number }
    createdAt: string
}

const columnHelper = createColumnHelper<Category>()

export default function CategoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categoryName, setCategoryName] = useState('')
    const queryClient = useQueryClient()

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get('/api/categories')
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: { name: string; id?: string }) => {
            if (data.id) {
                return axios.put(`/api/categories/${data.id}`, { name: data.name })
            }
            return axios.post('/api/categories', { name: data.name })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success(editingCategory ? 'Food category updated successfully' : 'Food category created successfully')
            closeModal()
        },
        onError: () => {
            toast.error('Something went wrong')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`/api/categories/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success('Food category deleted successfully')
        },
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
        setCategoryName('')
    }

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setCategoryName(category.name)
        }
        setIsModalOpen(true)
    }

    const columns = [
        columnHelper.accessor('name', {
            header: 'Food Category Name',
            cell: (info) => (
                <span className='font-bold text-grey-dark text-sm tracking-tight'>{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor('_count.foodItems', {
            header: 'Items Count',
            cell: (info) => (
                <span className='admin-badge'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                    {info.getValue()} items
                </span>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            cell: (info) => (
                <span className='text-xs font-semibold text-grey-muted'>
                    {new Date(info.getValue()).toLocaleDateString('en-GB')}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className='flex items-center gap-1'>
                    <button
                        onClick={() => openModal(info.row.original)}
                        title='Edit Food Category'
                        className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all'
                    >
                        <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this food category?')) {
                                deleteMutation.mutate(info.row.original.id)
                            }
                        }}
                        title='Delete Food Category'
                        className='p-2 text-grey-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all'
                    >
                        <Icon icon='solar:trash-bin-trash-bold-duotone' className='text-lg' />
                    </button>
                </div>
            ),
        }),
    ]

    const table = useReactTable({
        data: categories,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='space-y-8'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Food Categories</h1>
                    <p className='admin-page-subtitle'>Manage your restaurant food categories and menu sections</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='admin-btn-primary'
                >
                    <Icon icon='solar:add-circle-bold-duotone' className='text-xl' />
                    <span>Add Food Category</span>
                </button>
            </div>

            {/* Table */}
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
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-12 text-center text-grey-muted text-sm font-medium'>
                                        No food categories found.
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

            {/* Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-grey/10'>
                        <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                            <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                                <Icon icon='solar:list-bold-duotone' className='text-primary text-2xl' />
                                {editingCategory ? 'Edit Food Category' : 'New Food Category'}
                            </h4>
                            <button onClick={closeModal} className='text-grey-muted hover:text-grey p-1.5 rounded-xl hover:bg-grey/5 transition-colors'>
                                <Icon icon='solar:close-circle-bold' className='text-2xl' />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                mutation.mutate({ name: categoryName, id: editingCategory?.id })
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
