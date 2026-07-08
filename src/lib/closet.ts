import type { Lang } from '@/context/LanguageContext'
import type { ClothingCategory, ClothingSeason } from '@/lib/data-model'
import { getSiteCopy } from './site-copy'

export type ClosetCategory = {
  id: string
  label: string
  emoji: string
  description: string
}

export type ClosetItem = {
  id: string
  name: string
  category: ClothingCategory
  image?: string
  color: string
  style: string
  season: ClothingSeason
  brand?: string
  dateAdded: string
}

const categoryMeta = [
  { id: 'shirts', emoji: '👕' },
  { id: 'pants', emoji: '👖' },
  { id: 'shoes', emoji: '👟' },
  { id: 'jackets', emoji: '🧥' },
  { id: 'accessories', emoji: '⌚' },
]

export const categories: ClosetCategory[] = getCategories('en')

export function getCategories(lang: Lang): ClosetCategory[] {
  const copy = getSiteCopy(lang).categories

  return categoryMeta.map((category) => ({
    id: category.id,
    emoji: category.emoji,
    label: copy[category.id as keyof typeof copy].label,
    description: copy[category.id as keyof typeof copy].description,
  }))
}

const defaultItems: ClosetItem[] = []

export function loadClosetItems(): ClosetItem[] {
  if (typeof window === 'undefined') return defaultItems
  try {
    const raw = window.localStorage.getItem('closetItems')
    if (!raw) return defaultItems
    const parsed = JSON.parse(raw) as ClosetItem[]
    return Array.isArray(parsed) && parsed.length ? parsed : defaultItems
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
  const next = [...items, item]
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
