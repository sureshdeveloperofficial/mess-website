'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface MarqueeProps {
    images: string[]
    direction?: 'left' | 'right'
    speed?: number
}

const MarqueeRow = ({ images, direction = 'left', speed = 40 }: MarqueeProps) => {
    return (
        <div className='flex overflow-hidden select-none gap-10 py-10'>
            <motion.div
                initial={{ x: direction === 'left' ? 0 : '-50%' }}
                animate={{ x: direction === 'left' ? '-50%' : 0 }}
                transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
                className='flex shrink-0 gap-10'
            >
                {[...images, ...images].map((img, i) => (
                    <div key={i} className='w-48 h-48 md:w-64 md:h-64 relative rounded-[3rem] overflow-hidden border-8 border-white shadow-xl'>
                        <Image src={img} alt='food' fill className='object-cover hover:scale-110 transition-transform duration-500' />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export default MarqueeRow
