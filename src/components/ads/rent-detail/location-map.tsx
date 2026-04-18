interface LocationMapProps {
  lat: number
  lng: number
}

export default function LocationMap({ lat, lng }: LocationMapProps) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`

  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0, borderRadius: '16px' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
