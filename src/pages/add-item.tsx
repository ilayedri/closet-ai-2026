import { useLanguage } from '@/context/LanguageContext'
import { addClosetItem, getCategories } from '@/lib/closet'
import type { ClothingCategory, ClothingSeason } from '@/lib/data-model'
import { getSiteCopy } from '@/lib/site-copy'
import { DEFAULT_USER_ID, ensureUserProfile, upsertWardrobeItem } from '@/lib/style-intelligence'
import { detectOutfitItemsFromPhoto, enqueueOutfitPhotoForSeparation } from '@/lib/visual-wardrobe'
import { useRouter } from 'next/router'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import styles from './add-item.module.css'

export default function AddItemPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).addItem
  const categories = getCategories(lang)
  const [name, setName] = useState<string>(copy.newItem)
  const [category, setCategory] = useState<ClothingCategory>('shirts')
  const [color, setColor] = useState<string>(copy.defaultColor)
  const [style, setStyle] = useState<string>(copy.defaultStyle)
  const [season, setSeason] = useState<ClothingSeason>('all-season')
  const [brand, setBrand] = useState<string>('')
  const [image, setImage] = useState('')
  const [sourceMode, setSourceMode] = useState<'camera' | 'upload'>('upload')
  const [isOutfitPhoto, setIsOutfitPhoto] = useState(false)
  const [queuedForSeparation, setQueuedForSeparation] = useState(false)
  const [uploadFileName, setUploadFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ensureUserProfile(DEFAULT_USER_ID, lang)
  }, [lang])

  function openUploadPicker() {
    fileInputRef.current?.click()
  }

  function handleUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setImage(result)
        setUploadFileName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    const dateAdded = new Date().toISOString().slice(0, 10)
    const normalizedImage = image.trim() || undefined

    if (isOutfitPhoto && normalizedImage) {
      enqueueOutfitPhotoForSeparation(DEFAULT_USER_ID, normalizedImage)
      const detectedItems = detectOutfitItemsFromPhoto({
        image: normalizedImage,
        color,
        style,
        season,
        brand: brand || undefined,
      })

      detectedItems.forEach((detected, index) => {
        const itemId = `${Date.now()}-${index}`
        addClosetItem({
          id: itemId,
          name: detected.name,
          category: detected.category,
          image: detected.image,
          color: detected.color,
          style: detected.style,
          season: detected.season,
          brand: detected.brand,
          dateAdded,
        })

        upsertWardrobeItem(DEFAULT_USER_ID, {
          itemId,
          image: detected.image,
          category: detected.category,
          color: detected.color,
          style: detected.style,
          season: detected.season,
          brand: detected.brand,
          dateAdded,
          wearCount: 0,
          ignoreCount: 0,
        })
      })

      setQueuedForSeparation(true)
      router.push('/closet')
      return
    }

    const itemId = `${Date.now()}`

    addClosetItem({
      id: itemId,
      name,
      category,
      image: normalizedImage,
      color,
      style,
      season,
      brand: brand || undefined,
      dateAdded,
    })

    upsertWardrobeItem(DEFAULT_USER_ID, {
      itemId,
      image: normalizedImage,
      category,
      color,
      style,
      season,
      brand: brand || undefined,
      dateAdded,
      wearCount: 0,
      ignoreCount: 0,
    })

    router.push('/closet')
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>

        <section className={styles.sourceSection}>
          <p className={styles.sourceTitle}>{copy.itemSource}</p>
          <div className={styles.sourceGrid}>
            <button
              type="button"
              className={sourceMode === 'camera' ? styles.sourceCardActive : styles.sourceCard}
              onClick={() => setSourceMode('camera')}
            >
              <strong>📷 {copy.takePhoto}</strong>
              <span>{copy.takePhotoHint}</span>
            </button>

            <button
              type="button"
              className={sourceMode === 'upload' ? styles.sourceCardActive : styles.sourceCard}
              onClick={() => {
                setSourceMode('upload')
                openUploadPicker()
              }}
            >
              <strong>🖼 {copy.uploadImage}</strong>
              <span>{copy.uploadHint}</span>
            </button>
          </div>

          {sourceMode === 'camera' && <p className={styles.cameraHint}>{copy.cameraReady}</p>}

          <input
            ref={fileInputRef}
            className={styles.hiddenFileInput}
            type="file"
            accept="image/*"
            onChange={handleUploadFile}
          />

          <div className={styles.previewWrap}>
            {image ? <img src={image} alt={copy.image} className={styles.previewImage} /> : <div className={styles.emptyPreview}>{copy.imageMissingHint}</div>}
            <p>{uploadFileName || copy.uploadHint}</p>
          </div>
        </section>

        <label className={styles.fieldLabel}>
          {copy.name}
          <input className={styles.fieldInput} value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          {copy.category}
          <select className={styles.fieldSelect} value={category} onChange={(event) => setCategory(event.target.value as ClothingCategory)}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          {copy.color}
          <input className={styles.fieldInput} value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          {copy.style}
          <input className={styles.fieldInput} value={style} onChange={(event) => setStyle(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          {copy.brand}
          <input
            className={styles.fieldInput}
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder={copy.brandPlaceholder}
          />
        </label>

        <label className={styles.fieldLabel}>
          {copy.season}
          <select className={styles.fieldSelect} value={season} onChange={(event) => setSeason(event.target.value as ClothingSeason)}>
            <option value="spring">{copy.seasons.spring}</option>
            <option value="summer">{copy.seasons.summer}</option>
            <option value="autumn">{copy.seasons.autumn}</option>
            <option value="winter">{copy.seasons.winter}</option>
            <option value="all-season">{copy.seasons.allSeason}</option>
          </select>
        </label>

        <label className={styles.fieldLabel}>
          <input
            type="checkbox"
            checked={isOutfitPhoto}
            onChange={(event) => setIsOutfitPhoto(event.target.checked)}
          />{' '}
          {copy.fullOutfitPhotoToggle}
        </label>

        {isOutfitPhoto && (
          <p className={styles.cameraHint}>{copy.fullOutfitPhotoHint}</p>
        )}

        {queuedForSeparation && (
          <p className={styles.cameraHint}>{copy.preparedForSeparation}</p>
        )}

        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.secondaryButton} type="button">{copy.cancel}</button>
          <button onClick={handleSubmit} className={styles.primaryButton} type="button">{copy.save}</button>
        </div>
      </div>
    </main>
  )
}
