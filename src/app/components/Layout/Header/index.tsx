'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { Icon } from '@iconify/react/dist/iconify.js'
import { HeaderItem } from '@/app/types/menu'
import { motion, AnimatePresence } from 'framer-motion'

const Header: React.FC = () => {
  const { data: session, status } = useSession()
  const [headerLink, setHeaderLink] = useState<HeaderItem[]>([])

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const contactPhone = '+971 4 264 2613'
  const navbarRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      className={`fixed top-0 z-40 py-3.5 w-full transition-all duration-300 ${
        sticky
          ? 'shadow-md shadow-[#FFD54F]/10 bg-[#FFFDF5]/98 backdrop-blur-lg border-b border-[#FFD54F]/30'
          : 'bg-[#FFFDF5]/90 backdrop-blur-md border-b border-[#FFD54F]/20 shadow-xs'
      }`}>
      <div>
        <div className='container flex items-center justify-between'>
          <div>
            <Logo />
          </div>
          <nav className='hidden lg:flex grow items-center gap-4 xl:gap-6 justify-center'>
            {headerLink.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>

          <div className='flex items-center gap-2 lg:gap-4'>
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className='text-sm xl:text-base font-extrabold text-grey-dark hover:text-amber-600 hidden xl:flex items-center whitespace-nowrap mr-2 transition-colors'>
              <Icon
                icon='solar:phone-bold'
                className='text-amber-600 text-2xl inline-block me-1.5'
              />
              {contactPhone}
            </a>

            {status === 'authenticated' ? (
              <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden xl:flex flex-col items-end cursor-pointer group"
                >
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none whitespace-nowrap pb-1">Welcome back</span>
                  <span className="text-sm font-extrabold text-grey-dark flex items-center gap-1 group-hover:text-amber-600 transition-colors whitespace-nowrap">
                    {session?.user?.name || 'Customer'}
                    <Icon icon="solar:alt-arrow-down-bold" className={`text-xs transition-transform duration-300 text-grey-dark ${dropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </span>
                </button>
                
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-[#FFD54F]/20 border border-[#FFD54F]/40 hover:bg-[#FFD54F]/40 text-grey-dark p-2.5 rounded-2xl transition-all duration-300 group cursor-pointer shadow-sm shadow-[#FFD54F]/10"
                  title="Open user profile menu"
                >
                  <Icon icon="solar:user-circle-bold-duotone" className="text-2xl text-grey-dark group-hover:scale-105 transition-transform" />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-[#FFFDF5] rounded-3xl shadow-xl shadow-[#FFD54F]/15 border border-[#FFD54F]/30 overflow-hidden z-50 p-2.5"
                    >
                      <div className="p-3.5 bg-[#FFD54F]/15 rounded-2xl border border-[#FFD54F]/25 mb-2">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Authenticated Account</p>
                        <p className="text-xs font-extrabold text-grey-dark truncate">{session?.user?.name || 'Customer'}</p>
                        <p className="text-[11px] font-medium text-grey-dark/75 truncate mt-0.5">{session.user?.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Link 
                          href="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-grey-dark hover:bg-[#FFD54F]/20 font-bold text-xs transition-all"
                        >
                          <Icon icon="solar:user-bold-duotone" className="text-lg text-amber-600 shrink-0" />
                          <span>My Profile</span>
                        </Link>
                        <Link 
                          href="/my-orders" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-grey-dark hover:bg-[#FFD54F]/20 font-bold text-xs transition-all"
                        >
                          <Icon icon="solar:bag-check-bold-duotone" className="text-lg text-amber-600 shrink-0" />
                          <span>My Orders</span>
                        </Link>
                        
                        <hr className="border-[#FFD54F]/20 my-1.5" />
                        
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs transition-all w-full text-left cursor-pointer"
                        >
                          <Icon icon="solar:logout-2-bold-duotone" className="text-lg shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href='/signin'
                  className='hidden lg:block text-grey-dark duration-300 bg-[#FFD54F]/25 hover:bg-[#FFD54F] border border-[#FFD54F]/40 font-extrabold text-sm xl:text-base py-2 px-4 xl:px-6 rounded-full whitespace-nowrap transition-all'>
                  Sign In
                </Link>
                <Link
                  href='/signup'
                  className='hidden lg:block bg-[#FFD54F] duration-300 text-grey-dark hover:bg-[#F59E0B] font-extrabold text-sm xl:text-base py-2 px-4 xl:px-6 rounded-full whitespace-nowrap shadow-md shadow-[#FFD54F]/30 transition-all'>
                  Sign Up
                </Link>
              </>
            )}

            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-xl bg-[#FFD54F]/20 border border-[#FFD54F]/40 text-grey-dark'
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
              className='p-1.5 rounded-lg text-grey-dark hover:bg-[#FFD54F]/20'>
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
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-xs hover:bg-red-100 transition-all border border-red-200 cursor-pointer"
                  >
                    <Icon icon="solar:logout-2-bold-duotone" className="text-lg" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='/signin'
                    className='bg-[#FFD54F]/25 text-grey-dark font-bold px-4 py-2.5 rounded-xl border border-[#FFD54F]/40 hover:bg-[#FFD54F] text-center transition duration-300 ease-in-out'
                    onClick={() => setNavbarOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href='/signup'
                    className='bg-[#FFD54F] text-grey-dark font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-[#FFD54F]/30 hover:bg-[#F59E0B] text-center transition duration-300 ease-in-out'
                    onClick={() => setNavbarOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
