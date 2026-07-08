import { categories } from '@/lib/closet'
import { useRouter } from 'next/router'
import styles from './closet.module.css'

export default function ClosetPage() {
  const router = useRouter()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.top}>
          <div>
            <p className={styles.splash}>My Closet</p>
            <h1 className={styles.sectionTitle}>ארון חכם אישי</h1>
            <p className={styles.description}>בחר קטגוריה ותתחיל לנהל את הפריטים, הסטייל וההעדפות שלך.</p>
          </div>
          <button className={styles.primaryButton} onClick={() => router.push('/add-item')}>
            הוסף פריט חדש
          </button>
        </header>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <button key={category.id} className={styles.categoryCard} onClick={() => router.push(`/closet/${category.id}`)}>
              <span className={styles.categoryEmoji}>{category.emoji}</span>
              <div>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
