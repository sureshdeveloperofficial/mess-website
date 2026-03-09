'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type CheckoutFormProps = {
    selectedMenuIds: string[]
    selectionsJson: Record<string, Record<string, string>>
    totalPrice: number
}

export default function CheckoutForm({ selectedMenuIds, selectionsJson, totalPrice }: CheckoutFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        whatsappNo: '',
        address: '',
        buildingName: '',
        flatRoomNumber: '',
        startDate: '',
        deliveryLocation: 'inside_room',
        brunchLunchLocation: '',
        dinnerLocation: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await axios.post('/api/orders', {
                ...formData,
                totalAmount: totalPrice,
                menuIds: selectedMenuIds,
                selectionsJson: selectionsJson,
            })
            toast.success('Order placed successfully!')
            // Redirect or show success message
            router.push('/checkout/success')
        } catch (error: any) {
            console.error('Submission error:', error)
            toast.error(error.response?.data?.error || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-grey/5">
            <div className="bg-primary p-8 text-grey">
                <h2 className="text-3xl font-black tracking-tight mb-2">Finalize Your Order</h2>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Complete your subscription details</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                {/* Personal Info */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:person-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Customer Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Name *</label>
                            <input
                                required
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Phone Number *</label>
                            <input
                                required
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="+91 XXX XXX XXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">WhatsApp Number</label>
                            <input
                                name="whatsappNo"
                                value={formData.whatsappNo}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="+91 XXX XXX XXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Email Address</label>
                            <input
                                type="email"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-grey/5" />

                {/* Delivery Address */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:location-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Delivery Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Address *</label>
                            <textarea
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey min-h-[100px]"
                                placeholder="Building No, Street, Landmark..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Building Name / City Name</label>
                            <input
                                name="buildingName"
                                value={formData.buildingName}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Enter building or city"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Flat / Room Number</label>
                            <input
                                name="flatRoomNumber"
                                value={formData.flatRoomNumber}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="e.g. 402, Block A"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-grey/5" />

                {/* Preferences */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icon icon="ion:settings-outline" className="text-xl" />
                        </div>
                        <h3 className="text-xl font-black text-grey uppercase tracking-wider">Service Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Start Date *</label>
                            <input
                                required
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Default Drop Location</label>
                            <select
                                name="deliveryLocation"
                                value={formData.deliveryLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey appearance-none"
                            >
                                <option value="inside_room">Inside My Room</option>
                                <option value="outside_room">Outside My Room</option>
                                <option value="security_desk">Security Desk</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Brunch & Lunch Delivery Location</label>
                            <input
                                name="brunchLunchLocation"
                                value={formData.brunchLunchLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Specific instructions for lunch"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Dinner Delivery Location</label>
                            <input
                                name="dinnerLocation"
                                value={formData.dinnerLocation}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-grey/5 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-hidden transition-all font-bold text-grey"
                                placeholder="Specific instructions for dinner"
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Summary */}
                <div className="bg-grey/95 rounded-[2.5rem] p-8 mt-12 text-white border border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-grey shadow-lg shadow-primary/20">
                                <Icon icon="ion:card" className="text-3xl" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Payment Method</p>
                                <p className="text-white font-bold text-xl">Cash on Delivery (COD)</p>
                            </div>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Monthly Billing Total</p>
                            <p className="text-white font-black text-4xl tracking-tighter">₹ {totalPrice.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-grey/40 text-center uppercase tracking-[0.3em]">
                        Our agent will call you to confirm the order within 24 hours.
                    </p>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-primary text-grey rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <div className="w-8 h-8 border-4 border-grey/20 border-t-grey rounded-full animate-spin" />
                        ) : (
                            <>
                                SUBMIT ORDER NOW
                                <Icon icon="ion:arrow-forward" className="group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
