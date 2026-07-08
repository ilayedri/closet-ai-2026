import { useLanguage } from '@/context/LanguageContext'
import { loadClosetItems } from '@/lib/closet'
import { getSiteCopy } from '@/lib/site-copy'
import {
  DEFAULT_USER_ID,
  ensureUserProfile,
  recordOutfit,
  refreshIntelligence,
  updateUserProfile,
  upsertWardrobeItem,
} from '@/lib/style-intelligence'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './ai-stylist.module.css'

type VisualOutfit = {
  top?: ReturnType<typeof loadClosetItems>[number]
  bottom?: ReturnType<typeof loadClosetItems>[number]
  shoes?: ReturnType<typeof loadClosetItems>[number]
  outerwear?: ReturnType<typeof loadClosetItems>[number]
  accessories?: ReturnType<typeof loadClosetItems>[number]
}

function pickByCategory(items: ReturnType<typeof loadClosetItems>, category: 'shirts' | 'pants' | 'shoes' | 'jackets' | 'accessories') {
  return items.find((item) => item.category === category)
}

function buildVisualOutfit(items: ReturnType<typeof loadClosetItems>): VisualOutfit {
  return {
    top: pickByCategory(items, 'shirts'),
    bottom: pickByCategory(items, 'pants'),
    shoes: pickByCategory(items, 'shoes'),
    outerwear: pickByCategory(items, 'jackets'),
    accessories: pickByCategory(items, 'accessories'),
  }
}

