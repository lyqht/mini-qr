<script setup lang="ts">
import type { VCardCSVData } from '@/utils/csv'

const props = defineProps<{ vCard: VCardCSVData }>()

const address = [
  props.vCard.street,
  props.vCard.city,
  props.vCard.state,
  props.vCard.zipcode,
  props.vCard.country
]
  .filter(Boolean)
  .join(', ')
</script>
<template>
  <div
    class="mx-auto flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg md:max-w-xs"
  >
    <div class="mb-2">
      <p class="truncate text-xl font-bold text-gray-800 dark:text-gray-100">
        {{ vCard.firstName }} {{ vCard.lastName }}
      </p>
      <p v-if="vCard.position" class="truncate text-sm text-gray-600 dark:text-gray-300">
        {{ vCard.position }}
      </p>
      <p v-if="vCard.org" class="truncate text-sm text-gray-500 dark:text-gray-400">
        {{ vCard.org }}
      </p>
    </div>
    <div
      v-if="vCard.email"
      class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
    >
      <svg
        class="size-4 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4V4zm0 0l8 8 8-8" />
      </svg>
      <span>{{ vCard.email }}</span>
    </div>
    <div
      v-if="vCard.phonework"
      class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
    >
      <svg
        class="size-4 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
      <span>{{ vCard.phonework }}</span>
    </div>
    <div
      v-if="vCard.website"
      class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
    >
      <svg
        class="size-4 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span class="truncate"
        ><a
          :href="vCard.website"
          target="_blank"
          class="text-blue-600 hover:underline dark:text-blue-400"
          >{{ vCard.website }}</a
        ></span
      >
    </div>
    <div v-if="address" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <svg
        class="size-4 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
        />
      </svg>
      <span>{{ address }}</span>
    </div>
  </div>
</template>
