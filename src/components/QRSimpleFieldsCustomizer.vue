<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '@/components/ui/drawer'
import { SIMPLE_MODE_FIELD_GROUPS, type SimpleFieldKey } from '@/utils/simpleModeFields'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  /** Whether the customize panel is open. */
  open: boolean
  /** Currently pinned field keys. */
  modelValue: SimpleFieldKey[]
  /** Render as a centered dialog (desktop) vs. a bottom drawer (mobile). */
  isLarge: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: SimpleFieldKey[]): void
}>()

const groups = SIMPLE_MODE_FIELD_GROUPS

function isChecked(key: SimpleFieldKey): boolean {
  return props.modelValue.includes(key)
}

function toggle(key: SimpleFieldKey, checked: boolean): void {
  if (checked) {
    if (!props.modelValue.includes(key)) emit('update:modelValue', [...props.modelValue, key])
  } else {
    emit(
      'update:modelValue',
      props.modelValue.filter((k) => k !== key)
    )
  }
}

function reset(): void {
  emit('update:modelValue', [])
}

function setOpen(value: boolean): void {
  emit('update:open', value)
}
</script>

<template>
  <!-- The grouped checklist of fields to surface in Simple Mode. Rendered
       inside a Dialog on desktop and a Drawer on mobile so it feels native on
       each. -->
  <Dialog v-if="isLarge" :open="open" @update:open="setOpen">
    <DialogContent class="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ t('Customize fields') }}</DialogTitle>
        <DialogDescription>
          {{ t('Pick the fields to show in Simple mode. The data field is always shown.') }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-6">
        <fieldset v-for="group in groups" :key="group.labelKey" class="flex flex-col gap-2">
          <legend class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t(group.labelKey) }}
          </legend>
          <label
            v-for="field in group.fields"
            :key="field.key"
            class="flex cursor-pointer flex-row items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              :checked="isChecked(field.key as SimpleFieldKey)"
              @change="
                toggle(field.key as SimpleFieldKey, ($event.target as HTMLInputElement).checked)
              "
            />
            <span>{{ t(field.labelKey) }}</span>
          </label>
        </fieldset>
      </div>
      <div class="mt-4 flex flex-row justify-between">
        <button type="button" class="secondary-button" @click="reset">
          {{ t('Reset to data only') }}
        </button>
        <button type="button" class="button" @click="setOpen(false)">
          {{ t('Done') }}
        </button>
      </div>
    </DialogContent>
  </Dialog>

  <Drawer v-else :open="open" @update:open="setOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{{ t('Customize fields') }}</DrawerTitle>
        <DrawerDescription>
          {{ t('Pick the fields to show in Simple mode. The data field is always shown.') }}
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-4 pb-2">
        <fieldset v-for="group in groups" :key="group.labelKey" class="flex flex-col gap-2">
          <legend class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t(group.labelKey) }}
          </legend>
          <label
            v-for="field in group.fields"
            :key="field.key"
            class="flex cursor-pointer flex-row items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              :checked="isChecked(field.key as SimpleFieldKey)"
              @change="
                toggle(field.key as SimpleFieldKey, ($event.target as HTMLInputElement).checked)
              "
            />
            <span>{{ t(field.labelKey) }}</span>
          </label>
        </fieldset>
      </div>
      <div class="flex flex-row justify-between gap-2 p-4">
        <button type="button" class="secondary-button" @click="reset">
          {{ t('Reset to data only') }}
        </button>
        <button type="button" class="button" @click="setOpen(false)">
          {{ t('Done') }}
        </button>
      </div>
    </DrawerContent>
  </Drawer>
</template>
