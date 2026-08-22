'use client'

import React, { useState } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { AnimatePresence } from 'framer-motion'

export interface FilterOption {
    id: string
    label: string
    count?: number
}

interface DataTableProps<TData> {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    searchPlaceholder?: string
    filterOptions?: FilterOption[]
    activeFilter?: string
    onFilterChange?: (filterId: string) => void
    filterVariant?: 'tabs' | 'dropdown'
    filterLabel?: string
    headerActions?: React.ReactNode
    emptyMessage?: string
    emptySubtext?: string
    initialPageSize?: number
    viewToggle?: React.ReactNode
}

export function DataTable<TData>({
    data,
    columns,
    searchPlaceholder = 'Search records...',
    filterOptions,
    activeFilter,
    onFilterChange,
    filterVariant = 'tabs',
    filterLabel = 'Category',
    headerActions,
    emptyMessage = 'No records found',
    emptySubtext = 'Try adjusting your search query or filters',
    initialPageSize = 5,
    viewToggle,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [pageSize, setPageSize] = useState(initialPageSize)

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: initialPageSize,
            },
        },
    })

    // Update page size if changed
    React.useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    const rowCount = table.getFilteredRowModel().rows.length
    const pageIndex = table.getState().pagination.pageIndex
    const totalPages = table.getPageCount()
    const startRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1
    const endRow = Math.min((pageIndex + 1) * pageSize, rowCount)

    return (
        <div className='space-y-4'>
            {/* Table Controls Bar */}
            <div className='flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-grey/10 shadow-xs'>
                {/* Search & Filter Controls */}
                <div className='flex flex-wrap items-center gap-3 flex-1'>
                    {/* Search Input */}
                    <div className='relative min-w-[240px] flex-1 max-w-md'>
                        <Icon
                            icon='solar:magnifer-linear'
                            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-muted text-lg pointer-events-none'
                        />
                        <input
                            type='text'
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder={searchPlaceholder}
                            className='w-full pl-10 pr-9 py-2.5 bg-grey/5 hover:bg-grey/10 focus:bg-white border border-grey/10 rounded-2xl text-xs font-semibold text-grey-dark placeholder:text-grey-muted placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                        />
                        {globalFilter && (
                            <button
                                onClick={() => setGlobalFilter('')}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-grey-muted hover:text-grey-dark p-0.5 rounded-full cursor-pointer'
                                title='Clear search'
                            >
                                <Icon icon='solar:close-circle-bold' className='text-sm' />
                            </button>
                        )}
                    </div>

                    {/* Dropdown-based Filter Variant */}
                    {filterOptions && filterOptions.length > 0 && filterVariant === 'dropdown' && (
                        <div className='flex items-center gap-2 bg-grey/5 hover:bg-grey/10 border border-grey/10 rounded-2xl px-3.5 py-2 transition-all'>
                            <Icon icon='solar:filter-bold-duotone' className='text-primary text-base shrink-0' />
                            <select
                                value={activeFilter}
                                onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                                className='bg-transparent text-xs font-extrabold text-grey-dark focus:outline-none cursor-pointer pr-1'
                            >
                                {filterOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Tab-based Filter Variant */}
                    {filterOptions && filterOptions.length > 0 && filterVariant === 'tabs' && (
                        <div className='flex items-center gap-1.5 p-1 bg-grey/5 rounded-2xl border border-grey/10 overflow-x-auto'>
                            {filterOptions.map((opt) => {
                                const isActive = activeFilter === opt.id
                                return (
                                    <button
                                        key={opt.id}
                                        type='button'
                                        onClick={() => onFilterChange && onFilterChange(opt.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                            isActive
                                                ? 'bg-white text-grey-dark shadow-xs border border-grey/10'
                                                : 'text-grey-muted hover:text-grey-dark hover:bg-white/50'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {opt.count !== undefined && (
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                                                    isActive
                                                        ? 'bg-primary/20 text-grey-dark'
                                                        : 'bg-grey/10 text-grey-muted'
                                                }`}
                                            >
                                                {opt.count}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* View Toggle & Header Actions */}
                <div className='flex items-center gap-3 self-end md:self-auto'>
                    {viewToggle}
                    {headerActions}
                </div>
            </div>

            {/* Table Container */}
            <div className='admin-card p-0 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left border-collapse'>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className='border-b border-grey/10 bg-grey/5'>
                                    {headerGroup.headers.map((header) => {
                                        const isSortable = header.column.getCanSort()
                                        const sortDirection = header.column.getIsSorted()

                                        return (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className={`py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-grey-dark select-none ${
                                                    isSortable ? 'cursor-pointer hover:bg-grey/10 transition-colors' : ''
                                                }`}
                                            >
                                                <div className='flex items-center gap-1.5'>
                                                    <span>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                  header.column.columnDef.header,
                                                                  header.getContext()
                                                              )}
                                                    </span>
                                                    {isSortable && (
                                                        <span className='text-grey-muted text-sm'>
                                                            {sortDirection === 'asc' ? (
                                                                <Icon icon='solar:arrow-up-linear' className='text-primary font-bold' />
                                                            ) : sortDirection === 'desc' ? (
                                                                <Icon icon='solar:arrow-down-linear' className='text-primary font-bold' />
                                                            ) : (
                                                                <Icon icon='solar:sort-vertical-linear' className='opacity-40' />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className='divide-y divide-grey/10'>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className='py-16 text-center text-grey-muted bg-white'
                                    >
                                        <div className='flex flex-col items-center justify-center gap-2'>
                                            <div className='w-14 h-14 rounded-3xl bg-grey/5 flex items-center justify-center text-grey-muted text-2xl border border-grey/10'>
                                                <Icon icon='solar:magnifer-broken' />
                                            </div>
                                            <p className='text-sm font-bold text-grey-dark mt-2'>{emptyMessage}</p>
                                            <p className='text-xs text-grey-muted max-w-sm'>{emptySubtext}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className='hover:bg-primary/[0.03] transition-colors group'
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className='py-4 px-6 text-sm'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {rowCount > 0 && (
                    <div className='px-6 py-4 border-t border-grey/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-4'>
                        {/* Showing count and page size selector */}
                        <div className='flex items-center gap-3 text-xs text-grey-muted'>
                            <span>
                                Showing <strong className='text-grey-dark font-bold'>{startRow}</strong> to{' '}
                                <strong className='text-grey-dark font-bold'>{endRow}</strong> of{' '}
                                <strong className='text-grey-dark font-bold'>{rowCount}</strong> entries
                            </span>

                            <div className='flex items-center gap-1.5 ml-2 border-l border-grey/10 pl-3'>
                                <span className='text-[11px] uppercase font-bold text-grey-muted'>Rows:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className='px-2 py-1 bg-grey/5 border border-grey/10 rounded-lg text-xs font-bold text-grey-dark focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer'
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {/* Page navigation buttons */}
                        <div className='flex items-center gap-1.5'>
                            <button
                                type='button'
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className='p-2 rounded-xl text-grey-dark border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer'
                                title='First page'
                            >
                                <Icon icon='solar:double-alt-arrow-left-bold' className='text-xs' />
                            </button>

                            <button
                                type='button'
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className='px-3 py-1.5 rounded-xl text-xs font-bold text-grey-dark border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer'
                            >
                                <Icon icon='solar:alt-arrow-left-bold' className='text-xs' />
                                <span className='hidden sm:inline'>Prev</span>
                            </button>

                            <span className='px-3 py-1.5 text-xs font-bold text-grey-dark bg-grey/5 rounded-xl border border-grey/10'>
                                Page {pageIndex + 1} of {Math.max(1, totalPages)}
                            </span>

                            <button
                                type='button'
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className='px-3 py-1.5 rounded-xl text-xs font-bold text-grey-dark border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer'
                            >
                                <span className='hidden sm:inline'>Next</span>
                                <Icon icon='solar:alt-arrow-right-bold' className='text-xs' />
                            </button>

                            <button
                                type='button'
                                onClick={() => table.setPageIndex(totalPages - 1)}
                                disabled={!table.getCanNextPage()}
                                className='p-2 rounded-xl text-grey-dark border border-grey/10 hover:bg-grey/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer'
                                title='Last page'
                            >
                                <Icon icon='solar:double-alt-arrow-right-bold' className='text-xs' />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
