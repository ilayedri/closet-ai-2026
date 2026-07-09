import { useLanguage } from '@/context/LanguageContext'
import { getCategories, getCategoryItemCounts, loadClosetItems } from '@/lib/closet'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './closet.module.css'

export default function ClosetPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).closet
  const categories = getCategories(lang)
  const [hasUserItems, setHasUserItems] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [brokenCategoryCovers, setBrokenCategoryCovers] = useState<Record<string, true>>({})

  useEffect(() => {
    const items = loadClosetItems()
    setHasUserItems(items.length > 0)
    setCategoryCounts(getCategoryItemCounts())
  }, [router.asPath])

  const labels = {
    categoryCount: lang === 'he' ? 'פריטים' : 'items',
    openCloset: lang === 'he' ? 'פתח ארון' : 'Open Closet',
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.top}>
          <div>
            <p className={styles.splash}>{copy.splash}</p>
            <h1 className={styles.sectionTitle}>{copy.title}</h1>
            <p className={styles.subtitle}>{copy.subtitle}</p>
            <p className={styles.description}>{copy.description}</p>
          </div>
          <button className={styles.primaryButton} onClick={() => router.push('/add-item')} type="button">
            {copy.addItem}
          </button>
        </header>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            (() => {
              return (
            <button
              key={category.id}
              className={styles.categoryCard}
              onClick={() => router.push(`/closet/${category.id}`)}
              type="button"
            >
              <div className={styles.categoryImageWrap}>
                {category.coverImageUrl && !brokenCategoryCovers[category.id] && (
                  <img
                    src={category.coverImageUrl}
                    alt={category.label}
                    className={styles.categoryImage}
                    onError={() =>
                      setBrokenCategoryCovers((current) => ({
                        ...current,
                        [category.id]: true,
                      }))
                    }
                  />
                )}
                <div className={styles.categoryImagePlaceholder}>
                  <small>{category.label}</small>
                </div>
              </div>

              <div className={styles.categoryBody}>
                <h3>{category.label}</h3>
                <strong>{categoryCounts[category.id] ?? 0} {labels.categoryCount}</strong>
                <small>{labels.openCloset}</small>
              </div>
            </button>
              )
            })()
          ))}
        </div>

        {!hasUserItems && (
          <section className={styles.emptyState}>
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyText}</p>
            <button className={styles.secondaryButton} onClick={() => router.push('/add-item')} type="button">
              {copy.emptyCta}
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
