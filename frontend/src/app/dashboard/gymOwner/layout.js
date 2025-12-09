import GymSidebar from '@/components/GymDashboard/GymSidebar/GymSidebar'
import React from 'react'

const layout = ({children}) => {
  return (
    <div>
      <GymSidebar/>
   {children}
    </div>
  )
}

export default layout
