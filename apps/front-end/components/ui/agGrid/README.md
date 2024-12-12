# Ag Grid UI 컴포넌트
AG 그리드에서 사용 할 커스텀 UI 를 제공

## 제공 컴포넌트
  - Badge
  - ColorTag
  - ColorTagValue
  - IconLink
  - Link
  - StyleText
  - Tags

## 컴포넌트 작성 방법(권장)
  - 셋업함수로 제공할 것 language typescript 로 작성
  - 컴포넌트 생성 이후 Ag Grid 에서 받는 파라미터를 Props 받아서 처리함
  - Props 의 타입은 브랜드화로 명시하여 명확한 타입을 지정
    ```
    <script lang="ts" setup>
    //타입 정의
    type ExampleType = {
      disabled: boolean;
      color: string;
      text: string;
      value: string;
    }
    //태그벨류 브랜드명 타입 지정
    type ExampleBrand = 'Example';

    //타입을 'Example'로 브랜드화시킴
    type ExBrandType = createAgParams<ExampleType, ExampleBrand>
    const props = defineProps<ExBrandType>();
    const { disabled, color, text, value } = props.params;
    </script>
    <template>
      {{disabled}},{{color}},{{text}},{{value}}
    </template>
    ```