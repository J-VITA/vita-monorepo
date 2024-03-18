<script setup lang="ts">

const props = defineProps<{
  title: string;
}>();
</script>

<template>
    <button style="background-color: red; border-radius: 2px; width: 100px;">{{ props.title }}</button>
</template>