import React from 'react'
import DeliveryboyDashboard from './DeliveryboyDashboard'
import { auth } from '@/auth'
import connectDb from '@/config/db'
import Order from '@/models/order.model'

const DeliveryBoy = async() => {
  await connectDb()
  const session=await auth()
  const deliveryBoyId=session?.user?.id

const orders=await Order.find({
assignedDeliveryBoy:deliveryBoyId,
deliveryOtpVerify:true
})

const today=new Date().toDateString()
const todayOrders=orders.filter((o)=>new Date(o.deliveredAt).toDateString() === today).length

const todaysEarning=todayOrders * 40



  return (
    
    <DeliveryboyDashboard earning={todaysEarning}/>
    
  )
}

export default DeliveryBoy