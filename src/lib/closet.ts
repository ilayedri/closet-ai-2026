import type { Lang } from '@/context/LanguageContext'
import type { ClothingCategory, ClothingSeason } from '@/lib/data-model'
import { getSiteCopy } from './site-copy'

const DEFAULT_LOCAL_USER_ID = 'local-user'

const DISALLOWED_STOCK_ITEM_IMAGES = new Set([
  '/assets/images/shirt.jpg',
  '/assets/images/pants.jpg',
  '/assets/images/shoes.jpg',
  '/assets/images/blazer.jpg',
  '/assets/images/accessories.jpg',
  '/assets/images/hero-bg.png',
  '/assets/images/hero-bg-new.png',
  '/assets/images/hero-closet-clean.png',
])

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

function normalizeColorToHex(color?: string) {
  const normalized = (color || '').trim().toLowerCase()
  if (!normalized) return '#2a2d34'

  const namedColorMap: Record<string, string> = {
    black: '#1f1f1f',
    white: '#f1f1eb',
    gray: '#7f8590',
    grey: '#7f8590',
    blue: '#3e5f8a',
    navy: '#24354f',
    red: '#8f3a3a',
    green: '#3b6d4d',
    brown: '#6f513c',
    beige: '#c8b8a1',
    cream: '#ddd2bf',
    pink: '#b97586',
    purple: '#67507f',
    yellow: '#b8993b',
    orange: '#a46b3f',
  }

  if (namedColorMap[normalized]) return namedColorMap[normalized]
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) return normalized

  return '#2a2d34'
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function categoryGlyph(category: ClothingCategory) {
  if (category === 'shirts') return 'SHIRT'
  if (category === 'pants') return 'PANTS'
  if (category === 'shoes') return 'SHOES'
  if (category === 'jackets') return 'JACKET'
  return 'ACC'
}

function makeGeneratedItemImage(item: Pick<ClosetItem, 'category' | 'color' | 'style' | 'name'>) {
  const background = normalizeColorToHex(item.color)
  const glyph = categoryGlyph(item.category)
  const subtitle = `${item.color || 'Unknown'} · ${item.style || 'Casual'}`
  const title = (item.name || fallbackItemName(item.category)).slice(0, 28)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${background}"/><stop offset="100%" stop-color="#121417"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><rect x="48" y="48" width="704" height="904" rx="36" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2"/><text x="400" y="430" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="72" font-family="Arial, sans-serif" font-weight="700">${escapeXml(glyph)}</text><text x="400" y="820" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="40" font-family="Arial, sans-serif" font-weight="700">${escapeXml(title)}</text><text x="400" y="872" text-anchor="middle" fill="rgba(255,255,255,0.78)" font-size="28" font-family="Arial, sans-serif">${escapeXml(subtitle)}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function isDisallowedStockImage(value: string) {
  const normalized = value.toLowerCase().split('?')[0]
  if (DISALLOWED_STOCK_ITEM_IMAGES.has(normalized)) return true
  if (normalized.includes('chatgpt%20image')) return true
  return false
}

function scrubSuspiciousRepeatedScreenshots(items: ClosetItem[]) {
  const groups = new Map<string, { count: number; categories: Set<string> }>()

  items.forEach((item) => {
    const src = item.imageUrl || item.image
    if (!src || !src.startsWith('data:image/')) return

    const current = groups.get(src) || { count: 0, categories: new Set<string>() }
    current.count += 1
    current.categories.add(item.category)
    groups.set(src, current)
  })

  const suspicious = new Set<string>()
  groups.forEach((group, src) => {
    if (group.count >= 3 && group.categories.size >= 3) suspicious.add(src)
  })

  if (suspicious.size === 0) return items

  return items.map((item) => {
    const src = item.imageUrl || item.image
    if (!src || !suspicious.has(src)) return item

    const generated = makeGeneratedItemImage({
      category: item.category,
      color: item.color,
      style: item.style,
      name: item.name,
    })

    return {
      ...item,
      imageUrl: generated,
      image: generated,
    }
  })
}

const categoryMeta: Array<{ id: ClothingCategory; coverImageUrl: string }> = [
  { id: 'shirts', coverImageUrl: '/assets/images/category-covers/shirts.svg' },
  { id: 'pants', coverImageUrl: '/assets/images/category-covers/pants.svg' },
  { id: 'shoes', coverImageUrl: '/assets/images/category-covers/shoes.svg' },
  { id: 'jackets', coverImageUrl: '/assets/images/category-covers/jackets.svg' },
  { id: 'accessories', coverImageUrl: '/assets/images/category-covers/accessories.svg' },
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
  const hasUsableUploadedImage = Boolean(normalizedImage && !isDisallowedStockImage(normalizedImage))
  const finalImage = hasUsableUploadedImage
    ? normalizedImage
    : makeGeneratedItemImage({
        category: item.category,
        color: item.color || 'Unknown',
        style: item.style || 'Casual',
        name: normalizedName,
      })

  return {
    id: item.id,
    userId: item.userId || DEFAULT_LOCAL_USER_ID,
    name: normalizedName,
    imageUrl: finalImage,
    image: finalImage,
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

    const normalized = scrubSuspiciousRepeatedScreenshots(
      parsed
      .map((item) => normalizeClosetItem(item))
      .filter((item): item is ClosetItem => Boolean(item))
    )

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
