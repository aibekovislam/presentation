'use client'

import React from 'react'

import { Search, MapPin, Building2, Landmark, ShoppingBag } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import api from '@/shared/api/axios'

import cls from './search-bar.module.css'

type LocationType = 'district' | 'neighborhood' | 'landmark' | 'market'

interface LocationItem {
  name: string
  sub: string
  type: LocationType
  color: string
}

interface TaxonomyStreetItem {
  id?: string
  name: string
}

const LOCATION_ICON: Record<LocationType, React.ComponentType<{ size: number }>> = {
  district: MapPin,
  neighborhood: Building2,
  landmark: Landmark,
  market: ShoppingBag,
}

const ROOM_OPTIONS = [1, 2, 3, 4, 5]

const PRICE_PRESETS = [
  { key: 'to10', min: 0, max: 10000 },
  { key: 'to15', min: 0, max: 15000 },
  { key: 'to20', min: 0, max: 20000 },
  { key: 'to30', min: 0, max: 30000 },
  { key: 'to50', min: 0, max: 50000 },
  { key: 'over50', min: 50000, max: 0 },
]

const LOCATION_COLORS = ['#e8d5f5', '#d5ecd5', '#d5ddef', '#fde8d0', '#fce7f3', '#dbeafe', '#e0e7ff', '#fef3c7']

const NEIGHBORHOOD_NAMES = new Set([
  'джал',
  'асанбай',
  'тунгуч',
  'улан',
  'кок-жар',
  'восток-5',
  '5-й микрорайон',
  '6-й микрорайон',
  '8-й микрорайон',
  '11-й микрорайон',
  '12-й микрорайон',
  'ынтымак-1',
  'ынтымак-2',
])

type Segment = 'location' | 'rooms' | 'price' | null

interface SearchBarProps {
  location: string
  rooms: string
  priceFrom: string
  priceTo: string
  onLocationChange: (value: string) => void
  onRoomsChange: (value: string) => void
  onPriceFromChange: (value: string) => void
  onPriceToChange: (value: string) => void
  onSubmit: () => void
}

const normalizeLocationName = (value: string) => value.trim().toLowerCase()

const getColorByName = (locationName: string) => {
  const hash = Array.from(locationName).reduce((accumulator, symbol) => accumulator + symbol.charCodeAt(0), 0)

  return LOCATION_COLORS[hash % LOCATION_COLORS.length]
}

const getLocationType = (locationName: string): LocationType => {
  const normalizedLocationName = normalizeLocationName(locationName)

  if (normalizedLocationName.includes('район')) return 'district'

  if (
    normalizedLocationName.includes('микрорайон') ||
    normalizedLocationName.includes('жилмассив') ||
    normalizedLocationName.includes('жилой массив') ||
    NEIGHBORHOOD_NAMES.has(normalizedLocationName)
  ) {
    return 'neighborhood'
  }

  if (normalizedLocationName.includes('базар') || normalizedLocationName.includes('рынок')) {
    return 'market'
  }

  return 'landmark'
}

const getLocationSub = (locationName: string, locationType: LocationType) => {
  const normalizedLocationName = normalizeLocationName(locationName)

  if (locationType === 'district') return 'Район'

  if (locationType === 'neighborhood') {
    if (
      normalizedLocationName.includes('микрорайон') ||
      normalizedLocationName.includes('восток-') ||
      /^\d+-й/.test(normalizedLocationName)
    ) {
      return 'Микрорайон'
    }

    return 'Жилмассив'
  }

  if (locationType === 'market') return 'Рынок / ориентир'

  if (
    normalizedLocationName.includes('проспект') ||
    normalizedLocationName.includes('улица') ||
    normalizedLocationName.includes('бульвар') ||
    normalizedLocationName.includes('магистраль')
  ) {
    return 'Улица'
  }

  if (normalizedLocationName.includes('парк')) return 'Парк'
  if (normalizedLocationName.includes('площадь')) return 'Площадь'

  if (
    normalizedLocationName.includes('mall') ||
    normalizedLocationName.includes('plaza') ||
    normalizedLocationName.includes('center') ||
    normalizedLocationName.includes('city') ||
    normalizedLocationName.includes('цум') ||
    normalizedLocationName.includes('vefa')
  ) {
    return 'ТЦ / ориентир'
  }

  return 'Ориентир'
}

const buildLocationItem = (taxonomyStreetItem: TaxonomyStreetItem): LocationItem => {
  const locationType = getLocationType(taxonomyStreetItem.name)

  return {
    name: taxonomyStreetItem.name,
    type: locationType,
    sub: getLocationSub(taxonomyStreetItem.name, locationType),
    color: getColorByName(taxonomyStreetItem.name),
  }
}

const isTaxonomyStreetItem = (value: unknown): value is TaxonomyStreetItem => {
  if (!value || typeof value !== 'object') return false

  return typeof (value as TaxonomyStreetItem).name === 'string'
}

