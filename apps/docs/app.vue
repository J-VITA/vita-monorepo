<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const nav = [
  { label: 'Home', to: '/' },
  { label: 'page1', to: '/sample' },
  { label: 'page2', onClick: () => router.push(`/posts/reload-${(Math.random() * 100).toFixed()}`) },
  { label: 'page3', to: '/redirect' },
]


</script>

<template>
  <NuxtExample dir="DOC Server" :nav="nav" current-route>
    <!-- <NuxtLoadingIndicator /> -->
    <NuxtPage />
    <template #footer>
      <div class="text-center p-4 op-50">
        Current route: <UKbd>{{ route.path }}</UKbd>
      </div>
    </template>
  </NuxtExample>
  <!-- <div>
    <button type="button" @click="router.push({path: `/sample`})">
      >>>
    </button>
  </div> -->
</template>