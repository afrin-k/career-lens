import React from 'react'
import { testimonial } from '@/data/testimonial';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';

const Testimonials = () => {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 bg-muted/50'>
        <div className='container mx-auto px-4 md:px-6'>
            <h2 className='text-4xl font-bold tracking-tighter text-center mb-12 gradient-title'>
                What Our Users Say
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-6xl md:max-w-8xl mx-auto'>
                {testimonial.map((item,index)=>{
                    return (
                        <Card key={index} className='bg-background'>
                          <CardContent className='pt-6'>
                            <div className='flex flex-col space-y-4'>
                                <div className='flex items-center space-x-4'>
                                    <div className='relative h-12 w-12 shrink-0'>
                                        <Image src={item.image} alt={item.author} width={40} height={40} className='rounded-full object-cover border-2 border-primary/20'/>
                                    </div>
                                    <div>
                                        <p className='font-semibold'>{item.author}</p>
                                        <p className='text-sm text-muted-foreground'>{item.role}</p>
                                        <p className='text-sm text-primary'>{item.company}</p>
                                    </div>
                                </div>
                                <blockquote className='mt-2'>
                                    <p className='text-muted-foreground italic relative'>
                                        <span className='text-3xl text-primary absolute -top-4 -left-2'>
                                            &quot;
                                        </span>
                                        {item.quote}
                                        <span className='text-3xl text-primary absolute -bottom-4'>
                                            &quot;
                                        </span>
                                    </p>
                                </blockquote>
                            </div>
                          </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    </section>
  )
}

export default Testimonials