<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { type Response, pageSizeOptions, pagination, pageSize } from "@/types"
import { Form } from "ant-design-vue"
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"

import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Search } from "@/types/master/project"

definePageMeta({
	name: "프로젝트 관리",
})

const useForm = Form.useForm

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const columns = ref<ColumnsType<any>>([
	{
		title: "프로젝트명",
		dataIndex: "name",
		resizable: true,
		width: -1,
	},
	{
		title: "프로젝트 기간",
		dataIndex: "date",
		resizable: true,
		width: -1,
	},
	{
		title: "프로젝트 코드",
		dataIndex: "code",
		resizable: true,
		width: -1,
	},
	{
		title: "사용자",
		dataIndex: "employeeAmount",
		align: "right",
		resizable: true,
		width: -1,
	},
	{
		title: "설명",
		dataIndex: "description",
		resizable: true,
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		resizable: true,
		width: -1,
	},
])

const selectedRowKeys = ref<(string | number)[]>([])
const selectedNode = ref<any>(undefined)
const showProjectModal = ref<boolean>(false)

const filterDate = ref<[Dayjs, Dayjs]>()
const filterUsed = ref<string>("all")
const filterType = ref<"code" | "name">("name")
const filterText = ref<string>("")
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	pageNumber: 0,
	first: true,
	last: true,
	size: pageSize,
})

const { resetFields } = useForm(searchParams)

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"projects-list",
	() =>
		useCFetch<Response<any>>("/api/v2/master/projects", {
			method: "GET",
			params: {
				page: searchParams.value.pageNumber,
				...searchParams.value,
			},
		}).then((res: Response<any>) => res),
	{
		watch: [searchParams.value],
	}
)

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.startYearMonth = dateString[0]
	searchParams.value.endYearMonth = dateString[1]
}

const cellChange = (pagination: any) => {
	searchParams.value.pageNumber = pagination.current - 1
}

const showModal = async (id?: number) => {
	if (id) {
		selectedNode.value = await useCFetch<Response<any>>(`/api/v2/master/projects/${id}`, {
			method: "GET",
			params: { companyCode: getCompanyCode.value },
		}).then((res: Response<any>) => res.data)
	}
	showProjectModal.value = true
}

const onSearch = async () => {
	await nextTick(() => {
		if (filterType.value === "code") {
			searchParams.value.code = filterText.value
			delete searchParams.value.name
		} else if (filterType.value === "name") {
			searchParams.value.name = filterText.value
			delete searchParams.value.code
		}
		if (!filterText.value) {
			delete searchParams.value.code
			delete searchParams.value.name
		}

		if (filterUsed.value === "all") {
			delete searchParams.value.used
		}
		if (filterUsed.value === "use") {
			searchParams.value.used = true
		}
		if (filterUsed.value === "not") {
			searchParams.value.used = false
		}
	}).then(() => refresh())
}
const onDelete = (users: number[]) => {
	let num = 0
	users.forEach(async (id) => {
		await useCFetch<Response<any>>(`/api/v2/master/projects/${id}`, {
			method: "DELETE",
			body: {
				id: id,
			},
		})
			.then((res: Response<any>) => {
				if (res.status === 0) num = num + 1
			})
			.then(() => {
				if (num === users.length) {
					message.success(`${num}개의 프로젝트가 삭제 되었습니다.`)
					selectedRowKeys.value = []
					refresh()
				}
			})
	})
}
/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const updateModal = (value: boolean) => {
	showProjectModal.value = value
	selectedNode.value = undefined
}

onMounted(() => {
	const from = dayjs().subtract(1, "M")
	const to = dayjs()
	filterDate.value = [from, to]
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				프로젝트를 만들어 사용자를 할당할 수 있습니다. 프로젝트별로 지출을 관리하고
				사용현황을 추적할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="기간설정">
							<a-range-picker
								v-model:value="filterDate"
								picker="month"
								@change="onChangeRangePicker"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="검색필터">
							<a-input-group compact class="filter">
								<a-select
									v-model:value="filterType"
									:options="[
										{ label: '프로젝트명', value: 'name' },
										{ label: '프로젝트코드', value: 'code' },
									]"
									placeholder="항목선택"
								/>
								<a-input v-model:value="filterText" placeholder="검색" />
							</a-input-group>
						</a-form-item>
					</a-col>
					<a-col flex="16rem">
						<a-form-item label="사용여부">
							<a-select
								v-model:value="filterUsed"
								:options="[
									{ label: '전체', value: 'all' },
									{ label: '사용', value: 'use' },
									{ label: '미사용', value: 'not' },
								]"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
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
			</a-form>
			<a-divider class="my-md" />
			<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
				<a-col></a-col>
				<a-col>
					<a-space :size="5">
						<eacc-button
							component-is="delete"
							:data="selectedRowKeys"
							:modal-open="true"
							:disabled="selectedRowKeys.length === 0"
							@click="onDelete"
						/>
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'add_circle')"
							@click="showModal()"
							>프로젝트 추가</a-button
						>
						<a-select
							v-model:value="searchParams.size"
							:options="pageSizeOptions"
							value-field="key"
							text-field="label"
						/>
					</a-space>
				</a-col>
			</a-row>
			<a-table
				size="small"
				:loading="status === 'pending'"
				:columns="columns"
				:data-source="dataSource?.data"
				:row-selection="{
					selectedRowKeys,
					onChange: (keys) => (selectedRowKeys = keys),
				}"
				:row-key="(record) => record.id"
				:pagination="
					Object.assign({}, pagination, {
						current: searchParams?.pageNumber! + 1,
						pageSize: searchParams?.size,
						total: dataSource?.totalElements,
					})
				"
				@change="cellChange"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'name'">
						<a-typography-link @click="showModal(record.id)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'date'">
						<a-space :size="2">
							{{ record.startYearMonth }}
							<span v-if="record.endYearMonth">-</span>
							{{ record.endYearMonth }}
						</a-space>
					</template>
					<template v-if="column.dataIndex === 'used'">
						<a-badge
							:status="text ? 'success' : 'error'"
							:text="text ? '사용중' : '미사용'"
						/>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<project-modal
				:show="showProjectModal"
				:node="selectedNode"
				:companyCode="getCompanyCode"
				@update:show="updateModal"
				@callback="() => refresh()"
			/>
		</template>
	</page-layout>
</template>
