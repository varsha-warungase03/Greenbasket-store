'use client'
import { ArrowLeft, Eye, EyeIcon, EyeOff, Leaf, Loader2, LockIcon, LogIn, Mail, User } from 'lucide-react'
import React, { useState } from 'react'
import {motion} from "motion/react"
import Image from 'next/image'
import googleImage from "@/assests/google.png"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'




const Login = () => {

    
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [showPassword,setShowPassword]=useState(false);
    const [loading,setLoading]=useState(false);
    const router=useRouter();
    const session=useSession()
    console.log(session);

    const handleLogin=async(e:React.FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        try {
            const res=await signIn("credentials",{
                email,password,redirect:false,
            })
            setLoading(false);
            if (res?.ok) {
                router.replace("/")
              }
           
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }
   
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-linear-to-b from-green-200 to-white'>

        <div className='absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer' >
            
        </div>

        <motion.h1
        initial={{
            y:-10,
            opacity:0
        }}
        animate={{
            y:0,
            opacity:1
        }}
        transition={{
            duration:0.6,
        }}
        className='text-4xl font-extrabold text-green-700 mb-2'
        >
          Welcome Back...
        </motion.h1>
        <p className='text-gray-600 flex items-center'>Login to GrenBasket today <Leaf className='w-6 h-6'/></p>

        <motion.form className='flex flex-col gap-5 w-full max-w-sm mt-10'
        onSubmit={handleLogin}
        initial={{
            opacity:0
        }}
        animate={{
            opacity:1
        }}
        transition={{
            duration:0.6
        }}
        >
        
        
        <div className='relative'>
        <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'/>
        <input type='text' placeholder=' Your Email' className='w-full border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-100' onChange={(e)=>setEmail(e.target.value)} value={email}/>
        </div>
        <div className='relative'>
        <LockIcon className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'/>
        <input type={showPassword ? "text" : "password"} placeholder=' Your Password' className='w-full border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-100' onChange={(e)=>setPassword(e.target.value)} value={password}/>
        {
            showPassword ? <EyeOff className='absolute right-3 top-3.5 h-5 w-5 text-gray-500 cursor-pointer' onClick={()=>setShowPassword(false)}/> :<EyeIcon className='absolute right-3 top-3.5 h-5 w-5 text-gray-500 cursor-pointer' onClick={()=>setShowPassword(true)}/>
        }
        </div>

        {
            (()=>{
                const formValidation =  email !== "" && password!=="";
                return <button disabled={!formValidation || loading} className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${formValidation ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                    {loading ? <Loader2 className='w-5 h-5 animate-spin'/> :"Login" }
                    
                </button>
            })()
        }

        <div className='flex items-center gap-2 text-gray-400 text-sm mt-2'>
            <span className='flex-1 h-px bg-gray-200'></span>
            OR
            
            <span className='flex-1 h-px bg-gray-200'></span>
        </div>

        <div className='w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-100 py-3 rounded-x text-gray-700 font-medium transition-all duration-200' onClick={()=>signIn("google",{callbackUrl:"/"})}>
            <Image src={googleImage} className='h-5 w-12' alt='google'/>Continue with Google
        </div>
       
        </motion.form>

        <p className='text-gray-600 mt-6 text-sm flex items-center gap-1' onClick={()=>router.push("/register")}>Want to create an account  ? <LogIn className='h-4 w-4' /><span className='text-green-700 cursor-pointer'>Sign up</span></p>

    </div>
  )
}

export default Login;