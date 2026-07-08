export type OnboardingState = {
  language: 'he' | 'en'
  style: string
  completedAt?: string
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return { language: 'he', style: 'Minimal' }
  try {
    const raw = window.localStorage.getItem('onboardingState')
    if (!raw) return { language: 'he', style: 'Minimal' }
    const parsed = JSON.parse(raw) as OnboardingState
    return {
      language: parsed.language === 'en' ? 'en' : 'he',
      style: parsed.style || 'Minimal',
      completedAt: parsed.completedAt,
    }
  } catch {
    return { language: 'he', style: 'Minimal' }
  }
}

export function saveOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem('onboardingState', JSON.stringify(state))
  } catch {
    // ignore errors
  }
}

export function clearOnboardingState() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem('onboardingState')
  } catch {
    // ignore
  }
}
