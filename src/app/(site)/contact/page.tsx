'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        // Simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        toast.success("Message sent successfully! We'll get back to you soon.")
        setIsSubmitting(false)
        e.currentTarget.reset()
    }

    return (
        <main className="pt-32 pb-20 overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4">
                
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black text-grey uppercase tracking-tighter italic mb-4">
                            Let's <span className="text-primary">Connect</span>
                        </h1>
                        <p className="text-sm font-bold text-grey/50 uppercase tracking-[0.3em] max-w-2xl mx-auto">
                            HAVE A QUESTION OR NEED ASSISTANCE? WE'RE HERE TO HELP. REACH OUT TO OUR TEAM TODAY.
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 relative">
                    {/* Background decorative blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-grey/5 shadow-xl group hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Icon icon="solar:phone-calling-bold-duotone" className="text-3xl" />
                            </div>
                            <h3 className="text-xl font-black text-grey uppercase italic tracking-tight mb-2">Call Us</h3>
                            <p className="text-sm font-bold text-grey/50 mb-4">Monday to Friday, 9AM to 6PM</p>
                            <a href="tel:+19092359814" className="text-2xl font-black text-primary hover:text-grey transition-colors inline-block">+1 (909) 235-9814</a>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-grey/5 shadow-xl group hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Icon icon="solar:letter-bold-duotone" className="text-3xl" />
                            </div>
                            <h3 className="text-xl font-black text-grey uppercase italic tracking-tight mb-2">Email Us</h3>
                            <p className="text-sm font-bold text-grey/50 mb-4">We usually reply within 24 hours</p>
                            <a href="mailto:support@alshamilmess.com" className="text-lg font-black text-primary hover:text-grey transition-colors break-all">support@alshamilmess.com</a>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-primary p-8 rounded-[2.5rem] shadow-xl group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 text-white/10 group-hover:scale-110 transition-transform duration-500">
                                <Icon icon="logos:whatsapp-icon" className="text-[150px]" />
                            </div>
                            <div className="relative z-10 w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                                <Icon icon="logos:whatsapp-icon" className="text-3xl" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">WhatsApp</h3>
                            <p className="text-sm font-bold text-white/80 mb-4">Instant support & ordering</p>
                            <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-white/80 transition-colors inline-block">+971 50 123 4567</a>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-grey/5 shadow-2xl h-full">
                            <h2 className="text-3xl font-black text-grey uppercase italic tracking-tight mb-2">Send a Message</h2>
                            <p className="text-xs font-bold text-grey/40 uppercase tracking-widest mb-10">Fill out the form below and we will be in touch</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-grey/40">
                                                <Icon icon="solar:user-bold-duotone" className="text-xl" />
                                            </div>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                className="w-full bg-grey/5 border border-transparent focus:bg-white focus:border-primary/20 px-6 py-4 pl-14 rounded-2xl text-grey font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-grey/30"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-grey/40">
                                                <Icon icon="solar:letter-bold-duotone" className="text-xl" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                className="w-full bg-grey/5 border border-transparent focus:bg-white focus:border-primary/20 px-6 py-4 pl-14 rounded-2xl text-grey font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-grey/30"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Subject</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-grey/40">
                                            <Icon icon="solar:notes-bold-duotone" className="text-xl" />
                                        </div>
                                        <input
                                            type="text"
                                            id="subject"
                                            required
                                            className="w-full bg-grey/5 border border-transparent focus:bg-white focus:border-primary/20 px-6 py-4 pl-14 rounded-2xl text-grey font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-grey/30"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Your Message</label>
                                    <div className="relative">
                                        <div className="absolute top-5 left-0 pl-6 pointer-events-none text-grey/40">
                                            <Icon icon="solar:pen-bold-duotone" className="text-xl" />
                                        </div>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            required
                                            style={{ resize: 'none' }}
                                            className="w-full bg-grey/5 border border-transparent focus:bg-white focus:border-primary/20 px-6 py-4 pl-14 rounded-2xl text-grey font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-grey/30 rounded-bl-sm"
                                            placeholder="Tell us everything..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-grey text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2 shadow-xl hover:shadow-primary/30"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Icon icon="line-md:loading-loop" className="text-xl" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Icon icon="solar:plain-2-bold" className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>

            </div>
        </main>
    )
}