const extractTaxonomyStreetItems = (payload: unknown): TaxonomyStreetItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isTaxonomyStreetItem)
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const candidatePayload = payload as {
    results?: unknown
    items?: unknown
    data?: unknown
  }

  if (Array.isArray(candidatePayload.results)) {
    return candidatePayload.results.filter(isTaxonomyStreetItem)
  }

  if (Array.isArray(candidatePayload.items)) {
    return candidatePayload.items.filter(isTaxonomyStreetItem)
  }

  if (Array.isArray(candidatePayload.data)) {
    return candidatePayload.data.filter(isTaxonomyStreetItem)
  }

  return []
}

export const SearchBar: React.FC<SearchBarProps> = ({
  location,
  rooms,
  priceFrom,
  priceTo,
  onLocationChange,
  onRoomsChange,
  onPriceFromChange,
  onPriceToChange,
  onSubmit,
}) => {
  const t = useTranslations('Ads.searchBar')
  const locale = useLocale()

  const [active, setActive] = React.useState<Segment>(null)
  const [hovered, setHovered] = React.useState<Segment>(null)
  const [locations, setLocations] = React.useState<LocationItem[]>([])

  const locationRef = React.useRef<HTMLInputElement>(null)
  const roomsRef = React.useRef<HTMLInputElement>(null)
  const priceFromRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLFormElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const prevHeightRef = React.useRef(0)

  React.useLayoutEffect(() => {
    const el = dropdownRef.current
    const inner = innerRef.current

    if (!el || !inner) {
      prevHeightRef.current = 0

      return
    }

    const newHeight = inner.scrollHeight
    const prevHeight = prevHeightRef.current

    prevHeightRef.current = newHeight

    if (prevHeight === 0 || prevHeight === newHeight) {
      el.style.height = newHeight + 'px'

      return
    }

    el.style.transition = 'none'
    el.style.height = prevHeight + 'px'
    void el.offsetHeight
    el.style.transition = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.height = newHeight + 'px'

    const timer = setTimeout(() => {
      if (el) el.style.height = 'auto'
    }, 280)

    return () => clearTimeout(timer)
  }, [active])

  const close = React.useCallback(() => {
    setActive(null)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
    close()
  }

  const selectLocation = (name: string) => {
    onLocationChange(name)
    setActive('rooms')
    requestAnimationFrame(() => roomsRef.current?.focus())
  }

  React.useEffect(() => {
    const abortController = new AbortController()

    const loadLocations = async () => {
      try {
        const response = await api.get('/taxonomy/streets', {
          params: {
            lang: locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru',
          },
        })

        const taxonomyStreetItems = extractTaxonomyStreetItems(response.data)

        const mappedLocations = taxonomyStreetItems
          .map(buildLocationItem)
          .filter((locationItem) => locationItem.name.trim().length > 0)

        const uniqueLocations = Array.from(
          new Map(
            mappedLocations.map((locationItem) => [
              normalizeLocationName(locationItem.name),
              locationItem,
            ]),
          ).values(),
        ).sort((leftLocation, rightLocation) => leftLocation.name.localeCompare(rightLocation.name, 'ru'))

        setLocations(uniqueLocations)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('Failed to fetch taxonomy streets', error)
        setLocations([])
      }
    }

    loadLocations()

    return () => {
      abortController.abort()
    }
  }, [locale])

  const filteredLocations = React.useMemo(() => {
    if (!location.trim()) return locations

    const normalizedQuery = location.toLowerCase()

    return locations.filter(
      (locationItem) =>
        locationItem.name.toLowerCase().includes(normalizedQuery) ||
        locationItem.sub.toLowerCase().includes(normalizedQuery),
    )
  }, [location, locations])

  const selectRooms = (count: number) => {
    onRoomsChange(String(count))
    setActive('price')
    requestAnimationFrame(() => priceFromRef.current?.focus())
  }

  const selectPreset = (min: number, max: number) => {
    onPriceFromChange(min > 0 ? String(min) : '')
    onPriceToChange(max > 0 ? String(max) : '')
    onSubmit()
    close()
  }

  const handlePriceInput = (value: string, setter: (value: string) => void) => {
    const digitsOnlyValue = value.replace(/\D/g, '')

    setter(digitsOnlyValue)
  }

  React.useEffect(() => {
    if (!active) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const barInside = barRef.current?.contains(target)
      const dropdownInside = dropdownRef.current?.contains(target)

      if (!barInside && !dropdownInside) {
        close()
      }
    }

    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [active, close])

  const priceDisplay = React.useMemo(() => {
    if (priceFrom && priceTo) return `${Number(priceFrom).toLocaleString('ru-RU')} – ${Number(priceTo).toLocaleString('ru-RU')}`
    if (priceFrom) return `${t('priceFrom')} ${Number(priceFrom).toLocaleString('ru-RU')}`
    if (priceTo) return `${t('priceTo')} ${Number(priceTo).toLocaleString('ru-RU')}`

    return ''
  }, [priceFrom, priceTo, t])

  return (
    <>
      {active && <div className={cls.overlay} onClick={close} />}
      <div ref={rootRef} className={cls.wrapper}>
        <form ref={barRef} className={`${cls.bar} ${active ? cls.barActive : ''}`} onSubmit={handleSubmit}>
          <div
            className={`${cls.segment} ${active === 'location' ? cls.segmentActive : ''}`}
            onClick={() => {
              setActive('location')
              locationRef.current?.focus()
            }}
            onMouseEnter={() => setHovered('location')}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={cls.segmentLabel}>{t('locationLabel')}</span>
            <input
              ref={locationRef}
              type="text"
              className={cls.segmentInput}
              placeholder={t('location')}
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onFocus={() => setActive('location')}
            />
          </div>

          <span className={`${cls.divider} ${active === 'location' || active === 'rooms' || hovered === 'location' || hovered === 'rooms' ? cls.dividerHidden : ''}`} />

          <div
            className={`${cls.segment} ${active === 'rooms' ? cls.segmentActive : ''}`}
            onClick={() => {
              setActive('rooms')
              roomsRef.current?.focus()
            }}
            onMouseEnter={() => setHovered('rooms')}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={cls.segmentLabel}>{t('roomsLabel')}</span>
            <input
              ref={roomsRef}
              type="text"
              className={cls.segmentInput}
              placeholder={t('roomsPlaceholder')}
              value={rooms ? `${rooms} ${t('roomsSuffix')}` : ''}
              onChange={(e) => onRoomsChange(e.target.value)}
              onFocus={() => setActive('rooms')}
              readOnly
            />
          </div>

          <span className={`${cls.divider} ${active === 'rooms' || active === 'price' || hovered === 'rooms' || hovered === 'price' ? cls.dividerHidden : ''}`} />

          <div
            className={`${cls.segmentLast} ${active === 'price' ? cls.segmentActive : ''}`}
            onClick={() => {
              setActive('price')
              priceFromRef.current?.focus()
            }}
            onMouseEnter={() => setHovered('price')}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={cls.segmentLastInner}>
              <span className={cls.segmentLabel}>{t('priceLabel')}</span>
              <span className={cls.segmentInput} style={{ cursor: 'pointer' }}>
                {priceDisplay || <span style={{ color: '#9ca3af' }}>{t('pricePlaceholder')}</span>}
              </span>
            </div>
            <button type="submit" className={cls.searchBtn}>
              <Search size={18} />
              <span className={cls.searchBtnText}>{t('search')}</span>
            </button>
          </div>
        </form>

        {active && (
          <div className={cls.dropdown} ref={dropdownRef}>
            <div ref={innerRef} key={active} className={cls.dropdownInner}>
              {active === 'location' && (
                <>
                  <p className={cls.dropdownTitle}>{t('districts')}</p>
                  <div className={cls.districtList}>
                    {filteredLocations.map((locationItem) => {
                      const Icon = LOCATION_ICON[locationItem.type]

                      return (
                        <button
                          key={locationItem.name}
                          type="button"
                          className={cls.districtItem}
                          onClick={() => selectLocation(locationItem.name)}
                        >
                          <span className={cls.districtIcon} style={{ background: locationItem.color }}>
                            <Icon size={20} />
                          </span>
                          <div className={cls.districtText}>
                            <span className={cls.districtName}>{locationItem.name}</span>
                            <span className={cls.districtSub}>{locationItem.sub}</span>
                          </div>
                          <MapPin size={14} className={cls.districtPin} />
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {active === 'rooms' && (
                <>
                  <p className={cls.dropdownTitle}>{t('roomsLabel')}</p>
                  <div className={cls.roomsRow}>
                    {ROOM_OPTIONS.map((roomCount) => (
                      <button
                        key={roomCount}
                        type="button"
                        className={`${cls.roomBtn} ${rooms === String(roomCount) ? cls.roomBtnActive : ''}`}
                        onClick={() => selectRooms(roomCount)}
                      >
                        {roomCount}
                        {roomCount === 5 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {active === 'price' && (
                <>
                  <p className={cls.dropdownTitle}>{t('priceLabel')}</p>

                  <div className={cls.priceRange}>
                    <div className={cls.priceInputWrap}>
                      <label className={cls.priceInputLabel}>{t('priceFrom')}</label>
                      <input
                        ref={priceFromRef}
                        type="text"
                        inputMode="numeric"
                        className={cls.priceInput}
                        placeholder="0"
                        value={priceFrom}
                        onChange={(e) => handlePriceInput(e.target.value, onPriceFromChange)}
                      />
                      <span className={cls.priceInputSuffix}>KGS</span>
                    </div>

                    <span className={cls.priceDash}>–</span>

                    <div className={cls.priceInputWrap}>
                      <label className={cls.priceInputLabel}>{t('priceTo')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={cls.priceInput}
                        placeholder="100 000"
                        value={priceTo}
                        onChange={(e) => handlePriceInput(e.target.value, onPriceToChange)}
                      />
                      <span className={cls.priceInputSuffix}>KGS</span>
                    </div>
                  </div>

                  <div className={cls.pricePresets}>
                    {PRICE_PRESETS.map((pricePreset) => (
                      <button
                        key={pricePreset.key}
                        type="button"
                        className={cls.pricePresetBtn}
                        onClick={() => selectPreset(pricePreset.min, pricePreset.max)}
                      >
                        {t(`pricePreset.${pricePreset.key}`)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
