<script setup lang="ts">
import { type ItemType } from "ant-design-vue"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { Dayjs } from "dayjs"
import { Search, DocumentResParams } from "@/types/commons/document"
import { type Response, dateTimeFormat, generateSortParams, pagination } from "@/types"

const { show = false } = defineProps<{
	show: boolean
}>()

const emit = defineEmits<{
	(e: "update:documents", value: any[]): void
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const selectedMenuKeys = ref<string[]>(["1"])
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const showRelatedDocument = ref<boolean>(false)
const items = ref<ItemType[]>([
	{ label: "완료", key: "1" },
	{ label: "참조", key: "2" },
])
const searchFilterDate = ref<[Dayjs, Dayjs]>([useMonth.from(), useMonth.to()])
const documentColumns = ref<ColumnsType<DocumentResParams>>([
	{ title: "제목", dataIndex: "" },
	{ title: "기안자", dataIndex: "", width: 150 },
	{ title: "기안부서", dataIndex: "", width: 100 },
	{ title: "기안일", dataIndex: "", width: 100 },
])
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	startDate: useMonth.from(),
	endDate: useMonth.to(),
	title: "",
	searchType: "title",
	employeeId: getEmployeeId.value,
	page: 0,
	size: 10,
})
const documentsData = ref<any>()

// 테이블 선택값 초기화
const initTableSelectData = () => {
	selectedRowKeys.value = []
}

// 기간 설정
const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.startDate = dateString[0]
	searchParams.value.endDate = dateString[1]
}

// 필터 검색
const onSearch = () => {
	getDocumentData()
}

// 선택된 문서 데이터 보내기
const onSubmitFiles = () => {
	emit("update:documents", selectedRows.value)
}

// 마우스 오버 상태
const mouseoverKey = ref<string | null>(null)

// 마우스 오버 시 스타일 적용
const onMouseOverMenu = (e: { key: string }) => {
	mouseoverKey.value = e.key
}

// 마우스가 벗어났을 때 상태 초기화
const onMouseLeaveMenu = () => {
	mouseoverKey.value = null
}

// 클릭 이벤트
const onClickMenu = (e: { key: string | number }) => {
	if (typeof e.key !== "string") return

	selectedMenuKeys.value = [e.key]
	getDocumentData()
}

// 관련 문서 조회
const getDocumentData = () => {
	const url: string =
		selectedMenuKeys.value[0] === "1"
			? "/api/v2/approvals/documents/complete"
			: "/api/v2/approvals/documents/referenced"

	useCFetch<Response<any>>(url, {
		method: "GET",
		params: searchParams.value,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			documentsData.value = res
		} else {
			message.error(res.message)
		}
	})
}

// 선택된 아이템의 스타일 반환 함수
const getItemStyle = (key: string) => {
	if (selectedMenuKeys.value.includes(key)) {
		return { backgroundColor: "#6146E5", color: "white" } // 선택된 아이템
	}
	if (mouseoverKey.value === key) {
		return { backgroundColor: "lightgrey", color: "black" } // 마우스 오버 시
	}
	return { backgroundColor: "white", color: "black" } // 기본 상태
}

// 선택된 아이템의 클래스 반환 함수
const getItemClass = (key: string) => {
	if (selectedMenuKeys.value.includes(key)) {
		return "selected-menu-item"
	}
	return ""
}

// MenuItemType만 label을 가지고 있으므로, 이 타입에만 접근
const renderMenuItem = (item: ItemType) => {
	if (!item) return
	if ("label" in item) {
		return item.label
	}
	return ""
}

// 테이블 컬럼 길이 변경
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

// 테이블 변경 이벤트
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	initTableSelectData()
}

// 선택된 행 데이터 세팅
const onSelectChange = async (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
}

// 모달 닫기
const modalCancle = () => {
	emit("update:show", false)
}

onMounted(() => {
	getDocumentData()
})
</script>

<template>
	<a-modal
		centered
		:style="{ width: '100rem' }"
		title="관련문서 선택"
		ok-text="첨부"
		v-model:open="open"
		@ok="onSubmitFiles"
		@cancel="modalCancle"
	>
		<a-flex>
			<a-menu
				id="leftMenu"
				v-model:selectedKeys="selectedMenuKeys"
				:style="{ border: 'solid 0.5px lightgray', width: '256px' }"
				mode="inline"
				@click="onClickMenu"
				@mouseover="onMouseOverMenu"
				@mouseleave="onMouseLeaveMenu"
			>
				<a-menu-item
					v-for="item in items.filter((item) => item !== null)"
					:key="item.key"
					:style="getItemStyle(item.key as string)"
					:class="getItemClass(item.key as string)"
				>
					{{ renderMenuItem(item) }}
				</a-menu-item>
			</a-menu>
			<a-form label-align="left" :colon="false" :style="{ marginLeft: '20px' }">
				<a-row :gutter="[10, 5]" wrap :style="{ marginBottom: '20px' }">
					<a-col>
						<a-form-item label="기간설정">
							<a-range-picker
								v-model:value="searchFilterDate"
								:value-format="dateTimeFormat"
								picker="date"
								@change="onChangeRangePicker"
							/>
						</a-form-item>
					</a-col>
					<a-col :style="{ marginLeft: '20px' }">
						<a-space :size="5">
							<a-select
								v-model:value="searchParams.searchType"
								:options="[{ label: '제목', value: 'title' }]"
								:field-names="{ label: 'label', value: 'value' }"
							/>
							<a-input v-model:value="searchParams.title" />
							<eacc-button
								component-is="search"
								size="middle"
								:modal-open="false"
								:data="searchParams"
								@click="onSearch"
							/>
						</a-space>
					</a-col>
				</a-row>
				<a-col>
					<a-table
						v-if="documentsData"
						:columns="documentColumns"
						:data-source="documentsData.data"
						:pagination="
							Object.assign({}, pagination, {
								current: documentsData.pageNumber ? documentsData.pageNumber + 1 : 1,
								pageSize: documentsData.size,
								total: documentsData.totalElements,
							})
						"
						:row-key="(record: any) => record.id"
						:row-selection="{
							selectedRowKeys: selectedRowKeys,
							onChange: onSelectChange,
						}"
						:show-sorter-tooltip="false"
						@resize-column="handleResizeColumn"
						@change="cellChange"
					></a-table>
				</a-col>
			</a-form>
		</a-flex>
	</a-modal>
</template>

<style>
/* 기본 스타일 */
.selected-menu-item {
	background-color: #6146e5 !important;
	color: white !important;
}
</style>
