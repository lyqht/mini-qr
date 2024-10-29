import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type DarkModePreference = 'light' | 'dark' | 'system'
const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function getLocalStoragePreference(): DarkModePreference {
  return localStorage.getItem('dark-mode-preference') as DarkModePreference
}

function getMediaPreference(): DarkModePreference {
  const hasDarkPreference = colorSchemeMediaQuery.matches
  return hasDarkPreference ? 'dark' : 'light'
}

function getDarkModePreference(): DarkModePreference {
  return getLocalStoragePreference() ?? 'system'
}

function getIsDarkMode(): boolean {
  const darkModePreference = getDarkModePreference()
  return (
    darkModePreference === 'dark' ||
    (darkModePreference === 'system' && getMediaPreference() === 'dark')
  )
}

const useDarkModePreference = () => {
  const darkModePreference = ref<DarkModePreference>(getDarkModePreference())
  const isDarkModePreferenceSetBySystem = computed(() => darkModePreference.value === 'system')
  const isDarkMode = ref<boolean>(getIsDarkMode())

  const updateUiBasedOnDarkMode = () => {
    const isDark = getIsDarkMode()
    isDarkMode.value = isDark
    if (isDark && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark')
    } else if (!isDark && document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
    }
  }

  watch(darkModePreference, updateUiBasedOnDarkMode, { immediate: true })

  function setDarkModePreference(theme: DarkModePreference) {
    localStorage.setItem('dark-mode-preference', theme)
    darkModePreference.value = theme
  }

  const preferences: DarkModePreference[] = ['light', 'dark', 'system']
  function toggleDarkModePreference(): void {
    const updatedPreference =
      preferences[(preferences.indexOf(darkModePreference.value) + 1) % preferences.length]
    setDarkModePreference(updatedPreference)
  }

  function updateDarkModePreferenceIfSystemPreferenceChanges() {
    console.log(
      'updateDarkModePreferenceIfSystemPreferenceChanges',
      isDarkModePreferenceSetBySystem.value
    )
    if (isDarkModePreferenceSetBySystem.value) {
      updateUiBasedOnDarkMode()
    }
  }

  onMounted(() => {
    colorSchemeMediaQuery.addEventListener(
      'change',
      updateDarkModePreferenceIfSystemPreferenceChanges
    )
  })

  onBeforeUnmount(() => {
    colorSchemeMediaQuery.removeEventListener(
      'change',
      updateDarkModePreferenceIfSystemPreferenceChanges
    )
  })

  return {
    isDarkMode,
    darkModePreference,
    isDarkModePreferenceSetBySystem,
    setDarkModePreference,
    toggleDarkModePreference
  }
}

export default useDarkModePreference
