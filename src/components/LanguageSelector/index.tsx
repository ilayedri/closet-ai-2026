import { useLanguage } from '@/context/LanguageContext'
import styles from './LanguageSelector.module.css'

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage()
  return (
    <div className={styles.wrap}>
      <button className={lang === 'he' ? styles.active : ''} onClick={() => setLang('he')}>
        עברית
      </button>
      <button className={lang === 'en' ? styles.active : ''} onClick={() => setLang('en')}>
        English
      </button>
    </div>
  )
}
