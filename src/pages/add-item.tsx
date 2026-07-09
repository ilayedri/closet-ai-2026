import { useLanguage } from '@/context/LanguageContext'
import { addClosetItem, getCategories } from '@/lib/closet'
import type { ClothingCategory, ClothingSeason } from '@/lib/data-model'
import { getSiteCopy } from '@/lib/site-copy'
import { DEFAULT_USER_ID, ensureUserProfile, upsertWardrobeItem } from '@/lib/style-intelligence'
import { detectOutfitItemsFromPhoto, detectSingleItemCategory, detectSingleItemCategoryDetails, enqueueOutfitPhotoForSeparation } from '@/lib/visual-wardrobe'
import { useRouter } from 'next/router'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import styles from './add-item.module.css'

const ITEM_DEBUG_LOG_KEY = 'closetai:item-processing-debug'

function logItemProcessing(step: string, payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  try {
    const current = window.localStorage.getItem(ITEM_DEBUG_LOG_KEY)
    const parsed = current ? (JSON.parse(current) as Array<Record<string, unknown>>) : []
    const nextEntry = {
      step,
      at: new Date().toISOString(),
      ...payload,
    }

    window.localStorage.setItem(ITEM_DEBUG_LOG_KEY, JSON.stringify([nextEntry, ...parsed].slice(0, 40)))
  } catch {
    // ignore debug log failures
  }
}

export default function AddItemPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).addItem
  const categories = getCategories(lang)
  const [name, setName] = useState<string>(copy.newItem)
  const [color, setColor] = useState<string>(copy.defaultColor)
  const [style, setStyle] = useState<string>(copy.defaultStyle)
  const [season, setSeason] = useState<ClothingSeason>('all-season')
  const [brand, setBrand] = useState<string>('')
  const [image, setImage] = useState('')
  const [sourceMode, setSourceMode] = useState<'camera' | 'upload'>('upload')
  const [isOutfitPhoto, setIsOutfitPhoto] = useState(false)
  const [detectedCategories, setDetectedCategories] = useState<ClothingCategory[]>([])
  const [queuedForSeparation, setQueuedForSeparation] = useState(false)
  const [uploadFileName, setUploadFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ensureUserProfile(DEFAULT_USER_ID, lang)
  }, [lang])

  useEffect(() => {
    if (!isOutfitPhoto) {
      setDetectedCategories([])
      return
    }

    const categoriesFromSignals = detectOutfitItemsFromPhoto({
      image,
      name,
      fileName: uploadFileName,
      color,
      style,
      season,
      brand: brand || undefined,
    }).map((item) => item.category)

    setDetectedCategories(categoriesFromSignals)
  }, [isOutfitPhoto, image, name, uploadFileName, color, style, season, brand])

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
        const detection = detectSingleItemCategoryDetails({
          name,
          fileName: file.name,
          style,
          brand,
        })
        setDetectedCategories([detection.category])
        logItemProcessing('upload-received', {
          fileName: file.name,
          hasImage: true,
          detectedCategory: detection.category,
          confidence: detection.confidence,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    const dateAdded = new Date().toISOString().slice(0, 10)
    const normalizedImage = image.trim() || undefined
    const detection = detectSingleItemCategoryDetails({
      name,
      fileName: uploadFileName,
      style,
      brand,
    })
    const autoCategory = detection.category
    const safeName = name.trim() || categories.find((item) => item.id === autoCategory)?.label || copy.newItem

    logItemProcessing('recognition', {
      fileName: uploadFileName,
      name,
      style,
      brand,
      detectedCategory: autoCategory,
      confidence: detection.confidence,
      sourceText: detection.sourceText,
      isOutfitPhoto,
    })

    if (isOutfitPhoto && normalizedImage) {
      const selectedCategories = detectOutfitItemsFromPhoto({
        image: normalizedImage,
        name,
        fileName: uploadFileName,
        color,
        style,
        season,
        brand: brand || undefined,
      }).map((item) => item.category)

      setDetectedCategories(selectedCategories)
      enqueueOutfitPhotoForSeparation(DEFAULT_USER_ID, normalizedImage)
      const detectedItems = detectOutfitItemsFromPhoto({
        image: normalizedImage,
        name,
        fileName: uploadFileName,
        color,
        style,
        season,
        brand: brand || undefined,
        categories: selectedCategories,
        nameByCategory: Object.fromEntries(
          selectedCategories.map((selectedCategory) => {
            const match = categories.find((item) => item.id === selectedCategory)
            return [selectedCategory, match?.label || selectedCategory]
          })
        ) as Partial<Record<ClothingCategory, string>>,
      })

      detectedItems.forEach((detected, index) => {
        const itemId = `${Date.now()}-${index}`
        addClosetItem({
          id: itemId,
          userId: DEFAULT_USER_ID,
          name: detected.name,
          category: detected.category,
          imageUrl: detected.image,
          image: detected.image,
          color: detected.color,
          style: detected.style,
          season: detected.season,
          brand: detected.brand,
          dateAdded,
        })

        upsertWardrobeItem(DEFAULT_USER_ID, {
          itemId,
          userId: DEFAULT_USER_ID,
          imageUrl: detected.image,
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

        logItemProcessing('item-created-outfit', {
          itemId,
          category: detected.category,
          hasImage: Boolean(detected.image),
          name: detected.name,
        })
      })

      setQueuedForSeparation(true)
      router.push('/closet')
      return
    }

    const itemId = `${Date.now()}`

    addClosetItem({
      id: itemId,
      userId: DEFAULT_USER_ID,
      name: safeName,
      category: autoCategory,
      imageUrl: normalizedImage,
      image: normalizedImage,
      color,
      style,
      season,
      brand: brand || undefined,
      dateAdded,
    })

    upsertWardrobeItem(DEFAULT_USER_ID, {
      itemId,
      userId: DEFAULT_USER_ID,
      imageUrl: normalizedImage,
      image: normalizedImage,
      category: autoCategory,
      color,
      style,
      season,
      brand: brand || undefined,
      dateAdded,
      wearCount: 0,
      ignoreCount: 0,
    })

    logItemProcessing('item-created-single', {
      itemId,
      category: autoCategory,
      hasImage: Boolean(normalizedImage),
      name: safeName,
    })

    logItemProcessing('storage-written', {
      closetItemsCount: (() => {
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem('closetItems') : null
          if (!raw) return 0
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed.length : 0
        } catch {
          return -1
        }
      })(),
      lastCategory: autoCategory,
    })

    router.push('/closet')
  }
  const autoCategory = detectSingleItemCategory({
    name,
    fileName: uploadFileName,
    style,
    brand,
  })
  const autoCategoryLabel = categories.find((item) => item.id === autoCategory)?.label || autoCategory

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
          <div className={styles.aiCategoryValue}>
            <strong>{autoCategoryLabel}</strong>
            <span>{copy.autoCategoryHint}</span>
          </div>
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
          <div className={styles.detectedSection}>
            <p className={styles.cameraHint}>{copy.fullOutfitPhotoHint}</p>
            <p className={styles.detectedTitle}>{copy.detectedItemsAuto}</p>

            <div className={styles.detectedGrid}>
              {detectedCategories.map((detectedCategory) => {
                const categoryMeta = categories.find((item) => item.id === detectedCategory)
                if (!categoryMeta) return null

                return (
                  <div key={`detect-${categoryMeta.id}`} className={styles.detectedChipActive}>
                    {categoryMeta.label}
                  </div>
                )
              })}
            </div>
          </div>
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
