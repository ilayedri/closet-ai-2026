import LanguageSelector from '@/components/LanguageSelector'
import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <div className={styles.brand}>ClosetAI</div>
        <div className={styles.brandTag}>ארון פרטי חכם ובוט סטיילינג</div>
      </div>
      <nav className={styles.nav}>
        <Link href="#">Home</Link>
        <Link href="#features">Features</Link>
        <Link href="#">How It Works</Link>
        <Link href="#">For You</Link>
        <Link href="#">Pricing</Link>
      </nav>
      <div className={styles.rightGroup}>
        <LanguageSelector />
        <Link href="/onboarding/1" className={styles.cta}>
          Get Started
        </Link>
      </div>
    </header>
  )
}
