import { useLanguage } from '@/context/LanguageContext'
import { loadClosetItems } from '@/lib/closet'
import { DEFAULT_USER_ID, loadUserDataBundle } from '@/lib/style-intelligence'
import Link from 'next/link'
import { useMemo } from 'react'
import styles from './user.module.css'

export default function UserPage() {
  const { lang } = useLanguage()
  const bundle = loadUserDataBundle(DEFAULT_USER_ID)
  const items = loadClosetItems()

  const copy = useMemo(
    () => ({
      splash: lang === 'he' ? 'מרחב משתמש' : 'User Space',
      title: lang === 'he' ? 'הארון שלך, כמו שאת/ה באמת לובש/ת' : 'Your wardrobe, exactly how you wear it',
      text:
        lang === 'he'
          ? 'מסך אישי שמציג בצורה ויזואלית את הפריטים האמיתיים שהעלית, יחד עם תמונת מצב של למידת הסטייל שלך.'
          : 'A personal visual space for your real uploaded items and your style-learning snapshot.',
      wardrobe: lang === 'he' ? 'פריטים בארון' : 'Wardrobe Items',
      outfits: lang === 'he' ? 'לוקים שנשמרו' : 'Saved Outfits',
      styles: lang === 'he' ? 'סגנונות מובילים' : 'Top Styles',
      openCloset: lang === 'he' ? 'לארון המלא' : 'Open Full Closet',
      noImage: lang === 'he' ? 'ללא תמונה' : 'No image',
    }),
    [lang]
  )

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>{copy.splash}</p>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>

        <section className={styles.statsGrid}>
          <article>
            <span>{copy.wardrobe}</span>
            <strong>{bundle.wardrobe.length}</strong>
          </article>
          <article>
            <span>{copy.outfits}</span>
            <strong>{bundle.outfitHistory.length}</strong>
          </article>
          <article>
            <span>{copy.styles}</span>
            <strong>{bundle.intelligence.preferredStyles.join(', ') || '-'}</strong>
          </article>
        </section>

        <section className={styles.visualGrid}>
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className={styles.itemCard}>
              {item.image ? (
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              ) : (
                <div className={styles.placeholder}>
                  <span>{copy.noImage}</span>
                  <strong>{item.name}</strong>
                  <small>{item.color} · {item.style}</small>
                </div>
              )}
              <div className={styles.itemMeta}>
                <strong>{item.name}</strong>
                <span>{item.color} · {item.style}</span>
              </div>
            </div>
          ))}
        </section>

        <Link href="/closet" className={styles.primaryButton}>{copy.openCloset}</Link>
      </div>
    </main>
  )
}
