# EACC Button
조회, 삭제, 수정, 저장 기준으로 작성한 버튼 UI

## 사용방법
```html
<template>
  <!-- props
    * componentIs : search | delete | edit | create 조회, 삭제, 수정, 저장 해당 컴포넌트 지정 
    ? type : primary | ghost | dashed | link | text | default
    * data(타입: any) : 클릭 이후 전달 받을 데이터 세팅
    ? label : 버튼 text
    ? ghost : background 없음/있음 선택
    ? danger : 경고 백그라운드 설정
    ? size : 'large'|'middle'|'small'
    ? loading : 버튼 로딩
    ? modalOpen : 모달 띄울지 말지 결정 (search 컴포넌트는 사용안함.)
  -->
  <!-- event
   click: (data: any) => any
   -->
  <eacc-button 
    componentIs="search"
    type="primary"
    :data="deleteData"
    @click="callback">
  </eacc-button>
</template>
```