import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'he'
type ContextType = { lang: Lang; setLang: (l: Lang) => void }

const LanguageContext = createContext<ContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang') as Lang | null
      if (stored === 'he' || stored === 'en') setLangState(stored)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang)
    } catch (e) {}
    // update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
