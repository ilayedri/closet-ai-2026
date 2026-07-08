import { useLanguage } from '@/context/LanguageContext'
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { getSiteCopy } from '@/lib/site-copy'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './onboarding.module.css'

export default function Onboard3() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).onboarding3
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Minimal'])

  useEffect(() => {
    const saved = loadOnboardingState()
    if (saved.style?.length) setSelectedStyles(saved.style)
  }, [])

  function toggleStyle(value: string) {
    setSelectedStyles((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }

  function handleNext() {
    saveOnboardingState({ ...loadOnboardingState(), style: selectedStyles })
    router.push('/onboarding/4')
  }

  const multiHint =
    lang === 'he'
      ? 'ניתן לבחור כמה סגנונות שמתאימים לך.'
      : 'You can choose multiple styles that match you.'

  const selectedLabel =
    lang === 'he'
      ? `נבחרו ${selectedStyles.length} סגנונות`
      : `${selectedStyles.length} styles selected`

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>
        <p className={styles.text}>{multiHint}</p>
        <p className={styles.selectionMeta}>{selectedLabel}</p>

        <div className={styles.optionsGrid}>
          {copy.options.map((option) => (
            <button
              key={option.value}
              className={selectedStyles.includes(option.value) ? styles.optionActive : styles.optionButton}
              onClick={() => toggleStyle(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleNext}>
            {copy.save}
          </button>
        </div>
      </div>
    </div>
  )
}
