'use client'

import React from 'react'
import { Icon } from '@iconify/react'
import { Order } from '@/app/types/order'

export const FUTURISTIC_COLORS = {
    BG_DARK: '#0F1115',
    ACCENT: '#FACB15', // Electric Yellow
    SURFACE: '#1A1D23',
    TEXT_MAIN: '#FFFFFF',
    TEXT_DIM: '#8A8F98',
    BORDER: '#2D3139',
    GLOW: 'rgba(250, 203, 21, 0.1)',
    GLASS: 'rgba(255, 255, 255, 0.02)'
}

interface FuturisticInvoiceTemplateProps {
    order: Order
    invoiceRef?: React.RefObject<HTMLDivElement | null>
}

export const FuturisticInvoiceTemplate: React.FC<FuturisticInvoiceTemplateProps> = ({ order, invoiceRef }) => {
    const subtotal = order.totalAmount
    const tax = 0
    const total = subtotal + tax

    return (
        <div 
            ref={invoiceRef} 
            className="relative overflow-hidden font-sans selection:bg-amber-500/20"
            style={{ 
                width: '100%',
                minHeight: '297mm',
                backgroundColor: FUTURISTIC_COLORS.BG_DARK,
                color: FUTURISTIC_COLORS.TEXT_MAIN,
                padding: '0'
            }}
        >
            {/* Background Texture/Geometric Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(250,203,21,0.05)_0%,transparent_70%)] -mr-[200px] -mt-[200px]" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[linear-gradient(90deg,transparent,rgba(250,203,21,0.3),transparent)]" />

            <div className="relative z-10 p-16">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-24">
                    <div className="space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,203,21,0.3)]">
                                <Icon icon="solar:chef-hat-heart-bold" className="text-3xl text-black" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic">Al Shamil</h1>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/80">Premium Kitchen OS</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xs">
                            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-xl shadow-2xl">
                                <Icon icon="solar:map-point-wave-bold-duotone" className="text-xl text-amber-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Base Operations</p>
                                    <p className="text-[11px] font-medium leading-relaxed text-white/70">International City, Phase 1, Dubai, UAE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-block p-10 rounded-[40px] bg-white/2 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 blur-3xl" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 mb-6">Digital Ledger Record</p>
                            <h2 className="text-5xl font-black tracking-tighter mb-4 italic">
                                <span className="text-white/20">#</span>
                                {order.id.slice(-8).toUpperCase()}
                            </h2>
                            <div className="space-y-1 opacity-60">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Timestamp</p>
                                <p className="text-xs font-bold uppercase">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Configuration */}
                <div className="grid grid-cols-2 gap-20 mb-24">
                    <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-amber-400/20 rounded-full" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                            <Icon icon="solar:user-circle-bold" className="text-lg" />
                            Entity Recipient
                        </h3>
                        <div className="space-y-4">
                            <p className="text-2xl font-black tracking-tight">{order.customer?.name}</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/10">
                                <Icon icon="solar:letter-bold" className="text-amber-400 text-xs" />
                                <span className="text-[11px] font-bold text-white/50">{order.customer?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-3">
                            <Icon icon="solar:delivery-bold" className="text-lg" />
                            Logistics Node
                        </h3>
                        <div className="space-y-4">
                            <p className="text-lg font-black tracking-tight uppercase">
                                {order.buildingName ? `${order.buildingName} • ` : ''}Unit {order.flatRoomNumber || 'X'}
                            </p>
                            <p className="text-[11px] font-medium leading-relaxed text-white/40 max-w-xs">{order.address}</p>
                        </div>
                    </div>
                </div>

                {/* Ledger Items */}
                <div className="mb-24 relative">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Transaction Detail</th>
                                <th className="py-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20 w-40">Duration</th>
                                <th className="py-8 text-right text-[10px] font-black uppercase tracking-[0.4em] text-white/20 w-48">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            <tr>
                                <td className="py-12">
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-black tracking-tight text-white/90">PRIME CULINARY SUBSCRIPTION</h4>
                                        <div className="flex gap-3">
                                            {['AI-OPTIMIZED', 'SECURE HUB', 'DAILY SYNC'].map(tag => (
                                                <span key={tag} className="text-[8px] font-black px-3 py-1.5 rounded-full bg-amber-400/5 text-amber-400 border border-amber-400/20 uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-12 text-center">
                                    <span className="text-[11px] font-black bg-white/2 border border-white/5 px-8 py-4 rounded-2xl tracking-widest text-primary/80">
                                        {order.activeDates.length} CYCLES
                                    </span>
                                </td>
                                <td className="py-12 text-right">
                                    <span className="text-2xl font-black tracking-tighter text-amber-400">AED {order.totalAmount.toFixed(2)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary Configuration */}
                <div className="flex justify-between items-end">
                    <div className="max-w-sm space-y-8">
                        <div className="p-8 rounded-[32px] bg-white/2 border border-white/5 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-6 py-2 font-black text-[9px] uppercase tracking-[0.3em] rounded-bl-2xl ${
                                order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                                {order.paymentStatus === 'PAID' ? 'AUTHENTICATED' : 'ACTION REQUIRED'}
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">System Key</p>
                                    <p className="font-mono text-[10px] text-white/40 break-all leading-relaxed uppercase">{order.id}</p>
                                </div>
                                <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-black/40 border border-white/3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Icon icon="solar:shield-check-bold" className="text-amber-400/40 text-xl" />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 leading-relaxed">
                                        This document is cryptographically verified by Al Shamil Systems
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[400px] space-y-4">
                        <div className="flex justify-between items-center px-8 py-4 bg-white/2 rounded-2xl border border-white/3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Base Value</span>
                            <span className="text-sm font-bold text-white/60">AED {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center px-8 py-4 bg-white/2 rounded-2xl border border-white/3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Processing (0%)</span>
                            <span className="text-sm font-bold text-white/60">AED {tax.toFixed(2)}</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-amber-400/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative flex justify-between items-center p-10 bg-amber-400 rounded-[32px] shadow-[0_20px_60px_rgba(250,203,21,0.2)]">
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40">Total Settlement</p>
                                <span className="text-4xl font-black italic tracking-tighter text-black">AED {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Digital Footer */}
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col items-center gap-8">
                    <div className="flex gap-16 text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
                        <span>ALSHAMILMESS.COM</span>
                        <span>TERMINAL: +971 4 264 2613</span>
                        <span>EST. 2024</span>
                    </div>
                    <div className="px-8 py-3 rounded-full border border-white/5 bg-white/1">
                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20">Verified Electronic Generation Record • No Signature Required</p>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; background-color: #0F1115; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            `}} />
        </div>
    )
}
