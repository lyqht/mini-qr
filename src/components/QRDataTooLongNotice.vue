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
    role="alert"
    class="flex size-full overflow-auto bg-red-50 p-4 text-center text-xs leading-snug text-red-800 dark:bg-red-950 dark:text-red-200"
  >
    <div class="m-auto flex flex-col gap-1.5">
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
