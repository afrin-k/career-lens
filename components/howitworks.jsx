import React from 'react'
import { Card, CardContent } from './ui/card';
import { howItWorks } from '@/data/howItWorks';

const HowItWorks = () => {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 bg-background'>
        <div className='container mx-auto px-4 md:px-6'>
            <div className='text-center max-w-3xl mx-auto mb-12'>
                <h2 className='text-4xl font-bold tracking-tighter text-center mb-2 gradient-title'>
                    How It Works
                </h2>
                <p className='text-muted-foreground'>
                    Four simple steps to accelerate your career growth
                </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-8xl mx-auto'>
                {howItWorks.map((item,index)=>{
                    return(
                        <div key={index} className='flex flex-col items-center text-center space-y-4'>
                            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
                                {item.icon}
                            </div>
                            <h3 className='font-semibold text-xl'>{item.title}</h3>
                            <p className='text-muted-foreground'>{item.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
  )
}

export default HowItWorks