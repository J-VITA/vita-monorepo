<script lang="ts" setup>
import {
	FamilyEventListColumns,
	FamilyEventTableData,
	useFamilyEventListColumns,
	useFamilyRequestSearch,
} from "@/types/hr-ga/family-events"
import { Dayjs } from "dayjs"
import {
	pageSizeOptions,
	pagination,
	Response,
	SlipFormType,
	dateTimeFormat,
} from "@/types"
import { ColumnType } from "ant-design-vue/es/table"

definePageMeta({
	name: "경조금신청현황",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = await useFamilyRequestSearch(
	getCompanyCode.value,
	getEmployeeId.value
)

const columns = useFamilyEventListColumns()

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		searchDateFrom: dateString[0],
		searchDateTo: dateString[1],
	})
}

const handleResizeColumn = (w: number, col: ColumnType<FamilyEventListColumns>) => {
	col.width = w
}

const cellChange = (pagination: any) => {
	updateSearchParams({
		pageNumber: pagination.current - 1,
	})
}

const onSearch = () => {
	updateSearchParams({ pageNumber: 0 })
	refresh()
}

const onPage = async (id: number) => {
	await navigateTo(`/approvals/read-${compCase(SlipFormType.FAMILY_EVENT)}/${id}`)
}

const onSelectionchange = (size: number) => {
	updateSearchParams({
		size,
		pageNumber: 0,
	})
}

const {
	data: dataSource,
	status: tableStatus,
	refresh,
} = await useAsyncData(
	"hr-ga-family-events-list",
	() =>
		useCFetch<Response<Array<FamilyEventTableData>>>("/api/v2/familyEvents/requests", {
			method: "GET",
			params: {
				page: searchParams.value.pageNumber,
				...searchParams.value,
			},
		}),
	{
		transform: (res: Response<Array<FamilyEventTableData>>) => res,
		watch: [searchParams],
		immediate: true,
		deep: true,
	}
)
</script>
<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				경조금 신청내역을 확인 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 15]" wrap>
				<a-col>
					<a-space>
						<label>기안일</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>

				<a-col>
					<eacc-select-table
						label="기안자"
						url="/api/v2/cards/commons/employees"
						v-model:value="searchParams.draftEmmployeeIds"
						key-props="id"
						label-prop="name"
						:columns="[
							{ title: '이름', data: (row: any) => row.name },
							{ title: '직위', data: (row: any) => row.gradeName },
							{
								title: '코스트센터',
								data: (row: any) => row.costCenterName,
							},
						]"
						@update:value="(value) => (searchParams.draftEmmployeeId = value[0])"
					/>
				</a-col>

				<a-col>
					<eacc-select
						style="min-width: 10rem"
						label="결재상태"
						url="/api/v2/approvals/types/documentStatuses"
						v-model:value="searchParams.documentStatus"
						first
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="true"
					/>
				</a-col>
				<a-col>
					<a-space>
						<label>제목</label>
						<a-input v-model:value="searchParams.title"></a-input>
					</a-space>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						@click="onSearch"
					/>
				</a-col>
			</a-row>

			<a-divider />

			<a-flex align="center" justify="flex-end" class="mb-sm" :gap="5">
				<a-select
					v-if="searchParams.size"
					v-model:value="searchParams.size"
					:options="pageSizeOptions"
					@change="(page: any) => onSelectionchange(page)"
				/>
			</a-flex>

			<a-table
				size="small"
				:loading="tableStatus === 'pending'"
				:columns="columns"
				:data-source="dataSource?.data || []"
				:show-sorter-tooltip="false"
				:row-key="(record) => record.id"
				@resize-column="handleResizeColumn"
				:pagination="
					Object.assign({}, pagination, {
						current: searchParams.pageNumber ? searchParams.pageNumber + 1 : 1,
						pageSize: searchParams.size,
						total: dataSource?.totalElements,
					})
				"
				@change="cellChange"
			>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record.approvalHeaderId)">
							{{ text }}
						</a-typography-link>
					</template>
				</template>
			</a-table>
		</template>
	</page-layout>
</template>
