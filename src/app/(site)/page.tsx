import React from 'react'
import Hero from '@/app/components/Home/Hero'
import Features from '@/app/components/Home/Features'
import Cook from '@/app/components/Home/Cook'
import Expert from '@/app/components/Home/Expert'
import Gallery from '@/app/components/Home/Gallery'
import Newsletter from '@/app/components/Home/Newsletter'
import MenuPreview from '@/app/components/Home/MenuPreview'
import HowItWorks from '@/app/components/Home/HowItWorks'
// import AppDownload from '@/app/components/Home/AppDownload'
import { Metadata } from 'next'
import ContactForm from '@/app/components/Contact/Form'

export const metadata: Metadata = {
  title: 'AL SHAMIL MESS | Authentic Home-Style Daily Meals',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <MenuPreview />
      <HowItWorks />
      <Expert />
      <Cook />
      <Gallery />
      {/* <AppDownload /> */}
      <ContactForm />
      <Newsletter />
    </main>
  )
}
