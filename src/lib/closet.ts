import type { Lang } from '@/context/LanguageContext'
import type { ClothingCategory, ClothingSeason } from '@/lib/data-model'
import { getSiteCopy } from './site-copy'

const DEFAULT_LOCAL_USER_ID = 'local-user'

export type ClosetCategory = {
  id: string
  label: string
  description: string
  coverImageUrl?: string
}

export type ClosetItem = {
  id: string
  userId: string
  name: string
  imageUrl?: string
  category: ClothingCategory
  image?: string
  color: string
  style: string
  season: ClothingSeason
  brand?: string
  dateAdded: string
}

const categoryMeta = [
  { id: 'shirts' },
  { id: 'pants' },
  { id: 'shoes' },
  { id: 'jackets' },
  { id: 'accessories' },
]

export const categories: ClosetCategory[] = getCategories('en')

export function getCategories(lang: Lang): ClosetCategory[] {
  const copy = getSiteCopy(lang).categories

  return categoryMeta.map((category) => ({
    id: category.id,
    label: copy[category.id as keyof typeof copy].label,
    description: copy[category.id as keyof typeof copy].description,
    coverImageUrl: category.coverImageUrl,
  }))
}

function hasKnownImagePrefix(value: string) {
  return (
    value.startsWith('data:image/') ||
    value.startsWith('blob:') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  )
}

export function resolveItemImageSource(value?: string): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (hasKnownImagePrefix(trimmed)) return trimmed

  // Convert legacy relative paths to absolute public paths when possible.
  if (trimmed.startsWith('assets/')) return `/${trimmed}`
  if (/^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|gif|avif)$/i.test(trimmed)) return `/assets/images/${trimmed}`

  return undefined
}

const defaultItems: ClosetItem[] = []

function fallbackItemName(category: ClothingCategory) {
  if (category === 'shirts') return 'Shirt'
  if (category === 'pants') return 'Pants'
  if (category === 'shoes') return 'Shoes'
  if (category === 'jackets') return 'Jacket'
  return 'Accessory'
}

function normalizeClosetItem(item: Partial<ClosetItem>): ClosetItem | null {
  if (!item.id || !item.category) return null

  const normalizedImage = resolveItemImageSource(item.imageUrl || item.image)
  const normalizedName = typeof item.name === 'string' && item.name.trim().length > 0 ? item.name.trim() : fallbackItemName(item.category)

  return {
    id: item.id,
    userId: item.userId || DEFAULT_LOCAL_USER_ID,
    name: normalizedName,
    imageUrl: normalizedImage,
    image: normalizedImage,
    category: item.category,
    color: item.color || 'Unknown',
    style: item.style || 'Casual',
    season: item.season || 'all-season',
    brand: item.brand,
    dateAdded: item.dateAdded || new Date().toISOString().slice(0, 10),
  }
}

export function loadClosetItems(): ClosetItem[] {
  if (typeof window === 'undefined') return defaultItems
  try {
    const raw = window.localStorage.getItem('closetItems')
    if (!raw) return defaultItems
    const parsed = JSON.parse(raw) as Partial<ClosetItem>[]
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultItems

    const normalized = parsed
      .map((item) => normalizeClosetItem(item))
      .filter((item): item is ClosetItem => Boolean(item))

    // Persist normalized shape once so upcoming cloud migration has consistent local schema.
    window.localStorage.setItem('closetItems', JSON.stringify(normalized))

    return normalized
  } catch {
    return defaultItems
  }
}

export function saveClosetItems(items: ClosetItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem('closetItems', JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function addClosetItem(item: ClosetItem): ClosetItem[] {
  const items = loadClosetItems()
  const normalized = normalizeClosetItem(item)
  if (!normalized) return items
  const next = [...items, normalized]
  saveClosetItems(next)
  return next
}

export function itemsByCategory(category: string): ClosetItem[] {
  return loadClosetItems().filter((item) => item.category === category)
}

export function getCategoryItemCounts() {
  return loadClosetItems().reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1
    return acc
  }, {})
}

export function findCategory(id: string, lang: Lang = 'en') {
  return getCategories(lang).find((category) => category.id === id)
}
