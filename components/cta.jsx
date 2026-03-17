import { faqs } from '@/data/faqs'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

const CTASection = () => {
  return (
    <section className='w-full'>
        <div className='mx-auto py-24 gradient rounded-lg'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto'>
                <h2 className='text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl mb-4'>
                    Ready to Accelerate Your Career?
                </h2>
                <p className='mx-auto max-w-150 text-primary-foreground/80 md:text-xl'>
                    Join thousands of professionals who are advancing their career with AI-powered guidance.
                </p>
                <Link href="/dashboard" passHref>
                    <Button size="lg" variant="secondary" className="h-11 mt-5 animate-bounce">
                        Start Your Journey Today <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                </Link>
            </div>
        
        </div>
    </section>
  )
}

export default CTASection