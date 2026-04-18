// ── Common ──────────────────────────────────────────────

export type AdKind = 'RENT' | 'SALE' | 'HOUSEMATE'
export type AdStatus = 'DRAFT' | 'PENDING_MODERATION' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'
export type PostStatus = AdStatus
export type Currency = 'KGS' | 'USD' | 'EUR'
export type SortBy = 'createdAt' | 'publishedAt' | 'price'
export type SortOrder = 'asc' | 'desc'
export type ApiLang = 'ru' | 'kg' | 'en'

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FavoriteItem {
  postId: string
  kind: AdKind
  addedAt: string
  post: AdBase
}

export interface FavoriteToggleResponse {
  isFavorite: boolean
}

export interface FavoriteListParams {
  page?: number
  limit?: number
  kind?: AdKind
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: SortBy
  sortOrder?: SortOrder
  lang?: ApiLang
  city?: string
  districtId?: number
  streetId?: number
  q?: string
  minPrice?: number
  maxPrice?: number
}

export interface PublishResponse {
  success: boolean
  status: 'PUBLISHED'
  publishedAt: string
}

export interface ArchiveResponse {
  success: boolean
  status: 'ARCHIVED'
}

// ── Quick Filters ───────────────────────────────────────

export type QuickFilterSection = 'rent' | 'sale' | 'housemate'

export interface QuickFilterItem {
  id: string
  label: string
  labelRu: string
  labelKg: string
  labelEn: string
  filters: Record<string, unknown>
}

export interface QuickFiltersResponse {
  rent: QuickFilterItem[]
  sale: QuickFilterItem[]
  housemate: QuickFilterItem[]
}

// ── Owner ───────────────────────────────────────────────

export interface AdOwner {
  id: string
  firstName: string
  lastName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  createdAt?: string
  listingsCount?: number
  contactVerified?: boolean
}

// ── Base Ad Fields ──────────────────────────────────────

