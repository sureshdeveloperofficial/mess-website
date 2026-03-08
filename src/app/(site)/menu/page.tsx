import React from 'react'
import FoodMenu from '@/app/components/Home/FoodMenu'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Daily Mess Menu - AL SHAMIL MESS',
    description: 'Explore our soulful home-cooked meals and daily mess menus.',
}

export default function MenuPage() {
    return (
        <main className='pt-20'>
            <div className='pt-20 pb-10 bg-linear-to-b from-primary/5 to-white text-center relative overflow-hidden'>
                {/* Decorative background circle */}
                <div className='absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl'></div>
                <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl'></div>

                <h1 className='text-5xl md:text-7xl font-black text-grey uppercase tracking-tighter relative z-10'>
                    SIGNATURE <span className='text-primary'>MESS MENU</span>
                </h1>
                <p className='text-grey/50 mt-6 max-w-2xl mx-auto px-6 text-xl font-medium relative z-10 italic'>
                    "Savor the artistry of home-cooked excellence. A curated collection of soulful flavors,
                    meticulously prepared to bring the warmth of tradition to your table."
                </p>
            </div>
            <div className='-mt-10 relative z-20'>
                <FoodMenu />
            </div>
        </main>
    )
}
