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

import { PremiumInvoiceTemplate } from '@/app/components/Order/PremiumInvoiceTemplate'
import { Order } from '@/app/types/order'

const COLORS = {
    PRIMARY: '#1a1a2e',
    GREY: '#374151',
    RED_500: '#ef4444',
    SLATE_100: '#f1f5f9',
    SLATE_400: '#94a3b8',
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

            // Sanitize colors before html2canvas
            const sanitizeColors = (element: HTMLElement) => {
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
                let node = walker.currentNode as HTMLElement;
                while (node) {
                    if (node.style) {
                        const bg = window.getComputedStyle(node).backgroundColor;
                        const color = window.getComputedStyle(node).color;
                        const border = window.getComputedStyle(node).borderColor;
                        
                        if (bg.includes('lab(') || bg.includes('oklch(')) node.style.backgroundColor = 'white';
                        if (color.includes('lab(') || color.includes('oklch(')) node.style.color = 'black';
                        if (border.includes('lab(') || border.includes('oklch(')) node.style.borderColor = 'transparent';
                    }
                    node = walker.nextNode() as HTMLElement;
                }
            };

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF',
                windowWidth: invoiceRef.current.offsetWidth,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.body.querySelector('[ref]') || clonedDoc.body.firstChild;
                    if (el instanceof HTMLElement) sanitizeColors(el);
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
            pdf.save(fileName)
            toast.success('Invoice generated successfully', { id: toastId })

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

            <div className="max-w-[850px] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border" style={{ borderColor: COLORS.SLATE_100 }}>
                <PremiumInvoiceTemplate order={order} invoiceRef={invoiceRef} />
            </div>

            {/* Premium Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    nav, footer, .no-print { display: none !important; }
                }
                
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f8fafc; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    )
}
