<script setup lang="ts">
import { SIMPLE_MODE_FIELD_GROUPS, type SimpleFieldKey } from '@/utils/simpleModeFields'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  /** Currently pinned field keys. */
  modelValue: SimpleFieldKey[]
  /** Whether the frame is enabled (mirrors the real "Add frame" toggle). */
  frameEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SimpleFieldKey[]): void
  (e: 'update:frameEnabled', value: boolean): void
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <fieldset v-for="group in groups" :key="group.labelKey" class="flex flex-col gap-2">
      <legend class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ t(group.labelKey) }}
      </legend>

      <!-- Frame-style groups are gated behind an enable toggle: the field
           checkboxes only appear once the frame is enabled, mirroring the real
           frame settings UI. -->
      <label
        v-if="group.enableToggleLabelKey"
        class="flex cursor-pointer flex-row items-center gap-2 text-sm font-medium"
      >
        <input
          type="checkbox"
          :checked="frameEnabled"
          @change="emit('update:frameEnabled', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ t(group.enableToggleLabelKey) }}</span>
      </label>

      <template v-if="!group.enableToggleLabelKey || frameEnabled">
        <label
          v-for="field in group.fields"
          :key="field.key"
          class="flex cursor-pointer flex-row items-center gap-2 text-sm"
          :class="{ 'ms-6': group.enableToggleLabelKey }"
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
      </template>
    </fieldset>
  </div>
</template>
