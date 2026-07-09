import type { Lang } from '@/context/LanguageContext'
import { loadOnboardingState } from '@/lib/onboarding'
import type {
    AIStyleIntelligenceData,
    ClosetAIDataBundle,
    Gender,
    OutfitFeedback,
    OutfitHistoryData,
    OutfitItemReference,
    StyleCategory,
    UserProfileData,
    WardrobeItemData,
} from './data-model'

const STORAGE_PREFIX = 'closetai:v1'
export const DEFAULT_USER_ID = 'local-user'

function getStorageKey(userId: string, section: 'profile' | 'wardrobe' | 'outfits' | 'intelligence') {
  return `${STORAGE_PREFIX}:${userId}:${section}`
}

function nowIso() {
  return new Date().toISOString()
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage quota and serialization errors on purpose.
  }
}

function normalizeStyles(selectedStyles: string[] | string): { primary: StyleCategory; secondary: StyleCategory[] } {
  const rawStyles = Array.isArray(selectedStyles) ? selectedStyles : [selectedStyles]
  const normalizedCandidates = rawStyles
    .map((item) => (item || '').trim())
    .filter((item) => item.length > 0)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())

  const known = ['Casual', 'Business', 'Sport', 'Luxury', 'Streetwear', 'Classic']
  const valid = normalizedCandidates.filter((item) => known.includes(item)) as StyleCategory[]
  const primary = valid[0] || 'Casual'
  const secondary = [...new Set(valid.slice(1))] as StyleCategory[]
  const fallbackSecondary = known.filter((item) => item !== primary).slice(0, 2) as StyleCategory[]
  return { primary, secondary: secondary.length ? secondary : fallbackSecondary }
}

