<script setup lang="ts">
import { marked } from 'marked'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchWithBasePath } from '@/utils/basePath'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { X } from 'lucide-vue-next'

const { t } = useI18n()
const version = ref('...')
const changelogContent = ref<string | null>(null)
const isLoading = ref(true)
const hideCredits = ['1', 'true'].includes((import.meta.env.VITE_HIDE_CREDITS ?? '').toLowerCase())

async function fetchAndProcessChangelog() {
  if (changelogContent.value === null) {
    isLoading.value = true
    try {
      const response = await fetchWithBasePath('/CHANGELOG.md')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const markdown = await response.text()

      const versionMatch = markdown.match(/^##\s+(v\d+\.\d+\.\d+)/m)
      if (versionMatch && versionMatch[1]) {
        version.value = versionMatch[1]
      } else {
        version.value = 'N/A'
      }

      changelogContent.value = await marked.parse(markdown)
    } catch (error) {
      console.error('Failed to fetch or process changelog:', error)
      version.value = t('Error')
      changelogContent.value = `<p>${t('Failed to load changelog')}</p>`
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  fetchAndProcessChangelog()
})
</script>

<template>
  <footer
    v-if="!hideCredits"
    class="fixed inset-x-0 bottom-0 hidden p-4 text-sm text-zinc-600 dark:text-zinc-400 md:flex md:justify-center"
  >
    <div class="flex items-center gap-2">
      <span>{{ t('Created by') }}</span>
      <a
        href="https://github.com/lyqht"
        target="_blank"
        class="text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >Estee Tey 🐧🌻</a
      >
      <span>|</span>
      <Dialog>
        <DialogTrigger as-child>
          <button class="secondary-button" :aria-label="t('View changelog')" :disabled="isLoading">
            {{ isLoading ? '...' : version }}
          </button>
        </DialogTrigger>
        <DialogContent class="flex max-h-[80vh] flex-col sm:max-w-md" @open-auto-focus.prevent>
          <DialogHeader>
            <DialogTitle>{{ t('Changelog') }}</DialogTitle>
            <DialogClose
              class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X class="size-4" />
              <span class="sr-only">{{ t('Close') }}</span>
            </DialogClose>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto pr-2">
            <DialogDescription
              as="div"
              class="prose prose-sm max-w-none text-start dark:prose-invert prose-li:my-1"
            >
              <div v-if="isLoading">Loading...</div>
              <div v-else-if="changelogContent" v-html="changelogContent"></div>
              <div v-else>{{ t('Failed to load changelog') }}</div>
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </footer>
</template>

<style scoped>
/* Restore original footer background styles */
footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dark footer {
  background: rgba(24, 24, 27, 0.8);
}
</style>
