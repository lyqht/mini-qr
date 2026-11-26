<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  byteLength: number
  maxBytes: number
  level: string
  hint: string
}>()

const { t } = useI18n()
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-lg bg-red-700 px-3 py-2 text-center text-xs leading-snug text-white shadow-lg dark:bg-red-800"
  >
    <div
      class="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-red-700 dark:bg-red-800"
    ></div>
    <div class="relative flex flex-col gap-1 text-balance">
      <div class="font-semibold">{{ t('Too much data for one QR code') }}</div>
      <div>
        {{
          t('{length} of {max} bytes at error correction level {level}', {
            length: byteLength,
            max: maxBytes,
            level
          })
        }}
      </div>
      <div>{{ hint }}</div>
    </div>
  </div>
</template>
