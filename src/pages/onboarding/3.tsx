import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './onboarding.module.css'

const styleOptions = ['Minimal', 'Luxury', 'Streetwear', 'Business', 'Sport']

export default function Onboard3() {
  const router = useRouter()
  const [style, setStyle] = useState('Minimal')

  useEffect(() => {
    const saved = loadOnboardingState()
    if (saved.style) setStyle(saved.style)
  }, [])

  function handleNext() {
    saveOnboardingState({ ...loadOnboardingState(), style })
    router.push('/onboarding/4')
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>העדפות סטייל</p>
        <h1 className={styles.title}>הגדר את הסגנון האישי שלך</h1>
        <p className={styles.text}>בחר את קצה האופנה שמייצג אותך וה־AI ימליץ בהתאם.</p>

        <div className={styles.optionsGrid}>
          {styleOptions.map((option) => (
            <button
              key={option}
              className={option === style ? styles.optionActive : styles.optionButton}
              onClick={() => setStyle(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleNext}>
            שמור והמשך
          </button>
        </div>
      </div>
    </div>
  )
}
