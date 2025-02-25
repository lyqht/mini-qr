<script setup lang="ts">
import { Check, ChevronsUpDown } from 'lucide-vue-next'

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

const open = defineModel<boolean>('open')
const value = defineModel<string>('value')

defineProps<{
  items: { value: any; label: string }[]
  insertDividerAtIndexes?: number[]
  buttonLabel: string
}>()
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :aria-label="buttonLabel"
        class="w-fit flex gap-2 items-center justify-between focus-visible:ring-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <slot name="button-icon"></slot>
        {{ value ? items.find((item) => item.value === value)?.label : 'Select item...' }}
        <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-fit p-0">
      <Command class="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
        <CommandInput class="h-9" placeholder="Search item..." />
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <template v-for="(item, index) in items" :key="item.value">
              <CommandItem
                :value="item.value"
                class="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                @select="
                  (ev) => {
                    if (typeof ev.detail.value === 'string') {
                      value = ev.detail.value
                    }
                    open = false
                  }
                "
              >
                {{ item.label }}
                <Check
                  :class="cn('ml-auto h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')"
                />
              </CommandItem>
              <div
                id="divider"
                v-if="insertDividerAtIndexes && insertDividerAtIndexes.includes(index)"
                class="h-px bg-zinc-200 dark:bg-zinc-700"
              />
            </template>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
