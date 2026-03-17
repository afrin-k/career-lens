import { faqs } from '@/data/faqs'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

const FAQSection = () => {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 bg-background'>
        <div className='container mx-auto px-4 md:px-6'>
            <div className='text-center max-w-3xl mx-auto mb-12'>
                <h2 className='text-4xl font-bold tracking-tighter text-center mb-2 gradient-title'>
                    Frequently Asked Questions
                </h2>
                <p className='text-muted-foreground'>
                    Find answers to common questions about our platform
                </p>
            </div>
            <div className='max-w-6xl md:max-w-4xl mx-auto'>
                <Accordion type="single" collapsible defaultValue="item-1" className='w-full'>
                    {faqs.map((item,index)=>{
                        return (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="hover:no-underline cursor-pointer">{item.question}</AccordionTrigger>
                                <AccordionContent>{item.answer}</AccordionContent>
                            </AccordionItem>)
                    })}
                </Accordion>
            </div>
        </div>
    </section>
  )
}

export default FAQSection