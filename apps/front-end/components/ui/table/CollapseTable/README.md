# Collapse Table
컨텐츠 영역이 테이블이면서 접거나 펼칠 수 있는 UI 컴포넌트

## Collapse Table model & props
  - model:value 의 타입은 boolean, 펼치거나 접을때 사용하는 변수로 넘김
  - props
    - rowData 의 타입은 `Array<any>`, 테이블안에 들어갈 데이터
    - columns 의 타입은 `ColumnsType<any>`, 테이블 컬럼의 정의
    - title 의 타입은 `string`, 목록의 타이틀
### 사용방법
```vue
<script lang="ts" setup>
const isTableCollapse = ref<boolean>(true); //true 값이 닫는거임
const rowData = ref<Array<any>>([]);
const columns = ref<ColumnsType<any>>([
  {
    title: "컬럼1",
    dataIndex: "column1",
    width: -1,
  },
  {
    title: "컬럼2",
    dataIndex: "column2",
    width: -1,
  },
])
</script>
<template>
  <collapse-table
    v-model:value="isTableCollapse"
    :row-data="rowData"
    :columns="columns"
    title="테이블 목록"
  ></collapse-table>
</template>
```