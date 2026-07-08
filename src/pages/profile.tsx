import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy } from '@/lib/site-copy'
import { DEFAULT_USER_ID, loadUserDataBundle, refreshIntelligence } from '@/lib/style-intelligence'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './profile.module.css'

export default function ProfilePage() {
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).profile
  const userSpaceLabel = lang === 'he' ? 'מרחב המשתמש הוויזואלי' : 'Open Visual User Space'
  const [bundle, setBundle] = useState(() => loadUserDataBundle(DEFAULT_USER_ID))

  useEffect(() => {
    refreshIntelligence(DEFAULT_USER_ID)
    setBundle(loadUserDataBundle(DEFAULT_USER_ID))
  }, [lang])

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>

        <div className={styles.statsGrid}>
          {copy.cards.map((card) => (
            <div key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>

        <section className={styles.settingsCard}>
          <p className={styles.futureLabel}>{copy.splash}</p>
          <h2>{copy.title}</h2>
          <div className={styles.settingsGrid}>
            {copy.settings.map((setting) => (
              <div key={setting.label} className={styles.settingItem}>
                <span>{setting.label}</span>
                <strong>{setting.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.futureCard}>
          <p className={styles.futureLabel}>{copy.futureLabel}</p>
          <h2>{copy.futureTitle}</h2>
          <p>{copy.futureText}</p>
          <ul className={styles.futureList}>
            {copy.futureStack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.intelligenceCard}>
          <p className={styles.futureLabel}>{copy.intelligence.label}</p>
          <h2>{copy.intelligence.title}</h2>
          <div className={styles.intelligenceGrid}>
            <div>
              <span>{copy.intelligence.wardrobeItems}</span>
              <strong>{bundle.wardrobe.length}</strong>
            </div>
            <div>
              <span>{copy.intelligence.outfitHistory}</span>
              <strong>{bundle.outfitHistory.length}</strong>
            </div>
            <div>
              <span>{copy.intelligence.combinations}</span>
              <strong>{bundle.intelligence.favoriteCombinations.length}</strong>
            </div>
          </div>
          <p>{bundle.intelligence.inferredPreference}</p>
          <Link href="/user" className={styles.userSpaceButton}>{userSpaceLabel}</Link>
        </section>
      </div>
    </main>
  )
}
