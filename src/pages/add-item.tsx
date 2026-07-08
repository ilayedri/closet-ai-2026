import { addClosetItem } from '@/lib/closet'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './add-item.module.css'

const categories = [
  { id: 'shirts', label: 'חולצות' },
  { id: 'pants', label: 'מכנסיים' },
  { id: 'shoes', label: 'נעליים' },
  { id: 'jackets', label: 'מעילים' },
  { id: 'accessories', label: 'אקססוריז' },
]

export default function AddItemPage() {
  const router = useRouter()
  const [name, setName] = useState('New Item')
  const [category, setCategory] = useState('shirts')
  const [color, setColor] = useState('Black')
  const [style, setStyle] = useState('Casual')
  const [image, setImage] = useState('/assets/images/blazer.jpg')

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('closetItems')) {
      addClosetItem({
        id: '1',
        name: 'Navy Blazer',
        category: 'jackets',
        image: '/assets/images/blazer.jpg',
        color: 'Navy',
        style: 'Business',
        dateAdded: new Date().toISOString().slice(0, 10),
      })
    }
  }, [])

  function handleSubmit() {
    addClosetItem({
      id: `${Date.now()}`,
      name,
      category,
      image,
      color,
      style,
      dateAdded: new Date().toISOString().slice(0, 10),
    })
    router.push('/closet')
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <h1>הוסף פריט חדש</h1>
        <p>בחר קטגוריה, צבע וסגנון ושתף את הארון שלך בפריט חדש.</p>

        <label className={styles.fieldLabel}>
          שם הפריט
          <input className={styles.fieldInput} value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          קטגוריה
          <select className={styles.fieldSelect} value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          צבע
          <input className={styles.fieldInput} value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          סגנון
          <input className={styles.fieldInput} value={style} onChange={(event) => setStyle(event.target.value)} />
        </label>

        <label className={styles.fieldLabel}>
          תמונת פריט
          <select className={styles.fieldSelect} value={image} onChange={(event) => setImage(event.target.value)}>
            <option value="/assets/images/blazer.jpg">Blazer</option>
            <option value="/assets/images/shirt.jpg">Shirt</option>
            <option value="/assets/images/chinos.jpg">Chinos</option>
          </select>
        </label>

        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.secondaryButton}>בטל</button>
          <button onClick={handleSubmit} className={styles.primaryButton}>שמור פריט</button>
        </div>
      </div>
    </div>
  )
}
