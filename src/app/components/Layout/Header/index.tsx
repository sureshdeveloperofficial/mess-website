'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import AuthModal from '@/app/components/Auth/AuthModal'
import { Icon } from '@iconify/react/dist/iconify.js'
import { HeaderItem } from '@/app/types/menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '@/app/hooks/useSettings'

const Header: React.FC = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: settings } = useSettings()
  const [headerLink, setHeaderLink] = useState<HeaderItem[]>([])

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  const contactPhone = settings?.contact_phone || '+971 4 264 2613'
  const navbarRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const openSignIn = () => {
    setAuthModalMode('signin')
    setAuthModalOpen(true)
    setNavbarOpen(false)
  }

  const openSignUp = () => {
    setAuthModalMode('signup')
    setAuthModalOpen(true)
    setNavbarOpen(false)
  }

  const handleSignOut = async () => {
    setDropdownOpen(false)
    setNavbarOpen(false)
    await signOut({ redirect: false })
    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setHeaderLink(data.HeaderData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  const handleScroll = () => {
    setSticky(window.scrollY >= 20)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      dropdownOpen
    ) {
      setDropdownOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navbarOpen, dropdownOpen])

  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [navbarOpen])

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        sticky
          ? 'shadow-md shadow-[#FFD54F]/10 bg-[#FFFDF5]/95 backdrop-blur-md py-3'
          : 'shadow-none py-4 sm:py-5 bg-transparent'
      }`}>
      <div className='container mx-auto max-w-c-1390 px-4 sm:px-6 xl:px-8'>
        <div className='flex items-center justify-between'>
          {/* Brand Logo with Clean Spacing */}
          <div className='flex-shrink-0 pr-3 sm:pr-6 lg:pr-8 relative z-10'>
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-8 mx-auto px-4 xl:px-8'>
            {headerLink.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>

          {/* Contact Phone & Auth Section */}
          <div className='flex items-center gap-3 xl:gap-4 shrink-0 pl-2 sm:pl-4'>
            {/* Phone Button (visible on wide screens without wrapping) */}
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className='hidden 2xl:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD54F]/20 text-grey-dark hover:bg-[#FFD54F]/35 transition-all text-xs font-bold whitespace-nowrap shrink-0 border border-[#FFD54F]/30'
              title='Call Our Support'>
              <Icon icon='solar:phone-calling-bold-duotone' className='text-base text-amber-600 shrink-0' />
              <span className='whitespace-nowrap'>{contactPhone}</span>
            </a>

            {status === 'authenticated' ? (
              <div className='relative' ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className='flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#FFD54F]/20 hover:bg-[#FFD54F]/30 border border-[#FFD54F]/30 transition-all text-left group cursor-pointer'
                  aria-expanded={dropdownOpen}>
                  <div className='w-8 h-8 rounded-full bg-[#FFD54F] flex items-center justify-center text-grey-dark font-extrabold text-xs shadow-xs'>
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className='hidden sm:block text-left'>
                    <p className='text-xs font-black text-grey-dark leading-tight line-clamp-1'>
                      {session?.user?.name?.split(' ')[0] || 'User'}
                    </p>
                    <p className='text-[10px] text-grey-dark/70 font-semibold leading-tight'>
                      Subscriber
                    </p>
                  </div>
                  <Icon
                    icon='solar:alt-arrow-down-linear'
                    className={`text-grey-dark text-xs transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-[#FFD54F]/15 border border-[#FFD54F]/30 py-2 z-50 overflow-hidden'>
                      <div className='px-4 py-2.5 border-b border-[#FFD54F]/20 bg-[#FFFDF5]'>
                        <p className='text-xs font-black text-grey-dark truncate'>
                          {session?.user?.name || 'Customer'}
                        </p>
                        <p className='text-[10px] text-grey-dark/70 font-medium truncate mt-0.5'>
                          {session?.user?.email}
                        </p>
                      </div>

                      <div className='py-1.5'>
                        <Link
                          href='/profile'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-grey-dark hover:bg-[#FFD54F]/15 transition-colors'>
                          <Icon icon='solar:user-bold-duotone' className='text-base text-amber-600' />
                          <span>Edit Profile</span>
                        </Link>
                        <Link
                          href='/my-orders'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-grey-dark hover:bg-[#FFD54F]/15 transition-colors'>
                          <Icon icon='solar:bag-check-bold-duotone' className='text-base text-amber-600' />
                          <span>My Orders</span>
                        </Link>
                      </div>

                      <div className='pt-1.5 border-t border-[#FFD54F]/20 px-2'>
                        <button
                          onClick={handleSignOut}
                          className='w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer'>
                          <Icon icon='solar:logout-2-bold-duotone' className='text-base' />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  type='button'
                  onClick={openSignIn}
                  className='hidden lg:block text-grey-dark duration-300 bg-[#FFD54F]/25 hover:bg-[#FFD54F] border border-[#FFD54F]/40 font-extrabold text-sm xl:text-base py-2.5 px-5 xl:px-6 rounded-full whitespace-nowrap transition-all cursor-pointer'>
                  Sign In
                </button>
                <button
                  type='button'
                  onClick={openSignUp}
                  className='hidden lg:block bg-[#FFD54F] duration-300 text-grey-dark hover:bg-[#F59E0B] font-extrabold text-sm xl:text-base py-2.5 px-5 xl:px-6 rounded-full whitespace-nowrap shadow-md shadow-[#FFD54F]/30 transition-all cursor-pointer'>
                  Sign Up
                </button>
              </>
            )}

            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-xl bg-[#FFD54F]/20 border border-[#FFD54F]/40 text-grey-dark cursor-pointer'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-grey-dark'></span>
              <span className='block w-6 h-0.5 bg-grey-dark mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-grey-dark mt-1.5'></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-xs z-40' onClick={() => setNavbarOpen(false)} />
        )}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-[300px] bg-[#FFFDF5] border-l border-[#FFD54F]/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className='flex items-center justify-between p-4 border-b border-[#FFD54F]/20'>
            <span className='text-sm font-extrabold text-grey-dark'>Navigation Menu</span>
            <button
              onClick={() => setNavbarOpen(false)}
              className='p-1.5 rounded-lg text-grey-dark hover:bg-[#FFD54F]/20 cursor-pointer'>
              <Icon icon='solar:close-circle-bold' className='text-2xl text-grey-dark' />
            </button>
          </div>

          <nav className='flex flex-col items-start p-4'>
            {headerLink.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            <div className='mt-4 flex flex-col space-y-4 w-full'>
              {status === 'authenticated' ? (
                <>
                  <div className="p-3.5 bg-[#FFD54F]/15 rounded-2xl border border-[#FFD54F]/25">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm font-extrabold text-grey-dark truncate">{session?.user?.name || 'Customer'}</p>
                    <p className="text-[11px] font-medium text-grey-dark/75 truncate mt-0.5">{session?.user?.email}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 w-full">
                    <Link 
                      href="/profile" 
                      onClick={() => setNavbarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#FFD54F]/20 text-grey-dark font-bold text-xs hover:bg-[#FFD54F]/20 transition-all"
                    >
                      <Icon icon="solar:user-bold-duotone" className="text-lg text-amber-600" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link 
                      href="/my-orders" 
                      onClick={() => setNavbarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#FFD54F]/20 text-grey-dark font-bold text-xs hover:bg-[#FFD54F]/20 transition-all"
                    >
                      <Icon icon="solar:bag-check-bold-duotone" className="text-lg text-amber-600" />
                      <span>My Orders</span>
                    </Link>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-xs hover:bg-red-100 transition-all border border-red-200 cursor-pointer"
                  >
                    <Icon icon="solar:logout-2-bold-duotone" className="text-lg" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type='button'
                    onClick={openSignIn}
                    className='bg-[#FFD54F]/25 text-grey-dark font-bold px-4 py-2.5 rounded-xl border border-[#FFD54F]/40 hover:bg-[#FFD54F] text-center transition duration-300 ease-in-out cursor-pointer'>
                    Sign In
                  </button>
                  <button
                    type='button'
                    onClick={openSignUp}
                    className='bg-[#FFD54F] text-grey-dark font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-[#FFD54F]/30 hover:bg-[#F59E0B] text-center transition duration-300 ease-in-out cursor-pointer'>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Global Auth Modal Dialog */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  )
}

export default Header
