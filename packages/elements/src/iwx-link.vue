<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    to?: string;
  }>(),
  {
    title: "",
    to: "/",
  },
);
</script>

<template>
  <nuxt-link :to="`${props.to}`">
    {{ props.title }}
  </nuxt-link>
</template>
