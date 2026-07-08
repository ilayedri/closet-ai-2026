import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy } from '@/lib/site-copy'
import Link from 'next/link'
import styles from './onboarding.module.css'

export default function Onboard1() {
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).onboarding1

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>
        <div className={styles.actions}>
          <Link href="/onboarding/2">
            <button className={styles.primaryButton}>{copy.next}</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
