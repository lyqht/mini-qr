<template>
  <div ref="hostRef" />
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createQRCode, type QRCodeConfig, type QRCodeInstance } from '..'

const props = defineProps<{ config: QRCodeConfig; data?: string }>()
const hostRef = ref<HTMLElement>()
let instance: QRCodeInstance | undefined

// Top-level `data` arg overrides config.data so a Storybook text control can
// drive the encoded string without each story re-declaring it.
const resolved = computed<QRCodeConfig>(() => ({
  ...props.config,
  data: props.data ?? props.config.data
}))

function mount() {
  if (!hostRef.value) return
  if (!instance) {
    instance = createQRCode(resolved.value)
    instance.attachTo(hostRef.value)
  } else {
    instance.update(resolved.value)
  }
}

onMounted(mount)
watch(resolved, mount, { deep: true })
onBeforeUnmount(() => instance?.dispose())
</script>
