'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Breadcrumb from '@/app/components/Common/Breadcrumb'

const TermsPage = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By accessing and using AL SHAMIL MESS website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.',
    },
    {
      title: '2. Services Provided',
      content:
        'AL SHAMIL MESS provides home-style meal subscription services, including daily meals, event catering, and corporate lunch solutions. We reserve the right to modify or discontinue any service at our discretion.',
    },
    {
      title: '3. Ordering and Subscription',
      content:
        'Orders must be placed through our official website. Subscriptions are billed on a monthly basis unless otherwise specified. It is the responsibility of the user to provide accurate delivery and contact information.',
    },
    {
      title: '4. Cancellation and Refund Policy',
      content:
        'Cancellations must be made at least 24 hours in advance for daily meal services. Refunds for subscription balances are processed within 7-10 working days, subject to administrative fees where applicable.',
    },
    {
      title: '5. Food Safety and Allergies',
      content:
        'While we maintain high standards of hygiene and quality, users are responsible for notifying us of any food allergies or dietary restrictions during the ordering process. AL SHAMIL MESS is not liable for adverse reactions to ingredients not disclosed.',
    },
    {
      title: '6. Limitation of Liability',
      content:
        'AL SHAMIL MESS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or the inability to use our website.',
    },
    {
      title: '7. Governing Law',
      content:
        'These terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts in the UAE.',
    },
  ]

  return (
    <div className='bg-neutral-50/50 min-h-screen pb-20'>
      <Breadcrumb pageName='Terms and Conditions' />
      
      <div className='container max-w-4xl mx-auto px-6 mt-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-grey/5 border border-grey/5'
        >
          <div className='mb-12'>
            <h1 className='text-3xl md:text-5xl font-black text-grey mb-4'>Terms & Conditions</h1>
            <p className='text-grey/50 font-medium'>Last Updated: March 15, 2026</p>
          </div>

          <div className='space-y-10'>
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='border-l-4 border-primary/20 pl-6'
              >
                <h2 className='text-xl md:text-2xl font-bold text-grey mb-4'>{section.title}</h2>
                <p className='text-grey/70 leading-relaxed text-lg font-medium'>
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <div className='mt-16 pt-8 border-t border-grey/10'>
            <p className='text-grey/60 text-sm italic'>
              If you have any questions regarding these terms, please contact us at support@alshamilmess.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsPage
