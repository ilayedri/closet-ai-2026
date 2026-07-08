import { findCategory, itemsByCategory } from '@/lib/closet'
import { useRouter } from 'next/router'
import styles from './category.module.css'

export default function CategoryPage() {
  const router = useRouter()
  const { category } = router.query
  const details = typeof category === 'string' ? findCategory(category) : null
  const items = typeof category === 'string' ? itemsByCategory(category) : []

  if (!details) {
    return <div className={styles.page}>קטגוריה לא נמצאה.</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <button className={styles.backButton} onClick={() => router.push('/closet')}>
          ← חזור ל־My Closet
        </button>

        <header className={styles.header}>
          <div>
            <p className={styles.splash}>{details.emoji} {details.label}</p>
            <h1>{details.label}</h1>
            <p>פריטים בחלק זה של הארון שלך.</p>
          </div>
          <button className={styles.primaryButton} onClick={() => router.push('/add-item')}>
            הוסף פריט חדש
          </button>
        </header>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.imageWrapper}>
                <img src={item.image || '/assets/images/blazer.jpg'} alt={item.name} />
              </div>
              <div className={styles.itemInfo}>
                <strong>{item.name}</strong>
                <span>{item.color} · {item.style}</span>
                <span>נוסף ב־{item.dateAdded}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>טרם נוספו פריטים בקטגוריה זו.</p>}
        </div>
      </div>
    </div>
  )
}
