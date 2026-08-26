'use client'
import { useState } from 'react'
import Link from 'next/link'
import { HeaderItem } from '../../../../types/menu'
import { usePathname } from 'next/navigation'

const HeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const path = usePathname()
  const handleMouseEnter = () => {
    if (item.submenu) {
      setSubmenuOpen(true)
    }
  }
  const handleMouseLeave = () => {
    setSubmenuOpen(false)
  }

  console.log(path)

  return (
    <div
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <Link
        href={item.href}
        className={`text-sm xl:text-base flex items-center font-extrabold whitespace-nowrap transition-colors duration-300 ${
          path === item.href
            ? 'text-amber-600'
            : 'text-grey-dark/80 hover:text-amber-600'
        }`}>
        {item.label}
        {item.submenu && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1.2em'
            height='1.2em'
            className='ms-1'
            viewBox='0 0 24 24'>
            <path
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='m7 10l5 5l5-5'
            />
          </svg>
        )}
      </Link>
      {submenuOpen && (
        <div
          className={`absolute py-2 left-0 mt-1.5 w-60 bg-[#FFFDF5] border border-[#FFD54F]/30 shadow-xl shadow-[#FFD54F]/10 rounded-2xl overflow-hidden`}
          data-aos='fade-up'
          data-aos-duration='300'>
          {item.submenu?.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className={`block px-4 py-2.5 text-xs font-bold transition-colors ${
                path === subItem.href
                  ? 'bg-[#FFD54F] text-grey-dark'
                  : 'text-grey-dark hover:bg-[#FFD54F]/20 hover:text-amber-700'
              }`}>
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderLink
