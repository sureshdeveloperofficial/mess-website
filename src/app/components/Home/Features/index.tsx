'use client'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

const FEATURE_DATA = [
  {
    heading: 'Fresh Daily Meals',
    subheading: 'Home-style cooking prepared every morning with fresh, locally sourced ingredients.',
    icon: 'ion:leaf-outline',
    color: '#FACB15'
  },
  {
    heading: 'Affordable Subscription',
    subheading: 'Flexible weekly and monthly plans designed to fit your budget and schedule perfectly.',
    icon: 'ion:calendar-number-outline',
    color: '#FACB15'
  },
  {
    heading: 'Healthy Ingredients',
    subheading: 'No preservatives, zero additives. We focus on authentic taste and balanced nutrition.',
    icon: 'ion:heart-outline',
    color: '#FACB15'
  },
  {
    heading: 'Fast Delivery',
    subheading: 'Hot and delicious meals delivered straight to your doorstep right on time.',
    icon: 'ion:bicycle-outline',
    color: '#FACB15'
  }
]

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  return (
    <section id='features' className='py-32 bg-white relative overflow-hidden'>
      <div className='container relative z-10'>
        <div className='text-center mb-24'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-[#FACB15] text-sm font-black mb-4 tracking-[0.5em] uppercase'
          >
            Our Standards
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none'
          >
            Why Choose Al Shamil <span className='text-[#FACB15] italic underline decoration-[#2D2A26]/5 underline-offset-8 transform hover:skew-x-3 transition-transform duration-500'>Mess?</span>
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'
        >
          {FEATURE_DATA.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className='feature-card p-10 relative rounded-[3.5rem] bg-[#FFF9F5] border border-[#FACB15]/5 shadow-xl shadow-[#FACB15]/2 flex flex-col items-center text-center group transition-colors duration-500 hover:bg-white'
            >
              <div className='w-20 h-20 bg-[#FACB15]/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#FACB15] transition-all duration-500'>
                <Icon icon={item.icon} className='text-4xl text-[#FACB15] group-hover:text-white transition-colors duration-500' />
              </div>

              <h3 className='text-2xl font-black text-[#2D2A26] mb-4 tracking-tight group-hover:text-[#FACB15] transition-colors'>
                {item.heading}
              </h3>

              <p className='text-base font-medium text-[#2D2A26]/50 leading-relaxed'>
                {item.subheading}
              </p>

              {/* Decorative flourish */}
              <div className='absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <Icon icon='ion:sparkles-outline' className='text-2xl text-[#FACB15]/20' />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background accents */}
      <div className='absolute top-1/2 left-0 w-64 h-64 bg-[#FACB15]/5 rounded-full blur-[100px] pointer-events-none'></div>
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-[#FACB15]/3 rounded-full blur-[120px] pointer-events-none'></div>
    </section>
  )
}

export default Features
