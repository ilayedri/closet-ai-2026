import { useLanguage } from '@/context/LanguageContext'
import { findCategory, itemsByCategory, resolveItemImageSource } from '@/lib/closet'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from './category.module.css'

export default function CategoryPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).categoryPage
  const labels = {
    color: lang === 'he' ? 'צבע' : 'Color',
    style: lang === 'he' ? 'סגנון' : 'Style',
  }
  const { category } = router.query
  const details = typeof category === 'string' ? findCategory(category, lang) : null
  const items = typeof category === 'string' ? itemsByCategory(category) : []
  const [brokenItemKeys, setBrokenItemKeys] = useState<Record<string, true>>({})

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
            <p className={styles.splash}>{details.label}</p>
            <h1>{details.label}</h1>
            <p>{copy.description}</p>
          </div>
          <button className={styles.primaryButton} onClick={() => router.push('/add-item')} type="button">
            {copy.addItem}
          </button>
        </header>

        <section className={styles.categoryHero}>
          <div className={styles.categoryHeroOverlay}>
            <strong>{details.label}</strong>
            <span>{items.length} {lang === 'he' ? 'פריטים' : 'items'}</span>
          </div>
        </section>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.imageWrapper}>
                {resolveItemImageSource(item.imageUrl || item.image) && !brokenItemKeys[item.id] ? (
                  <img
                    src={resolveItemImageSource(item.imageUrl || item.image)}
                    alt={item.name}
                    onError={() =>
                      setBrokenItemKeys((current) => ({
                        ...current,
                        [item.id]: true,
                      }))
                    }
                  />
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
                <span>{labels.color}: {item.color}</span>
                <span>{labels.style}: {item.style}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className={styles.emptyText}>{copy.empty}</p>}
        </div>
      </div>
    </div>
  )
}
