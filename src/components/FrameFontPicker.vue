<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ChevronsUpDown } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { FontOption } from '@/utils/framePresets'

const props = defineProps<{
  id: string
  modelValue: string | undefined
  ungrouped: FontOption[]
  groups: { category: string; label: string; fonts: FontOption[] }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { t } = useI18n()
const open = ref(false)

const allFonts = computed(() => [...props.ungrouped, ...props.groups.flatMap((g) => g.fonts)])
const selectedFont = computed(
  () => allFonts.value.find((font) => font.value === (props.modelValue ?? '')) ?? props.ungrouped[0]
)

function filterByLabel(labels: unknown[], term: string): string[] {
  const query = term.trim().toLowerCase()
  const all = labels.map(String)
  return query ? all.filter((label) => label.toLowerCase().includes(query)) : all
}

function select(font: FontOption) {
  emit('update:modelValue', font.value)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        :id="id"
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="flex w-full items-center justify-between gap-2 bg-zinc-50 font-normal text-zinc-900 focus-visible:ring-1 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <span
          class="truncate"
          :style="selectedFont?.value ? { fontFamily: selectedFont.value } : {}"
          >{{ selectedFont?.label }}</span
        >
        <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[--radix-popover-trigger-width] p-0" align="start">
      <Command
        :filter-function="filterByLabel"
        class="bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <CommandInput class="h-9" :placeholder="t('Search fonts')" />
        <CommandEmpty>{{ t('No fonts found') }}</CommandEmpty>
        <CommandList class="max-h-72 overflow-y-auto">
          <CommandGroup>
            <CommandItem
              v-for="font in ungrouped"
              :key="font.label"
              :value="font.label"
              @select="select(font)"
            >
              {{ font.label }}
              <Check
                :class="cn('ms-auto size-4', selectedFont === font ? 'opacity-100' : 'opacity-0')"
              />
            </CommandItem>
          </CommandGroup>
          <CommandGroup v-for="group in groups" :key="group.category" :heading="t(group.label)">
            <CommandItem
              v-for="font in group.fonts"
              :key="font.label"
              :value="font.label"
              :style="{ fontFamily: font.value }"
              @select="select(font)"
            >
              {{ font.label }}
              <Check
                :class="cn('ms-auto size-4', selectedFont === font ? 'opacity-100' : 'opacity-0')"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
