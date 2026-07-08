import type { Lang } from '@/context/LanguageContext'

export type StyleCategory = 'Casual' | 'Business' | 'Sport' | 'Luxury' | 'Streetwear' | 'Classic'

export const styleCategories: StyleCategory[] = [
  'Casual',
  'Business',
  'Sport',
  'Luxury',
  'Streetwear',
  'Classic',
]

export type ClothingCategory = 'shirts' | 'pants' | 'shoes' | 'jackets' | 'accessories'
export type ClothingSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season'
export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say'
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+'

export type StylePreference = {
  primaryStyle: StyleCategory
  secondaryStyles: StyleCategory[]
}

export type UserProfileData = {
  userId: string
  language: Lang
  gender?: Gender
  ageRange?: AgeRange
  location?: string
  preferredStyles: StylePreference
  favoriteColors: string[]
  clothingPreferences: string[]
  createdAt: string
  updatedAt: string
}

export type WardrobeItemData = {
  itemId: string
  image?: string
  category: ClothingCategory
  color: string
  style: string
  season: ClothingSeason
  brand?: string
  dateAdded: string
  wearCount: number
  ignoreCount: number
  lastWornAt?: string
}

export type OutfitFeedback = 'love' | 'like' | 'neutral' | 'dislike' | null

export type OutfitItemSlot = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessories'

export type OutfitItemReference = {
  itemId: string
  category: ClothingCategory
  slot: OutfitItemSlot
}

export type OutfitHistoryData = {
  id: string
  userId: string
  items: OutfitItemReference[]
  occasion: string
  weather: string
  createdDate: string
  userFeedback: OutfitFeedback
}

export type UploadedOutfitPhotoData = {
  photoId: string
  userId: string
  image: string
  createdDate: string
  status: 'pending-separation' | 'separated'
}

export type SeparatedClothingCandidate = {
  candidateId: string
  photoId: string
  userId: string
  sourceImage: string
  image?: string
  category: ClothingCategory
  color: string
  style: string
  season: ClothingSeason
  brand?: string
  confidence: number
  createdDate: string
}

export type FavoriteCombination = {
  itemIds: string[]
  score: number
}

export type AIStyleIntelligenceData = {
  mostWornItems: string[]
  favoriteCombinations: FavoriteCombination[]
  ignoredItems: string[]
  preferredColors: string[]
  preferredStyles: string[]
  outfitHistoryCount: number
  inferredPreference: string
  updatedAt: string
}

export type ClosetAIDataBundle = {
  profile: UserProfileData
  wardrobe: WardrobeItemData[]
  outfitHistory: OutfitHistoryData[]
  intelligence: AIStyleIntelligenceData
}
