import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import styles from './onboarding.module.css'

export default function Onboard2() {
  const { lang, setLang } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (lang) {
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    }
  }, [lang])

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>בחר/י שפה</p>
        <h1 className={styles.title}>בחר/י את השפה המועדפת עליך</h1>
        <p className={styles.text}>הבחירה תשמור את כיוון הטקסט והחווייה שלך.</p>
        <div className={styles.langButtons}>
          <button
            className={lang === 'he' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => {
              setLang('he')
              router.push('/onboarding/3')
            }}
          >
            🇮🇱 עברית
          </button>
          <button
            className={lang === 'en' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => {
              setLang('en')
              router.push('/onboarding/3')
            }}
          >
            🇺🇸 English
          </button>
        </div>
      </div>
    </div>
  )
}
