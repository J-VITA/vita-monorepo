# EACC Select
공통 API 요청 콤보박스이며 비동기로 진행
Options 의 값들과 v-model:value 의 값이 일치하지 않은 경우 undefined 를 반환시킨다.
각 옵션들은 아래 템플릿에 정의해두었고, 해당 상세 정보는 컴포넌트 상세 코드 참고

## 사용방법
```vue
<script lang="ts" setup>
  type SelectField = {
    label: string,
    value: string
  }
  const value = ref('');
  const fieldsConfig = ref<SelectField>({
    label: 'name', value: 'code'
  });
</script>
<template>
  <!-- props
    /** API 호출 url */
    url: string;
    /**
    * select option 라벨과 키값 세팅
    * @param SelectField
    * * { label: string, value: string }
    */
    fieldNames: SelectField;
    /** select label class */
    labelClass?: string;
    /** select label 명 */
    label?: string;
    /** label style */
    labelStyle?: any;
    /** style */
    style?: any;
    /** style */
    gap?: number;
    /** 전체 필드 추가 옵션 */
    onAllField?: boolean;
    /** refresh */
    refresh?: boolean;
    /** disabled */
    disabled?: boolean;
    /** 요청 파라미터 셋업 */
    params?: {};
    /** placeholder */
    placeholder?: string;
    /** 반환 타입 선택(string, number, boolean, any */
    valueType?: 'any' | 'string' | 'number' | undefined;
    /** first '참' 일 경우 options 값의 첫번재 값을 default 셋업 */
    first?: boolean;
  -->
  <!--
  v-model:value="value"
  -->
  <!-- event
   @update:value="(key: string) => value = key"
   -->
  <eacc-select 
    url="/api/v2/settings/commons/departments"
    v-model:value="value" 
    :field-names="fieldsConfig"
    @update:value="(key) => value = key"
    params: {
      companyCode: '1000'
    }
    label="부서"
    placeholder="부서를 선택해주세요."
    refresh
    first
    :on-all-field="false"
    :disabled="isRead">
  </eacc-select>
</template>
```


# EACC Select Multiple Table
공통 코드 호출 콤보박스 UI
# EACC Select Table

# EACC AutoComplete