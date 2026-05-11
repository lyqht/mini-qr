<template>
  <div ref="hostRef" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createQRCode, type QRCodeConfig, type QRCodeInstance } from '..'

const props = defineProps<{ config: QRCodeConfig }>()
const hostRef = ref<HTMLElement>()
let instance: QRCodeInstance | undefined

function mount() {
  if (!hostRef.value) return
  if (!instance) {
    instance = createQRCode(props.config)
    instance.attachTo(hostRef.value)
  } else {
    instance.update(props.config)
  }
}

onMounted(mount)
watch(() => props.config, mount, { deep: true })
onBeforeUnmount(() => instance?.dispose())
</script>
