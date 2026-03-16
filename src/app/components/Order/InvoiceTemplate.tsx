'use client'

import React from 'react'
import { Icon } from '@iconify/react'
import { Order } from '@/app/types/order'

// Enterprise-standard HEX Color Palette (Legacy Safe)
export const COLORS = {
    PRIMARY: '#FACB15',
    GREY: '#363636',
    SLATE_50: '#F8FAFC',
    SLATE_100: '#F1F5F9',
    SLATE_200: '#E2E8F0',
    SLATE_400: '#94A3B8',
    SLATE_500: '#64748B',
    RED_500: '#EF4444',
    GREEN_500: '#22C55E',
    ORANGE_500: '#F97316',
    WHITE: '#FFFFFF'
}

interface InvoiceTemplateProps {
    order: Order
    invoiceRef: React.RefObject<HTMLDivElement | null>
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, invoiceRef }) => {
    const subtotal = order.totalAmount
    const tax = 0
    const total = subtotal + tax

    return (
        <div 
            ref={invoiceRef} 
            className="bg-white overflow-hidden relative" 
            style={{ 
                width: '210mm', 
                minHeight: '297mm',
                padding: '20mm',
                fontFamily: 'Poppins, sans-serif'
            }}
        >
            {/* Subtle Branding Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 z-0 opacity-10" style={{ backgroundColor: COLORS.PRIMARY }} />

            <div className="relative z-10">
                {/* Header: Brand & Meta */}
                <div className="flex justify-between items-start mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: COLORS.GREY }}>
                                <Icon icon="solar:chef-hat-heart-bold-duotone" className="text-3xl" style={{ color: COLORS.PRIMARY }} />
                            </div>
                            <div className="space-y-0.5">
                                <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: COLORS.GREY }}>AL SHAMIL</h1>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: COLORS.PRIMARY }}>Culinary Services</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest leading-relaxed" style={{ color: COLORS.SLATE_500 }}>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:map-point-bold" className="text-xs opacity-30" />
                                <span>International City, Phase 1, Dubai, UAE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:phone-bold" className="text-xs opacity-30" />
                                <span>+971 4 264 2613</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:letter-bold" className="text-xs opacity-30" />
                                <span>contact@alshamilmess.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="px-8 py-8 rounded-3xl border bg-slate-50/50 min-w-[240px]" style={{ borderColor: COLORS.SLATE_100 }}>
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-4" style={{ color: COLORS.PRIMARY }}>Official Invoice</p>
                            <p className="text-3xl font-black tracking-tighter mb-2" style={{ color: COLORS.GREY }}>#{order.id.slice(-8).toUpperCase()}</p>
                            <div className="h-0.5 w-10 ml-auto mb-4" style={{ backgroundColor: `${COLORS.PRIMARY}40` }} />
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40" style={{ color: COLORS.GREY }}>Generated on</p>
                                <p className="text-[11px] font-black uppercase tracking-tight" style={{ color: COLORS.GREY }}>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parties Grid */}
                <div className="grid grid-cols-2 gap-16 mb-16">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: COLORS.SLATE_400 }}>
                            <Icon icon="solar:user-bold" />
                            Client Recipient
                        </h2>
                        <div className="pl-6 space-y-1">
                            <p className="text-lg font-black uppercase tracking-tight" style={{ color: COLORS.GREY }}>{order.customer?.name}</p>
                            <p className="text-xs font-bold opacity-50" style={{ color: COLORS.GREY }}>{order.customer?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: COLORS.SLATE_400 }}>
                            <Icon icon="solar:delivery-bold" />
                            Delivery Specs
                        </h2>
                        <div className="pl-6 space-y-1">
                            <p className="text-sm font-black uppercase" style={{ color: COLORS.GREY }}>
                                {order.buildingName ? `${order.buildingName}, ` : ''}Unit {order.flatRoomNumber || 'N/A'}
                            </p>
                            <p className="text-xs font-bold leading-relaxed opacity-50" style={{ color: COLORS.GREY }}>{order.address}</p>
                        </div>
                    </div>
                </div>

                {/* Service Table */}
                <div className="mb-16">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: COLORS.SLATE_100 }}>
                                <th className="py-4 text-[9px] font-black uppercase tracking-[0.4em] opacity-30" style={{ color: COLORS.GREY }}>Service Description</th>
                                <th className="py-4 text-center text-[9px] font-black uppercase tracking-[0.4em] w-32 opacity-30" style={{ color: COLORS.GREY }}>Duration</th>
                                <th className="py-4 text-right text-[9px] font-black uppercase tracking-[0.4em] w-48 opacity-30" style={{ color: COLORS.GREY }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: COLORS.SLATE_50 }}>
                            <tr>
                                <td className="py-8">
                                    <p className="text-base font-black uppercase tracking-tight mb-2" style={{ color: COLORS.GREY }}>Premium Daily Meal Integration</p>
                                    <div className="flex gap-2">
                                        <span className="text-[8px] font-black px-2.5 py-1 rounded bg-slate-50 text-slate-400 uppercase border border-slate-100">Full Selection</span>
                                        <span className="text-[8px] font-black px-2.5 py-1 rounded bg-amber-50 text-amber-600 uppercase border border-amber-100">Priority Hub</span>
                                    </div>
                                </td>
                                <td className="py-8 text-center">
                                    <span className="text-sm font-black uppercase px-4 py-2 rounded-xl bg-slate-50 border border-slate-100" style={{ color: COLORS.GREY }}>
                                        {order.activeDates.length} Days
                                    </span>
                                </td>
                                <td className="py-8 text-right">
                                    <span className="text-lg font-black tracking-tight" style={{ color: COLORS.GREY }}>AED {order.totalAmount.toFixed(2)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals & Security Section */}
                <div className="grid grid-cols-2 gap-12 items-end">
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl border bg-slate-50/50 relative overflow-hidden group" style={{ borderColor: COLORS.SLATE_100 }}>
                            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl font-black text-[8px] uppercase tracking-widest" style={{ 
                                backgroundColor: order.paymentStatus === 'PAID' ? COLORS.GREEN_500 : COLORS.ORANGE_500,
                                color: COLORS.WHITE
                            }}>
                                {order.paymentStatus === 'PAID' ? 'Authenticated' : 'Pending'}
                            </div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 opacity-30" style={{ color: COLORS.GREY }}>Security Identifier</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border rounded-2xl flex items-center justify-center bg-white shadow-sm" style={{ borderColor: COLORS.SLATE_100 }}>
                                    <Icon icon="solar:qr-code-bold-duotone" className="text-2xl opacity-10" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: COLORS.GREY }}>Unique Digital Hash</p>
                                    <p className="text-[9px] font-mono opacity-30 truncate max-w-[150px]" style={{ color: COLORS.GREY }}>{order.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50 text-[10px]">
                            <span className="font-black uppercase tracking-widest opacity-20" style={{ color: COLORS.GREY }}>Subtotal</span>
                            <span className="font-black" style={{ color: COLORS.GREY }}>AED {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50 text-[10px]">
                            <span className="font-black uppercase tracking-widest opacity-20" style={{ color: COLORS.GREY }}>Tax (0%)</span>
                            <span className="font-black" style={{ color: COLORS.GREY }}>AED {tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-6 px-8 rounded-3xl bg-slate-900 shadow-xl">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Total Charged</p>
                            <span className="text-2xl font-black italic tracking-tighter" style={{ color: COLORS.PRIMARY }}>AED {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Policy */}
                <div className="mt-20 pt-10 border-t flex flex-col items-center space-y-4" style={{ borderColor: COLORS.SLATE_100 }}>
                    <div className="flex justify-center gap-10 text-[9px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: COLORS.GREY }}>
                        <span>alshamilmess.com</span>
                        <span>+971 4 264 2613</span>
                        <span>Enterprise Culinary Log</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-center opacity-10" style={{ color: COLORS.GREY }}>Approved Electronic Generation Record</p>
                </div>
            </div>
        </div>
    )
}
