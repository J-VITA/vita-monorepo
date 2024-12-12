# 임직원 조직도 모달
  - useEmployeeTree.ts Composables API 사용
  * 주요 기능
    - 전체 회사 > 부서 > 임직원 계층 구조 데이터 조회
    - 회사와 부서 데이터를 트리 구조로 재가공
    - 트리 노드 선택 시 해당 임직원 데이터 조회 및 처리
  * 반환
    - treeList: 회사와 부서 구조의 트리 데이터
    - selectedNode: 현재 선택된 트리 노드 객체
    - loading: 임직원 데이터 조회 시 로딩 상태 플래그
    - dataTable: 조회 및 가공된 임직원 데이터
    - onSelect: 트리 노드 선택 이벤트 핸들러 함수
    - cellChange: 미사용 (페이징 처리 불필요)

## 사용방법
```vue
<script lang="ts" setup>
  import EmployeeTreeModal from '@components/ui/modals/EmployeeTreeModal/index.vue'; //생략 가능

  const opened = ref<boolean>(false);
</script>
<template>
  <employee-tree-modal
    v-model:open="opened"
    title="조직도">
  </employee-tree-modal>
</template>
```