<script setup lang="ts">
import { name } from "./package.json";

const router = useRouter()
const route = useRoute()
const nav = [
  { label: 'Home', to: '/' },
  { label: 'page1', to: '/page1' },
  { label: 'page2', onClick: () => router.push(`/page2/reload-${(Math.random() * 100).toFixed()}`) },
]

const dir = `${name} Server`;
</script>

<template>
  <NuxtExample :dir="dir" :nav="nav" current-route>
    <NuxtLoadingIndicator />
    <NuxtPage />
    <template #footer>
      <div class="text-center p-4 op-50">
        Current route: <UKbd>{{ route.path }}</UKbd>
      </div>
    </template>
  </NuxtExample>
</template>