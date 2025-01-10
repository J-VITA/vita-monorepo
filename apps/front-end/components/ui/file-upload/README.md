# 파일 첨부 (영수증, 첨부파일, 관련문서) 컴포넌트

## ReceiptFileUpload (영수증 파일)
  - 이미지 파일: image/*
    - 모든 종류의 이미지 파일을 허용 (예: .jpg, .png, .gif, .webp 등)
  - 첨부파일 업로드 한 개만 가능 (Single File Upload) 그러나 반환타입은 Array 참고
### 사용방법
```vue
<script lang="ts" setup>
const isRead = ref<boolean>(false); //읽기 전용 플래그
const receiptFile = ref<Array<any>>([]); 
</script>
<template>
  <receipt-file-upload
    :is-read="isRead"
    v-model:file-list="receiptFile"
    :file-props="{
      companyCode: 1000,//회사코드(필수)
      fileType: 'RECEIPT', //영수증타입(필수)
      documentedNumber: 'EA00000000'//전표번호(선택)
    }"
    @update:file-list="(files: Array<any>) => console.log('변경 파일 정보', files)"
  />
</template>
```

## AttachmentFileUpload (첨부파일 파일)
  - 이미지 파일: image/*, PDF 파일: .pdf
    - 모든 종류의 이미지 파일을 허용, 그리고 pdf 파일 (예: .jpg, .png, .gif, .webp 등, .pdf)
  - Multiple File Upload
### 사용방법
```vue
<script lang="ts" setup>
const isRead = ref<boolean>(false); //읽기 전용 플래그
const attachmentFile = ref<Array<any>>([]); 
</script>
<template>
  <attachment-file-upload
    :is-read="isRead"
    v-model:file-list="attachmentFile"
    :file-props="{
      companyCode: 1000,//회사코드(필수)
      fileType: 'SLIP', //전표타입(필수)
      documentedNumber: 'EA00000000'//전표번호(선택)
    }"
    @update:file-list="(files: Array<any>) => console.log('변경 파일 정보', files)"
  />
</template>
```

## DocumentsFileUpload (전자결재 문서 불러오기)
### 사용방법
```vue
<script lang="ts" setup>
</script>
<template>
  <documents-file-upload
    @update:document-ids="(data: number[])=>{
      formState.documents=data
    }"
  />
</template>
```