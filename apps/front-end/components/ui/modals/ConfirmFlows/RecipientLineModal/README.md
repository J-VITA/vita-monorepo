# 수신자 추가 모달
기준정보관리 -> 검인/수신 라인관리 -> 수신자 관리 탭
수신자 추가 및 수정 모달

## How to use
```vue
<script lang="ts" setup>
import { Response } from '@/types';

const opend = ref(false); // 모달 오픈/클로즈 플래그
const itemId = ref<string | number | undefined>(undefined); //수신 정보 상세 ID

const submit = (close: Response<any>) => {
  console.log('submit close : ', close);
}

</script>
<template>
  <recipient-line-modal
    v-model:open="opend"
    :item-id="itemId"
    @update:open="() => (opend = false)"
    @submit="submit"
  >
  </recipient-line-modal>
</template>
```

## Props
 - 테이블 아이템 선택할 시 id 값을 선택하여 props 에 전달하면 상세조회.
 - itemId 값이 없다면 신규로 간주함.
