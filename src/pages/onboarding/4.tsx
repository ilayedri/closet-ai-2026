import { useLanguage } from '@/context/LanguageContext'
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding'
import { getSiteCopy } from '@/lib/site-copy'
import { buildStylePreference, DEFAULT_USER_ID, updateUserProfile } from '@/lib/style-intelligence'
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
    const completedState = { ...state, completedAt: new Date().toISOString() }
    const clothingHabits = state.clothingHabits
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    const preferences = state.about
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    saveOnboardingState(completedState)
    updateUserProfile(DEFAULT_USER_ID, {
      language: state.language,
      gender: state.gender,
      preferredStyles: buildStylePreference(state.style),
      clothingPreferences: preferences,
      clothingHabits,
      weatherLocation: state.weatherLocation.trim() || undefined,
      location: state.weatherLocation.trim() || undefined,
      personalization: {
        preferences,
        weatherLocation: state.weatherLocation.trim() || undefined,
        clothingHabits,
      },
    })
    router.push('/closet')
  }

  const genderOptions = [
    { value: 'male', label: copy.genderOptions.male },
    { value: 'female', label: copy.genderOptions.female },
    { value: 'prefer-not-to-say', label: copy.genderOptions.preferNotToSay },
  ] as const

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>
        <p className={styles.text}><strong>{copy.aboutTitle}</strong></p>
        <p className={styles.text}>{copy.aboutHint}</p>

        <label className={styles.fieldLabel}>
          {copy.gender}
          <select
            className={styles.fieldSelect}
            value={state.gender}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                gender: event.target.value as 'male' | 'female' | 'prefer-not-to-say',
              }))
            }
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          {copy.about}
          <input
            className={styles.fieldInput}
            value={state.about}
            placeholder={copy.aboutPlaceholder}
            onChange={(event) => setState((current) => ({ ...current, about: event.target.value }))}
          />
        </label>

        <label className={styles.fieldLabel}>
          {copy.weatherLocation}
          <input
            className={styles.fieldInput}
            value={state.weatherLocation}
            placeholder={copy.weatherLocationPlaceholder}
            onChange={(event) => setState((current) => ({ ...current, weatherLocation: event.target.value }))}
          />
        </label>

        <label className={styles.fieldLabel}>
          {copy.clothingHabits}
          <input
            className={styles.fieldInput}
            value={state.clothingHabits}
            placeholder={copy.habitsPlaceholder}
            onChange={(event) => setState((current) => ({ ...current, clothingHabits: event.target.value }))}
          />
        </label>

        <div className={styles.summaryBox}>
          <div>{copy.language}: {state.language === 'he' ? 'עברית' : 'English'}</div>
          <div>{copy.style}: {state.style.join(', ')}</div>
          <div>{copy.gender}: {genderOptions.find((option) => option.value === state.gender)?.label || copy.genderOptions.preferNotToSay}</div>
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
