<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  isLoading: boolean
  imageSrc: string | null
}>()

defineEmits(['close'])
const { t } = useI18n()
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <button
        type="button"
        class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        @click="$emit('close')"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h3 class="mb-4 text-lg font-medium">{{ t('Copy QR Code to clipboard') }}</h3>
      <div v-if="isLoading" class="flex h-48 items-center justify-center">
        <div class="size-8 animate-spin rounded-full border-y-2 border-gray-900"></div>
      </div>
      <div v-else-if="imageSrc" class="flex flex-col items-center">
        <img :src="imageSrc" alt="QR Code" class="mb-4 size-48 object-contain" />
        <p class="mt-2 text-sm text-gray-500">
          {{ t("Right click the image, and select 'Copy Image'") }}
        </p>
      </div>
    </div>
  </div>
</template>
