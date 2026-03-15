'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { useParams, useSearchParams } from 'next/navigation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'react-hot-toast'

type FoodItem = {
    id: string
    name: string
    category: string
}

type FoodMenu = {
    id: string
    name: string
    foodItems: FoodItem[]
}

type Order = {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    activeDates: string[]
    selectedMenus: FoodMenu[]
    address: string
    buildingName: string | null
    flatRoomNumber: string | null
    customer: {
        name: string
        email: string
    }
}

// Enterprise-standard HEX Color Palette (Legacy Safe)
const COLORS = {
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

export default function InvoicePage() {
    const { data: session } = useSession()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const shouldDownload = searchParams.get('print') === 'true'
    const invoiceRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const { data: order, isLoading } = useQuery<Order>({
        queryKey: ['user-order-invoice', id],
        queryFn: async () => {
            const response = await axios.get(`/api/user/orders/${id}`)
            return response.data
        },
        enabled: !!session && !!id
    })

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current || !order) return
        
        setIsGenerating(true)
        const toastId = toast.loading('Architecting your premium invoice...')

        try {
            await new Promise(resolve => setTimeout(resolve, 800))

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: COLORS.WHITE,
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    // CRITICAL: Clean up modern Tailwind 4 colors (lab/oklch) that break html2canvas
                    const elements = clonedDoc.getElementsByTagName('*')
                    for (let i = 0; i < elements.length; i++) {
                        const el = elements[i] as HTMLElement
                        const style = window.getComputedStyle(el)
                        
                        // Sanitize background colors
                        if (style.backgroundColor.includes('lab') || style.backgroundColor.includes('oklch')) {
                            el.style.backgroundColor = COLORS.WHITE // Fallback
                        }
                        // Sanitize border colors
                        if (style.borderColor.includes('lab') || style.borderColor.includes('oklch')) {
                            el.style.borderColor = COLORS.SLATE_100
                        }
                        // Sanitize text colors
                        if (style.color.includes('lab') || style.color.includes('oklch')) {
                            el.style.color = COLORS.GREY
                        }
                    }
                }
            })

            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
            
            const fileName = `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`
            const blob = pdf.output('blob')
            const url = URL.createObjectURL(blob)
            
            const newWindow = window.open(url, '_blank')
            if (!newWindow) {
                pdf.save(fileName)
                toast.success('PDF downloaded (Pop-up was blocked)', { id: toastId })
            } else {
                toast.success('Invoice generated successfully', { id: toastId })
            }

        } catch (error) {
            console.error('PDF Generation Error:', error)
            toast.error('Architectural failure during PDF generation', { id: toastId })
        } finally {
            setIsGenerating(false)
        }
    }

    useEffect(() => {
        if (order && shouldDownload) {
            const timer = setTimeout(() => {
                handleDownloadPDF()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [order, shouldDownload])

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4" style={{ borderColor: `${COLORS.PRIMARY}40`, borderTopColor: COLORS.PRIMARY }} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-grey/40">Fetching Secure Data...</p>
        </div>
    )

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="text-center p-12 border-2 border-dashed rounded-4xl" style={{ borderColor: '#FEE2E2', backgroundColor: '#FEF2F240' }}>
                <Icon icon="solar:shield-warning-bold" className="text-6xl mx-auto mb-4" style={{ color: COLORS.RED_500 }} />
                <h2 className="text-xl font-black uppercase italic" style={{ color: COLORS.RED_500 }}>Access Denied</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: '#F8717199' }}>Invoice reference not found or unauthorized.</p>
            </div>
        </div>
    )

    const subtotal = order.totalAmount
    const tax = 0
    const total = subtotal + tax

    return (
        <div className="min-h-screen p-6 sm:p-12 font-sans selection:bg-primary/10" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Control Panel (Non-print) */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 no-print bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: COLORS.PRIMARY }}>
                        <Icon icon="solar:document-text-bold-duotone" className="text-white text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-grey uppercase tracking-tight">Invoice System v2.0</h2>
                        <p className="text-[9px] font-bold text-grey/40 uppercase tracking-widest">Enterprise Generation Mode</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className="group relative flex items-center gap-3 px-8 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        style={{ backgroundColor: COLORS.GREY }}
                    >
                        {isGenerating ? (
                            <Icon icon="solar:refresh-bold" className="text-lg animate-spin" />
                        ) : (
                            <Icon icon="solar:download-square-bold" className="text-lg" />
                        )}
                        {isGenerating ? 'Architecting...' : 'Generate Premium PDF'}
                    </button>
                    <button 
                        onClick={() => window.close()}
                        className="p-4 rounded-2xl transition-all active:scale-90"
                        style={{ backgroundColor: COLORS.SLATE_100, color: COLORS.SLATE_400 }}
                    >
                        <Icon icon="solar:close-circle-bold" className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Premium Invoice Container (Using Legacy HEX for HTML2Canvas Stability) */}
            <div ref={invoiceRef} className="max-w-[850px] mx-auto bg-white shadow-2xl rounded-4xl overflow-hidden border relative" style={{ borderColor: COLORS.SLATE_100 }}>
                
                {/* Visual Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 z-0" style={{ backgroundColor: COLORS.SLATE_50 }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full -ml-32 -mb-32 z-0" style={{ backgroundColor: `${COLORS.PRIMARY}0D` }} />

                <div className="relative z-10 p-12 md:p-20">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: COLORS.GREY }}>
                                    <Icon icon="solar:chef-hat-heart-bold-duotone" className="text-4xl" style={{ color: COLORS.PRIMARY }} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter italic" style={{ color: COLORS.GREY }}>AL SHAMIL</h1>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] -mt-1" style={{ color: COLORS.PRIMARY }}>Culinary Services</p>
                                </div>
                            </div>
                            <div className="space-y-1 text-[11px] font-bold uppercase tracking-widest max-w-xs leading-relaxed" style={{ color: COLORS.SLATE_400 }}>
                                <p className="flex items-start gap-2">
                                    <Icon icon="solar:map-point-bold" className="mt-0.5 opacity-20" />
                                    International City, Phase 1, Dubai, UAE
                                </p>
                                <p className="flex items-center gap-2">
                                    <Icon icon="solar:phone-bold" className="opacity-20" />
                                    +971 4 264 2613
                                </p>
                                <p className="flex items-center gap-2">
                                    <Icon icon="solar:letter-bold" className="opacity-20" />
                                    contact@alshamilmess.com
                                </p>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <div className="px-8 py-10 rounded-4xl border min-w-[240px]" style={{ backgroundColor: COLORS.SLATE_50, borderColor: COLORS.SLATE_100 }}>
                                <h1 className="text-6xl font-black uppercase absolute -top-10 right-0 pointer-events-none italic opacity-5" style={{ color: COLORS.GREY }}>OFFICIAL</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: COLORS.PRIMARY }}>Invoice Record</p>
                                <p className="text-2xl font-black tracking-tight mb-2" style={{ color: COLORS.GREY }}>#{order.id.slice(-8).toUpperCase()}</p>
                                <div className="h-px w-12 ml-auto mb-4" style={{ backgroundColor: `${COLORS.GREY}1A` }} />
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30" style={{ color: COLORS.GREY }}>Issue Date</p>
                                    <p className="text-xs font-black uppercase tracking-tighter" style={{ color: COLORS.GREY }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.SLATE_50 }}>
                                    <Icon icon="solar:user-bold-duotone" className="text-lg opacity-40" />
                                </div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: COLORS.GREY }}>Client Recipient</h2>
                            </div>
                            <div className="pl-11 space-y-1">
                                <p className="text-xl font-black uppercase italic tracking-tight" style={{ color: COLORS.GREY }}>{session?.user?.name || 'Authorized Client'}</p>
                                <p className="text-sm font-bold opacity-40" style={{ color: COLORS.GREY }}>{session?.user?.email}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.SLATE_50 }}>
                                    <Icon icon="solar:delivery-bold-duotone" className="text-lg opacity-40" />
                                </div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: COLORS.GREY }}>Delivery Point</h2>
                            </div>
                            <div className="pl-11 text-xs font-bold leading-relaxed uppercase tracking-widest opacity-50" style={{ color: COLORS.GREY }}>
                                <p className="font-black mb-1" style={{ color: COLORS.GREY }}>{order.buildingName ? `${order.buildingName},` : ''} Unit {order.flatRoomNumber || 'N/A'}</p>
                                <p>{order.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mb-20">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2" style={{ borderColor: `${COLORS.GREY}0D` }}>
                                    <th className="py-6 text-left text-[10px] font-black uppercase tracking-[0.4em] px-4 opacity-30" style={{ color: COLORS.GREY }}>Core Service Description</th>
                                    <th className="py-6 text-center text-[10px] font-black uppercase tracking-[0.4em] w-32 px-4 opacity-30" style={{ color: COLORS.GREY }}>Tenure</th>
                                    <th className="py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] w-48 px-4 opacity-30" style={{ color: COLORS.GREY }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderBottomColor: `${COLORS.GREY}08` }}>
                                <tr>
                                    <td className="py-10 px-4">
                                        <p className="text-lg font-black uppercase italic tracking-tight mb-2" style={{ color: COLORS.GREY }}>Premium Daily Meal Integration</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest opacity-40" style={{ backgroundColor: COLORS.SLATE_50, borderColor: COLORS.SLATE_100, color: COLORS.GREY }}>Full Menu Access</span>
                                            <span className="text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest" style={{ backgroundColor: `${COLORS.PRIMARY}0D`, borderColor: `${COLORS.PRIMARY}1A`, color: COLORS.PRIMARY }}>Priority Delivery</span>
                                        </div>
                                    </td>
                                    <td className="py-10 px-4 text-center">
                                        <span className="text-base font-black uppercase italic tracking-widest shadow-sm px-4 py-2 rounded-2xl border" style={{ backgroundColor: COLORS.SLATE_50, borderColor: COLORS.SLATE_100, color: COLORS.GREY }}>
                                            {order.activeDates.length} Days
                                        </span>
                                    </td>
                                    <td className="py-10 px-4 text-right">
                                        <span className="text-xl font-black uppercase italic tracking-tighter" style={{ color: COLORS.GREY }}>AED {order.totalAmount.toFixed(2)}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="flex flex-col justify-end">
                            <div className="p-8 rounded-4xl border relative overflow-hidden group" style={{ backgroundColor: COLORS.SLATE_50, borderColor: COLORS.SLATE_100 }}>
                                <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black text-[9px] uppercase tracking-[0.3em] shadow-lg" style={{ 
                                    backgroundColor: order.paymentStatus === 'PAID' ? COLORS.GREEN_500 : COLORS.ORANGE_500,
                                    color: COLORS.WHITE
                                }}>
                                    {order.paymentStatus === 'PAID' ? 'Verified Receipt' : 'Awaiting Settlement'}
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-30" style={{ color: COLORS.GREY }}>Security & Validation</h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 border-2 rounded-2xl flex items-center justify-center bg-white shadow-sm" style={{ borderColor: `${COLORS.GREY}0D`, boxShadow: `0 0 0 8px ${COLORS.SLATE_50}80` }}>
                                        <Icon icon="solar:qr-code-bold-duotone" className="text-4xl opacity-10" style={{ color: COLORS.GREY }} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.GREY }}>Unique Digital ID</p>
                                        <p className="text-[10px] font-mono break-all leading-tight opacity-30" style={{ color: COLORS.GREY }}>{order.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-4 border-b" style={{ borderColor: `${COLORS.GREY}0D` }}>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20" style={{ color: COLORS.GREY }}>Service Subtotal</span>
                                <span className="text-sm font-black uppercase italic" style={{ color: COLORS.GREY }}>AED {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b" style={{ borderColor: `${COLORS.GREY}0D` }}>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20" style={{ color: COLORS.GREY }}>Govt VAT (0%)</span>
                                <span className="text-sm font-black uppercase italic" style={{ color: COLORS.GREY }}>AED {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-8 px-8 rounded-4xl shadow-2xl overflow-hidden relative group" style={{ backgroundColor: COLORS.GREY }}>
                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-1 opacity-30" style={{ color: COLORS.WHITE }}>Total Authorized Amount</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest italic opacity-10" style={{ color: COLORS.WHITE }}>Includes all charges and processing</p>
                                </div>
                                <span className="text-4xl font-black italic tracking-tighter relative" style={{ color: COLORS.PRIMARY }}>AED {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t flex flex-col items-center" style={{ borderColor: `${COLORS.GREY}0D` }}>
                        <Icon icon="solar:shield-check-bold-duotone" className="text-6xl mb-4 opacity-5" style={{ color: COLORS.GREY }} />
                        <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-8 text-center opacity-20" style={{ color: COLORS.GREY }}>Electronically Authenticated Document</p>
                        <div className="flex justify-center flex-wrap gap-x-12 gap-y-4 text-[9px] font-black uppercase tracking-widest opacity-30" style={{ color: COLORS.GREY }}>
                            <span>alshamilmess.com</span>
                            <span>+971 4 264 2613</span>
                            <span>Verified via Blockchain Layer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    nav, footer, .no-print { display: none !important; }
                }
                
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f8fafc; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    )
}
