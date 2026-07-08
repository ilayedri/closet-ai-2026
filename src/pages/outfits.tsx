import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy } from '@/lib/site-copy'
import Link from 'next/link'
import styles from './outfits.module.css'

export default function OutfitsPage() {
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).outfits
  const midpoint = Math.ceil(copy.cards.length / 2)
  const savedLooks = copy.cards.slice(0, midpoint)
  const generatedLooks = copy.cards.slice(midpoint)

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.splash}>{copy.splash}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </header>

        <section className={styles.collectionSection}>
          <p className={styles.collectionLabel}>{copy.savedLabel}</p>
          <div className={styles.outfitGrid}>
            {savedLooks.map((card) => (
              <article key={card.title} className={styles.outfitCard}>
                <p className={styles.outfitLabel}>{card.label}</p>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        {generatedLooks.length > 0 && (
          <section className={styles.collectionSection}>
            <p className={styles.collectionLabel}>{copy.generatedLabel}</p>
            <div className={styles.outfitGrid}>
              {generatedLooks.map((card) => (
                <article key={card.title} className={styles.outfitCardMuted}>
                  <p className={styles.outfitLabel}>{card.label}</p>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className={styles.bottomNote}>
          <p>{copy.bottom}</p>
          <Link href="/stylist" className={styles.primaryButton}>{copy.cta}</Link>
        </div>
      </div>
    </main>
  )
}
