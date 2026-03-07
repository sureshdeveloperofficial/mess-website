'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import axios from 'axios'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useState, useRef, useEffect } from 'react'
import { getFullImageUrl } from '@/utils/image'
import gsap from 'gsap'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    category: { name: string }
}

type FoodPlan = {
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

const PremiumCard = ({ plan, onSelect, index }: { plan: FoodPlan, onSelect: (p: FoodPlan) => void, index: number }) => {
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
            <div className='absolute -top-24 -right-24 w-96 h-96 bg-[#FACB15]/5 rounded-full blur-[100px] group-hover:bg-[#FACB15]/10 transition-colors duration-700'></div>
            <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-[#2D2A26]/5 rounded-full blur-[100px] group-hover:bg-[#FACB15]/5 transition-colors duration-700'></div>

            {/* Content Side */}
            <div className='flex-1 relative z-10 w-full' style={{ transform: "translateZ(50px)" }}>
                <div className='flex items-center gap-4 mb-8'>
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                        className='px-6 py-2 bg-[#FACB15]/10 text-[#FACB15] rounded-full flex items-center gap-2'
                    >
                        <Icon icon='ion:sparkles' className='text-sm' />
                        <span className='text-[10px] font-black uppercase tracking-[0.2em]'>Signature Choice</span>
                    </motion.div>
                </div>

                <h3 className='text-4xl md:text-6xl font-black text-[#2D2A26] capitalize mb-6 tracking-tighter leading-none whitespace-nowrap'>
                    {plan.name.split(' ').map((word, i) => (
                        <span key={i} className={i === 0 ? 'text-[#FACB15]' : 'ml-3'}>
                            {word}
                        </span>
                    ))}
                </h3>

                <p className='text-[#2D2A26]/60 text-xl mb-12 leading-relaxed font-medium italic max-w-xl border-l-4 border-[#FACB15]/20 pl-6'>
                    "{plan.description || "Experience the pinnacle of culinary excellence with our hand-picked selections."}"
                </p>

                {/* Stat Grid */}
                <div className='grid grid-cols-2 gap-8 mb-12'>
                    <div className='space-y-2'>
                        <span className='text-[10px] font-black text-[#2D2A26]/40 uppercase tracking-[0.3em] block'>Varieties</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-[#2D2A26]/5 flex items-center justify-center'>
                                <Icon icon='ion:restaurant-outline' className='text-[#FACB15] text-xl' />
                            </div>
                            <span className='text-2xl font-black text-[#2D2A26]'>{plan.foodItems.length} Dishes</span>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <span className='text-[10px] font-black text-[#2D2A26]/40 uppercase tracking-[0.3em] block'>Experience</span>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-2xl bg-[#2D2A26]/5 flex items-center justify-center'>
                                <Icon icon='ion:star-outline' className='text-[#FACB15] text-xl' />
                            </div>
                            <span className='text-2xl font-black text-[#2D2A26]'>Premium</span>
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-10'>
                    <div className='bg-[#FACB15] text-white px-10 py-5 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(255,122,61,0.3)]'>
                        <span className='text-[10px] font-black uppercase tracking-widest block opacity-70 mb-1'>Starting At</span>
                        <span className='font-black text-4xl'>${plan.price.toFixed(0)}</span>
                    </div>

                    <MagneticButton
                        onClick={() => onSelect(plan)}
                        className='px-12 py-6 bg-[#2D2A26] text-white rounded-[2.5rem] font-black shadow-xl hover:bg-[#FACB15] transition-all flex items-center gap-3 text-lg group overflow-hidden relative'
                    >
                        <span className='relative z-10'>Explore Plan</span>
                        <Icon icon='ion:arrow-forward' className='relative z-10 group-hover:translate-x-2 transition-transform' />
                    </MagneticButton>
                </div>
            </div>

            {/* Auto-Sliding Image Stack Side */}
            <AutoSlidingStack items={plan.foodItems.length > 0 ? plan.foodItems : [
                { id: '1', name: 'Malabar Porata Feast', image: '/images/food/parotta.png', price: 0, category: { name: 'Signature' } },
                { id: '2', name: 'Chef Special Biryani', image: '/images/food/biryani_premium.png', price: 0, category: { name: 'Royal' } },
                { id: '3', name: 'Beef Masala Roast', image: '/images/food/appetizer.png', price: 0, category: { name: 'Classic' } },
                { id: '4', name: 'Sambar & Rice Set', image: '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg', price: 0, category: { name: 'Daily' } },
            ]} />
        </motion.div>
    )
}

const FoodPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState<FoodPlan | null>(null)
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, -200])

    const { data: plans = [], isLoading } = useQuery<FoodPlan[]>({
        queryKey: ['public-food-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-plans')
            return response.data
        },
    })

    useEffect(() => {
        if (!isLoading && plans.length > 0) {
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
    }, [isLoading, plans])

    return (
        <section ref={sectionRef} id='plans' className='pt-16 pb-32 bg-[#FFF9F5] relative overflow-hidden'>
            {/* Background Narrative Elements */}
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
                <Icon icon='ion:restaurant-outline' className='floating-bg-icon absolute top-10 left-[5%] text-9xl text-[#2D2A26]/2 opacity-[0.03]' />
                <Icon icon='ion:wine-outline' className='floating-bg-icon absolute top-1/2 right-[5%] text-[15rem] text-[#FACB15]/5 opacity-[0.03]' />
                <Icon icon='ion:leaf-outline' className='floating-bg-icon absolute bottom-20 left-[15%] text-8xl text-green-500/5 opacity-[0.03]' />
                <Icon icon='ion:cafe-outline' className='floating-bg-icon absolute top-1/4 right-[10%] text-9xl text-[#2D2A26]/2 opacity-[0.03]' />
                <Icon icon='ion:pizza-outline' className='floating-bg-icon absolute top-[60%] left-[8%] text-9xl text-[#FACB15]/5 opacity-[0.03]' />

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
                        className='absolute w-2 h-2 bg-[#FACB15]/20 rounded-full blur-[2px]'
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}

                <div className='absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#FACB15]/2 rounded-full blur-[150px]'></div>
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
                        {plans.map((plan, idx) => (
                            <PremiumCard
                                key={plan.id}
                                plan={plan}
                                index={idx}
                                onSelect={setSelectedPlan}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Details Modal */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 z-1000 flex items-center justify-center p-0 md:p-6 lg:p-10 bg-grey/60 backdrop-blur-2xl'
                        onClick={() => setSelectedPlan(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className='bg-white rounded-t-4xl md:rounded-5xl max-w-7xl w-full h-screen md:h-auto md:max-h-[90vh] overflow-hidden shadow-[0_100px_150px_-30px_rgba(0,0,0,0.4)] flex flex-col border border-white relative'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header - Compact Fixed Part */}
                            <div className='p-6 md:p-10 border-b border-grey/5 relative bg-white/80 backdrop-blur-md z-30'>
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className='absolute top-6 right-6 p-4 bg-grey/5 hover:bg-primary hover:text-white rounded-full transition-all group z-40'
                                >
                                    <Icon icon='ion:close' className='text-2xl transition-transform group-hover:rotate-90' />
                                </button>

                                <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 pr-14'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <span className='px-4 py-1.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-1.5'>
                                                <Icon icon='ion:star' className='text-xs animate-pulse' />
                                                Chef's Selection
                                            </span>
                                        </div>
                                        <h4 className='text-4xl md:text-6xl font-black text-grey capitalize tracking-tighter leading-none mb-3'>
                                            {selectedPlan.name}
                                        </h4>
                                        <p className='text-grey/40 max-w-xl text-base leading-relaxed font-medium italic border-l-4 border-primary/20 pl-4'>
                                            "{selectedPlan.description || "A masterfully crafted selection for the discerning palette."}"
                                        </p>
                                    </div>
                                    <div className='bg-grey text-white px-8 py-5 rounded-4xl text-center shadow-xl relative overflow-hidden group min-w-[180px]'>
                                        <div className='absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                        <div className='relative z-10'>
                                            <p className='text-[8px] font-black uppercase tracking-[0.4em] mb-1 opacity-50'>Package Price</p>
                                            <p className='text-4xl md:text-5xl font-black tracking-tighter'>${selectedPlan.price.toFixed(0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body - Optimized Horizontal Items List */}
                            <div className='flex-1 overflow-y-auto px-4 md:px-10 py-8 bg-[#fafafa] custom-scrollbar modal-items-container'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
                                    {selectedPlan.foodItems.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className='food-item-card bg-white p-3 md:p-4 rounded-4xl border border-white shadow-[0_5px_15px_-5px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex items-center gap-4 md:gap-6'
                                        >
                                            {/* Compact Image */}
                                            <div className='relative w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-3xl overflow-hidden shadow-inner'>
                                                <Image
                                                    src={getFullImageUrl(item.image) || PREMIUM_IMAGES[idx % PREMIUM_IMAGES.length]}
                                                    alt={item.name}
                                                    fill
                                                    className='object-cover group-hover:scale-110 transition-transform duration-700'
                                                />
                                            </div>

                                            {/* Balanced Content */}
                                            <div className='flex-1 min-w-0 pr-2'>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    <span className='px-2.5 py-0.5 bg-grey/5 text-grey text-[7px] font-black uppercase tracking-widest rounded-full'>
                                                        {item.category.name}
                                                    </span>
                                                </div>
                                                <h5 className='font-black text-grey text-lg md:text-xl capitalize tracking-tight group-hover:text-primary transition-colors truncate'>
                                                    {item.name}
                                                </h5>
                                                <p className='text-[8px] text-grey/30 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1'>
                                                    <Icon icon='ion:checkmark-circle' className='text-primary opacity-50' />
                                                    Chef Recommended
                                                </p>
                                            </div>

                                            {/* Minimalist Action */}
                                            <div className='w-10 h-10 rounded-full bg-grey/5 flex items-center justify-center text-grey opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all transform scale-90 group-hover:scale-100 md:mr-2'>
                                                <Icon icon='ion:chevron-forward' className='text-lg' />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <GSAPModalStagger />
                            </div>

                            {/* Modal Footer - Compact Action Bar */}
                            <div className='p-6 md:p-8 bg-white/90 backdrop-blur-md border-t border-grey/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-30'>
                                <div className='flex items-center gap-6'>
                                    <div className='hidden sm:flex items-center gap-3'>
                                        <div className='flex -space-x-3'>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className='w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-grey/5'>
                                                    <Image src={PREMIUM_IMAGES[i % PREMIUM_IMAGES.length]} alt='Chef' width={40} height={40} className='object-cover' />
                                                </div>
                                            ))}
                                        </div>
                                        <p className='text-xs font-bold text-grey/60 tracking-tight'>
                                            <span className='text-grey font-black'>12k+</span> Diners Happy
                                        </p>
                                    </div>

                                    <div className='h-8 w-px bg-grey/10 hidden sm:block'></div>

                                    <div className='flex items-center gap-3'>
                                        <Icon icon='ion:shield-checkmark' className='text-green-500 text-xl' />
                                        <p className='text-[8px] font-black text-grey/40 uppercase tracking-widest'>Secure & Verified</p>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='w-full md:w-auto px-12 py-5 bg-primary text-white rounded-4xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(255,107,74,0.3)] hover:bg-grey transition-all flex items-center justify-center gap-4 relative overflow-hidden'
                                >
                                    <span>Confirm Selection</span>
                                    <Icon icon='ion:arrow-forward' className='text-xl' />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

const GSAPModalStagger = () => {
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".food-item-card", {
                y: 40,
                opacity: 0,
                scale: 0.95,
                duration: 0.6,
                stagger: {
                    each: 0.04,
                    from: "start"
                },
                ease: "power2.out",
                clearProps: "all"
            })
        }, ".modal-items-container")
        return () => ctx.revert()
    }, [])
    return null
}

export default FoodPlans
