import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation';
import React from 'react'
import OnboardingForm from './_components/onboarding-form';
import { industries } from '@/data/industries';

const OnboardingPage = async() => {
    // checking if the user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();
  
  if (isOnboarded){
    redirect("/dashboard");
  }
  
  return (
    <main>
        <OnboardingForm industries={industries}/>
    </main>
  )
}

export default OnboardingPage

// the reason why we are creating a separate onboardingform component is that it will be a client component 
// and this will be a server component, which means we will be having an api call from here 
// so keeping it as a server component instead of converting it to a client component will keep this page much more faster