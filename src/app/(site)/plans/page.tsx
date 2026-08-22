import React from 'react'
import FoodMenu from '@/app/components/Home/FoodMenu'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Monthly Meal Plans - AL SHAMIL MESS',
    description: 'Explore our authentic South Indian home-cooked monthly meal subscriptions and flexible mess plans.',
}

export default function MealPlansPage() {
    return (
        <main className='pt-20 bg-[#FFF9F5] min-h-screen'>
            <div className='pt-20 pb-10 bg-linear-to-b from-primary/10 via-primary/5 to-[#FFF9F5] text-center relative overflow-hidden'>
                {/* Decorative background circles */}
                <div className='absolute -top-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl'></div>
                <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl'></div>

                <div className='max-w-4xl mx-auto px-4 relative z-10'>
                    <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-black uppercase tracking-widest mb-6 border border-primary/30'>
                        Authentic Daily Subscriptions
                    </div>

                    <h1 className='text-4xl sm:text-6xl md:text-7xl font-black text-grey-dark uppercase tracking-tighter'>
                        MONTHLY <span className='text-primary'>MEAL PLANS</span>
                    </h1>
                    
                    <p className='text-grey-muted mt-5 max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed'>
                        Savor the warmth of home-cooked South Indian and Kerala meals delivered fresh to your room or flat daily. Choose your favorite plan below.
                    </p>
                </div>
            </div>

            <div className='relative z-20 -mt-6'>
                <FoodMenu />
            </div>
        </main>
    )
}
