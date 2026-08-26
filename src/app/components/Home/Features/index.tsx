'use client'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

const FEATURE_DATA = [
  {
    heading: 'Fresh Daily Meals',
    subheading: 'Home-style cooking prepared every morning with fresh, locally sourced ingredients.',
    icon: 'ion:leaf-outline',
    color: '#FFD54F'
  },
  {
    heading: 'Affordable Subscription',
    subheading: 'Flexible weekly and monthly plans designed to fit your budget and schedule perfectly.',
    icon: 'ion:calendar-number-outline',
    color: '#FFD54F'
  },
  {
    heading: 'Healthy Ingredients',
    subheading: 'No preservatives, zero additives. We focus on authentic taste and balanced nutrition.',
    icon: 'ion:heart-outline',
    color: '#FFD54F'
  },
  {
    heading: 'Fast Delivery',
    subheading: 'Hot and delicious meals delivered straight to your doorstep right on time.',
    icon: 'ion:bicycle-outline',
    color: '#FFD54F'
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
    <section id='features' className='py-16 bg-[#FFFDF5] relative overflow-hidden'>
      <div className='container relative z-10'>
        <div className='text-center mb-12'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-amber-600 text-xs font-black mb-4 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD54F]/20 border border-[#FFD54F]/40'
          >
            <Icon icon='solar:star-fall-bold-duotone' className='text-amber-600' />
            Our Standards
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-3.5xl sm:text-5xl md:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight'
          >
            Why Choose Premium <span className='text-amber-500 italic underline decoration-grey-dark/5 underline-offset-8 transform hover:skew-x-3 transition-transform duration-500'>Mess?</span>
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'
        >
          {FEATURE_DATA.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className='feature-card p-6 sm:p-8 lg:p-10 relative rounded-3xl sm:rounded-[3rem] bg-[#FFF9E6] border border-[#FFD54F]/30 shadow-lg shadow-[#FFD54F]/10 flex flex-col items-center text-center group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-[#FFD54F]/20'
            >
              <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#FFD54F]/25 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:bg-[#FFD54F] transition-all duration-300'>
                <Icon icon={item.icon} className='text-3xl sm:text-4xl text-amber-600 group-hover:text-grey-dark transition-colors duration-300' />
              </div>

              <h3 className='text-lg sm:text-xl font-extrabold text-grey-dark mb-3 tracking-tight group-hover:text-amber-600 transition-colors'>
                {item.heading}
              </h3>

              <p className='text-xs sm:text-sm font-normal text-grey-dark/75 leading-relaxed'>
                {item.subheading}
              </p>

              {/* Decorative flourish */}
              <div className='absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <Icon icon='ion:sparkles-outline' className='text-2xl text-[#FFD54F]/40' />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background accents */}
      <div className='absolute top-1/2 left-0 w-64 h-64 bg-[#FFD54F]/15 rounded-full blur-[100px] pointer-events-none'></div>
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-[120px] pointer-events-none'></div>
    </section>
  )
}

export default Features
