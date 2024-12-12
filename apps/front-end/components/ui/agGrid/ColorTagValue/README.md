# ColorTagValue(AG-Grid 컬럼 커스텀 컴포넌트)
태그와 텍스트, 그리고 벨류값을 함께 표시하는 레이아웃 컴포넌트 제공

## 사용방법
    ```
    <script setup lang="ts">
    import { ColorTagValue } from '@/components/ui';
    const columnDefs = ref<GridOptions<any>['columnDefs']>([
      cellRenderer: ColorTagValue,
      cellRendererParams: (params: ICellRendererParams) => {
        return {
          params, // 옵셔널 (타입의 포함은 안되어 있지만 던지면 받음.)
          color: 'red', // 태그의 컬러
          text: '분할', // 태그의 텍스트
          disabled: params.node.data.flag, //태그의 disabled 처리 플래그
          value: params.value, //벨류 값
        };
      },
    ]);
    </script>
    ```
## Props
  - agGrid <ICellRendererParams> 의 전체 타입을 props으로 전달받음.
  - 컴포넌트의 타입을 좀더 명확한 타입으로 명시받기 위해 타입을 브랜드화 시킨 타입
    - TagValueType과 tagValueBrand의 정의
      - color: string 태그의 컬러
      - text: string 태그의 텍스트
      - disabled: boolean 태그의 disabled 처리 플래그
      - value: string | number 벨류 값