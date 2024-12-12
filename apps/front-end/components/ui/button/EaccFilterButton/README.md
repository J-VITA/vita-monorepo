# EACC Filter Button
검색 폼 버튼

## 사용방법
```vue
<script lang="ts" setup>
import type { IFormData, IFormType } from '@/types';

  const formData = ref<Array<IFormData>>([
    { //기본 input 유형
      name: 'input',
      label: 'Text1',
      disabled: false,
    },
    { //기본 input 유형, defaultValue 와 rules 적용
      name: 'input2',
      label: 'Rule 추가',
      disabled: true,
      defaultValue: '',
      rules: [
        {
          required: true,
          message: '해당 필드는 필수 입니다',
        },
      ],
    },
    { //기본 radio 유형
      name: 'statementAccount',
      label: '전표입력계정',
      defaultValue: '1',
      typeInfo: {
        type: 'radio',
        options: [
          { label: '가능', value: '1' },
          { label: '불가능', value: '2' },
        ],
      } as IFormType,
    },
    { //기본 checkbox 유형
      name: 'expenditureType',
      label: '지출유형선택',
      defaultValue: [1, 2, 3],
      typeInfo: {
        type: 'checkbox',
        options: [
          { label: '개인경비', value: 1 },
          { label: '법인카드', value: 2 },
          { label: '세금계산서', value: 3 },
        ],
      } as IFormType,
    },
    { //기본 select 유형
      name: 'test11',
      label: 'select test',
      defaultValue: { label: '텍스트입력형', value: 'a' },
      typeInfo: {
        type: 'select',
        options: [
          { label: '텍스트입력형', value: 'a' },
          { label: '날짜선택형', value: 'b' },
          { label: '코드형', value: 'c' },
        ],
      } as IFormType,
    },
    { //search select 유형
      name: 'deptName',
      label: '직위테스트',
      url: '/api/v2/settings/commons/jobTitles',
      defaultValue: 'Rule 을 추가한 경우 입니다.',
      typeInfo: {
        type: 'search',
        fieldName: {label: 'name', value: 'code'},
        options: [
          { label: '텍스트입력형', code: 'a' },
          { label: '날짜선택형', code: 'b' },
          { label: '코드형', code: 'c' },
        ],
      } as IFormType,
      rules: [
        {
          required: true,
          message: '빈값을 채워주세요',
        },
      ],
    },
  ]);

  const submit = (value: any) => {
    console.log('submit', value);
  };
</script>
<template>
  <!-- props
    /** 버튼 타입 (디폴트값 : primary) */
    type?: 'primary' | 'dashed' | 'text' | 'link';
    /** 버튼 텍스트 */
    label?: string;
    /** 버튼 ghost option 선택 */
    ghost?: boolean;
    /** 버튼 danger option 선택 */
    danger?: boolean;
    /** 버튼 기본 사이트 선택  (디폴트값 : middle) */
    size?: 'large' | 'middle' | 'small';
    /** 버튼 로딩 사용할 것인지 선택  (디폴트값 : false) */
    loading?: boolean;
    /** icon */
    icon?: any;
  -->
  <!-- event
   update:form-data: (data: Array<IFormData>) => any
   -->
  <eacc-filter-button
    v-model:form-data="formData"
    @update:form-data="(params) => (formData = params)"
    :icon="materialIcons('mso', 'visibility')"
    @submit="submit"
  >
    상세필터조회
  </eacc-filter-button>
</template>
```