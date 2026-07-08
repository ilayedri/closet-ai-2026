import type {
  ClothingCategory,
  ClothingSeason,
  SeparatedClothingCandidate,
  UploadedOutfitPhotoData,
  WardrobeItemData,
} from './data-model'

type DetectionInput = {
  image: string
  color: string
  style: string
  season: ClothingSeason
  brand?: string
}

export type DetectedWardrobeItemDraft = {
  name: string
  category: ClothingCategory
  image: string
  color: string
  style: string
  season: ClothingSeason
  brand?: string
}

const VISUAL_STORAGE_PREFIX = 'closetai:visual:v1'

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
    // ignore local storage quota/serialization errors
  }
}

function photoQueueKey(userId: string) {
  return `${VISUAL_STORAGE_PREFIX}:${userId}:photos`
}

function candidateQueueKey(userId: string) {
  return `${VISUAL_STORAGE_PREFIX}:${userId}:candidates`
}

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function buildCandidate(userId: string, photoId: string, sourceImage: string, category: ClothingCategory) {
  return {
    candidateId: `${photoId}:${category}`,
    photoId,
    userId,
    sourceImage,
    category,
    color: '',
    style: '',
    season: 'all-season' as ClothingSeason,
    confidence: 0,
    createdDate: nowIsoDate(),
  } satisfies SeparatedClothingCandidate
}

function defaultNameForCategory(category: ClothingCategory) {
  if (category === 'shirts') return 'Detected Shirt'
  if (category === 'pants') return 'Detected Pants'
  if (category === 'shoes') return 'Detected Shoes'
  if (category === 'jackets') return 'Detected Jacket'
  return 'Detected Accessory'
}

export function detectOutfitItemsFromPhoto(input: DetectionInput): DetectedWardrobeItemDraft[] {
  const categories: ClothingCategory[] = ['shirts', 'pants', 'shoes']

  return categories.map((category) => ({
    name: defaultNameForCategory(category),
    category,
    image: input.image,
    color: input.color,
    style: input.style,
    season: input.season,
    brand: input.brand,
  }))
}

export function enqueueOutfitPhotoForSeparation(userId: string, image: string): UploadedOutfitPhotoData {
  const photoId = `photo-${Date.now()}`
  const photo: UploadedOutfitPhotoData = {
    photoId,
    userId,
    image,
    createdDate: nowIsoDate(),
    status: 'pending-separation',
  }

  const photos = readStorage<UploadedOutfitPhotoData[]>(photoQueueKey(userId), [])
  writeStorage(photoQueueKey(userId), [photo, ...photos])

  // Prepare category candidates so future AI can fill them directly from one user photo.
  const categories: ClothingCategory[] = ['shirts', 'pants', 'shoes', 'jackets', 'accessories']
  const preparedCandidates = categories.map((category) => buildCandidate(userId, photoId, image, category))
  const existingCandidates = readStorage<SeparatedClothingCandidate[]>(candidateQueueKey(userId), [])
  writeStorage(candidateQueueKey(userId), [...preparedCandidates, ...existingCandidates])

  return photo
}

export function loadUploadedOutfitPhotos(userId: string): UploadedOutfitPhotoData[] {
  return readStorage<UploadedOutfitPhotoData[]>(photoQueueKey(userId), [])
}

export function loadSeparationCandidates(userId: string): SeparatedClothingCandidate[] {
  return readStorage<SeparatedClothingCandidate[]>(candidateQueueKey(userId), [])
}

export function convertCandidateToWardrobeItem(candidate: SeparatedClothingCandidate): WardrobeItemData {
  return {
    itemId: `item-${candidate.candidateId}`,
    image: candidate.image || candidate.sourceImage,
    category: candidate.category,
    color: candidate.color || 'Unknown',
    style: candidate.style || 'Casual',
    season: candidate.season,
    brand: candidate.brand,
    dateAdded: candidate.createdDate,
    wearCount: 0,
    ignoreCount: 0,
  }
}
