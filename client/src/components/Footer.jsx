import React from 'react'
import { assets } from '../assets/assets'

function Footer() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 items-center py-3 mt-20 w-full'>
      {/* Left: Logo and copyright */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <img src={assets.logo_icon} alt="MindSketch" className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0' />
          <span className='text-base sm:text-lg font-semibold text-gray-800 whitespace-nowrap'>MindSketch</span>
        </div>
        <p className='border-l-0 sm:border-l border-gray-400 pl-0 sm:pl-4 text-gray-500 text-xs sm:text-sm'>
          Copyright @MindSketch | All rights reserved.
        </p>
      </div>

      {/* Center: Made with love */}
      <div className='flex justify-center order-3 sm:order-2'>
        <p className='text-gray-500 text-xs sm:text-sm text-center'>
          Made with <span className='text-red-500'>❤️</span> by Aaditya
        </p>
      </div>

      {/* Right: Social icons */}
      <div className='flex justify-center sm:justify-end gap-2 sm:gap-2.5 order-2 sm:order-3'>
        <button className='border border-gray-300 hover:border-gray-400 rounded-full p-1.5 sm:p-2 transition-colors'>
          <img src={assets.facebook_icon} alt="Facebook" className='w-6 h-6 sm:w-8 sm:h-8' />
        </button>
        <button className='border border-gray-300 hover:border-gray-400 rounded-full p-1.5 sm:p-2 transition-colors'>
          <img src={assets.instagram_icon} alt="Instagram" className='w-6 h-6 sm:w-8 sm:h-8' />
        </button>
        <button className='border border-gray-300 hover:border-gray-400 rounded-full p-1.5 sm:p-2 transition-colors'>
          <img src={assets.twitter_icon} alt="Twitter" className='w-6 h-6 sm:w-8 sm:h-8' />
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