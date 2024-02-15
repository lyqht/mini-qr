import { ref, onMounted, onUnmounted } from 'vue'

export function useDarkMode() {
  // This ref will hold the value indicating if dark mode is preferred or not.
  const isDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

  // This function will update the `isDark` value based on the system preference.
  const updateDarkMode = (e) => {
    isDark.value = e.matches
  }

  onMounted(() => {
    // When the component using this composable is mounted, add an event listener to listen for changes.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDarkMode)
  })

  onUnmounted(() => {
    // When the component is unmounted, remove the event listener to clean up.
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateDarkMode)
  })

  return {
    isDark
  }
}
