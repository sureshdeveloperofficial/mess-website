import React from 'react'
import Hero from '@/app/components/Home/Hero'
import Features from '@/app/components/Home/Features'
import Cook from '@/app/components/Home/Cook'
import Expert from '@/app/components/Home/Expert'
import Gallery from '@/app/components/Home/Gallery'
import PremiumBanner from '@/app/components/Home/PremiumBanner'
import Newsletter from '@/app/components/Home/Newsletter'
import HowItWorks from '@/app/components/Home/HowItWorks'
// import AppDownload from '@/app/components/Home/AppDownload'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'PREMIUM MESS | Authentic Home-Style Daily Meals',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Cook />
      <Features />
      <Gallery />
      <HowItWorks />
      {/* <Expert /> */}
      {/* <PremiumBanner /> */}
      {/* <Newsletter /> */}
    </main>
  )
}
