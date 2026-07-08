import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import styles from './dashboard.module.css'

const translations = {
  he: {
    title: 'הלוח מחוונים של ClosetAI',
    description: 'כל הכלים שלך במקום אחד: ארון, סטייליסט, לוק יומי ופרופיל אישי.',
    sections: [
      { title: 'Smart Closet', description: 'נהל פריטים וראה מה קיים בארון עם חוויית פרימיום.' },
      { title: 'AI Stylist', description: 'קבל לוק מותאם אירוע, מזג אוויר והעדפות אישיות.' },
      { title: "Today's Outfit", description: 'צפה בהמלצת היום שלך ותלבושיה קלה לביצוע.' },
      { title: 'Profile', description: 'עדכן סגנון, צבעים מועדפים והעדפות לבינה המלאכותית.' },
    ],
    startCloset: 'פתח את הארון',
    startStylist: 'פתח את הסטייליסט',
    startProfile: 'פרטי סגנון',
    footer: 'Built with passion in Israel',
  },
  en: {
    title: 'ClosetAI Dashboard',
    description: 'All your style tools in one premium space: closet, stylist, outfit and profile.',
    sections: [
      { title: 'Smart Closet', description: 'Manage items and explore your wardrobe in an elegant interface.' },
      { title: 'AI Stylist', description: 'Get recommendations tailored to occasion, weather, and personal taste.' },
      { title: "Today's Outfit", description: 'See today’s curated recommendation and styling notes.' },
      { title: 'Profile', description: 'Update your style, favorite colors and preferences for AI learning.' },
    ],
    startCloset: 'Open Closet',
    startStylist: 'Open Stylist',
    startProfile: 'Style Profile',
    footer: 'Built with passion in Israel',
  },
}

export default function DashboardPage() {
  const { lang } = useLanguage()
  const text = translations[lang]

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.badge}>ClosetAI</p>
          <h1>{text.title}</h1>
          <p>{text.description}</p>
        </div>
        <div className={styles.heroActions}>
          <Link href="/closet" className={styles.primaryButton}>{text.startCloset}</Link>
          <Link href="/ai-stylist" className={styles.secondaryButton}>{text.startStylist}</Link>
          <Link href="/profile" className={styles.ghostButton}>{text.startProfile}</Link>
        </div>
      </div>

      <section className={styles.cardsGrid}>
        {text.sections.map((section) => (
          <div key={section.title} className={styles.card}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>{text.footer}</p>
      </footer>
    </main>
  )
}
