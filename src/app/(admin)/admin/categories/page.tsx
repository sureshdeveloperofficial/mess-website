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
            toast.success(editingCategory ? 'Category updated' : 'Category created')
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
            toast.success('Category deleted')
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
            header: 'Category Name',
            cell: (info) => (
                <span className='font-semibold text-grey'>{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor('_count.foodItems', {
            header: 'Items Count',
            cell: (info) => (
                <span className='px-3 py-1 bg-grey/5 rounded-full text-xs font-medium text-grey/60'>
                    {info.getValue()} items
                </span>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            cell: (info) => (
                <span className='text-sm text-grey/40'>
                    {new Date(info.getValue()).toLocaleDateString()}
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
                            if (confirm('Are you sure you want to delete this category?')) {
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
        data: categories,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Menu Categories</h3>
                    <p className='text-grey/40 text-sm'>Manage your food menu sections</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className='px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2'
                >
                    <Icon icon='ion:add-circle-outline' className='text-xl' />
                    Add Category
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
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-10 text-center text-grey/40'>
                                        No categories found.
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

            {/* Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl'>
                        <div className='flex items-center justify-between mb-6'>
                            <h4 className='text-xl font-bold text-grey'>
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h4>
                            <button onClick={closeModal} className='text-grey/40 hover:text-grey p-1'>
                                <Icon icon='ion:close-outline' className='text-2xl' />
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
                                <label className='block text-sm font-medium text-grey mb-2'>Category Name</label>
                                <input
                                    type='text'
                                    required
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className='block w-full px-4 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                    placeholder='e.g. Main Course'
                                />
                            </div>

                            <div className='flex flex-col gap-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={mutation.isPending}
                                    className='w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all'
                                >
                                    {mutation.isPending ? 'Saving...' : 'Save Category'}
                                </button>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='w-full py-3 bg-grey/5 text-grey rounded-xl font-semibold hover:bg-grey/10 transition-all'
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
