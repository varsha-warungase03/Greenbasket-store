'use client'
import { getSocket } from '@/config/socket'
import { RootState } from '@/redux/store'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Livemap from './Livemap'
import Deliverychat from './Deliverychat'
import { Loader } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ILocation {
  latitude: number,
  longitude: number
}

const DeliveryboyDashboard = ({earning}:{earning:number}) => {
  const [assignments, setAssignments] = useState<any[]>([])
  const { userData } = useSelector((state: RootState) => state.user)
  const [activeOrder, setActiveorder] = useState<any>(null)
  const [userLocation, setUserlocation] = useState<ILocation>({ latitude: 0, longitude: 0 })
  const [deliveryBoyLocation, setDeliveryboylocation] = useState<ILocation>({ latitude: 0, longitude: 0 })
  const [otpError,setOtperror]=useState("")
  const [sendOtploading,setSendotploading]=useState(false)
  const [verifyOtploading,setVerifyotploading]=useState(false)
  const [showOtp, setShowotp] = useState(false)
  const [otp, setOtp] = useState("")


  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get_assignments")
      setAssignments(result.data)
      
    } catch (error) {

    }

  }


  const handleAccept = async (id: string) => {
    try {
      const result = await axios.get(`/api/delivery/assignment/${id}/accept_assignment`)
      
      fetchCurrentOrder()
    } catch (error) {
      console.log(error);
    }
  }
  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current_order")
      if (result.data.active) {
        setActiveorder(result.data.assignment)
        setUserlocation({
          latitude: result.data.assignment.order.address.latitude,
          longitude: result.data.assignment.order.address.longitude
        })
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect((): any => {
    const socket = getSocket()
    socket.on("update-delivery-location", ({ userId, location }) => {
      setDeliveryboylocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
      })
    })
    return () => socket.off("update-delivery-location")
  }, [])

  useEffect(() => {
    fetchCurrentOrder()
    fetchAssignments()
  }, [userData])

  useEffect((): any => {
    const socket = getSocket()
    if (!socket) return
    socket.on("new-assignment", (deliveryAssignment) => {
      setAssignments((prev) => [...prev, deliveryAssignment])
    })
    return () => socket.off("new-assignment")
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!userData?._id) return
    if (!navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      setDeliveryboylocation({
        latitude: lat,
        longitude: lon
      })
      socket.emit("update-location", {
        userId: userData?._id,
        latitude: lat,
        longitude: lon
      })
    }, (err) => {
      console.log(err);
    }, { enableHighAccuracy: true })
    return () => navigator.geolocation.clearWatch(watcher)
  }, [userData?._id])


  const sendOtp = async () => {
    setSendotploading(true)
    try {
      const result = await axios.post("/api/delivery/otp/send", { orderId: activeOrder.order._id })
      
      setShowotp(true)
      setSendotploading(false)
    } catch (error) {
      console.log(error);
      setSendotploading(false)
    }
  }


  const verifyOtp=async()=>{
    setVerifyotploading(true)
    try {
      const result = await axios.post("/api/delivery/otp/verify", { orderId: activeOrder.order._id ,otp})
      
      setActiveorder(null)
      setVerifyotploading(false);
      await fetchCurrentOrder()
      window.location.reload()
    } catch (error) {
      setOtperror("otp verify error")
      setVerifyotploading(false);
    }
  }

  if(!activeOrder && assignments.length===0){
    const todayEarning=[
      {name:"Today",
      earning,
      deliveries:earning/40
    }
    ]

    return (
      <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-white to-green-50 p-6'>
        <div className='max-w-md w-full text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>No Active Deliveries 🚛</h2>
          <p className='text-gray-500 mb-5'>Stay online to receive new orders 📦</p>

          <div className='bg-white border rounded-xl shadow-xl p-6'>
            <h2 className='font-medium text-green-700 mb-2'>Today's Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={todayEarning}>
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip />
                <Legend/>
                <Bar dataKey="orders" name="Earnings (₹)"/>
                <Bar dataKey="deliveries" name="Deliveries"/>

                </BarChart>

            </ResponsiveContainer>

            <p className='mt-4 text-lg font-bold text-green-700'>{earning || 0} Earned today</p>
            <button className='mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg' onClick={()=>window.location.reload()}>Refresh Earning</button>
          </div>

        </div>

      </div>
    )
  }


  if (activeOrder && userLocation) {
    return (
      <div className='p-4 pt-30 min-h-screen bg-gray-50 text-center'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold text-green-700 mb-2'>Active Delivery</h1>
          <p className='text-gray-600 text-sm mb-4'> order #{activeOrder.order._id.slice(-6)}</p>
          <div className='rounded-xl border shadow-lg overflow-hidden mb-6'>
            <Livemap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>
          <Deliverychat orderId={activeOrder.order._id} deliveryBoyId={userData?._id?.toString()!} />


          <div className='mt-6 bg-white rounded-xl border  shadow p-6'>
            {!activeOrder.order.deliveryOtpVerify && !showOtp && (
              <button
                onClick={sendOtp}
                className='w-full py-4 bg-green-600 text-white rounded-lg'>
                {sendOtploading ? <Loader size={16} className='animate-spin text-white text-center'/>:  "Mark as Delivered"}
              </button>

            )}

            {showOtp &&
              <div className='mt-4'>
                <input type='text' className='w-full py-3 border rounded-lg text-center' placeholder='Enter Otp' maxLength={4} value={otp} onChange={(e)=>setOtp(e.target.value)}/>
                <button className='w-full mt-4 bg-blue-600 text-white py-3 rounded-lg' onClick={verifyOtp}>{verifyOtploading?<Loader size={16} className='animate-spin text-white text-center'/> :  "Verify OTP"}</button>

                {otpError && 
                <div className='text-red-600 mt-2'>
                  {otpError}
                  </div>}
              </div>
              }

              {activeOrder.order.deliveryOtpVerify &&  
              <div className='text-green-700 text-center font-bold'>
                Delivery Completed !
              </div> }

          </div>


        </div>
      </div>
    )
  }



  return (
    <div className='w-full min-h-screen bg-gray-50 -4'>
      <div className='max-w-3xl mx-auto'>
        <h2 className='text-2xl font-bold pt-30 text-center  mb-7.5'>
          Delivery Assignment..
        </h2>
        {assignments?.map((a, index) => (
          <div key={index} className='p-5 bg-white rounded-xl shadow mb-4 border'>
            <p><b> Order ID </b> #{a?.order?._id?.toString().slice(-6)}</p>
            <p className='text-gray-600'>{a?.order?.address?.fullAddress}</p>
            <div className='flex gap-3 mt-4'>
              <button className='flex-1 bg-green-600 text-white py-2 rounded-lg' onClick={() => handleAccept(a._id)}>Accept</button>
              <button className='flex-1 bg-red-600 text-white py-2 rounded-lg'>Reject</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DeliveryboyDashboard