<script setup lang="ts">
import { Combobox } from '@/components/ui/Combobox'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { sortedLocales } from '@/utils/language'

const isLocaleSelectOpen = ref(false)
const { t, locale } = useI18n()
const locales = computed(() =>
  sortedLocales.map((loc) => ({
    value: loc,
    label: t(loc)
  }))
)
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
