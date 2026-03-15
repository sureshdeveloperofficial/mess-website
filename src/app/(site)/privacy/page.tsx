'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Icon } from '@iconify/react'

const PrivacyPage = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: 'solar:user-id-bold',
      content:
        'We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you place an order or create an account.',
    },
    {
      title: 'How We Use Information',
      icon: 'solar:settings-bold',
      content:
        'We use the collected information to process your orders, communicate with you about your subscription, improve our services, and send you promotional offers if you have opted in.',
    },
    {
      title: 'Data Security',
      icon: 'solar:shield-check-bold',
      content:
        'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your payment information is processed through secure, encrypted gateways.',
    },
    {
      title: 'Cookies and Tracking',
      icon: 'solar:cookie-bold',
      content:
        'Our website uses cookies to enhance your browsing experience, analyze site traffic, and remember your preferences. You can manage your cookie preferences through your browser settings.',
    },
    {
      title: 'Third-Party Sharing',
      icon: 'solar:share-bold',
      content:
        'We do not sell your personal information. We may share data with trusted third-party service providers (e.g., delivery partners) only to the extent necessary to perform their services for us.',
    },
    {
      title: 'Your Rights',
      icon: 'solar:hand-stars-bold',
      content:
        'You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact our support team.',
    },
  ]

  return (
    <div className='bg-neutral-50/50 min-h-screen pb-20'>
      <Breadcrumb pageName='Privacy Policy' />
      
      <div className='container max-w-5xl mx-auto px-6 mt-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-grey/5 border border-grey/5 relative overflow-hidden'
        >
          {/* Decorative background element */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
          
          <div className='relative z-10'>
            <div className='mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6'>
                <Icon icon='solar:lock-bold' />
                Data Protection
              </div>
              <h1 className='text-4xl md:text-6xl font-black text-grey mb-6 tracking-tight'>Privacy Policy</h1>
              <p className='text-grey/50 font-medium text-lg leading-relaxed max-w-2xl'>
                At AL SHAMIL MESS, we value your privacy. This policy outlines how we handle your data with transparency and care.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'>
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='p-8 rounded-[2rem] bg-neutral-50 hover:bg-white hover:shadow-xl hover:shadow-grey/5 transition-all duration-300 border border-transparent hover:border-grey/5 group'
                >
                  <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform'>
                    <Icon icon={section.icon} className='text-2xl' />
                  </div>
                  <h3 className='text-xl font-bold text-grey mb-4'>{section.title}</h3>
                  <p className='text-grey/60 leading-relaxed font-medium'>
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className='mt-20 p-8 rounded-[2.5rem] bg-grey text-white relative overflow-hidden'>
              <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
                <div>
                  <h4 className='text-2xl font-black mb-2'>Have privacy concerns?</h4>
                  <p className='text-white/60 font-medium'>Our dedicated privacy team is here to help you.</p>
                </div>
                <a 
                  href='mailto:privacy@alshamilmess.com' 
                  className='px-8 py-4 bg-primary text-grey font-black rounded-2xl hover:scale-105 transition-all'
                >
                  Contact Privacy Team
                </a>
              </div>
              <Icon icon='solar:shield-warning-bold' className='absolute right-0 bottom-0 text-[12rem] text-white/5 -mb-12 -mr-8' />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacyPage
