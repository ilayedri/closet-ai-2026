import Link from 'next/link'
import { useRef } from 'react'
import styles from './index.module.css'

export default function HomePage() {
  const stylistRef = useRef<HTMLDivElement | null>(null)

  function scrollToStylist() {
    stylistRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <p className={styles.badge}>ClosetAI</p>
          <h1>Meet Your AI Fashion Stylist</h1>
          <p>Your wardrobe. Your style. Powered by artificial intelligence.</p>
          <div className={styles.actions}>
            <Link href="/language" className={styles.primaryButton}>
              Start Your Journey
            </Link>
            <button className={styles.secondaryButton} onClick={scrollToStylist}>
              Discover AI Styling
            </button>
          </div>
          <p className={styles.subtext}>Luxury closet experience with real actions, not placeholders.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionCard}>
          <span className={styles.sectionLabel}>Premium Experience</span>
          <h2>One elegant path from discovery to daily outfits.</h2>
          <p>Every tap takes you deeper in the wardrobe: language, onboarding, dashboard, closet, stylist and profile.</p>
        </div>
        <div className={styles.overviewGrid}>
          <div className={styles.featureCard}>
            <p className={styles.featureTitle}>Smart Closet</p>
            <p>Organize shirts, pants, shoes, jackets and accessories in a premium digital closet.</p>
          </div>
          <div className={styles.featureCard}>
            <p className={styles.featureTitle}>AI Stylist</p>
            <p>Get outfit recommendations tailored to occasion, weather and your personal style.</p>
          </div>
          <div className={styles.featureCard}>
            <p className={styles.featureTitle}>Luxurious Design</p>
            <p>Minimal black and gold interface with elegant transitions and refined clarity.</p>
          </div>
        </div>
      </section>

      <section className={styles.splitSection} ref={stylistRef}>
        <div className={styles.splitText}>
          <p className={styles.badge}>AI Stylist</p>
          <h2>From occasion to outfit in seconds.</h2>
          <p>Choose work, date, event, casual or sport. Pick weather. Receive a premium recommendation synchronized to your wardrobe and style.</p>
          <Link href="/ai-stylist" className={styles.linkButton}>
            Explore AI Styling
          </Link>
        </div>
        <div className={styles.splitPreview}>
          <div className={styles.previewCard}>
            <span>Why it works</span>
            <p>AI combines your closet profile, mood and weather to propose a look that feels modern, polished and effortless.</p>
          </div>
        </div>
      </section>

      <section className={styles.footerSection}>
        <div>
          <p className={styles.smallLabel}>Built with passion in Israel</p>
          <h3>A future wardrobe that feels personal and high-end.</h3>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/language">Start Now</Link>
          <Link href="/dashboard">Open Dashboard</Link>
        </div>
      </section>
    </main>
  )
}

