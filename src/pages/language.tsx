import { useLanguage } from '@/context/LanguageContext'
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import styles from './language.module.css'

export default function LanguagePage() {
  const { lang, setLang } = useLanguage()
  const router = useRouter()
  const copy = getSiteCopy(lang).language

  function chooseLanguage(value: 'he' | 'en') {
    setLang(value)
    const state = loadOnboardingState()
    saveOnboardingState({ ...state, language: value })
    router.push('/onboarding/1')
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.label}>{copy.label}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className={styles.options}>
          <button
            className={lang === 'he' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => chooseLanguage('he')}
          >
            {copy.hebrew}
          </button>
          <button
            className={lang === 'en' ? styles.primaryButton : styles.secondaryButton}
            onClick={() => chooseLanguage('en')}
          >
            {copy.english}
          </button>
        </div>
      </div>
    </main>
  )
}
