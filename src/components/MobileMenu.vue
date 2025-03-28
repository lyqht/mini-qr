<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  isDarkMode: boolean
  isDarkModePreferenceSetBySystem: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-dark-mode'): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const isOpen = ref(false)
const reference = ref<HTMLElement | null>(null)
const floating = ref<HTMLElement | null>(null)

const { floatingStyles } = useFloating(reference, floating, {
  placement: 'bottom-end',
  middleware: [offset(5), flip(), shift()],
  whileElementsMounted: autoUpdate
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
  emit('close')
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    floating.value &&
    !floating.value.contains(event.target as Node) &&
    reference.value &&
    !reference.value.contains(event.target as Node)
  ) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="transition-opacity duration-300">
    <!-- Hamburger menu button -->
    <button
      ref="reference"
      class="flex size-9 items-center justify-center rounded-md border border-zinc-300 bg-zinc-100 text-zinc-800 outline-none hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:focus-visible:ring-zinc-200"
      @click="toggleMenu"
      :aria-label="t('Menu')"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 18h18v-2H3zm0-5h18v-2H3zm0-5h18V6H3z" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      ref="floating"
      :style="floatingStyles"
      class="z-50 w-64 rounded-md border border-zinc-300 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div class="flex flex-col gap-4">
        <!-- App title -->
        <div class="flex items-center">
          <h1 class="text-xl text-gray-700 dark:text-gray-100">MiniQR</h1>
        </div>

        <!-- GitHub link -->
        <a
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
          href="https://github.com/lyqht/mini-qr"
          target="_blank"
          :aria-label="t('GitHub repository for this project')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.001 2c-5.525 0-10 4.475-10 10a9.994 9.994 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.563 4.938c.363.312.676.912.676 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10Z"
            />
          </svg>
          <span>GitHub</span>
        </a>

        <!-- Dark mode toggle -->
        <button
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
          @click="emit('toggle-dark-mode')"
          :aria-label="t('Toggle dark mode')"
        >
          <span v-if="isDarkModePreferenceSetBySystem">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <g fill="currentColor">
                <path d="M12 16a4 4 0 0 0 0-8z" />
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m0 2v4a4 4 0 1 0 0 8v4a8 8 0 1 0 0-16"
                  clip-rule="evenodd"
                />
              </g>
            </svg>
          </span>
          <span v-else-if="isDarkMode">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </span>
          <span v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </span>
          <span>{{ t('Toggle dark mode') }}</span>
        </button>

        <!-- Language selector -->
        <div class="px-2 py-1.5">
          <LanguageSelector />
        </div>
      </div>
    </div>
  </div>
</template>
