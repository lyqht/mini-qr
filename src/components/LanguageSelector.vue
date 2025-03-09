<script setup lang="ts">
import { Combobox } from '@/components/ui/Combobox'
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { sortedLocales } from '@/utils/language'

const STORAGE_KEY = 'preferred-language'

const isLocaleSelectOpen = ref(false)
const { t, locale } = useI18n()
const locales = computed(() =>
  sortedLocales.map((loc) => ({
    value: loc,
    label: t(loc)
  }))
)

// Save language preference to localStorage whenever it changes
watch(locale, (newLocale) => {
  if (newLocale) {
    localStorage.setItem(STORAGE_KEY, newLocale)
  }
})

onMounted(() => {
  const savedLocale = localStorage.getItem(STORAGE_KEY)

  if (savedLocale && sortedLocales.includes(savedLocale)) {
    locale.value = savedLocale
    return
  }

  // If no saved preference, try to detect from browser
  const browserLanguages = navigator.languages || [navigator.language]

  for (const browserLang of browserLanguages) {
    // Extract the language code (e.g., 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0].toLowerCase()

    // Check for exact match
    if (sortedLocales.includes(browserLang)) {
      locale.value = browserLang
      return
    }

    // Check for language code match
    const matchedLocale = sortedLocales.find(
      (availableLocale) => availableLocale.toLowerCase() === langCode
    )

    if (matchedLocale) {
      locale.value = matchedLocale
      return
    }
  }

  // If no match found, keep the default locale (usually 'en')
})
</script>

<template>
  <Combobox
    :items="locales"
    v-model:value="locale"
    v-model:open="isLocaleSelectOpen"
    :button-label="t('Select language')"
  >
    <template #button-icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="icon -ml-1.5 size-6 shrink-0"
        width="36"
        height="36"
        viewBox="0 0 24 24"
      >
        <g
          fill="none"
          stroke="#abcbca"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M4 5h7M7 4c0 4.846 0 7 .5 8" />
          <path
            d="M10 8.5c0 2.286-2 4.5-3.5 4.5S4 11.865 4 11c0-2 1-3 3-3s5 .57 5 2.857c0 1.524-.667 2.571-2 3.143m2 6l4-9l4 9m-.9-2h-6.2"
          />
        </g>
      </svg>
    </template>
  </Combobox>
</template>
