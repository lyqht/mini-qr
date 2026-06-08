<script setup lang="ts">
import { cn } from '@/lib/utils'
import { AccordionContent, type AccordionContentProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<
  AccordionContentProps & {
    class?: HTMLAttributes['class']
    /**
     * Extra classes for the collapsible wrapper itself (the element that owns
     * the collapse animation + overflow). Use this to opt out of the
     * height-collapse clipping, e.g. when the section is force-expanded and its
     * content can grow dynamically.
     */
    rootClass?: HTMLAttributes['class']
  }
>()

const delegatedProps = computed(() => {
  const { class: _, rootClass: _rootClass, ...delegated } = props

  return delegated
})
</script>

<template>
  <AccordionContent
    v-bind="delegatedProps"
    :class="
      cn(
        'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        props.rootClass
      )
    "
  >
    <div :class="cn('pb-4 pt-0', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
