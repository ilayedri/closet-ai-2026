import { useLanguage } from '@/context/LanguageContext'
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { useRouter } from 'next/router'
import styles from './language.module.css'

export default function LanguagePage() {
  const { lang, setLang } = useLanguage()
  const router = useRouter()

  function chooseLanguage(value: 'he' | 'en') {
    setLang(value)
    const state = loadOnboardingState()
    saveOnboardingState({ ...state, language: value })
    router.push('/onboarding/1')
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.label}>שפה / Language</p>
        <h1 className={styles.title}>בחר את השפה שלך</h1>
        <p className={styles.description}>עבור לחוויית ארון חכם מותאמת לשפה ולכיוון הטקסט.</p>
        <div className={styles.options}>
          <button
            className={lang === 'he' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => chooseLanguage('he')}
          >
            🇮🇱 עברית
          </button>
          <button
            className={lang === 'en' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => chooseLanguage('en')}
          >
            🇺🇸 English
          </button>
        </div>
      </div>
    </main>
  )
}
