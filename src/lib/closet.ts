export type ClosetCategory = {
  id: string
  label: string
  emoji: string
  description: string
}

export type ClosetItem = {
  id: string
  name: string
  category: string
  image?: string
  color: string
  style: string
  dateAdded: string
}

export const categories: ClosetCategory[] = [
  { id: 'shirts', label: 'חולצות', emoji: '👕', description: 'החלק העליון של הסטייל שלך.' },
  { id: 'pants', label: 'מכנסיים', emoji: '👖', description: 'הבסיס לכל לוק.' },
  { id: 'shoes', label: 'נעליים', emoji: '👟', description: 'הגימור שמרים כל הופעה.' },
  { id: 'jackets', label: 'מעילים', emoji: '🧥', description: 'כל שכבה חכמה לעונה.' },
  { id: 'accessories', label: 'אקססוריז', emoji: '⌚', description: 'פרטים קטנים שמשפרים הכל.' },
]

const defaultItems: ClosetItem[] = [
  {
    id: '1',
    name: 'Navy Blazer',
    category: 'jackets',
    image: '/assets/images/blazer.jpg',
    color: 'Navy',
    style: 'Business',
    dateAdded: '2026-07-08',
  },
  {
    id: '2',
    name: 'White Shirt',
    category: 'shirts',
    image: '/assets/images/shirt.jpg',
    color: 'White',
    style: 'Minimal',
    dateAdded: '2026-07-08',
  },
  {
    id: '3',
    name: 'Chinos',
    category: 'pants',
    image: '/assets/images/chinos.jpg',
    color: 'Beige',
    style: 'Smart Casual',
    dateAdded: '2026-07-08',
  },
]

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

export function findCategory(id: string) {
  return categories.find((category) => category.id === id)
}
