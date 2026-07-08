import { useLanguage } from '@/context/LanguageContext'
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './onboarding.module.css'

export default function Onboard4() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).onboarding4
  const [state, setState] = useState(loadOnboardingState())

  useEffect(() => {
    const saved = loadOnboardingState()
    setState(saved)
  }, [])

  function handleComplete() {
    saveOnboardingState({ ...state, completedAt: new Date().toISOString() })
    router.push('/closet')
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>
        <div className={styles.summaryBox}>
          <div>{copy.language}: {state.language === 'he' ? 'עברית' : 'English'}</div>
          <div>{copy.style}: {state.style.join(', ')}</div>
        </div>
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleComplete}>
            {copy.openCloset}
          </button>
        </div>
      </div>
    </div>
  )
}
