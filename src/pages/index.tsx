import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy, heroBackgroundUrl } from '@/lib/site-copy'
import Link from 'next/link'
import styles from './index.module.css'

export default function HomePage() {
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).home

  return (
    <main className={styles.page}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: `url('${heroBackgroundUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className={styles.heroBackdrop} />
        <div className={styles.shell}>
          <div className={styles.overlay} />

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <p className={styles.badge}>{copy.heroIntroLabel}</p>
              <h1>{copy.heroIntroTitle}</h1>
              <p>{copy.heroIntroDescription}</p>

              <div className={styles.heroActions}>
                <Link href="/onboarding/1" className={styles.primaryButton}>
                  {copy.ctas.journey}
                </Link>
                <a href="#how-it-works" className={styles.secondaryButton}>
                  {copy.ctas.howItWorks}
                </a>
              </div>

              <div className={styles.heroSignals}>
                {copy.metrics.map((metric) => (
                  <div key={metric.label} className={styles.signalCard}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <aside className={styles.assistantRail}>
              <div className={styles.assistantCard}>
                <p className={styles.assistantLabel}>{copy.assistant.label}</p>
                <h2>{copy.assistant.title}</h2>
                <p>{copy.assistant.text}</p>
                <Link href="/stylist" className={styles.ghostButton}>
                  {copy.ctas.assistant}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className={styles.contentShell}>
        <section className={styles.visionSection} id="how-it-works">
          <div className={styles.sectionIntro}>
            <p className={styles.smallLabel}>{copy.vision.label}</p>
            <h2>{copy.vision.title}</h2>
            <p className={styles.sectionText}>
              {copy.vision.text}
            </p>
          </div>

          <div className={styles.visionGrid}>
            {copy.vision.cards.map((card) => (
              <article key={card.title} className={styles.visionCard}>
                <p className={styles.featureTag}>{card.tag}</p>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.featureSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.smallLabel}>{copy.capabilities.label}</p>
            <h2>{copy.capabilities.title}</h2>
          </div>

          <div className={styles.featureGrid}>
            {copy.capabilities.cards.map((card) => (
              <div key={card.title} className={styles.featureCard}>
                <p className={styles.featureTag}>{card.tag}</p>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.flowSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.smallLabel}>{copy.roadmap.label}</p>
            <h2>{copy.roadmap.title}</h2>
          </div>

          <div className={styles.roadmapGrid}>
            {copy.roadmap.cards.map((card) => (
              <div key={card.step + card.title} className={styles.flowCard}>
                <div className={styles.stepNumber}>{card.step}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.aboutCard}>
            <p className={styles.badge}>{copy.about.badge}</p>
            <h3>{copy.about.title}</h3>
            {copy.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <div className={styles.actions}>
              <Link href="/stylist" className={styles.primaryButton}>
                {copy.about.ctas.dashboard}
              </Link>
              <Link href="/closet" className={styles.secondaryButton}>
                {copy.about.ctas.closet}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

