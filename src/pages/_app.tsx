import Header from '@/components/Header'
import { LanguageProvider } from '@/context/LanguageContext'
import type { AppProps } from 'next/app'
import '../../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Header />
      <Component {...pageProps} />
    </LanguageProvider>
  )
}
