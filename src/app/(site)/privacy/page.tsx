'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const PrivacyPage = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: 'solar:user-id-bold-duotone',
      content:
        'We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you place an order or create an account.',
    },
    {
      title: 'How We Use Information',
      icon: 'solar:settings-bold-duotone',
      content:
        'We use the collected information to process your orders, communicate with you about your subscription, improve our services, and send you promotional offers if you have opted in.',
    },
    {
      title: 'Data Security',
      icon: 'solar:shield-check-bold-duotone',
      content:
        'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your payment information is processed through secure, encrypted gateways.',
    },
    {
      title: 'Cookies and Tracking',
      icon: 'solar:widget-bold-duotone',

      content:
        'Our website uses cookies to enhance your browsing experience, analyze site traffic, and remember your preferences. You can manage your cookie preferences through your browser settings.',
    },
    {
      title: 'Third-Party Sharing',
      icon: 'solar:share-bold-duotone',
      content:
        'We do not sell your personal information. We may share data with trusted third-party service providers (e.g., delivery partners) only to the extent necessary to perform their services for us.',
    },
    {
      title: 'Your Rights',
      icon: 'solar:hand-stars-bold-duotone',
      content:
        'You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact our support team.',
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
            <Icon icon='solar:lock-bold-duotone' className='text-sm' />
            Privacy Policy
          </div>

          <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-grey-dark tracking-tight mb-4'>
            Your <span className='text-primary'>Privacy</span> Matters
          </h1>
          <p className='text-grey-muted text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto'>
            At AL SHAMIL MESS, we value your privacy. This policy outlines how we handle your data with transparency and care.
          </p>
        </motion.div>

      </div>

      {/* Content */}
      <div className='relative z-20 -mt-4 pb-20'>
        <div className='container max-w-5xl mx-auto px-4'>

          {/* Policy Sections Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-8'>
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group'
              >
                <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20 group-hover:scale-105 transition-transform'>
                  <Icon icon={section.icon} className='text-2xl' />
                </div>
                <h3 className='text-base font-extrabold text-grey-dark mb-2'>
                  {section.title}
                </h3>
                <p className='text-sm font-normal text-grey-dark/75 leading-relaxed'>
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='bg-primary rounded-3xl p-8 md:p-10 relative overflow-hidden'
          >
            <div className='absolute right-0 bottom-0 opacity-10'>
              <Icon icon='solar:shield-warning-bold' className='text-[10rem]' />
            </div>
            <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-6'>
              <div>
                <h4 className='text-xl font-extrabold text-grey-dark mb-1'>
                  Have privacy concerns?
                </h4>
                <p className='text-sm font-medium text-grey-dark/75'>
                  Our dedicated privacy team is here to help you.
                </p>
              </div>
              <a
                href='mailto:privacy@alshamilmess.com'
                className='shrink-0 px-7 py-3 bg-grey-dark text-white font-extrabold text-sm rounded-2xl hover:bg-grey-dark/90 transition-all shadow-md hover:shadow-lg'
              >
                Contact Privacy Team
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}

export default PrivacyPage
