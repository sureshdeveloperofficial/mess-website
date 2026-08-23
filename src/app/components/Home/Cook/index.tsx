'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const Cook = () => {
  return (
    <section className='relative py-16 bg-white' id='aboutus'>
      <div className='container'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center gap-20'>
          <div className='lg:col-span-6 relative'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className='relative z-20 rounded-[5rem] overflow-hidden border-[1.5rem] border-[#FFF9F5] shadow-2xl'
            >
              <Image
                src='/images/Cook/cook.webp'
                alt='chef'
                width={636}
                height={808}
                className='w-full h-full object-cover'
              />
            </motion.div>

            {/* Absolute decorative food image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className='absolute -right-10 -bottom-10 w-48 h-48 z-30 hidden xl:block drop-shadow-2xl'
            >
              <Image src='/images/food/parotta.png' alt='parotta' width={200} height={200} className='rounded-full' />
            </motion.div>
          </div>

          <div className='lg:col-span-6'>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='text-primary text-xs font-semibold mb-4 tracking-wider uppercase'
            >
              The Heart of our Mess
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='text-4xl md:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight mb-8'
            >
              Crafted with <span className='text-primary'>Passion</span>, Served with Pride
            </motion.h2>

            <div className='space-y-6 text-base font-normal text-grey-dark/75 leading-relaxed'>
              <p>
                At <span className='text-grey-dark font-extrabold'>AL SHAMIL MESS</span>, every dish tells a story. Our team blends
                tradition with quality to deliver a hearty home-style dining experience that
                delights the senses.
              </p>
              <p>
                From handpicked farm-fresh ingredients to generous servings, we’re here to make every meal feel like home. Whether you’re stopping
                by for a reliable daily meal plan or just for a nostalgic taste of home, we promise something truly satisfying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cook
