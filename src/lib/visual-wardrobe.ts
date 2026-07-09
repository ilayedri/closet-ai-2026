import type {
    ClothingCategory,
    ClothingSeason,
    SeparatedClothingCandidate,
    UploadedOutfitPhotoData,
    WardrobeItemData,
} from './data-model'

type DetectionInput = {
  image: string
  name?: string
  fileName?: string
  color: string
  style: string
  season: ClothingSeason
  brand?: string
  categories?: ClothingCategory[]
  nameByCategory?: Partial<Record<ClothingCategory, string>>
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

const categoryKeywords: Record<ClothingCategory, string[]> = {
  shirts: ['shirt', 'tee', 't-shirt', 'top', 'blouse', 'button down', 'hoodie', 'sweater', 'חולצה', 'טי', 'סריג'],
  pants: ['pant', 'pants', 'trouser', 'trousers', 'jeans', 'chino', 'shorts', 'skirt', 'slacks', 'cargo', 'leggings', 'מכנס', 'מכנסיים', 'ג׳ינס', 'גינס', 'צ׳ינו'],
  shoes: ['shoe', 'sneaker', 'boot', 'loafer', 'heel', 'sandals', 'נעל', 'סניקר', 'סניקרס', 'מגף'],
  jackets: ['jacket', 'coat', 'blazer', 'outerwear', 'מעיל', 'ז׳קט', 'זקט', 'בלייזר'],
  accessories: ['watch', 'belt', 'bag', 'cap', 'hat', 'sunglass', 'scarf', 'jewelry', 'bracelet', 'necklace', 'תיק', 'חגורה', 'שעון', 'כובע', 'צעיף', 'צמיד', 'שרשרת'],
}

function normalizeText(value: string | undefined): string {
  return (value || '').toLowerCase()
}

function scoreCategory(text: string, category: ClothingCategory): number {
  return categoryKeywords[category].reduce((score, keyword) => (text.includes(keyword) ? score + 1 : score), 0)
}

export function detectSingleItemCategory(input: {
  name?: string
  fileName?: string
  style?: string
  brand?: string
}): ClothingCategory {
  return detectSingleItemCategoryDetails(input).category
}

export function detectSingleItemCategoryDetails(input: {
  name?: string
  fileName?: string
  style?: string
  brand?: string
}): { category: ClothingCategory; confidence: 'high' | 'medium' | 'low'; sourceText: string } {
  const sourceText = [input.name, input.fileName, input.style, input.brand].map(normalizeText).join(' ')
  const categories: ClothingCategory[] = ['shirts', 'pants', 'shoes', 'jackets', 'accessories']

  const scored = categories
    .map((category) => ({ category, score: scoreCategory(sourceText, category) }))
    .sort((a, b) => b.score - a.score)

  if ((scored[0]?.score ?? 0) >= 2) {
    return { category: scored[0].category, confidence: 'high', sourceText }
  }
  if ((scored[0]?.score ?? 0) === 1) {
    return { category: scored[0].category, confidence: 'medium', sourceText }
  }

  const styleText = normalizeText(input.style)
  if (styleText.includes('sport') || styleText.includes('athletic') || styleText.includes('running') || styleText.includes('ספורט')) {
    return { category: 'shoes', confidence: 'low', sourceText }
  }
  if (styleText.includes('winter') || styleText.includes('outer') || styleText.includes('coat') || styleText.includes('מעיל')) {
    return { category: 'jackets', confidence: 'low', sourceText }
  }
  return { category: 'shirts', confidence: 'low', sourceText }
}

export function detectOutfitCategories(input: {
  name?: string
  fileName?: string
  style?: string
  brand?: string
}): ClothingCategory[] {
  const sourceText = [input.name, input.fileName, input.style, input.brand].map(normalizeText).join(' ')
  const categories: ClothingCategory[] = ['shirts', 'pants', 'shoes', 'jackets', 'accessories']

  const inferred = categories.filter((category) => scoreCategory(sourceText, category) > 0)
  if (inferred.length) return inferred

  // Default luxury outfit composition for auto-organization when explicit signals are missing.
  return ['shirts', 'pants', 'shoes', 'accessories']
}

export function detectOutfitItemsFromPhoto(input: DetectionInput): DetectedWardrobeItemDraft[] {
  const categories: ClothingCategory[] =
    input.categories && input.categories.length
      ? input.categories
      : detectOutfitCategories({
          name: input.name,
          fileName: input.fileName,
          style: input.style,
          brand: input.brand,
        })

  return categories.map((category) => ({
    name: input.nameByCategory?.[category] || defaultNameForCategory(category),
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
  const imageUrl = candidate.image || candidate.sourceImage

  return {
    itemId: `item-${candidate.candidateId}`,
    userId: candidate.userId,
    imageUrl,
    image: imageUrl,
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
