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
      className={`fixed top-0 z-40 py-4 w-full transition-all duration-300 ${
        sticky ? 'shadow-lg bg-white' : 'shadow-none'
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
            <Link
              href='#'
              className='text-sm xl:text-base font-bold hover:text-primary hidden xl:flex items-center whitespace-nowrap mr-2'>
              <Icon
                icon='solar:phone-bold'
                className='text-primary text-2xl inline-block me-1'
              />
              +971 4 264 2613
            </Link>

            {status === 'authenticated' ? (
              <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden xl:flex flex-col items-end cursor-pointer group"
                >
                  <span className="text-[10px] font-black text-grey/40 uppercase tracking-[0.2em] leading-none group-hover:text-primary transition-colors whitespace-nowrap pb-1">Welcome back</span>
                  <span className="text-sm font-black text-grey uppercase tracking-tight flex items-center gap-1 group-hover:text-primary transition-colors whitespace-nowrap">
                    {session?.user?.name || 'User'}
                    <Icon icon="solar:alt-arrow-down-bold" className={`text-xs transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-grey/5 hover:bg-primary/10 text-grey/40 hover:text-primary p-2.5 rounded-full transition-all duration-300 group"
                >
                  <Icon icon="solar:user-circle-bold-duotone" className="text-2xl group-hover:scale-110 transition-transform" />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-64 bg-white rounded-4xl shadow-2xl border border-grey/5 overflow-hidden z-50 p-2"
                    >
                      <div className="p-4 border-b border-grey/5 mb-2">
                        <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest mb-1">Authenticated Account</p>
                        <p className="text-sm font-black text-grey uppercase tracking-tight truncate">{session.user?.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Link 
                          href="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-grey/60 hover:bg-primary/10 hover:text-primary transition-all font-bold text-sm"
                        >
                          <Icon icon="solar:user-bold-duotone" className="text-xl" />
                          My Profile
                        </Link>
                        <Link 
                          href="/my-orders" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-grey/60 hover:bg-primary/10 hover:text-primary transition-all font-bold text-sm"
                        >
                          <Icon icon="solar:box-bold-duotone" className="text-xl" />
                          My Subscriptions
                        </Link>
                        
                        <hr className="border-grey/5 my-2" />
                        
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-sm w-full text-left"
                        >
                          <Icon icon="solar:logout-3-bold-duotone" className="text-xl" />
                          Sign Out
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
                  className='hidden lg:block text-primary duration-300 bg-primary/15 hover:text-white hover:bg-primary font-bold text-sm xl:text-base py-2 px-4 xl:px-6 rounded-full whitespace-nowrap'>
                  Sign In
                </Link>
                <Link
                  href='/signup'
                  className='hidden lg:block bg-primary duration-300 text-white hover:bg-primary/15 hover:text-primary font-bold text-sm xl:text-base py-2 px-4 xl:px-6 rounded-full whitespace-nowrap'>
                  Sign Up
                </Link>
              </>
            )}

            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-lg'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-black'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
            </button>
          </div>
        </div>

        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )}

        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50`}>
          <div className='flex items-center justify-between gap-2 p-4'>
            <div>
              <Logo />
            </div>
            <button
              onClick={() => setNavbarOpen(false)}
              className="hover:cursor-pointer"
              aria-label='Close menu Modal'>
              <Icon
                icon='material-symbols:close-rounded'
                width={24}
                height={24}
                className='text-black hover:text-primary text-24 inline-block me-2'
              />
            </button>
          </div>
          <Link
            href='#'
            className='text-lg font-medium hover:text-primary block md:hidden mt-6 p-4'>
            <Icon
              icon='solar:phone-bold'
              className='text-primary text-3xl lg:text-2xl inline-block me-2'
            />
            +971 4 264 2613
          </Link>
          <nav className='flex flex-col items-start p-4'>
            {headerLink.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            <div className='mt-4 flex flex-col space-y-4 w-full'>
              {status === 'authenticated' ? (
                <>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-lg font-black text-grey uppercase">{session?.user?.name}</p>
                    <p className="text-xs font-bold text-grey/40 truncate">{session?.user?.email}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 w-full">
                    <Link 
                      href="/profile" 
                      onClick={() => setNavbarOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-grey/5 text-grey font-black uppercase tracking-widest text-xs hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Icon icon="solar:user-bold-duotone" className="text-xl" />
                      Edit Profile
                    </Link>
                    <Link 
                      href="/my-orders" 
                      onClick={() => setNavbarOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-grey/5 text-grey font-black uppercase tracking-widest text-xs hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Icon icon="solar:box-bold-duotone" className="text-xl" />
                      My Subscriptions
                    </Link>
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  >
                    <Icon icon="solar:logout-3-bold" className="text-xl" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='/signin'
                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent text-center transition duration-300 ease-in-out'
                    onClick={() => setNavbarOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href='/signup'
                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent text-center transition duration-300 ease-in-out'
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
