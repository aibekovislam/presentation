'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// City centers for initial map view
const CITY_CENTERS: Record<string, [number, number]> = {
  'Бишкек': [42.8746, 74.5698],
  'Ош': [40.5283, 72.7985],
  'Джалал-Абад': [40.9333, 73.0017],
  'Каракол': [42.4907, 78.3936],
  'Токмок': [42.7631, 75.3007],
}

interface MapPickerProps {
  lat: number | null
  lng: number | null
  city: string
  onChange: (lat: number, lng: number) => void
  onGeocode?: (street: string, houseNumber: string) => void
}

// Sub-component to handle map click events
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Sub-component to recenter map when city changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevCenter = useRef(center)

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.setView(center, 13)
      prevCenter.current = center
    }
  }, [center, map])

  return null
}

export default function MapPicker({ lat, lng, city, onChange, onGeocode }: MapPickerProps) {
  const center = CITY_CENTERS[city] || CITY_CENTERS['Бишкек']
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleClick = useCallback(
    async (clickLat: number, clickLng: number) => {
      onChange(clickLat, clickLng)

      // Reverse geocode to get address
      if (onGeocode) {
        setIsGeocoding(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${clickLat}&lon=${clickLng}&format=json&addressdetails=1&accept-language=ru`,
          )
          const data = await res.json()
          if (data?.address) {
            const street = data.address.road || data.address.street || ''
            const houseNumber = data.address.house_number || ''
            onGeocode(street, houseNumber)
          }
        } catch {
          // silently fail
        } finally {
          setIsGeocoding(false)
        }
      }
    },
    [onChange, onGeocode],
  )

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={lat && lng ? [lat, lng] : center}
        zoom={13}
        style={{ height: 300, width: '100%', borderRadius: 12, zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={handleClick} />
        <MapRecenter center={lat && lng ? [lat, lng] : center} />
        {lat && lng && <Marker position={[lat, lng]} icon={markerIcon} />}
      </MapContainer>
      {isGeocoding && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,0.9)',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 12,
            zIndex: 1000,
          }}
        >
          ...
        </div>
      )}
    </div>
  )
}
