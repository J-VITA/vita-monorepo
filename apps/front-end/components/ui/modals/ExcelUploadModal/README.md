# ExcelUploadModal 컴포넌트

이 문서는 `ExcelUploadModal` 컴포넌트에 대한 설명입니다. 이 컴포넌트는 엑셀 파일을 업로드하고, 업로드된 데이터를 미리보기 및 등록할 수 있는 기능을 제공합니다.

## 설치

이 컴포넌트를 사용하기 위해서는 다음의 패키지가 필요합니다:

- `xlsx`: 엑셀 파일을 읽고 쓰기 위한 라이브러리
- `ant-design-vue`: UI 컴포넌트 라이브러리

## 사용법

### Props

| 이름            | 타입      | 설명              |
| --------------- | --------- | ----------------- |
| `show`          | `boolean` | 모달의 표시 여부  |
| `sampleFileKey` | `string?` | 샘플 양식 연동 키 |
| `url`           | `string`  | 통신 API URL      |

### 이벤트

| 이름          | 설명                      |
| ------------- | ------------------------- |
| `update:show` | 모달의 표시 상태 업데이트 |
| `callback`    | 파일 등록 후 콜백         |

### 예제

```
<template>
<ExcelUploadModal
:show="isModalVisible"
:url="uploadUrl"
@update:show="isModalVisible = $event"
@callback="handleCallback"
/>
</template>
<script setup>
import { ref } from 'vue'
import ExcelUploadModal from '@/components/ui/modals/ExcelUploadModal'
const isModalVisible = ref(false)
const uploadUrl = '/api/upload'
const handleCallback = (data) => {
console.log('Uploaded data:', data)
}
</script>
```

## 기능

1. **파일 업로드**: 사용자는 엑셀 파일을 드래그 앤 드롭하거나 클릭하여 업로드할 수 있습니다.
2. **샘플 파일 다운로드**: 사용자는 샘플 양식을 다운로드할 수 있습니다.
3. **미리보기**: 업로드된 파일의 내용을 미리 볼 수 있습니다.
4. **등록**: 미리보기 후 등록 버튼을 클릭하여 데이터를 서버에 전송할 수 있습니다.

## 주의사항

- 업로드할 파일은 `.xlsx`, `.xls`, `.csv` 형식이어야 합니다.
- 파일 업로드 후, 서버에서의 응답에 따라 등록 성공 또는 실패 메시지가 표시됩니다.
