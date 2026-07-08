import { useLanguage } from '@/context/LanguageContext'
import { findCategory, itemsByCategory } from '@/lib/closet'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import styles from './category.module.css'

export default function CategoryPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).categoryPage
  const brandLabel = lang === 'he' ? 'מותג' : 'Brand'
  const categoryLabel = lang === 'he' ? 'קטגוריה' : 'Category'
  const { category } = router.query
  const details = typeof category === 'string' ? findCategory(category, lang) : null
  const items = typeof category === 'string' ? itemsByCategory(category) : []

  if (!details) {
    return <div className={styles.page}>{copy.notFound}</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <button className={styles.backButton} onClick={() => router.push('/closet')}>
          ← {copy.back}
        </button>

        <header className={styles.header}>
          <div>
            <p className={styles.splash}>{details.emoji} {details.label}</p>
            <h1>{details.label}</h1>
            <p>{copy.description}</p>
          </div>
          <button className={styles.primaryButton} onClick={() => router.push('/add-item')} type="button">
            {copy.addItem}
          </button>
        </header>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.imageWrapper}>
                {item.imageUrl || item.image ? (
                  <img src={item.imageUrl || item.image} alt={item.name} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <strong>{item.name}</strong>
                    <span>{details.label}</span>
                    <span>{item.color} · {item.style}</span>
                  </div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <strong>{item.name}</strong>
                <span>{categoryLabel} {details.label}</span>
                <span>{item.color} · {item.style}</span>
                {item.brand ? <span>{brandLabel} {item.brand}</span> : null}
                <span>{copy.season} {item.season}</span>
                <span>{copy.addedOn} {item.dateAdded}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>{copy.empty}</p>}
        </div>
      </div>
    </div>
  )
}
