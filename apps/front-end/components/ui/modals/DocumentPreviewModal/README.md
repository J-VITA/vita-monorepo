# (공통) 전표유형별 미리보기화면

## 사용법
```vue
 
<script lang="ts" setup>
import { SlipFormType } from "@/types"SlipFormType

</script>
<template>
  <!-- 전표유형은 SlipFormType 을 참고하세요. -->
  <document-preview-modal
    :show="showDocument"
    :id="id"
    :slip-type="compCase(전표유형타입)" 
    :completed="true"
    @update:show="(value) => (showDocument = value)"
  />
</template>
```