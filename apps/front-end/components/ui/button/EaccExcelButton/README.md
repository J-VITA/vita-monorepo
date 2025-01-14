# ExcelButton 컴포넌트

## 개요

`ExcelButton` 컴포넌트는 Excel 파일 업로드 및 다운로드를 위한 다목적 버튼 컴포넌트입니다.

## 설치 및 의존성

- `xlsx` 라이브러리
- Vue 3
- Ant Design Vue

## Props 타입

```typescript
interface ExcepOptionsProps<T> {
	reqType: "upload" | "download" // 버튼 동작 유형
	label?: string // 버튼 라벨
	type?: string // 버튼 타입
	ghost?: boolean // 고스트 버튼 여부
	danger?: boolean // 위험 버튼 여부
	size?: string // 버튼 크기
	loading?: boolean // 로딩 상태
	disabled?: boolean // 비활성화 상태
	url?: string // API 엔드포인트
	sampleFileKey?: string // 샘플 파일 키
	sheetName?: string // 다운로드 시트 이름
}
```

## 사용 예시

### 다운로드 버튼

```vue
<excel-button
	req-type="download"
	label="데이터 다운로드"
	:excel-data="userData"
	file-name="사용자 목록"
/>
```

### 업로드 버튼

```vue
<excel-button
	req-type="upload"
	label="엑셀 업로드"
	url="/api/upload"
	sample-file-key="user_template"
	@submit="handleUpload"
/>
```

## 주요 기능

- Excel 파일 업로드/다운로드 지원
- 동적 아이콘 렌더링
- 모달 기반 파일 업로드
- 다양한 버튼 스타일 커스터마이징

## 이벤트

- `submit`: 파일 업로드/다운로드 완료 시 트리거

## 주의사항

- 업로드 시 `url` prop 필수
- 샘플 파일 다운로드를 위해 `sampleFileKey` 권장
