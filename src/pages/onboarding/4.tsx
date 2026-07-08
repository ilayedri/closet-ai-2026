import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './onboarding.module.css'

export default function Onboard4() {
  const router = useRouter()
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
        <p className={styles.splash}>סיום ההגדרות</p>
        <h1 className={styles.title}>הארון החכם שלך כמעט מוכן</h1>
        <p className={styles.text}>הגדרות סופיות כדי להתחיל לקבל לוקים ואורח חיים של סגנון אישי.</p>
        <div className={styles.summaryBox}>
          <div>שפה: {state.language === 'he' ? 'עברית' : 'English'}</div>
          <div>סגנון: {state.style}</div>
        </div>
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleComplete}>
            פתח את הארון שלי
          </button>
        </div>
      </div>
    </div>
  )
}
