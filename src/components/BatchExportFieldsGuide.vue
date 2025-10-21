<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SimpleCSVData, VCardCSVData } from '@/utils/csv'

const { t } = useI18n()

const activeTab = ref<'simple' | 'vcard'>('simple')
const isExpanded = ref(false)
const accordionHeader = ref<HTMLElement | null>(null)

const closeAccordion = () => {
  isExpanded.value = false
  // Scroll to accordion header with a small delay to ensure DOM updates
  setTimeout(() => {
    accordionHeader.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

const simpleFields: Array<{
  name: keyof SimpleCSVData
  required: boolean
  description: string
  example: string
}> = [
  {
    name: 'url',
    required: true,
    description: 'The URL or text to encode',
    example: 'https://example.com'
  },
  {
    name: 'frameText',
    required: false,
    description: 'Text to display under the QR code',
    example: 'Visit our website'
  },
  {
    name: 'fileName',
    required: false,
    description: 'Custom filename for the exported QR code',
    example: 'my_custom_name'
  }
]

const vCardFields: Array<{
  name: keyof VCardCSVData
  required: boolean
  description: string
  example: string
}> = [
  { name: 'firstName', required: true, description: 'First name', example: 'John' },
  { name: 'lastName', required: true, description: 'Last name', example: 'Doe' },
  { name: 'org', required: false, description: 'Organization/Company', example: 'Acme Inc' },
  { name: 'position', required: false, description: 'Job title', example: 'Software Engineer' },
  { name: 'phonework', required: false, description: 'Work phone', example: '+1-555-0123' },
  { name: 'phoneprivate', required: false, description: 'Private phone', example: '+1-555-0124' },
  { name: 'phonemobile', required: false, description: 'Mobile phone', example: '+1-555-0125' },
  { name: 'email', required: false, description: 'Email address', example: 'john.doe@example.com' },
  { name: 'website', required: false, description: 'Website URL', example: 'https://example.com' },
  { name: 'street', required: false, description: 'Street address', example: '123 Main St' },
  { name: 'zipcode', required: false, description: 'ZIP/Postal code', example: '12345' },
  { name: 'city', required: false, description: 'City', example: 'San Francisco' },
  { name: 'state', required: false, description: 'State/Province', example: 'CA' },
  { name: 'country', required: false, description: 'Country', example: 'USA' },
  { name: 'version', required: false, description: 'vCard version', example: '4.0' },
  {
    name: 'frameText',
    required: false,
    description: 'Text to display under the QR code',
    example: 'Contact Info'
  },
  {
    name: 'fileName',
    required: false,
    description: 'Custom filename for the exported QR code',
    example: 'john_doe_contact'
  }
]

const simpleCsvExample = `url,frameText,fileName
https://example.com,Visit us,site
https://github.com/user,GitHub,github
https://linkedin.com,LinkedIn,linkedin`

const vCardCsvExample = `firstName,lastName,org,email,frameText
John,Doe,Acme,john@ex.com,Contact
Jane,Smith,Tech,jane@ex.com,Manager`
</script>

<template>
  <div class="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800/50" style="contain: layout">
    <!-- Accordion header -->
    <button
      ref="accordionHeader"
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70 sm:px-4"
      :class="isExpanded ? 'rounded-t-lg border-b-0' : 'rounded-lg'"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-zinc-500"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {{ t('CSV Format Guide') }}
        </span>
      </div>
      <svg
        :class="['size-4 text-zinc-500 transition-transform', isExpanded ? 'rotate-180' : '']"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Accordion content -->
    <div
      v-if="isExpanded"
      class="w-full space-y-4 border-t border-zinc-200 py-4 dark:border-zinc-700 sm:px-4"
    >
      <!-- Tab buttons -->
      <div class="flex gap-1 border-b">
        <button
          @click="activeTab = 'simple'"
          :class="[
            'flex-1 p-2 text-xs font-medium transition-colors sm:flex-none sm:whitespace-nowrap sm:px-4 sm:text-sm',
            activeTab === 'simple'
              ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          ]"
        >
          {{ t('Simple URL/Text') }}
        </button>
        <button
          @click="activeTab = 'vcard'"
          :class="[
            'flex-1 p-2 text-xs font-medium transition-colors sm:flex-none sm:whitespace-nowrap sm:px-4 sm:text-sm',
            activeTab === 'vcard'
              ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          ]"
        >
          {{ t('vCard Contact') }}
        </button>
      </div>

      <!-- Simple URL/Text content -->
      <div v-if="activeTab === 'simple'" class="w-full space-y-4">
        <div class="w-full rounded-lg border bg-white p-3 dark:bg-zinc-900">
          <h4 class="mb-3 text-sm font-medium">{{ t('Available Fields') }}</h4>
          <div class="space-y-3">
            <div
              v-for="field in simpleFields"
              :key="field.name"
              class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2"
            >
              <code
                class="block break-all rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800 sm:inline-block sm:min-w-[100px] sm:break-normal sm:text-sm"
                :class="{ 'font-semibold': field.required }"
              >
                {{ field.name }}
              </code>
              <span
                class="break-words text-xs text-zinc-600 dark:text-zinc-400 sm:flex-1 sm:text-sm"
              >
                {{ field.description }}
                <span v-if="field.required" class="ms-1 text-red-500">*</span>
              </span>
            </div>
          </div>
        </div>

        <div class="w-full rounded-lg border bg-zinc-50 p-3 dark:bg-zinc-900/50">
          <h4 class="mb-2 text-sm font-medium">{{ t('Example CSV') }}</h4>
          <pre class="w-full overflow-x-auto rounded bg-white p-2 text-xs dark:bg-zinc-950">{{
            simpleCsvExample
          }}</pre>
        </div>

        <div
          class="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <p class="break-words text-xs sm:text-sm">
            <strong>{{ t('Filename Priority') }}:</strong>
            {{
              t(
                'If fileName is provided, it will be used. Otherwise, frameText will be used. If neither is provided, a name will be generated from the URL.'
              )
            }}
          </p>
        </div>
      </div>

      <!-- vCard content -->
      <div v-if="activeTab === 'vcard'" class="w-full space-y-4">
        <div class="w-full rounded-lg border bg-white p-3 dark:bg-zinc-900">
          <h4 class="mb-3 text-sm font-medium">{{ t('Available Fields') }}</h4>
          <div class="space-y-3 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
            <div
              v-for="field in vCardFields"
              :key="field.name"
              class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2"
            >
              <code
                class="block break-all rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800 sm:inline-block sm:min-w-[120px] sm:break-normal sm:text-sm"
                :class="{ 'font-semibold': field.required }"
              >
                {{ field.name }}
              </code>
              <span
                class="break-words text-xs text-zinc-600 dark:text-zinc-400 sm:flex-1 sm:text-sm"
              >
                {{ field.description }}
                <span v-if="field.required" class="ms-1 text-red-500">*</span>
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-zinc-50 p-3 dark:bg-zinc-900/50">
          <h4 class="mb-2 text-sm font-medium">{{ t('Example CSV') }}</h4>
          <pre class="overflow-x-auto rounded bg-white p-2 text-xs dark:bg-zinc-950">{{
            vCardCsvExample
          }}</pre>
        </div>

        <div
          class="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <p class="break-words text-xs sm:text-sm">
            <strong>{{ t('Filename Priority') }}:</strong>
            {{
              t(
                'If fileName is provided, it will be used. Otherwise, frameText will be used. If neither is provided, the full name will be used.'
              )
            }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          href="/simple_with_all_fields.csv"
          download
          class="inline-flex items-center justify-center gap-1 rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="sm:size-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ t('Download Simple Example') }}
        </a>
        <a
          href="/vcard_with_all_fields.csv"
          download
          class="inline-flex items-center justify-center gap-1 rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="sm:size-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ t('Download vCard Example') }}
        </a>
      </div>

      <!-- Close button -->
      <div class="mt-4 flex justify-center border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <button
          @click="closeAccordion"
          class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <span>{{ t('Close guide') }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="rotate-180"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
