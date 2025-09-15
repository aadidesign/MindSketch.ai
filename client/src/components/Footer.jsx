import React from 'react'
import { assets } from '../assets/assets'

function Footer() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center py-4 sm:py-6 mt-16 sm:mt-20 w-full px-4 max-w-7xl mx-auto'>
      {/* Left: Logo and copyright */}
      <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-4 text-center md:text-left order-1'>
        <div className='flex items-center justify-center md:justify-start gap-2 sm:gap-3'>
          <img src={assets.logo_icon} alt="MindSketch" className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0' />
          <span className='text-sm sm:text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap'>MindSketch</span>
        </div>
        <p className='border-l-0 md:border-l border-gray-400 pl-0 md:pl-4 text-gray-500 text-xs sm:text-sm text-center md:text-left'>
          Copyright @MindSketch | All rights reserved.
        </p>
      </div>

      {/* Center: Made with love */}
      <div className='flex justify-center order-3 md:order-2'>
        <p className='text-gray-500 text-xs sm:text-sm text-center'>
          Made with <span className='text-red-500'>❤️</span> by Aaditya
        </p>
      </div>

      {/* Right: Social icons */}
      <div className='flex justify-center md:justify-end gap-3 sm:gap-4 order-2 md:order-3'>
        <button className=' hover:border-gray-400 hover:bg-gray-50 rounded-full p-2 sm:p-2.5 transition-all duration-200'>
          <img src={assets.facebook_icon} alt="Facebook" className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
        </button>
        <button className=' hover:bg-gray-50 rounded-full p-2 sm:p-2.5 transition-all duration-200'>
          <img src={assets.instagram_icon} alt="Instagram" className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
        </button>
        <button className=' hover:bg-gray-50 rounded-full p-2 sm:p-2.5 transition-all duration-200'>
          <img src={assets.twitter_icon} alt="Twitter" className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
        </button>
      </div>
    </div>
  )
}

export default Footer




// import React from 'react'
// import { assets } from '../assets/assets'

// function Footer() {
//   return (
//     <div className='flex items-center justify-between gap-4 py-3 mt-20 grid grid-cols-4'>

//         <img src={assets.logo} alt="" width={150} />
//         <p className='flex-1 border-1 border-gray-400 pl-4 text-400 text-gray-500 max-sm:hidden'>Copyright @Aadi.designer | All rights reserved.</p>
//          <div className='flex justify-center'>
//         <p className='text-gray-500 text-sm'>
//           Made with <span className='text-red-500'>❤️</span> by Aadi
//         </p>
//       </div>
        

//         <div className='flex gap-2.5'>
//             <img src={assets.facebook_icon} alt="" width={35} />
//             <img src={assets.instagram_icon} alt="" width={35} />
//             <img src={assets.twitter_icon} alt="" width={35} />
//         </div>

//     </div>
//   )
// }

// export default Footer