export interface AdBase {
  id: string
  ownerId?: string
  owner?: AdOwner
  kind: AdKind
  status: AdStatus
  title: string
  description?: string
  city: string
  districtId?: number
  streetId?: number
  districtName?: string | null
  streetName?: string | null
  price: number
  currency: Currency
  photos?: string[]
  viewCount?: number
  isActive?: boolean
  isFavorite?: boolean
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

// ── Rent ────────────────────────────────────────────────

export type RentType = 'long_term' | 'daily'
export type RentPropertyType = 'flat' | 'room' | 'house' | 'cottage' | 'studio'
export type UtilitiesPaymentType = 'included' | 'separate' | 'partly' | 'excluded' | 'partial'

export interface RentAddress {
  geo?: {
    lat: number
    lng: number
  }
  street?: string
  landmark?: string
  houseNumber?: string
}

export interface RentDetails {
  rentType: RentType
  propertyType: RentPropertyType
  roomsCount?: number
  maxResidents?: number
  minLeaseMonths?: number
  totalAreaM2?: number
  livingAreaM2?: number
  kitchenAreaM2?: number
  floor?: number
  totalFloors?: number
  yearBuilt?: number
  commissionPercent?: number
  prepaymentMonths?: number
  amenities?: string[]
  address?: RentAddress
  utilitiesPaymentType?: UtilitiesPaymentType
  depositAmount?: number
  securityDepositAmount?: number
  isNegotiable?: boolean
  allowedWithKids?: boolean
  allowedWithPets?: boolean
  smokingAllowed?: boolean
  alcoholAllowed?: boolean
  partiesAllowed?: boolean
  instrumentsAllowed?: boolean
  guestsAllowed?: boolean
  quietHoursFrom?: string
  quietHoursTo?: string
  cleaningRequired?: boolean
  shoesOffRequired?: boolean
  additionalRulesText?: string
  checkInFrom?: string
  checkOutTo?: string
  photos?: string[]
}

export interface RentAd extends AdBase {
  kind: 'RENT'
  rent: RentDetails
}

export interface CreateRentAdRequest {
  title: string
  description?: string
  city: string
  districtId?: number
  streetId?: number
  price: number
  currency: Currency
  photos?: string[]
  rent: {
    rentType: RentType
    propertyType: RentPropertyType
    roomsCount?: number
    maxResidents?: number
    amenities?: string[]
    depositAmount?: number
    totalAreaM2?: number
    livingAreaM2?: number
    kitchenAreaM2?: number
    floor?: number
    totalFloors?: number
    yearBuilt?: number
    commissionPercent?: number
    prepaymentMonths?: number
    minLeaseMonths?: number
    utilitiesPaymentType?: UtilitiesPaymentType
    isNegotiable?: boolean
    address?: RentAddress
    allowedWithKids?: boolean
    allowedWithPets?: boolean
    smokingAllowed?: boolean
    alcoholAllowed?: boolean
    partiesAllowed?: boolean
    instrumentsAllowed?: boolean
    guestsAllowed?: boolean
    quietHoursFrom?: string
    quietHoursTo?: string
    cleaningRequired?: boolean
    shoesOffRequired?: boolean
    additionalRulesText?: string
  }
}

export interface RentFilterParams extends PaginationParams {
  rentType?: RentType
  roomsCount?: number
}

// ── Sale ────────────────────────────────────────────────

export type SalePropertyType = 'flat' | 'house' | 'cottage' | 'land'

export interface SaleDetails {
  propertyType: SalePropertyType
  roomsCount?: number
  totalAreaM2?: number
}

export interface SaleAd extends AdBase {
  kind: 'SALE'
  sale: SaleDetails
}

export interface CreateSaleAdRequest {
  title: string
  description?: string
  city: string
  districtId?: number
  streetId?: number
  price: number
  currency: Currency
  photos?: string[]
  sale: {
    propertyType: SalePropertyType
    roomsCount?: number
    totalAreaM2?: number
  }
}

export interface SaleFilterParams extends PaginationParams {
  salePropertyType?: SalePropertyType
}

// ── Housemate ───────────────────────────────────────────

export type OfferedPlaceType = 'separate_room' | 'shared_room' | 'bed_place'
export type HousematePropertyType = 'flat' | 'house' | 'hostel' | 'other'
export type Gender = 'male' | 'female' | 'any'
export type PaymentPeriod = 'per_month' | 'per_week' | 'per_day'
export type SmokingPolicy = 'no' | 'yes' | 'only_balcony'
export type PetsPolicy = 'no' | 'yes' | 'cats_only' | 'small_pets_only' | 'discuss'
export type GuestsPolicy = 'no' | 'rare' | 'allowed'
export type PartiesPolicy = 'no' | 'rare' | 'allowed'

export interface HousemateAddress {
  street?: string | null
  houseNumber?: string | null
  landmark?: string | null
  geo?: { lat: number; lng: number } | null
}

export interface HomeInfo {
  propertyType?: string | null
  roomsTotal?: number | null
  areaTotalM2?: number | null
  floor?: number | null
  floorsTotal?: number | null
  hasElevator?: boolean | null
  renovation?: string | null
}

export interface OfferedPlace {
  offeredPlaceType?: string | null
  roomAreaM2?: number | null
  furnished?: boolean | null
}

export interface HousematePricing {
  price?: number | null
  currency?: string | null
  paymentPeriod?: PaymentPeriod | null
  utilitiesPaymentType?: UtilitiesPaymentType | null
  depositAmount?: number | null
  isNegotiable?: boolean | null
}

export interface HousemateResident {
  gender?: Gender | null
  age?: number | null
}

export interface AgeRange {
  min: number
  max: number
}

export interface CurrentResidents {
  residentsCount?: number | null
  housemates?: HousemateResident[] | null
  genders?: string[] | null
  ageRange?: AgeRange | null
  hasKids?: boolean | null
  kidsInfo?: string | null
  hasPets?: boolean | null
  lifestyleNotes?: string | null
}

export interface HousemateRules {
  smokingPolicy?: SmokingPolicy | null
  petsPolicy?: PetsPolicy | null
  guestsPolicy?: GuestsPolicy | null
  partiesPolicy?: PartiesPolicy | null
  quietHours?: Record<string, unknown> | null
  cleaningSchedule?: boolean | null
  sharedExpenses?: boolean | null
  additionalRulesText?: string | null
}

export interface DesiredRoommate {
  gender?: Gender | null
  ageRange?: AgeRange | null
  applicantsCount?: number | null
  allowedWithPets?: boolean | null
  allowedWithKids?: boolean | null
  allowedSmoking?: boolean | null
  occupationNotes?: string | null
  preferredLifestyleText?: string | null
}

export interface HousemateDetails {
  // Main fields
  propertyType: string | null
  offeredPlaceType: string | null
  residentsCount: number | null

