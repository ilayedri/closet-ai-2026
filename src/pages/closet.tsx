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

  useEffect(() => {
    const items = loadClosetItems()
    setHasUserItems(items.length > 0)
    setCategoryCounts(getCategoryItemCounts())
  }, [router.asPath])

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

        <section className={styles.processGrid}>
          {copy.process.map((step) => (
            <article key={step.step} className={styles.processCard}>
              <span>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </section>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={styles.categoryCard}
              onClick={() => router.push(`/closet/${category.id}`)}
              type="button"
            >
              <span className={styles.categoryEmoji}>{category.emoji}</span>
              <div>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <small>{categoryCounts[category.id] ?? 0} {copy.itemsCountLabel}</small>
              </div>
            </button>
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
