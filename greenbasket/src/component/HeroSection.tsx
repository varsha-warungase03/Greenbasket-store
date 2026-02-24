'use client'
import { Leaf, ShoppingBasket, Smartphone, Truck } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'


const HeroSection = () => {
  

    const slides = [
        {
            id: 1,
            icon: <Leaf className='w-20 h-20 sm:h-28 text-green-400 drop-shadow-lg' />,
            title: "Fresh organic groceries",
            subtitle: "Farm-fresh fruits,vegetables,and daily essentials deliverd to you",
            btnText: "shop Now",
            bg: "https://images.unsplash.com/photo-1683688684067-b87a189c7503?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dv"
        },
        {
            id: 2,
            icon: <Truck className='w-20 h-20 sm:h-28 text-green-400 drop-shadow-lg' />,
            title: "Fast & Reliable Delivery..",
            subtitle: "We ensure your groceries reach your doorstep in no time",
            btnText: "Order Now",
            bg: "https://images.unsplash.com/photo-1762350988406-d793b530c44c?q=80&w=913&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 3,
            icon: <Smartphone className='w-20 h-20 sm:h-28 text-green-400 drop-shadow-lg' />,
            title: "Shop Anyttime,Anywhere ",
            subtitle: "Easy and seamless online grocery shopping experience",
            btnText: "Get Started Now..",
            bg: "https://images.unsplash.com/photo-1550497507-634bd6d81ecd?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    ]

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % (slides.length))
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    const slide = slides[current]

    return (
        <div className='relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl '>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    exit={{ opacity: 0 }}
                    className='absolute inset-0'
                >
                    <Image src={slide.bg} fill alt='slide' priority className='object-cover' />

                    <div className='absolute inset-0  bg-black/70 backdrop-blur-[1px]' />



                </motion.div>
            </AnimatePresence>
            <div className='absolute inset-0 flex items-center justify-center text-center text-white px-6'>
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className='flex flex-col items-center justify-center gap-6 max-w-3xl'
                >
                    <div className='bg-white/20 backdrop-blur-md p-6 rounded-full shadow-lg'>{slide.icon}</div>
                    <h1 className='text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg'>{slide.title}</h1>
                    <p className='text-lg sm:text-xl text-gray-200 max-w-2xl'>{slide.subtitle}</p>
                    <motion.button
                        whileHover={{ scale: 1.09 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2 }}

                        className='mt-4 bg-white text-green-700 hover:bg-green-100 px-14 py-4 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2'>
                        <ShoppingBasket className='w-5 h-5' />
                        {slide.btnText}
                    </motion.button>
                </motion.div>
            </div>

            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'>
            {slides.map((_,index)=>(
                <button 
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${index===current ? "bg-white w-6" :"bg-white/50"}`}/>
            ))}
            </div>
        </div>
    )
}

export default HeroSection