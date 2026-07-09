export type OnboardingState = {
  language: 'he' | 'en'
  style: string[]
  gender: 'male' | 'female' | 'prefer-not-to-say'
  about: string
  weatherLocation: string
  clothingHabits: string
  completedAt?: string
}

const defaultState: OnboardingState = {
  language: 'he',
  style: ['Casual'],
  gender: 'prefer-not-to-say',
  about: '',
  weatherLocation: '',
  clothingHabits: '',
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem('onboardingState')
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as {
      language?: unknown
      style?: unknown
      gender?: unknown
      about?: unknown
      weatherLocation?: unknown
      clothingHabits?: unknown
      completedAt?: string
    }
    const rawStyle = parsed.style
    const normalizedStyleCandidates = Array.isArray(rawStyle)
      ? rawStyle.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : typeof rawStyle === 'string' && rawStyle.trim().length > 0
        ? [rawStyle]
        : defaultState.style

    const normalizeStyleName = (value: string) => {
      const lower = value.trim().toLowerCase()
      if (lower === 'minimal') return 'Casual'
      return value
    }

    const normalizedStyle = normalizedStyleCandidates.map(normalizeStyleName)

    const parsedGender =
      parsed.gender === 'male' || parsed.gender === 'female' || parsed.gender === 'prefer-not-to-say'
        ? parsed.gender
        : defaultState.gender

    return {
      language: parsed.language === 'en' ? 'en' : 'he',
      style: normalizedStyle.length ? normalizedStyle : defaultState.style,
      gender: parsedGender,
      about: typeof parsed.about === 'string' ? parsed.about : defaultState.about,
      weatherLocation: typeof parsed.weatherLocation === 'string' ? parsed.weatherLocation : defaultState.weatherLocation,
      clothingHabits: typeof parsed.clothingHabits === 'string' ? parsed.clothingHabits : defaultState.clothingHabits,
      completedAt: parsed.completedAt,
    }
  } catch {
    return defaultState
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
