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

export type AutoImageInsights = {
  category: ClothingCategory
  color: string
  style: string
  season: ClothingSeason
  confidence: 'high' | 'medium' | 'low'
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
  }

  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  const hue = Math.round(((h * 60 + 360) % 360))

  return {
    hue,
    saturation,
    lightness,
  }
}

function inferColorNameFromRgb(r: number, g: number, b: number) {
  const { hue, saturation, lightness } = rgbToHsl(r, g, b)

  if (lightness < 0.16) return 'Black'
  if (lightness > 0.9 && saturation < 0.14) return 'White'
  if (saturation < 0.12) return 'Gray'
  if (hue < 15 || hue >= 345) return 'Red'
  if (hue < 45) return 'Orange'
  if (hue < 70) return 'Yellow'
  if (hue < 165) return 'Green'
  if (hue < 250) return hue < 210 ? 'Blue' : 'Navy'
  if (hue < 300) return 'Purple'
  return 'Pink'
}

function inferStyleAndSeason(colorName: string, saturation: number, lightness: number, text: string): { style: string; season: ClothingSeason } {
  const compactText = normalizeText(text)

  if (compactText.includes('coat') || compactText.includes('jacket') || compactText.includes('wool') || compactText.includes('מעיל')) {
    return { style: 'Classic', season: 'winter' }
  }

  if (compactText.includes('sport') || compactText.includes('running') || compactText.includes('gym') || compactText.includes('ספורט')) {
    return { style: 'Sport', season: 'all-season' }
  }

  if (lightness < 0.24 || ['Black', 'Navy', 'Gray'].includes(colorName)) {
    return { style: 'Minimal', season: 'winter' }
  }

  if (saturation > 0.45 && lightness > 0.5) {
    return { style: 'Streetwear', season: 'summer' }
  }

  if (['White', 'Beige', 'Yellow', 'Orange'].includes(colorName) || lightness > 0.72) {
    return { style: 'Casual', season: 'summer' }
  }

  return { style: 'Casual', season: 'all-season' }
}

async function getAverageRgbFromImage(imageDataUrl: string): Promise<{ r: number; g: number; b: number; validPixels: number }> {
  if (typeof window === 'undefined') {
    return { r: 0, g: 0, b: 0, validPixels: 0 }
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const instance = new Image()
    instance.onload = () => resolve(instance)
    instance.onerror = () => reject(new Error('Failed to decode uploaded image'))
    instance.src = imageDataUrl
  })

  const canvas = document.createElement('canvas')
  const maxSide = 96
  const ratio = clamp(maxSide / Math.max(image.width || 1, image.height || 1), 0.08, 1)
  canvas.width = Math.max(1, Math.round((image.width || 1) * ratio))
  canvas.height = Math.max(1, Math.round((image.height || 1) * ratio))

  const context = canvas.getContext('2d')
  if (!context) return { r: 0, g: 0, b: 0, validPixels: 0 }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

  let sumR = 0
  let sumG = 0
  let sumB = 0
  let validPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 32) continue

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    // Ignore near-flat background noise and almost-black borders.
    if (max < 14 || max - min < 4) continue

    sumR += r
    sumG += g
    sumB += b
    validPixels += 1
  }

  if (!validPixels) return { r: 0, g: 0, b: 0, validPixels: 0 }

  return {
    r: Math.round(sumR / validPixels),
    g: Math.round(sumG / validPixels),
    b: Math.round(sumB / validPixels),
    validPixels,
  }
}

export async function detectSingleItemInsightsFromImage(input: {
  image: string
  name?: string
  fileName?: string
  style?: string
  brand?: string
}): Promise<AutoImageInsights> {
  const categoryInfo = detectSingleItemCategoryDetails({
    name: input.name,
    fileName: input.fileName,
    style: input.style,
    brand: input.brand,
  })

  const avg = await getAverageRgbFromImage(input.image)
  if (avg.validPixels === 0) {
    return {
      category: categoryInfo.category,
      color: 'Black',
      style: 'Casual',
      season: 'all-season',
      confidence: 'low',
    }
  }

  const hsl = rgbToHsl(avg.r, avg.g, avg.b)
  const color = inferColorNameFromRgb(avg.r, avg.g, avg.b)
  const styleSeason = inferStyleAndSeason(color, hsl.saturation, hsl.lightness, [input.name, input.fileName, input.style, input.brand].filter(Boolean).join(' '))
  const confidence = categoryInfo.confidence === 'high' && avg.validPixels > 180 ? 'high' : avg.validPixels > 80 ? 'medium' : 'low'

  return {
    category: categoryInfo.category,
    color,
    style: styleSeason.style,
    season: styleSeason.season,
    confidence,
  }
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
