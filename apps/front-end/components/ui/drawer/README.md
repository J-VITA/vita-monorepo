# EACC Filter Form Drawer
검색 필터 폼 Drawer UI
- EaccFilterButton 에서 사용 중인 drawer UI 

## 사용방법
[EaccFilterButton 데이터 참고](../button/EaccFilterButton/index.vue)
```vue
<script lang="ts" setup>
  import type { IFormData, IFormType } from '@/types';

  const formData = ref<Array<IFormData>>([
    ... (EaccFilterButton 데이터 참고)
  ])

</script>
<template>
  <!-- props
    /** 드로워 타이틀 */
    title?: string;
  -->
  <!--
  v-model:form-data="formData"
  -->
  <!-- event
   @update:model-value="(params: Array<IFormData>) => ()"
   -->
  <eacc-filter-form-drawer
    v-model:form-data="formData"
    title="상세 필터 조회"
    v-model:open="showDetailFilter"
    @update:model-value="(params: Array<IFormData>) => console.log(params)"
  >
  </eacc-filter-form-drawer>
</template>
```