export default function AiStylistPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).aiStylist
  const [occasion, setOccasion] = useState('Work')
  const [weather, setWeather] = useState('Sunny')
  const [outfit, setOutfit] = useState<string | null>(null)
  const [visualOutfit, setVisualOutfit] = useState<VisualOutfit | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const profile = ensureUserProfile(DEFAULT_USER_ID, lang)
    updateUserProfile(DEFAULT_USER_ID, { language: lang, preferredStyles: profile.preferredStyles })
  }, [lang])

  function createOutfit() {
    const selectedOccasion = copy.occasionOptions.find((option) => option.value === occasion)?.label ?? occasion
    const selectedWeather = copy.weatherOptions.find((option) => option.value === weather)?.label ?? weather
    const closetItems = loadClosetItems()
    const selectedVisualOutfit = buildVisualOutfit(closetItems)

    setOutfit(
      lang === 'he'
        ? `לוק מדויק ל-${selectedOccasion} עם מזג אוויר ${selectedWeather.toLowerCase()}.`
        : `A refined outfit for ${selectedOccasion.toLowerCase()} with ${selectedWeather.toLowerCase()} weather.`
    )
    setVisualOutfit(selectedVisualOutfit)

    setIsSaved(false)
  }

  function saveLook() {
    const closetItems = loadClosetItems()
    const selectedVisualOutfit = visualOutfit || buildVisualOutfit(closetItems)

    closetItems.forEach((item) => {
      upsertWardrobeItem(DEFAULT_USER_ID, {
        itemId: item.id,
        userId: item.userId,
        imageUrl: item.imageUrl || item.image,
        image: item.imageUrl || item.image,
        category: item.category as 'shirts' | 'pants' | 'shoes' | 'jackets' | 'accessories',
        color: item.color,
        style: item.style,
        season: item.season,
        brand: item.brand,
        dateAdded: item.dateAdded,
        wearCount: 0,
        ignoreCount: 0,
      })
    })

    const outfitItems = [
      selectedVisualOutfit.top ? { itemId: selectedVisualOutfit.top.id, category: selectedVisualOutfit.top.category, slot: 'top' as const } : null,
      selectedVisualOutfit.bottom ? { itemId: selectedVisualOutfit.bottom.id, category: selectedVisualOutfit.bottom.category, slot: 'bottom' as const } : null,
      selectedVisualOutfit.shoes ? { itemId: selectedVisualOutfit.shoes.id, category: selectedVisualOutfit.shoes.category, slot: 'shoes' as const } : null,
      selectedVisualOutfit.outerwear ? { itemId: selectedVisualOutfit.outerwear.id, category: selectedVisualOutfit.outerwear.category, slot: 'outerwear' as const } : null,
      selectedVisualOutfit.accessories ? { itemId: selectedVisualOutfit.accessories.id, category: selectedVisualOutfit.accessories.category, slot: 'accessories' as const } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item))

    recordOutfit(DEFAULT_USER_ID, {
      id: `outfit-${Date.now()}`,
      items: outfitItems,
      occasion,
      weather,
      userFeedback: null,
    })

    refreshIntelligence(DEFAULT_USER_ID)
    setIsSaved(true)
    router.push('/outfits?source=stylist')
  }

  const labels = {
    visualTitle: lang === 'he' ? 'לוק להיום (תצוגה ויזואלית)' : "Today's Outfit (Visual Preview)",
    components: lang === 'he' ? 'רכיבי הלוק' : 'Outfit Components',
    top: lang === 'he' ? 'חלק עליון' : 'Top',
    bottom: lang === 'he' ? 'חלק תחתון' : 'Bottom',
    shoes: lang === 'he' ? 'נעליים' : 'Shoes',
    outerwear: lang === 'he' ? 'שכבה חיצונית' : 'Outerwear',
    accessories: lang === 'he' ? 'אקססוריז' : 'Accessories',
    missing: lang === 'he' ? 'לא נמצא פריט מתאים עדיין' : 'No matching item yet',
    why: lang === 'he' ? 'למה הלוק נבחר' : 'Why this outfit was selected',
    reasonWeather: lang === 'he' ? 'התאמה למזג האוויר' : 'Weather match',
    reasonOccasion: lang === 'he' ? 'התאמה לאירוע' : 'Occasion match',
    reasonStyle: lang === 'he' ? 'התאמה לסגנון אישי' : 'Personal style match',
  }

  const outfitHeroImage =
    visualOutfit?.top?.imageUrl || visualOutfit?.top?.image ||
    visualOutfit?.outerwear?.imageUrl || visualOutfit?.outerwear?.image ||
    visualOutfit?.bottom?.imageUrl || visualOutfit?.bottom?.image ||
    visualOutfit?.shoes?.imageUrl || visualOutfit?.shoes?.image ||
    '/assets/images/hero-closet-clean.png'

  const componentRows = visualOutfit
    ? [
      { label: labels.top, item: visualOutfit.top },
      { label: labels.bottom, item: visualOutfit.bottom },
      { label: labels.shoes, item: visualOutfit.shoes },
      { label: labels.outerwear, item: visualOutfit.outerwear },
      { label: labels.accessories, item: visualOutfit.accessories },
    ]
    : []

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.splash}>{copy.splash}</p>
          <h1 className={styles.sectionTitle}>{copy.title}</h1>
          <h2 className={styles.question}>{copy.question}</h2>
          <p>{copy.description}</p>
        </header>

        <section className={styles.contextGrid}>
          {copy.cards.map((card) => (
            <article key={card.title} className={styles.contextCard}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.selectionSection}>
          <p className={styles.selectionLabel}>{copy.occasion}</p>
          <p className={styles.selectionHint}>{copy.occasionHint}</p>
          <div className={styles.optionGrid}>
            {copy.occasionOptions.map((option) => (
              <button
                key={option.value}
                className={option.value === occasion ? styles.optionButtonActive : styles.optionButton}
                onClick={() => setOccasion(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.selectionSection}>
          <p className={styles.selectionLabel}>{copy.weather}</p>
          <p className={styles.selectionHint}>{copy.weatherHint}</p>
          <div className={styles.optionGrid}>
            {copy.weatherOptions.map((option) => (
              <button
                key={option.value}
                className={option.value === weather ? styles.optionButtonActive : styles.optionButton}
                onClick={() => setWeather(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={createOutfit} type="button">{copy.submit}</button>
          <Link href="/closet" className={styles.secondaryButton}>{copy.closetCta}</Link>
        </div>

        {outfit && (
          <section className={styles.result}>
            <h2>{copy.resultTitle}</h2>
            <p>{outfit}</p>
            <p>{copy.resultReason}</p>

            <div className={styles.visualPanel}>
              <h3>{labels.visualTitle}</h3>
              <img src={outfitHeroImage} alt={labels.visualTitle} className={styles.visualImage} />

              <h4>{labels.components}</h4>
              <div className={styles.componentList}>
                {componentRows.map((row) => (
                  <div key={row.label} className={styles.componentRow}>
                    <strong>{row.label}</strong>
                    <span>{row.item ? row.item.name : labels.missing}</span>
                  </div>
                ))}
              </div>

              <h4>{labels.why}</h4>
              <ul className={styles.reasonList}>
                <li>{labels.reasonWeather}: {copy.weatherOptions.find((option) => option.value === weather)?.label || weather}</li>
                <li>{labels.reasonOccasion}: {copy.occasionOptions.find((option) => option.value === occasion)?.label || occasion}</li>
                <li>{labels.reasonStyle}: {lang === 'he' ? 'לפי דפוסי הבחירה הקיימים בארון שלך' : 'Based on your current wardrobe behavior patterns'}</li>
              </ul>
            </div>

            <button className={styles.saveButton} onClick={saveLook} type="button">
              {isSaved ? `${copy.saveLook} ✓` : copy.saveLook}
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
