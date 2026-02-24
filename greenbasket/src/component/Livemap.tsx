import React, { useEffect } from 'react'
import "leaflet/dist/leaflet.css"
import dynamic from 'next/dynamic'
import type { LatLngExpression } from 'leaflet'
import { useMap } from 'react-leaflet'


interface ILocation {
  latitude: number,
  longitude: number
}

interface Iprops {
  userLocation: ILocation
  deliveryBoyLocation: ILocation
}

function Recenter({positions}:{positions:[number,number]}){
  const map=useMap()
  useEffect(()=>{
    if(positions[0] !== 0 && positions[1] !== 0){
      map.setView(positions, map.getZoom(),{
        animate:true
      })
    }
  },[positions,map])
  return null
}

const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then(m => m.Polyline),
  { ssr: false }
)

function Livemap({ userLocation, deliveryBoyLocation }: Iprops) {
  const L = require('leaflet')
  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
    iconSize: [45, 45]
  })

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [45, 45]
  })

  const linePositions =
    deliveryBoyLocation && userLocation ?
      [[userLocation.latitude, userLocation.longitude],
      [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
      ] : []

  const center = [userLocation.latitude, userLocation.longitude]

  return (
    <div className='w-full h-125 rounded-xl overflow-hidden shadow relative z-2'>
      <MapContainer center={center as LatLngExpression} zoom={17} scrollWheelZoom={true} className='w-full h-full'>
        <Recenter positions={center as any}/>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>Delovery Address</Popup>
        </Marker>

        {deliveryBoyLocation && <Marker position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} icon={deliveryBoyIcon}><Popup>Delovery Boy</Popup></Marker>}
        <Polyline positions={linePositions as any} color='green'></Polyline>

      </MapContainer>
    </div>
  )
}

export default Livemap