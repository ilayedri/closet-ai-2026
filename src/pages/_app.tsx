import { LanguageProvider } from '@/context/LanguageContext'
import type { AppProps } from 'next/app'
import '../../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  )
}
