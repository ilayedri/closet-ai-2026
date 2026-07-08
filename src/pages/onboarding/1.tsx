import Link from 'next/link'
import styles from './onboarding.module.css'

export default function Onboard1() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>Welcome to ClosetAI</p>
        <h1 className={styles.title}>ברוך הבא לעתיד של הארון החכם</h1>
        <p className={styles.text}>צעדים קצרים להכנה של הארון האישי שלך וליצירת סטיילינג AI.</p>
        <div className={styles.actions}>
          <Link href="/onboarding/2">
            <button className={styles.primaryButton}>המשך</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
