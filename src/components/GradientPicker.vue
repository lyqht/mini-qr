<template>
  <div class="flex w-full flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
    <div class="flex items-center justify-between gap-2">
      <label :for="`${id}-enabled`" class="text-sm font-medium">
        {{ label }}
      </label>
      <input
        :id="`${id}-enabled`"
        type="checkbox"
        :checked="enabled"
        @change="onToggle(($event.target as HTMLInputElement).checked)"
      />
    </div>
    <div v-if="enabled" class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <fieldset class="flex items-center gap-3">
          <legend class="sr-only">{{ t('Gradient type') }}</legend>
          <label class="radio flex items-center gap-1 text-sm">
            <input
              type="radio"
              :name="`${id}-type`"
              value="linear"
              :checked="value?.type !== 'radial'"
              @change="updateType('linear')"
            />
            {{ t('Linear') }}
          </label>
          <label class="radio flex items-center gap-1 text-sm">
            <input
              type="radio"
              :name="`${id}-type`"
              value="radial"
              :checked="value?.type === 'radial'"
              @change="updateType('radial')"
            />
            {{ t('Radial') }}
          </label>
        </fieldset>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-1 text-sm">
          {{ t('Start') }}
          <input
            type="color"
            class="color-input"
            :value="stopAt(0)"
            @input="updateStopColor(0, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="flex items-center gap-1 text-sm">
          {{ t('End') }}
          <input
            type="color"
            class="color-input"
            :value="stopAt(1)"
            @input="updateStopColor(1, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <label v-if="value?.type !== 'radial'" class="flex items-center gap-1 text-sm">
          {{ t('Rotation') }}
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            :value="rotationDegrees"
            @input="updateRotation(Number(($event.target as HTMLInputElement).value))"
          />
          <span class="w-10 text-right text-xs tabular-nums">{{ rotationDegrees }}°</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Gradient } from '@/lib/qr-code'

const props = defineProps<{
  modelValue: Gradient | undefined
  id: string
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: Gradient | undefined] }>()
const { t } = useI18n()

const enabled = computed(() => !!props.modelValue)
const value = computed(() => props.modelValue)

const rotationDegrees = computed(() => {
  if (!value.value || value.value.type === 'radial') return 0
  const rad = value.value.rotation ?? 0
  return Math.round((rad * 180) / Math.PI)
})

function defaultGradient(): Gradient {
  return {
    type: 'linear',
    rotation: 0,
    colorStops: [
      { offset: 0, color: '#ff6a00' },
      { offset: 1, color: '#0061ff' }
    ]
  }
}

function stopAt(offset: 0 | 1): string {
  const stops = value.value?.colorStops ?? []
  const found = stops.find((s) => s.offset === offset)
  return found?.color ?? (offset === 0 ? '#000000' : '#ffffff')
}

function onToggle(checked: boolean) {
  emit('update:modelValue', checked ? (value.value ?? defaultGradient()) : undefined)
}

function updateType(type: 'linear' | 'radial') {
  const next = { ...(value.value ?? defaultGradient()), type }
  emit('update:modelValue', next)
}

function updateRotation(degrees: number) {
  const next = {
    ...(value.value ?? defaultGradient()),
    rotation: (degrees * Math.PI) / 180
  }
  emit('update:modelValue', next)
}

function updateStopColor(offset: 0 | 1, color: string) {
  const current = value.value ?? defaultGradient()
  const stops = [
    { offset: 0, color: stopAt(0) },
    { offset: 1, color: stopAt(1) }
  ]
  stops[offset] = { offset, color }
  emit('update:modelValue', { ...current, colorStops: stops })
}
</script>
