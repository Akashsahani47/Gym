import Footer from '@/components/hompage/footer/page'
import Hero from '@/components/hompage/herosection/hero'
import FeaturesSection from '@/components/hompage/herosection/section5/page'
import Navbar from '@/components/hompage/navbar/navbar'
import WhyDifferent from '@/components/hompage/section3/section3'
import DashboardsSection from '@/components/hompage/section4/page'
import React from 'react'

const page = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <WhyDifferent/>
      <DashboardsSection/>
      <FeaturesSection/>
      <Footer/>
    </div>
  )
}

export default page
