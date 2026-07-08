import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/context/LanguageContext'
import { getSiteCopy } from '@/lib/site-copy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './Header.module.css'

export default function Header() {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = getSiteCopy(lang).header
  const activePath = router.pathname
  const isActive = (href: string) => {
    if (href === '/closet') {
      return activePath === '/closet' || activePath.startsWith('/closet/')
    }
    if (href === '/stylist') {
      return activePath === '/stylist' || activePath === '/ai-stylist'
    }
    return activePath === href
  }

  const navItems = [
    { href: '/', label: copy.nav.home },
    { href: '/closet', label: copy.nav.closet },
    { href: '/stylist', label: copy.nav.stylist },
    { href: '/outfits', label: copy.nav.outfits },
    { href: '/profile', label: copy.nav.profile },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <div className={styles.brand}>ClosetAI</div>
        <div className={styles.brandTag}>{copy.brandTag}</div>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? styles.navLinkActive : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.rightGroup}>
        <LanguageSelector />
        <Link href="/dashboard" className={styles.cta}>
          {copy.dashboard}
        </Link>
      </div>
    </header>
  )
}
