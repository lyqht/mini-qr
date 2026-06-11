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
import SimpleFieldsChecklist from '@/components/SimpleFieldsChecklist.vue'
import { type SimpleFieldKey } from '@/utils/simpleModeFields'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  /** Whether the customize panel is open. */
  open: boolean
  /** Currently pinned field keys. */
  modelValue: SimpleFieldKey[]
  /** Whether the frame is enabled (mirrors the real "Add frame" toggle). */
  frameEnabled: boolean
  /** Render as a centered dialog (desktop) vs. a bottom drawer (mobile). */
  isLarge: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: SimpleFieldKey[]): void
  (e: 'update:frameEnabled', value: boolean): void
}>()

function reset(): void {
  // "Data only" means clear pinned fields AND turn the frame back off, so the
  // frame section no longer shows in Simple mode.
  emit('update:modelValue', [])
  emit('update:frameEnabled', false)
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
      <SimpleFieldsChecklist
        :model-value="modelValue"
        :frame-enabled="frameEnabled"
        @update:model-value="emit('update:modelValue', $event)"
        @update:frame-enabled="emit('update:frameEnabled', $event)"
      />
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
      <div class="max-h-[60vh] overflow-y-auto px-4 pb-2">
        <SimpleFieldsChecklist
          :model-value="modelValue"
          :frame-enabled="frameEnabled"
          @update:model-value="emit('update:modelValue', $event)"
          @update:frame-enabled="emit('update:frameEnabled', $event)"
        />
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
