'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface BankSettingsState {
    bank_name: string
    account_name: string
    account_number: string
    swift_code: string
    iban_number: string
    whatsapp_instruction: string
}

export default function BankSettingsPage() {
    const queryClient = useQueryClient()
    const [justSaved, setJustSaved] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const [formData, setFormData] = useState<BankSettingsState>({
        bank_name: 'Emirates NBD',
        account_name: 'Al Shamil Mess Services LLC',
        account_number: '101234567890',
        swift_code: 'EBILAEADXXX',
        iban_number: 'AE12 0310 0000 1012 3456 7890',
        whatsapp_instruction: 'Please share a screenshot of the transfer confirmation receipt on WhatsApp (+971 50 123 4567) after payment to activate your meal subscription.',
    })

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await axios.get('/api/settings')
            return response.data
        },
    })

    useEffect(() => {
        if (settings) {
            setFormData({
                bank_name: settings.bank_name || 'Emirates NBD',
                account_name: settings.account_name || 'Al Shamil Mess Services LLC',
                account_number: settings.account_number || '101234567890',
                swift_code: settings.swift_code || 'EBILAEADXXX',
                iban_number: settings.iban_number || 'AE12 0310 0000 1012 3456 7890',
                whatsapp_instruction: settings.whatsapp_instruction || 'Please share a screenshot of the transfer confirmation receipt on WhatsApp (+971 50 123 4567) after payment to activate your meal subscription.',
            })
        }
    }, [settings])

    const saveMutation = useMutation({
        mutationFn: async (newSettings: BankSettingsState) => {
            const res = await axios.post('/api/settings', { settings: newSettings })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setJustSaved(true)
            toast.success('Bank details saved successfully!')
            setTimeout(() => setJustSaved(false), 4000)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to save bank settings')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        saveMutation.mutate(formData)
    }

    const copyToClipboard = (text: string, fieldName: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        toast.success(`Copied ${fieldName} to clipboard!`)
        setTimeout(() => setCopiedField(null), 2000)
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-16'>
            {/* Header */}
            <div>
                <h1 className='admin-page-title'>Bank Transfer &amp; Collection Settings</h1>
                <p className='admin-page-subtitle'>
                    Configure your corporate UAE bank account details. Customers choosing Bank Transfer at checkout will receive these details for wire payments.
                </p>
            </div>

            {/* Success Alert Banner */}
            {justSaved && (
                <div className='bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-xs'>
                    <Icon icon='solar:check-circle-bold' className='text-xl text-green-600' />
                    <span>Bank settings updated successfully! Live checkout vouchers and invoices are now synced.</span>
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
                {/* Form Inputs (7 Cols) */}
                <form onSubmit={handleSubmit} className='lg:col-span-7 bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                        <h2 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:card-2-bold-duotone' className='text-primary text-2xl' />
                            Account Credentials
                        </h2>
                        {isLoading && <span className='text-xs text-grey-muted animate-pulse'>Loading active configuration...</span>}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Bank Name */}
                        <div>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:buildings-bold-duotone' className='text-primary text-sm' />
                                <span>Bank Name *</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.bank_name}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                placeholder='e.g. Emirates NBD or Abu Dhabi Commercial Bank'
                                className='admin-input'
                            />
                        </div>

                        {/* Account Name */}
                        <div>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:user-bold-duotone' className='text-primary text-sm' />
                                <span>Beneficiary / Account Name *</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.account_name}
                                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                placeholder='e.g. Al Shamil Mess Services LLC'
                                className='admin-input'
                            />
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:hashtag-bold' className='text-primary text-sm' />
                                <span>Account Number *</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.account_number}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                placeholder='e.g. 101234567890'
                                className='admin-input'
                            />
                        </div>

                        {/* Swift Code */}
                        <div>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:global-bold-duotone' className='text-primary text-sm' />
                                <span>SWIFT / BIC Code *</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.swift_code}
                                onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                                placeholder='e.g. EBILAEADXXX'
                                className='admin-input uppercase'
                            />
                        </div>

                        {/* IBAN Number */}
                        <div className='md:col-span-2'>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:diploma-verified-bold-duotone' className='text-primary text-sm' />
                                <span>Full IBAN Number *</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.iban_number}
                                onChange={(e) => setFormData({ ...formData, iban_number: e.target.value })}
                                placeholder='e.g. AE12 0310 0000 1012 3456 7890'
                                className='admin-input font-mono'
                            />
                        </div>

                        {/* WhatsApp Instruction Text */}
                        <div className='md:col-span-2'>
                            <label className='admin-label flex items-center gap-1.5'>
                                <Icon icon='solar:chat-round-dots-bold-duotone' className='text-primary text-sm' />
                                <span>Payment Instructions &amp; Receipt Note</span>
                            </label>
                            <textarea
                                rows={3}
                                value={formData.whatsapp_instruction}
                                onChange={(e) => setFormData({ ...formData, whatsapp_instruction: e.target.value })}
                                placeholder='e.g. Please share a screenshot of the transfer confirmation on WhatsApp (+971 50 123 4567)...'
                                className='admin-input resize-none'
                            />
                            <p className='text-xs text-grey-muted mt-1.5'>
                                This guidance note is displayed to customers directly on the checkout screen after they select Bank Transfer.
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-end pt-4 border-t border-grey/10'>
                        <button
                            type='submit'
                            disabled={saveMutation.isPending}
                            className='admin-btn-primary'
                        >
                            {saveMutation.isPending ? (
                                <>
                                    <Icon icon='line-md:loading-loop' className='text-xl' />
                                    <span>Saving Bank Details...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon='solar:diskette-bold-duotone' className='text-xl' />
                                    <span>Save Bank Details</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Right Side: Luxury Bank Card & Voucher Live Preview (5 Cols) */}
                <div className='lg:col-span-5 space-y-6'>
                    {/* Header Label */}
                    <div className='flex items-center justify-between'>
                        <h3 className='text-xs font-bold uppercase tracking-wider text-grey/60 flex items-center gap-1.5'>
                            <Icon icon='solar:eye-bold-duotone' className='text-primary text-base' />
                            Customer Card &amp; Voucher Preview
                        </h3>
                        <span className='text-[10px] font-bold uppercase px-2.5 py-1 bg-green-500/10 text-green-700 rounded-full'>
                            Live Sync
                        </span>
                    </div>

                    {/* Luxury Metallic UAE Debit Card */}
                    <div className='w-full aspect-[1.58/1] rounded-3xl p-6 md:p-7 relative overflow-hidden bg-gradient-to-br from-[#1c1d22] via-[#2a2b34] to-[#121316] text-white shadow-2xl border border-white/10 flex flex-col justify-between group'>
                        {/* Shimmer Effect */}
                        <div className='absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000' />

                        {/* Card Top */}
                        <div className='flex items-center justify-between relative z-10'>
                            <div className='flex items-center gap-2'>
                                <Icon icon='solar:buildings-bold-duotone' className='text-2xl text-[#f3ba2f]' />
                                <span className='font-black text-sm uppercase tracking-wider text-white/90'>
                                    {formData.bank_name || 'Emirates NBD'}
                                </span>
                            </div>
                            <span className='text-[10px] font-mono tracking-widest text-[#f3ba2f] font-bold px-2 py-0.5 rounded-full border border-[#f3ba2f]/30 bg-[#f3ba2f]/10'>
                                CORPORATE
                            </span>
                        </div>

                        {/* EMV Chip & Contactless */}
                        <div className='flex items-center gap-3 my-auto relative z-10'>
                            <div className='w-11 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#f7e7a9] to-[#aa8010] border border-yellow-200/50 shadow-inner flex items-center justify-center'>
                                <div className='w-8 h-5 border border-yellow-800/30 rounded-sm' />
                            </div>
                            <Icon icon='solar:card-recive-bold' className='text-white/40 text-xl' />
                        </div>

                        {/* Card Bottom */}
                        <div className='space-y-3 relative z-10'>
                            <div>
                                <p className='text-[9px] uppercase tracking-widest text-white/40'>Account Number</p>
                                <p className='font-mono font-bold text-base md:text-lg tracking-wider text-white'>
                                    {formData.account_number ? formData.account_number.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• ••••'}
                                </p>
                            </div>
                            <div className='flex items-center justify-between pt-1 border-t border-white/10'>
                                <div>
                                    <p className='text-[8px] uppercase tracking-widest text-white/40'>Account Name</p>
                                    <p className='text-xs font-bold uppercase tracking-tight text-white/90 truncate max-w-[170px]'>
                                        {formData.account_name || 'Beneficiary Name'}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-[8px] uppercase tracking-widest text-white/40'>SWIFT / BIC</p>
                                    <p className='text-xs font-mono font-bold text-[#f3ba2f]'>
                                        {formData.swift_code || 'SWIFT'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formatted Payment Voucher Card */}
                    <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-4'>
                        <div className='flex items-center justify-between'>
                            <span className='text-xs font-bold text-grey uppercase tracking-wider'>IBAN Wire Transfer Voucher</span>
                            <span className='text-[10px] text-grey/40 font-medium'>UAE Central Bank Verified</span>
                        </div>

                        <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-2'>
                            <div className='flex items-center justify-between'>
                                <span className='text-[10px] font-bold uppercase text-grey/40'>Official IBAN</span>
                                <button
                                    type='button'
                                    onClick={() => copyToClipboard(formData.iban_number, 'IBAN')}
                                    className='text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1'
                                >
                                    <Icon icon={copiedField === 'IBAN' ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} />
                                    {copiedField === 'IBAN' ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <p className='font-mono font-bold text-xs md:text-sm text-grey tracking-wider break-all'>
                                {formData.iban_number || 'AE12 0310 0000 1012 3456 7890'}
                            </p>
                        </div>

                        {/* WhatsApp Instruction Box */}
                        <div className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3'>
                            <Icon icon='logos:whatsapp-icon' className='text-xl shrink-0 mt-0.5' />
                            <p className='text-xs font-medium text-yellow-900 leading-relaxed'>
                                {formData.whatsapp_instruction || 'Please share a screenshot of the transfer confirmation on WhatsApp after payment.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
