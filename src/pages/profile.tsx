import styles from './profile.module.css'

export default function ProfilePage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.splash}>My Style</p>
        <h1>הפרופיל שלי</h1>
        <p>ניהול סגנון אישי, צבעים מועדפים ומטרות ה-AI שלך.</p>

        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <h3>Favorite Colors</h3>
            <p>Black, Navy, Ivory</p>
          </div>
          <div className={styles.card}>
            <h3>My Style</h3>
            <p>Minimal luxury / Work-ready</p>
          </div>
          <div className={styles.card}>
            <h3>AI Learning</h3>
            <p>המערכת לומדת מהבחירות שלך ומטייבת הצעות.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
