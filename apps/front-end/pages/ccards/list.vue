<script setup lang="ts">
import type { Dayjs } from "dayjs"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import { pagination, generateSortParams, pageSizeOptions, type Response } from "@/types"
import { CardStatusColor, CardTypeColor } from "@/types/ccards"
import {
	type CardManagementListTableData,
	useCardManagementListColumns,
	useCardManagementListSearch,
} from "@/types/ccards/list"
import CardManagementModal from "@/components/ui/modals/CardManagementModal/index.vue"

definePageMeta({
	name: "법인카드정보관리",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = await useCardManagementListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)

const columns = useCardManagementListColumns()
const selectedRowKeys = ref<(string | number)[]>([])
const formId = ref<number | undefined>(undefined)
const isCardManagement = ref<boolean>(false)

const handleResizeColumn = (w: number, col: ColumnType<CardManagementListTableData>) => {
	col.width = w
}

const onSelectionchange = (size: number) => {
	searchParams.value.size = size
	refresh()
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const { current, pageSize } = pagination
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: current - 1,
		size: pageSize,
		sort: sortParams,
	})
	refresh()
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		issueDateFrom: dateString[0],
		issueDateTo: dateString[1],
	})
}

const onSearch = () => {
	updateSearchParams({ pageNumber: 0 })
	refresh()
}

const onDelete = async (data: any) => {
	await Promise.all(
		data.map((id: number) =>
			useCFetch<Response<any>>(`/api/v2/card/managements/${id}`, {
				method: "DELETE",
				params: { id },
				body: { id },
			})
		)
	)
		.then((res) => {
			message.success(`${res.length}개의 카드가 삭제되었습니다.`)
			refresh()
		})
		.catch((err) => console.error(err))
}

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"card-managements-list",
	() =>
		useCFetch<Response<Array<CardManagementListTableData>>>("/api/v2/card/managements", {
			method: "GET",
			params: {
				page: searchParams.value.pageNumber,
				...searchParams.value,
			},
		}),
	{
		transform: (res: Response<Array<CardManagementListTableData>>) => res,
	}
)

const onCardManagement = (id?: number) => {
	formId.value = undefined
	if (id) {
		formId.value = id
	}
	isCardManagement.value = true
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				사업장별 법인카드를 추가하고 관리 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 15]" wrap>
				<a-col>
					<a-space>
						<label>발급일자</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>카드번호</label>
						<a-input v-model:value="searchParams.number" />
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>카드별칭</label>
						<a-input v-model:value="searchParams.name" />
					</a-space>
				</a-col>
				<a-col>
					<eacc-select-table
						label="카드소유자"
						url="/api/v2/cards/commons/employees"
						v-model:value="searchParams.ownerIds"
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
						@update:value="(value) => (searchParams.ownerId = value[0])"
					/>
				</a-col>
				<a-col>
					<eacc-select
						style="min-width: 10rem"
						label="카드구분"
						url="/api/v2/card/managements/types/CardType"
						v-model:value="searchParams.cardType"
						first
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="true"
					/>
				</a-col>
				<a-col>
					<eacc-select
						style="min-width: 10rem"
						label="카드상태"
						url="/api/v2/card/managements/types/CardStatuss"
						v-model:value="searchParams.cardStatus"
						first
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="true"
					/>
				</a-col>
				<a-col>
					<a-space>
						<label>사용여부</label>
						<a-select
							style="min-width: 10rem"
							v-model:value="searchParams.used"
							:options="[
								{ value: '', label: '전체' },
								{ value: 'true', label: '사용' },
								{ value: 'false', label: '미사용' },
							]"
						/>
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
			<a-flex justify="flex-end" gap="5" class="mb-sm">
				<eacc-button
					component-is="delete"
					size="middle"
					:modal-open="true"
					:data="selectedRowKeys"
					@click="onDelete"
					:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
				/>
				<a-button :icon="materialIcons('mso', 'download')">엑셀다운로드</a-button>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_card')"
					@click="onCardManagement()"
				>
					법인카드등록
				</a-button>
				<a-select
					v-model:value="searchParams.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="(page: any) => onSelectionchange(page)"
				/>
			</a-flex>
			<a-table
				size="small"
				:loading="status === 'pending'"
				:columns="columns"
				:data-source="dataSource?.data || []"
				:row-key="(record) => record.id"
				:row-selection="{
					selectedRowKeys: selectedRowKeys,
					onChange: (keys) => {
						selectedRowKeys = keys
					},
				}"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
				:pagination="
					Object.assign({}, pagination, {
						current: searchParams.pageNumber! + 1 || 1,
						pageSize: searchParams.size,
						total: dataSource?.totalElements,
					})
				"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'name'">
						<a-typography-link @click="onCardManagement(record.id)">
							{{ text ? text : "-" }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'cardTypeName'">
						<a-tag :color="CardTypeColor[text]">
							{{ record.cardTypeLabel }}
						</a-tag>
					</template>
					<template v-if="column.dataIndex === 'cardStatusName'">
						<a-tag :color="CardStatusColor[text]">
							{{ record.cardStatusLabel }}
						</a-tag>
					</template>
					<template v-if="column.dataIndex === 'used'">
						<a-badge
							:status="text ? 'success' : 'error'"
							:text="text ? '사용' : '미사용'"
						/>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<card-management-modal
				:show="isCardManagement"
				:form-id="formId"
				@update:show="(value) => (isCardManagement = value)"
				@refresh="refresh()"
			/>
		</template>
	</page-layout>
</template>
