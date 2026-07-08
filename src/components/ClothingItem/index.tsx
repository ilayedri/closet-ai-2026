import styles from './ClothingItem.module.css';

type Item = { id: string; name: string; image?: string }

export default function ClothingItem({ item }: { item: Item }) {
  return (
    <div className={styles.item}>
      <div className={styles.thumb}>
        {item.image ? <img src={item.image} alt={item.name} /> : <div className={styles.placeholder} />}
      </div>
      <div className={styles.name}>{item.name}</div>
    </div>
  )
}
