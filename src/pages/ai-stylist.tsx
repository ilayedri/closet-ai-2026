import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from './ai-stylist.module.css'

const occasions = ['Work', 'Date', 'Event', 'Casual', 'Sport']
const weathers = ['Sunny', 'Cold', 'Rainy']

export default function AiStylistPage() {
  const router = useRouter()
  const [occasion, setOccasion] = useState('Work')
  const [weather, setWeather] = useState('Sunny')
  const [outfit, setOutfit] = useState<string | null>(null)

  function createOutfit() {
    setOutfit(`המלצת לוק ל${occasion.toLowerCase()} ב${weather.toLowerCase()}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← חזור
        </button>

        <header className={styles.header}>
          <p className={styles.splash}>AI Stylist</p>
          <h1 className={styles.sectionTitle}>צור לי לוק עם בינה מלאכותית</h1>
          <p>בחר אירוע ומזג אוויר ותקבל המלצה עם הסבר מדויק.</p>
        </header>

        <label className={styles.fieldLabel}>
          אירוע
          <select className={styles.fieldSelect} value={occasion} onChange={(event) => setOccasion(event.target.value)}>
            {occasions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          מזג אוויר
          <select className={styles.fieldSelect} value={weather} onChange={(event) => setWeather(event.target.value)}>
            {weathers.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={createOutfit}>Create My Outfit</button>
        </div>

        {outfit && (
          <div className={styles.result}>
            <h2>Recommended Outfit</h2>
            <p>{outfit}</p>
            <p>Why this outfit was selected: התאמה לסטייל שלך ולמזג האוויר.</p>
          </div>
        )}
      </div>
    </div>
  )
}
