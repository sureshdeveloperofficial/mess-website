'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

const FloatingActions: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const whatsappNumber = '97142642613'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Premium Mess! I would like to inquire about your daily meal plans.')}`

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none'>
      <div className='flex flex-col items-end gap-2.5 pointer-events-auto'>
        {/* WhatsApp Direct Chat Button */}
        <motion.a
          href={whatsappUrl}
          target='_blank'
          rel='noopener noreferrer'
          whileHover={{ scale: 1.08, x: -2 }}
          whileTap={{ scale: 0.92 }}
          className='flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-xl shadow-[#25D366]/30 transition-all group cursor-pointer'
          title='Chat on WhatsApp'
        >
          <Icon icon='logos:whatsapp-icon' className='text-2xl' />
          <span className='hidden sm:inline font-bold text-xs tracking-wide'>Chat on WhatsApp</span>
        </motion.a>

        {/* Scroll To Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className='w-11 h-11 bg-[#fed869] hover:bg-[#e6c04f] text-grey-dark rounded-full shadow-lg shadow-[#fed869]/35 flex items-center justify-center border border-[#fed869]/40 cursor-pointer transition-colors'
              aria-label='Scroll to top'
            >
              <Icon icon='solar:alt-arrow-up-bold' className='text-xl' />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FloatingActions
