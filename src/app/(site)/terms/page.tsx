'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const TermsPage = () => {
  const sections = [
    {
      icon: 'solar:document-text-bold-duotone',
      title: '1. Acceptance of Terms',
      content:
        'By accessing and using AL SHAMIL MESS website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.',
    },
    {
      icon: 'solar:cup-star-bold-duotone',
      title: '2. Services Provided',
      content:
        'AL SHAMIL MESS provides home-style meal subscription services, including daily meals, event catering, and corporate lunch solutions. We reserve the right to modify or discontinue any service at our discretion.',
    },
    {
      icon: 'solar:cart-check-bold-duotone',
      title: '3. Ordering and Subscription',
      content:
        'Orders must be placed through our official website. Subscriptions are billed on a monthly basis unless otherwise specified. It is the responsibility of the user to provide accurate delivery and contact information.',
    },
    {
      icon: 'solar:wallet-money-bold-duotone',
      title: '4. Cancellation and Refund Policy',
      content:
        'Cancellations must be made at least 24 hours in advance for daily meal services. Refunds for subscription balances are processed within 7-10 working days, subject to administrative fees where applicable.',
    },
    {
      icon: 'solar:heart-pulse-bold-duotone',
      title: '5. Food Safety and Allergies',
      content:
        'While we maintain high standards of hygiene and quality, users are responsible for notifying us of any food allergies or dietary restrictions during the ordering process. AL SHAMIL MESS is not liable for adverse reactions to ingredients not disclosed.',
    },
    {
      icon: 'solar:shield-warning-bold-duotone',
      title: '6. Limitation of Liability',
      content:
        'AL SHAMIL MESS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or the inability to use our website.',
    },
    {
      icon: 'solar:buildings-bold-duotone',
      title: '7. Governing Law',
      content:
        'These terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts in the UAE.',
    },
  ]

  return (
    <main className='pt-20 bg-[#FFF9F5] min-h-screen'>
      {/* Hero Banner */}
      <div className='pt-16 pb-12 bg-linear-to-b from-primary/10 via-primary/5 to-[#FFF9F5] text-center relative overflow-hidden'>
        <div className='absolute -top-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none' />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='relative z-10'
        >
          <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-semibold mb-4 border border-primary/30'>
            <Icon icon='solar:document-bold-duotone' className='text-sm' />
            Terms &amp; Conditions
          </div>

          <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-grey-dark tracking-tight mb-4'>
            Our <span className='text-primary'>Terms</span> of Service
          </h1>
          <p className='text-grey-muted text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto'>
            Please read these terms carefully before using our services. By using AL SHAMIL MESS, you agree to these conditions.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className='relative z-20 -mt-4 pb-20'>
        <div className='container max-w-4xl mx-auto px-4'>

          {/* Sections */}
          <div className='space-y-4 mb-8'>
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex gap-5'
              >
                <div className='shrink-0 w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform'>
                  <Icon icon={section.icon} className='text-xl' />
                </div>
                <div>
                  <h2 className='text-base font-extrabold text-grey-dark mb-1.5'>
                    {section.title}
                  </h2>
                  <p className='text-sm font-normal text-grey-dark/75 leading-relaxed'>
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='bg-white rounded-3xl border border-grey/10 shadow-xs px-7 py-5 flex items-center gap-3'
          >
            <Icon icon='solar:letter-bold-duotone' className='text-xl text-primary shrink-0' />
            <p className='text-sm font-medium text-grey-dark/75'>
              If you have any questions regarding these terms, please contact us at{' '}
              <a href='mailto:support@alshamilmess.com' className='text-primary font-extrabold hover:underline'>
                support@alshamilmess.com
              </a>
            </p>
          </motion.div>

        </div>
      </div>
    </main>
  )
}

export default TermsPage