export function buildStylePreference(selectedStyles: string[] | string): UserProfileData['preferredStyles'] {
  const normalized = normalizeStyles(selectedStyles)
  return {
    primaryStyle: normalized.primary,
    secondaryStyles: normalized.secondary,
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeGender(value: unknown): Gender | undefined {
  if (value === 'male' || value === 'female' || value === 'prefer-not-to-say') return value
  return undefined
}

function normalizeUserProfile(
  profile: Partial<UserProfileData>,
  userId: string,
  language: Lang,
  fallbackStyles: string[]
): UserProfileData {
  const preferenceSource = normalizeStringArray(profile.personalization?.preferences)
  const clothingPreferences = normalizeStringArray(profile.clothingPreferences)
  const clothingHabits = normalizeStringArray(profile.clothingHabits)
  const favoriteColors = normalizeStringArray(profile.favoriteColors)
  const styleConfig = profile.preferredStyles || buildStylePreference(fallbackStyles)

  const weatherLocation =
    typeof profile.weatherLocation === 'string' && profile.weatherLocation.trim().length > 0
      ? profile.weatherLocation.trim()
      : typeof profile.location === 'string' && profile.location.trim().length > 0
        ? profile.location.trim()
        : undefined

  const safeCreatedAt = typeof profile.createdAt === 'string' && profile.createdAt ? profile.createdAt : nowIso()

  return {
    userId: profile.userId || userId,
    language: profile.language === 'en' ? 'en' : profile.language === 'he' ? 'he' : language,
    gender: normalizeGender(profile.gender),
    ageRange: profile.ageRange,
    location: weatherLocation,
    weatherLocation,
    preferredStyles: styleConfig,
    favoriteColors: favoriteColors.length ? favoriteColors : ['Black', 'Navy', 'Ivory'],
    clothingPreferences: clothingPreferences.length ? clothingPreferences : ['Minimal luxury', 'Tailored silhouettes'],
    clothingHabits,
    personalization: {
      preferences: preferenceSource.length ? preferenceSource : clothingPreferences,
      weatherLocation,
      clothingHabits,
    },
    createdAt: safeCreatedAt,
    updatedAt: typeof profile.updatedAt === 'string' && profile.updatedAt ? profile.updatedAt : safeCreatedAt,
  }
}

function splitListInput(rawValue: string): string[] {
  return rawValue
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function ensureUserProfile(userId = DEFAULT_USER_ID, language: Lang = 'he'): UserProfileData {
  const key = getStorageKey(userId, 'profile')
  const existing = readStorage<UserProfileData | null>(key, null)
  const onboarding = loadOnboardingState()

  if (existing) {
    const normalizedExisting = normalizeUserProfile(existing, userId, language, onboarding.style)
    writeStorage(key, normalizedExisting)
    return normalizedExisting
  }

  const stylePreference = buildStylePreference(onboarding.style)
  const aboutPreferences = splitListInput(onboarding.about)
  const habits = splitListInput(onboarding.clothingHabits)
  const weatherLocation = onboarding.weatherLocation.trim() || undefined
  const createdAt = nowIso()

  const profile: UserProfileData = {
    userId,
    language: onboarding.language || language,
    gender: onboarding.gender,
    location: weatherLocation,
    weatherLocation,
    preferredStyles: stylePreference,
    favoriteColors: ['Black', 'Navy', 'Ivory'],
    clothingPreferences: aboutPreferences.length ? aboutPreferences : ['Minimal luxury', 'Tailored silhouettes'],
    clothingHabits: habits,
    personalization: {
      preferences: aboutPreferences,
      weatherLocation,
      clothingHabits: habits,
    },
    createdAt,
    updatedAt: createdAt,
  }

  writeStorage(key, profile)
  return profile
}

export function updateUserProfile(userId: string, patch: Partial<UserProfileData>): UserProfileData {
  const current = ensureUserProfile(userId)
  const nextWeatherLocation =
    patch.weatherLocation !== undefined ? patch.weatherLocation : patch.location !== undefined ? patch.location : current.weatherLocation

  const nextPreferences = patch.personalization?.preferences ?? patch.clothingPreferences ?? current.personalization.preferences
  const nextHabits = patch.personalization?.clothingHabits ?? patch.clothingHabits ?? current.personalization.clothingHabits

  const next: UserProfileData = {
    ...current,
    ...patch,
    weatherLocation: nextWeatherLocation,
    location: nextWeatherLocation,
    preferredStyles: patch.preferredStyles ? patch.preferredStyles : current.preferredStyles,
    clothingPreferences: patch.clothingPreferences ? patch.clothingPreferences : current.clothingPreferences,
    clothingHabits: patch.clothingHabits ? patch.clothingHabits : current.clothingHabits,
    personalization: {
      preferences: normalizeStringArray(nextPreferences),
      weatherLocation: nextWeatherLocation,
      clothingHabits: normalizeStringArray(nextHabits),
    },
    updatedAt: nowIso(),
  }

  writeStorage(getStorageKey(userId, 'profile'), next)
  return next
}

export function loadWardrobe(userId = DEFAULT_USER_ID): WardrobeItemData[] {
  const raw = readStorage<Array<WardrobeItemData | Partial<WardrobeItemData>>>(getStorageKey(userId, 'wardrobe'), [])
  const normalized = raw
    .map((item) => normalizeWardrobeItem(item, userId))
    .filter((item): item is WardrobeItemData => Boolean(item))

  if (normalized.length !== raw.length) {
    writeStorage(getStorageKey(userId, 'wardrobe'), normalized)
  }

  return normalized
}

function normalizeWardrobeItem(item: Partial<WardrobeItemData>, userId: string): WardrobeItemData | null {
  if (!item.itemId || !item.category) return null

  const imageUrl = item.imageUrl || item.image

  return {
    itemId: item.itemId,
    userId: item.userId || userId,
    imageUrl,
    image: imageUrl,
    category: item.category,
    color: item.color || 'Unknown',
    style: item.style || 'Casual',
    season: item.season || 'all-season',
    brand: item.brand,
    dateAdded: item.dateAdded || new Date().toISOString().slice(0, 10),
    wearCount: Number.isFinite(item.wearCount) ? Number(item.wearCount) : 0,
    ignoreCount: Number.isFinite(item.ignoreCount) ? Number(item.ignoreCount) : 0,
    lastWornAt: item.lastWornAt,
  }
}

export function upsertWardrobeItem(userId: string, item: WardrobeItemData): WardrobeItemData[] {
  const items = loadWardrobe(userId)
  const index = items.findIndex((entry) => entry.itemId === item.itemId)
  const normalized = normalizeWardrobeItem(item, userId)
  if (!normalized) return items

  const next = [...items]
  if (index >= 0) {
    next[index] = { ...next[index], ...normalized }
  } else {
    next.push(normalized)
  }

  writeStorage(getStorageKey(userId, 'wardrobe'), next)
  refreshIntelligence(userId)
  return next
}

export function incrementItemWear(userId: string, itemId: string) {
  const items = loadWardrobe(userId)
  const next = items.map((item) =>
    item.itemId === itemId
      ? { ...item, wearCount: item.wearCount + 1, lastWornAt: nowIso() }
      : item
  )
  writeStorage(getStorageKey(userId, 'wardrobe'), next)
}

export function incrementItemIgnored(userId: string, itemId: string) {
  const items = loadWardrobe(userId)
  const next = items.map((item) =>
    item.itemId === itemId
      ? { ...item, ignoreCount: item.ignoreCount + 1 }
      : item
  )
  writeStorage(getStorageKey(userId, 'wardrobe'), next)
  refreshIntelligence(userId)
}

export function loadOutfitHistory(userId = DEFAULT_USER_ID): OutfitHistoryData[] {
  const raw = readStorage<Array<OutfitHistoryData | Record<string, unknown>>>(getStorageKey(userId, 'outfits'), [])

  const normalized = raw
    .map((entry) => normalizeOutfitEntry(entry, userId))
    .filter((entry): entry is OutfitHistoryData => Boolean(entry))

  if (normalized.length !== raw.length) {
    writeStorage(getStorageKey(userId, 'outfits'), normalized)
  }

  return normalized
}

function normalizeOutfitEntry(entry: OutfitHistoryData | Record<string, unknown>, userId: string): OutfitHistoryData | null {
  if (entry && typeof entry === 'object' && 'id' in entry && 'items' in entry) {
    const current = entry as OutfitHistoryData
    return {
      ...current,
      userId: current.userId || userId,
      createdDate: current.createdDate || nowIso(),
    }
  }

  if (entry && typeof entry === 'object' && 'outfitId' in entry) {
    const legacy = entry as {
      outfitId?: string
      clothingItemIds?: string[]
      occasion?: string
      weather?: string
      userFeedback?: OutfitFeedback
      createdAt?: string
    }

    const legacyItems = Array.isArray(legacy.clothingItemIds) ? legacy.clothingItemIds : []
    const items: OutfitItemReference[] = legacyItems.map((itemId, index) => ({
      itemId,
      category: inferLegacyCategoryByPosition(index),
      slot: inferLegacySlotByPosition(index),
    }))

    return {
      id: legacy.outfitId || `outfit-${Date.now()}`,
      userId,
      items,
      occasion: legacy.occasion || 'Casual',
      weather: legacy.weather || 'Sunny',
      createdDate: legacy.createdAt || nowIso(),
      userFeedback: legacy.userFeedback ?? null,
    }
  }

  return null
}

function inferLegacyCategoryByPosition(index: number): OutfitItemReference['category'] {
  const categoryMap: OutfitItemReference['category'][] = ['shirts', 'pants', 'shoes', 'jackets', 'accessories']
  return categoryMap[index] || 'accessories'
}

function inferLegacySlotByPosition(index: number): OutfitItemReference['slot'] {
  const slotMap: OutfitItemReference['slot'][] = ['top', 'bottom', 'shoes', 'outerwear', 'accessories']
  return slotMap[index] || 'accessories'
}

type CreateOutfitInput = Omit<OutfitHistoryData, 'createdDate' | 'userId'>

export function recordOutfit(userId: string, input: CreateOutfitInput): OutfitHistoryData {
  const history = loadOutfitHistory(userId)
  const entry: OutfitHistoryData = {
    ...input,
    id: input.id || `outfit-${Date.now()}`,
    userId,
    createdDate: nowIso(),
    userFeedback: input.userFeedback ?? null,
  }

  writeStorage(getStorageKey(userId, 'outfits'), [...history, entry])

  entry.items.forEach((item) => incrementItemWear(userId, item.itemId))
  refreshIntelligence(userId)

  return entry
}

export function updateOutfitFeedback(userId: string, outfitId: string, feedback: OutfitFeedback): OutfitHistoryData[] {
  const history = loadOutfitHistory(userId)
  const next = history.map((entry) =>
    entry.id === outfitId ? { ...entry, userFeedback: feedback } : entry
  )
  writeStorage(getStorageKey(userId, 'outfits'), next)
  refreshIntelligence(userId)
  return next
}

export function loadStyleIntelligence(userId = DEFAULT_USER_ID): AIStyleIntelligenceData {
  return readStorage<AIStyleIntelligenceData>(getStorageKey(userId, 'intelligence'), {
    mostWornItems: [],
    favoriteCombinations: [],
    ignoredItems: [],
    preferredColors: [],
    preferredStyles: [],
    outfitHistoryCount: 0,
    inferredPreference: 'Not enough data yet.',
    updatedAt: nowIso(),
  })
}

function buildStyleIntelligence(userId: string): AIStyleIntelligenceData {
  const wardrobe = loadWardrobe(userId)
  const history = loadOutfitHistory(userId)
  const profile = ensureUserProfile(userId)

  const mostWornItems = [...wardrobe]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 5)
    .map((item) => item.itemId)

  const ignoredItems = wardrobe
    .filter((item) => item.ignoreCount > 0)
    .sort((a, b) => b.ignoreCount - a.ignoreCount)
    .map((item) => item.itemId)

  const colorCount = new Map<string, number>()
  const styleCount = new Map<string, number>()
  const combinationCount = new Map<string, number>()

  wardrobe.forEach((item) => {
    colorCount.set(item.color, (colorCount.get(item.color) ?? 0) + 1)
    styleCount.set(item.style, (styleCount.get(item.style) ?? 0) + 1)
  })

  history.forEach((outfit) => {
    const itemIds = outfit.items.map((item) => item.itemId)
    if (itemIds.length >= 2) {
      const comboKey = [...itemIds].sort().join('+')
      combinationCount.set(comboKey, (combinationCount.get(comboKey) ?? 0) + 1)
    }
  })

  const favoriteCombinations = [...combinationCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, score]) => ({ itemIds: key.split('+'), score }))

  const preferredColors = [...colorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color)

  const preferredStyles = [...styleCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([style]) => style)

  const topStyle = preferredStyles[0] || profile.preferredStyles.primaryStyle
  const topColor = preferredColors[0] || profile.favoriteColors[0] || 'black'
  const inferredPreference =
    profile.language === 'he'
      ? `נראה שהמשתמש בוחר לרוב בגווני ${topColor.toLowerCase()} עם כיוון סגנוני ${topStyle.toLowerCase()}.`
      : `This user often selects ${topColor.toLowerCase()} tones with a ${topStyle.toLowerCase()} direction.`

  return {
    mostWornItems,
    favoriteCombinations,
    ignoredItems,
    preferredColors,
    preferredStyles,
    outfitHistoryCount: history.length,
    inferredPreference,
    updatedAt: nowIso(),
  }
}

export function refreshIntelligence(userId = DEFAULT_USER_ID): AIStyleIntelligenceData {
  const intelligence = buildStyleIntelligence(userId)
  writeStorage(getStorageKey(userId, 'intelligence'), intelligence)
  return intelligence
}

export function loadUserDataBundle(userId = DEFAULT_USER_ID): ClosetAIDataBundle {
  return {
    profile: ensureUserProfile(userId),
    wardrobe: loadWardrobe(userId),
    outfitHistory: loadOutfitHistory(userId),
    intelligence: loadStyleIntelligence(userId),
  }
}
