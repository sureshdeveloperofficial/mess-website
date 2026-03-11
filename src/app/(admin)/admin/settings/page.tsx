'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'

type Settings = {
    bank_name?: string
    account_name?: string
    account_number?: string
    swift_code?: string
    iban_number?: string
    whatsapp_instruction?: string
}

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<Settings>({
        bank_name: '',
        account_name: '',
        account_number: '',
        swift_code: '',
        iban_number: '',
        whatsapp_instruction: '',
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
            setFormData(prev => ({ ...prev, ...settings }))
        }
    }, [settings])

    const mutation = useMutation({
        mutationFn: async (newSettings: Settings) => {
            return axios.post('/api/settings', { settings: newSettings })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            toast.success('Settings updated successfully')
        },
        onError: () => {
            toast.error('Failed to update settings')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate(formData)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (isLoading) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center font-bold'>
                <Icon icon='line-md:loading-loop' className='text-3xl text-primary mr-3' />
                LOADING SETTINGS...
            </div>
        )
    }

    return (
        <div className='max-w-4xl space-y-8'>
            <div>
                <h3 className='text-3xl font-black text-grey uppercase tracking-tight'>System Settings</h3>
                <p className='text-grey/40 font-bold uppercase text-[10px] tracking-widest mt-1'>Manage dynamic content and configurations</p>
            </div>

            <div className='bg-white rounded-[2.5rem] border border-grey/5 shadow-sm overflow-hidden'>
                <div className='p-8 bg-primary/5 border-b border-primary/10 flex items-center gap-4'>
                    <div className='w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20'>
                        <Icon icon='ion:business-outline' className='text-2xl' />
                    </div>
                    <div>
                        <h4 className='text-lg font-black text-grey uppercase tracking-tight'>Bank Transfer Details</h4>
                        <p className='text-[10px] font-bold text-primary uppercase tracking-widest'>Configure the collection account information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='p-8 space-y-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>Bank Name</label>
                            <input
                                name='bank_name'
                                value={formData.bank_name}
                                onChange={handleChange}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey'
                                placeholder='e.g. Emirates NBD'
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>Account Name</label>
                            <input
                                name='account_name'
                                value={formData.account_name}
                                onChange={handleChange}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey'
                                placeholder='e.g. Al Shamil Mess Services'
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>Account Number</label>
                            <input
                                name='account_number'
                                value={formData.account_number}
                                onChange={handleChange}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey'
                                placeholder='Enter account number'
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>Swift Code</label>
                            <input
                                name='swift_code'
                                value={formData.swift_code}
                                onChange={handleChange}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey'
                                placeholder='Enter swift code'
                            />
                        </div>
                        <div className='md:col-span-2 space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>IBAN Number</label>
                            <input
                                name='iban_number'
                                value={formData.iban_number}
                                onChange={handleChange}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey tracking-wider'
                                placeholder='Enter full IBAN number'
                            />
                        </div>
                        <div className='md:col-span-2 space-y-2'>
                            <label className='text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4'>WhatsApp Instruction Text</label>
                            <textarea
                                name='whatsapp_instruction'
                                value={formData.whatsapp_instruction}
                                onChange={handleChange}
                                rows={3}
                                className='w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-grey'
                                placeholder='e.g. Please share a screenshot of the transfer confirmation on WhatsApp (+971 XXX XXX XXXX)...'
                            />
                        </div>
                    </div>

                    <div className='pt-4'>
                        <button
                            type='submit'
                            disabled={mutation.isPending}
                            className='w-full md:w-auto px-12 py-4 bg-primary text-grey rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3'
                        >
                            {mutation.isPending ? (
                                <Icon icon='line-md:loading-loop' className='text-xl' />
                            ) : (
                                <Icon icon='ion:save-outline' className='text-xl' />
                            )}
                            {mutation.isPending ? 'SAVING CHANGES...' : 'SAVE SETTINGS'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview Card */}
            <div className='space-y-4'>
                <h4 className='text-sm font-black text-grey uppercase tracking-widest ml-4'>Customer View Preview</h4>
                <div className='bg-primary/5 border-2 border-primary/20 rounded-4xl p-8 space-y-6 max-w-2xl'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white'>
                            <Icon icon='ion:business-outline' className='text-2xl' />
                        </div>
                        <div>
                            <h4 className='text-lg font-black text-grey uppercase tracking-tight italic'>Collection Bank Details</h4>
                            <p className='text-[10px] font-bold text-primary uppercase tracking-widest'>Transfer to the account below</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest'>Bank Name</p>
                            <p className='font-black text-grey'>{formData.bank_name || '—'}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest'>Account Name</p>
                            <p className='font-black text-grey'>{formData.account_name || '—'}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest'>Account Number</p>
                            <p className='font-black text-grey'>{formData.account_number || '—'}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest'>Swift Code</p>
                            <p className='font-black text-grey'>{formData.swift_code || '—'}</p>
                        </div>
                        <div className='sm:col-span-2 p-4 bg-white rounded-2xl border border-primary/10'>
                            <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest mb-1'>IBAN Number</p>
                            <p className='font-black text-primary tracking-wider break-all text-sm'>{formData.iban_number || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
