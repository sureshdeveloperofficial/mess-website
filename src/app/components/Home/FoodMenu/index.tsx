'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useState, useRef, useEffect } from 'react'
import { getFullImageUrl } from '@/utils/image'
import gsap from 'gsap'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    monthlyPrice?: number | null
    category: { name: string }
}

type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    foodItems: FoodItem[]
}

const PREMIUM_IMAGES = [
    '/images/food/biryani_premium.png',
    '/images/food/parotta.png',
    '/images/food/appetizer.png',
    '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 150, damping: 15 })
    const springY = useSpring(y, { stiffness: 150, damping: 15 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!buttonRef.current) return
        const { clientX, clientY } = e
        const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2
        const distanceX = clientX - centerX
        const distanceY = clientY - centerY
        x.set(distanceX * 0.3)
        y.set(distanceY * 0.3)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            onClick={onClick}
            className={className}
        >
            {children}
        </motion.button>
    )
}

const AutoSlidingStack = ({ items }: { items: FoodItem[] }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (items.length <= 1) return
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [items.length])

    const nextIndex = (index + 1) % items.length
    const prevIndex = (index - 1 + items.length) % items.length

    const visibleItems = items.length >= 3
        ? [items[prevIndex], items[index], items[nextIndex]]
        : items.length === 2
            ? [items[index], items[nextIndex]]
            : [items[index]]

    return (
        <div className='flex-1 relative h-80 md:h-[500px] w-full flex items-center justify-center perspective-1000'>
            <AnimatePresence mode='popLayout'>
                {visibleItems.map((item, i) => {
                    const isCenter = items.length >= 3 ? i === 1 : i === 0
                    const isLeft = items.length >= 3 ? i === 0 : false
                    const isRight = items.length >= 3 ? i === 2 : i === 1

                    return (
                        <motion.div
                            key={`${item.id}-${i}`}
                            layout
                            initial={{
                                opacity: 0,
                                scale: 0.8,
                                x: isLeft ? -150 : isRight ? 150 : 0,
                                rotate: isLeft ? -30 : isRight ? 30 : 0,
                            }}
                            animate={{
                                opacity: 1,
                                scale: isCenter ? 1.1 : 0.85,
                                x: isLeft ? -80 : isRight ? 80 : 0,
                                rotate: isLeft ? -15 : isRight ? 15 : 0,
                                zIndex: isCenter ? 30 : 10,
                                filter: isCenter ? "blur(0px)" : "blur(2px)",
                                y: isCenter ? -20 : 0
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.5,
                                x: isLeft ? -200 : isRight ? 200 : 0,
                                filter: "blur(10px)"
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25,
                                opacity: { duration: 0.5 }
                            }}
                            className='absolute w-56 h-56 md:w-72 md:h-72 rounded-[3.5rem] overflow-hidden border-12 border-white shadow-[0_30px_60px_-15px_rgba(45,42,38,0.2)] cursor-pointer will-change-transform'
                        >
                            <Image
                                src={getFullImageUrl(item.image) || PREMIUM_IMAGES[index % PREMIUM_IMAGES.length]}
                                alt={item.name}
                                fill
                                className='object-cover scale-110 hover:scale-125 transition-transform duration-700'
                            />
                            {isCenter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='absolute bottom-4 left-0 right-0 text-center'
                                >
                                    <span className='px-4 py-1.5 bg-[#2D2A26]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full'>
                                        {item.name}
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

const PremiumCard = ({ menu, index }: { menu: FoodMenu, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return
        const { left, top, width, height } = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - left) / width - 0.5
        const y = (e.clientY - top) / height - 0.5
        mouseX.set(x)
        mouseY.set(y)
    }

    const handleMouseLeave = () => {
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className='group bg-white/40 backdrop-blur-2xl rounded-[5rem] p-10 md:p-20 shadow-[0_50px_100px_-20px_rgba(45,42,38,0.05)] border border-white/40 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden will-change-transform'
        >
            {/* Ambient Background Glow */}
            <div className='absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors duration-700'></div>
            <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-[#2D2A26]/5 rounded-full blur-[100px] group-hover:bg-primary/5 transition-colors duration-700'></div>

            {/* Content Side */}
            <div className='flex-1 relative z-10 w-full' style={{ transform: "translateZ(50px)" }}>
                <div className='flex items-center gap-4 mb-8'>
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                        className='px-6 py-2 bg-primary/10 text-primary rounded-full flex items-center gap-2'
                    >
                        <Icon icon='ion:sparkles' className='text-sm' />
                        <span className='text-[10px] font-black uppercase tracking-[0.2em]'>Signature Choice</span>
                    </motion.div>
                </div>

                <h3 className='text-4xl md:text-6xl font-black text-[#2D2A26] capitalize mb-6 tracking-tighter leading-none whitespace-nowrap'>
                    {menu.name.split(' ').map((word, i) => (
                        <span key={i} className={i === 0 ? 'text-primary' : 'ml-3'}>
                            {word}
                        </span>
                    ))}
                </h3>

                <p className='text-[#2D2A26]/60 text-xl mb-12 leading-relaxed font-medium italic max-w-xl border-l-4 border-primary/20 pl-6'>
                    "{menu.description || "Experience the pinnacle of culinary excellence with our hand-picked selections."}"
                </p>

                {/* Stat Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-12 pt-10 border-t border-[#2D2A26]/5'>
                    <div className='px-6 py-4 rounded-[2rem] bg-[#2D2A26]/5 border border-transparent hover:border-primary/20 transition-all'>
                        <span className='text-[10px] font-black text-[#2D2A26]/40 uppercase tracking-[0.3em] block mb-2'>Dishes</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-[#2D2A26]/10 flex items-center justify-center'>
                                <Icon icon='ion:restaurant-outline' className='text-primary text-xl' />
                            </div>
                            <span className='text-2xl font-black text-[#2D2A26]'>{menu.foodItems.length} Variety</span>
                        </div>
                    </div>

                    <div className='px-6 py-4 rounded-[2rem] bg-primary/10 border border-primary/20 hover:scale-105 transition-all'>
                        <span className='text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] block mb-2'>Monthly Hub</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20'>
                                <Icon icon='ion:calendar-outline' className='text-xl' />
                            </div>
                            <span className='text-3xl font-black text-grey tracking-tighter'>AED {menu.price.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className='px-6 py-4 rounded-[2rem] bg-[#2D2A26]/5 border border-transparent'>
                        <span className='text-[10px] font-black text-[#2D2A26]/40 uppercase tracking-[0.3em] block mb-2'>Effective Day</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center'>
                                <Icon icon='ion:flash' className='text-green-600 text-xl' />
                            </div>
                            <span className='text-2xl font-black text-[#2D2A26]'>AED {(menu.price / 30).toFixed(0)}</span>
                        </div>
                    </div>

                    <div className='px-6 py-4 rounded-[2rem] bg-[#2D2A26]/5 border border-transparent'>
                        <span className='text-[10px] font-black text-[#2D2A26]/40 uppercase tracking-[0.3em] block mb-2'>Benefit</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-[#2D2A26]/10 flex items-center justify-center'>
                                <Icon icon='ion:wallet-outline' className='text-primary text-xl' />
                            </div>
                            <span className='text-2xl font-black text-[#2D2A26]'>-40%</span>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-10 mt-10'>
                    <Link href={`/menu/${menu.id}`}>
                        <MagneticButton
                            onClick={() => { }}
                            className='px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black shadow-xl hover:bg-grey transition-all flex items-center gap-3 text-lg group overflow-hidden relative'
                        >
                            <span className='relative z-10'>Explore Monthly Menu</span>
                            <Icon icon='ion:arrow-forward' className='relative z-10 group-hover:translate-x-2 transition-transform' />
                        </MagneticButton>
                    </Link>
                </div>
            </div>

            <AutoSlidingStack items={menu.foodItems.length > 0 ? menu.foodItems : [
                { id: '1', name: 'Malabar Porata Feast', image: '/images/food/parotta.png', price: 0, category: { name: 'Signature' } },
                { id: '2', name: 'Chef Special Biryani', image: '/images/food/biryani_premium.png', price: 0, category: { name: 'Royal' } },
                { id: '3', name: 'Beef Masala Roast', image: '/images/food/appetizer.png', price: 0, category: { name: 'Classic' } },
                { id: '4', name: 'Sambar & Rice Set', image: '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg', price: 0, category: { name: 'Daily' } },
            ]} />
        </motion.div >
    )
}

const FoodMenu = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, -200])

    const { data: menus = [], isLoading } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-menu'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu')
            return response.data
        },
    })

    useEffect(() => {
        if (!isLoading && menus.length > 0) {
            // Use requestAnimationFrame for smoother initial setup
            const t = setTimeout(() => {
                gsap.to(".floating-bg-icon", {
                    y: "random(-50, 50)",
                    x: "random(-30, 30)",
                    rotation: "random(-20, 20)",
                    duration: "random(15, 25)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    stagger: 0.2
                })
            }, 100)
            return () => clearTimeout(t)
        }
    }, [isLoading, menus])

    return (
        <section ref={sectionRef} id='menu' className='pt-16 pb-32 bg-[#FFF9F5] relative overflow-hidden'>
            {/* Background Narrative Elements */}
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
                <Icon icon='ion:restaurant-outline' className='floating-bg-icon absolute top-10 left-[5%] text-9xl text-[#2D2A26]/2 opacity-[0.03]' />
                <Icon icon='ion:wine-outline' className='floating-bg-icon absolute top-1/2 right-[5%] text-[15rem] text-primary/5 opacity-[0.03]' />
                <Icon icon='ion:leaf-outline' className='floating-bg-icon absolute bottom-20 left-[15%] text-8xl text-green-500/5 opacity-[0.03]' />
                <Icon icon='ion:cafe-outline' className='floating-bg-icon absolute top-1/4 right-[10%] text-9xl text-[#2D2A26]/2 opacity-[0.03]' />
                <Icon icon='ion:pizza-outline' className='floating-bg-icon absolute top-[60%] left-[8%] text-9xl text-primary/5 opacity-[0.03]' />

                {/* Decorative drifting particles/sparkles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        className='absolute w-2 h-2 bg-primary/20 rounded-full blur-[2px]'
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}

                <div className='absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[150px]'></div>
                <div className='absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-[#2D2A26]/2 rounded-full blur-[180px]'></div>
            </div>

            <div className='max-w-[1400px] relative z-10 mx-auto px-4'>
                {/* Header section removed as it's redundant on the plans page */}

                {isLoading ? (
                    <div className='flex flex-col gap-24'>
                        {[1, 2].map((i) => (
                            <div key={i} className='h-[600px] bg-white/50 rounded-[5rem] animate-pulse shadow-sm border border-grey/5'></div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col gap-32 px-4'>
                        {menus.map((menu, idx) => (
                            <PremiumCard
                                key={menu.id}
                                menu={menu}
                                index={idx}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default FoodMenu
