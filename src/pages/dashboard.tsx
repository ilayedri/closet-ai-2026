import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy } from '@/lib/site-copy'
import Link from 'next/link'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).dashboard

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.badge}>{copy.badge}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className={styles.heroActions}>
          <Link href="/closet" className={styles.primaryButton}>{copy.ctas.closet}</Link>
          <Link href="/stylist" className={styles.secondaryButton}>{copy.ctas.stylist}</Link>
          <Link href="/outfits" className={styles.ghostButton}>{copy.ctas.outfits}</Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        {copy.summary.map((card) => (
          <div key={card.title} className={styles.summaryCard}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.text}</p>
          </div>
        ))}
      </section>

      <section className={styles.cardsGrid}>
        {copy.cards.map((card) => (
          <div key={card.title} className={styles.card}>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>{copy.footer}</p>
      </footer>
    </main>
  )
}