  // Nested objects
  address?: HousemateAddress | null
  homeInfo?: HomeInfo | null
  offeredPlace?: OfferedPlace | null
  pricing?: HousematePricing | null
  currentResidents?: CurrentResidents | null
  amenities?: Record<string, unknown> | null
  rules?: HousemateRules | null
  desiredRoommate?: DesiredRoommate | null

  // Legacy fields (backward compat)
  paymentPeriod?: string | null
  utilitiesPaymentType?: string | null
  depositAmount?: number | null
  isNegotiable?: boolean | null
  gender?: string | null
  smokingPolicy?: string | null
  petsPolicy?: string | null
  guestsPolicy?: string | null
  partiesPolicy?: string | null
  allowedWithKids?: boolean | null
  allowedWithPets?: boolean | null
  allowedSmoking?: boolean | null
  applicantsCount?: number | null
  occupationNotes?: string | null
  preferredLifestyleText?: string | null
}

export interface CompatibilityBreakdownItem {
  key: string
  label: string
  score: number
  weight: number
}

export interface Compatibility {
  total: number
  breakdown: CompatibilityBreakdownItem[]
}

export interface HousemateAd extends AdBase {
  kind: 'HOUSEMATE'
  housemate: HousemateDetails
  compatibility?: Compatibility | null
}

export interface CreateHousemateAdRequest {
  title: string
  description?: string
  city: string
  districtId?: number
  streetId?: number
  price: number
  currency: Currency
  photos?: string[]
  housemate: {
    propertyType: HousematePropertyType
    offeredPlaceType: OfferedPlaceType
    residentsCount: number
    address?: HousemateAddress
    homeInfo?: Partial<HomeInfo>
    offeredPlace?: Partial<OfferedPlace>
    pricing?: Partial<HousematePricing>
    currentResidents?: Partial<CurrentResidents>
    amenities?: Record<string, unknown>
    rules?: Partial<HousemateRules>
    desiredRoommate?: Partial<DesiredRoommate>
  }
}

export interface HousemateFilterParams extends PaginationParams {
  status?: PostStatus
  // Basic filters
  housemateOfferedPlaceType?: OfferedPlaceType
  gender?: 'male' | 'female' | 'any'
  ageMin?: number
  ageMax?: number
  currency?: Currency
  // Quick chips (boolean)
  utilitiesIncluded?: boolean
  noDeposit?: boolean
  petsAllowed?: boolean
  noSmoking?: boolean
  // Deep: price & payments
  maxDeposit?: number
  utilitiesPaymentType?: 'included' | 'separate' | 'partly'
  isNegotiable?: boolean
  // Deep: property & house
  propertyType?: 'flat' | 'house' | 'hostel' | 'other'
  minRooms?: number
  maxRooms?: number
  minFloor?: number
  maxFloor?: number
  hasElevator?: boolean
  renovation?: string
  minArea?: number
  maxArea?: number
  // Deep: offered place
  furnished?: boolean
  minRoomArea?: number
  maxRoomArea?: number
  // Deep: amenities
  wifi?: boolean
  washingMachine?: boolean
  fridge?: boolean
  kitchen?: boolean
  airConditioner?: boolean
  balcony?: boolean
  parking?: boolean
  // Deep: house rules
  smokingPolicy?: 'no' | 'yes' | 'only_balcony'
  petsPolicy?: 'no' | 'yes' | 'cats_only' | 'small_pets_only' | 'discuss'
  guestsPolicy?: 'no' | 'rare' | 'allowed'
  partiesPolicy?: 'no' | 'rare' | 'allowed'
  // Deep: who lives
  minResidents?: number
  maxResidents?: number
  hasKids?: boolean
  hasPets?: boolean
  // Deep: who they want
  allowedWithPets?: boolean
  allowedWithKids?: boolean
  allowedSmoking?: boolean
}

// ── Housemate Profiles ──────────────────────────────────

export interface HousemateProfileUser {
  userId: string
  firstName: string
  lastName: string | null
  avatarUrl: string | null
}

export type RoommateSmokingPolicy = 'no_smoking' | 'outside_only' | 'any'
export type RoommatePetsPolicy = 'no_pets' | 'pets_ok' | 'any'
export type RoommateGuestsPolicy = 'no_parties' | 'sometimes_small' | 'any'
export type RentPeriodType = 'long_term' | 'short_term_daily' | '3_month' | '6_month' | '9_month'

export interface RoommateBudget {
  currencyCode?: string | null
  monthlyRentMin?: number | null
  monthlyRentMax?: number | null
  isDepositAcceptable?: boolean | null
  maxDepositAmount?: number | null
  rentPeriodType?: string | null
}

export interface RoommateCurrentHome {
  homeType?: string | null
  district?: string | null
  description?: string | null
}

export interface RoommateLifestyle {
  smokingPreference?: string | null
  alcoholPreference?: string | null
  guestsPreference?: string | null
  petsPreference?: string | null
}

export interface RoommatePreferences {
  preferredGender?: string | null
  preferredAgeFrom?: number | null
  preferredAgeTo?: number | null
  isOkWithCouples?: boolean | null
  isOkWithChildren?: boolean | null
  lifestyle?: RoommateLifestyle | null
  scheduleFrom?: number | null
  scheduleTo?: number | null
  roommateComment?: string | null
}

export interface HousemateProfile {
  preferredGender?: string | null
  minAge?: number | null
  maxAge?: number | null
  smokingPolicy?: string | null
  petsPolicy?: string | null
  guestsPolicy?: string | null
  notes?: string | null
  budget?: RoommateBudget | null
  currentHome?: RoommateCurrentHome | null
  roommatePreferences?: RoommatePreferences | null
  family?: { gender?: string | null; age?: number | null }[] | null
  createdAt: string
  updatedAt: string
}

export interface RoommateProfileResponse {
  exists: boolean
  profile: HousemateProfile | null
}

export interface UpdateRoommateProfileRequest {
  preferredGender?: string | null
  minAge?: number | null
  maxAge?: number | null
  smokingPolicy?: string | null
  petsPolicy?: string | null
  guestsPolicy?: string | null
  notes?: string | null
  budget?: Partial<RoommateBudget> | null
  currentHome?: Partial<RoommateCurrentHome> | null
  roommatePreferences?: Partial<RoommatePreferences> | null
  family?: { gender?: string | null; age?: number | null }[] | null
}

export interface HousemateProfileEntry {
  user: HousemateProfileUser
  profile: HousemateProfile
}

export interface HousemateProfileFilterParams {
  page?: number
  limit?: number
  q?: string
  preferredGender?: Gender
  minAge?: number
  maxAge?: number
}
