import React from 'react'
import { testimonialsData, assets } from '../assets/assets'          // Assuming testimonialsData is an array of testimonial objects with name, image, and text from assets.js
import { motion } from "framer-motion"

function Testimonials() {
  return (
    <motion.div
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}} 
    className='flex flex-col items-center justify-center my-20 py-12'> 
    <h1 className='text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-center px-4'>
        Customer Testimonials
    </h1>
    <p className='text-gray-500 mb-8 sm:mb-12 text-center px-4 text-sm sm:text-base'>
        What our users are saying about us
    </p>

    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4'>
        {testimonialsData.map((testimonial, index)=>(
            <div key={index} className='bg-white/20 p-6 sm:p-8 lg:p-12 rounded-lg shadow-md w-full max-w-sm mx-auto cursor-pointer hover:scale-[1.02] transition-all'>
                <div className='flex flex-col items-center'>
                    <img src={testimonial.image} alt="" className='rounded-full w-12 sm:w-14 mb-3'/>
                    <h2 className='text-lg sm:text-xl font-semibold mb-1'>{testimonial.name}</h2>
                    <p className='text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base'>{testimonial.role}</p>
                    <div className='flex mb-3 sm:mb-4 gap-1'>
                        {Array(testimonial.stars).fill().map((item,index)=>(
                            <img key={index} src={assets.rating_star} alt='' className='w-4 h-4 sm:w-5 sm:h-5'/>
                        ))}
                    </div>
                    <p className='text-center text-xs sm:text-sm text-gray-600 leading-relaxed'>{testimonial.text}</p>
                </div>
            </div>
        ))}
    </div>

    </motion.div>   // Copied the Classname from Description.jsx and modified the content
  )
}

export default Testimonials