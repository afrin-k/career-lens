import React, { Suspense } from 'react'
import { BarLoader } from "react-spinners";

const Layout = ({children}) => {
  return (
    <div className='px-5'>
      <h1 className='text-6xl font-bold gradient-title mb-5'>
          Interview Preparation
        </h1>
        <Suspense fallback={<BarLoader className='items-center justify-center' width={"100%"} color='gray'/> }>
            {children}
        </Suspense>
    </div>
  )
}

export default Layout