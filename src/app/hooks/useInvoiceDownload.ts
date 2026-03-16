'use client'

import { useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'react-hot-toast'
import { COLORS } from '@/app/components/Order/InvoiceTemplate'
import { Order } from '@/app/types/order'

export const useInvoiceDownload = () => {
    const [isGenerating, setIsGenerating] = useState(false)

    const downloadInvoice = async (orderId: string, orderData?: Order) => {
        if (isGenerating) return
        
        const toastId = toast.loading('Architecting your futuristic premium invoice...')
        setIsGenerating(true)

        try {
            const response = await axios.get(`/api/invoice/${orderId}`, {
                responseType: 'blob'
            })

            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Invoice_${orderId.slice(-8).toUpperCase()}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            // Cleanup
            window.URL.revokeObjectURL(url)
            link.remove()
            
            toast.success('Ultimate Invoice Synced Successfully', { id: toastId })
        } catch (error) {
            console.error('Invoice Download Error:', error)
            toast.error('Neural architectural failure during generation', { id: toastId })
        } finally {
            setIsGenerating(false)
        }
    }

    return { downloadInvoice, isGenerating }
}
