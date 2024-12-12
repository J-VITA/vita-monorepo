<script lang="ts" setup>
import { Dayjs } from "dayjs"
import {
	type FormProps,
	Form,
	RadioGroupProps,
	SelectProps,
	FormInstance,
} from "ant-design-vue"
import { type Response, type RequestParams, pageSizeOptions, pagination } from "@/types"
import type {
	FamilyEventsItem,
	FamilyEventsParams,
	Search,
} from "@/types/master/family-events"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
definePageMeta({
	name: "경조금관리",
})

const { $dayjs } = useNuxtApp()
const searchFilterDate = ref<[Dayjs, Dayjs]>()

const familyEventFormRef = ref<FormInstance>()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const flagOptions: RadioGroupProps["options"] = [
	{ label: "지원", value: true },
	{ label: "미지원", value: false },
]
const selectedRowKeys = ref<(string | number)[]>([])
const isShowFamilyEventModal = ref<boolean>(false)
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	startDate: undefined,
	endDate: undefined,
	pageNumber: 0,
	size: 10,
})

const modalField = ref<FamilyEventsItem>({
	companyCode: getCompanyCode.value,
	description: "",
	filterDate: undefined,
	familyEventTypeName: "",
	familyEventTypeLabel: "",
	familyEventAmount: 0,
	vacationDay: 1,
	mutualAidFlag: false,
	wreathFlag: false,
	updatedAt: "",
	updatedBy: "",
	startDate: "",
	endDate: "",
})

const vacationOptions: SelectProps["options"] = []
const columns = ref<ColumnsType<any>>([
	{
		title: "경조구분명",
		dataIndex: "familyEventTypeName",
		resizable: true,
		sorter: true,
		width: -1,
	},
	{
		title: "적용기간",
		dataIndex: "date",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "지원금액",
		dataIndex: "familyEventAmount",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "휴가부여일수",
		dataIndex: "vacationDay",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "상조용품",
		dataIndex: "mutualAidFlag",
		resizable: true,
		width: -1,
	},
	{
		title: "화환",
		dataIndex: "wreathFlag",
		resizable: true,
		width: -1,
	},
	{
		title: "최종수정일",
		dataIndex: "updatedAt",
		resizable: true,
		width: -1,
	},
	{
		title: "최종수정자",
		dataIndex: "updatedBy",
		resizable: true,
		width: -1,
	},
])

const {
	data: eventData,
	pending,
	refresh,
} = await useAsyncData("family-events-list", () =>
	useIFetch<Response<Array<FamilyEventsItem>>>("/api/v2/master/familyEvents", {
		method: "GET",
		params: searchParams.value,
	})
		.then((res: any) => res.data.value)
		.then((res: Response<Array<FamilyEventsItem>>) => res)
)

const onSearch = () => {
	refresh()
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.startDate = dateString[0]
	searchParams.value.endDate = dateString[1]
}

const showModal = async (id?: number) => {
	if (id) {
		await useIFetch<Response<FamilyEventsItem>>(`/api/v2/master/familyEvents/${id}`, {
			method: "GET",
			params: { companyCode: getCompanyCode.value },
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				modalField.value.id = id
				modalField.value.companyCode = res.data.companyCode
				modalField.value.description = res.data.description
				modalField.value.familyEventTypeName = res.data.familyEventTypeName
				modalField.value.familyEventTypeLabel = res.data.familyEventTypeLabel
				modalField.value.familyEventAmount = res.data.familyEventAmount
				modalField.value.vacationDay = res.data.vacationDay
				modalField.value.mutualAidFlag = res.data.mutualAidFlag
				modalField.value.wreathFlag = res.data.wreathFlag
				modalField.value.updatedAt = res.data.updatedAt
				modalField.value.updatedBy = res.data.updatedBy
				modalField.value.startDate = $dayjs(res.data.startDate).format("YYYY-MM-DD")
				modalField.value.endDate = $dayjs(res.data.endDate).format("YYYY-MM-DD")
				modalField.value.filterDate = [
					$dayjs(res.data.startDate),
					$dayjs(res.data.endDate),
				]
			})
			.finally(() => (isShowFamilyEventModal.value = true))
	} else {
		modalField.value.companyCode = getCompanyCode.value
		modalField.value.description = ""
		modalField.value.familyEventTypeName = ""
		modalField.value.familyEventTypeLabel = ""
		modalField.value.familyEventAmount = 0
		modalField.value.vacationDay = 1
		modalField.value.mutualAidFlag = false
		modalField.value.wreathFlag = false
		modalField.value.updatedAt = undefined
		modalField.value.updatedBy = undefined
		modalField.value.startDate = undefined
		modalField.value.endDate = undefined
		modalField.value.filterDate = undefined
		isShowFamilyEventModal.value = true
	}
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
}

const cellChange = (pagination: any) => {
	searchParams.value.pageNumber = pagination.current
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onDelete = (users: number[]) => {
	let num = 0
	users.forEach(async (id) => {
		await useIFetch<Response<any>>(`/api/v2/master/familyEvents/${id}`, {
			method: "DELETE",
			body: {
				id: id,
			},
		})
			.then((res: any) => res.data.value)
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

const calculate = (start: number, end: number) => {
	for (let idx: number = start; idx < end; idx++)
		vacationOptions.push({ value: idx, label: idx + "일" })
	return vacationOptions
}
const onSubmit = (data: FamilyEventsParams) => {
	familyEventFormRef.value
		?.validate()
		.then(async () => {
			const send = Object.assign({}, data)
			delete send.method
			const url = data.id
				? `/api/v2/master/familyEvents/${data.id}`
				: "/api/v2/master/familyEvents"
			await useIFetch<Response<any>>(url, {
				method: data.id ? "PATCH" : "POST",
				body: send,
			})
				.then((res: any) => res.data.value)
				.then((res: Response<any>) => {
					if (res.status !== 0) return
					isShowFamilyEventModal.value = false
					familyEventFormRef.value?.resetFields()
					message.success(res.message)
					refresh()
				})
		})
		.catch((err) => {
			console.log("error", err)
		})
}

onMounted(() => {
	calculate(1, 31)
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				경조금 기준을 만들어 기간별로 관리할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="기간설정">
							<a-range-picker
								v-model:value="searchFilterDate"
								picker="month"
								@change="onChangeRangePicker"
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
							@click="onDelete"
						/>
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'add_circle')"
							@click="showModal()"
							>경조금기준 추가</a-button
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
				:loading="pending"
				:columns="columns"
				:show-sorter-tooltip="false"
				:data-source="eventData?.data"
				:row-key="(record) => record.id"
				:row-selection="{
					selectedRowKeys,
					onChange: onRowSelection,
				}"
				:pagination="
					Object.assign({}, pagination, {
						current:
							searchParams?.pageNumber === 0
								? searchParams?.pageNumber + 1
								: searchParams?.pageNumber,
						pageSize: searchParams?.size,
						total: eventData?.totalElements,
					})
				"
				@change="cellChange"
				@resizeColumn="handleResizeColumn"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'familyEventTypeName'">
						<a-typography-link @click="showModal(record.id)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'date'">
						<a-space :size="2">
							{{ record.startDate }}
							<span v-if="record.endDate">-</span>
							{{ record.endDate }}
						</a-space>
					</template>
					<template v-if="column.dataIndex === 'mutualAidFlag'">
						<a-badge
							:color="record.mutualAidFlag ? 'green' : 'red'"
							:text="record.mutualAidFlag ? '지원' : '미지원'"
						/>
					</template>
					<template v-if="column.dataIndex === 'wreathFlag'">
						<a-badge
							:color="record.wreathFlag ? 'green' : 'red'"
							:text="record.wreathFlag ? '지원' : '미지원'"
						/>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<field-modal
				title="경조금 기준 추가"
				okText="저장"
				cancelText="취소"
				:field="modalField"
				:showed="isShowFamilyEventModal"
				@closed="
					() => {
						familyEventFormRef?.resetFields()
						isShowFamilyEventModal = false
					}
				"
				@submit="(data: FamilyEventsParams) => onSubmit(data)"
			>
				<template #content="{ field }">
					<a-form
						ref="familyEventFormRef"
						:model="field"
						label-align="left"
						:colon="false"
						:label-col="{ span: 8 }"
						:wrapper-col="{ span: 16 }"
					>
						<a-form-item
							label="경조구분명"
							name="familyEventTypeName"
							:rules="[
								{
									required: true,
									message: '경조구분명을 선택해주세요.',
								},
							]"
							has-feedback
						>
							<eacc-select
								url="/api/v2/master/familyEvents/types/familyEventTypes"
								:on-all-field="false"
								v-model:value="modalField.familyEventTypeName"
								:field-names="{ label: 'label', value: 'code' }"
								:first="modalField.familyEventTypeName ? false : true"
								valueType="any"
								@update:anyValue="
									(value: any) => {
										modalField.familyEventTypeLabel = value.label
										modalField.familyEventTypeName = value.code
									}
								"
							>
							</eacc-select>
						</a-form-item>
						<a-form-item
							label="적용기간"
							name="filterDate"
							:rules="[
								{
									required: true,
									message: '적용기간을 선택해주세요.',
									type: 'array',
									trigger: 'change',
								},
							]"
							has-feedback
						>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-range-picker
										class="full-width"
										v-model:value="field.filterDate"
										@change="
											(_, dateString) => {
												modalField.startDate = dateString[0]
												modalField.endDate = dateString[1]
											}
										"
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item
							label="지원금액"
							name="familyEventAmount"
							:rules="[
								{
									required: true,
									message: '지원금액을 작성해주세요.',
								},
							]"
						>
							<eacc-amount-input
								v-model:value="modalField.familyEventAmount"
								:disabled="false"
							/>
						</a-form-item>

						<a-form-item
							label="휴가부여일수"
							name="vacationDay"
							:rules="[
								{
									required: true,
									message: '휴가부여일수를 선택해주세요.',
								},
							]"
							has-feedback
						>
							<a-select
								name="select"
								v-model:value="modalField.vacationDay"
								:options="vacationOptions"
							>
							</a-select>
						</a-form-item>
						<a-form-item label="상조용품" name="mutualAidFlag">
							<a-radio-group
								v-model:value="modalField.mutualAidFlag"
								:options="flagOptions"
							/>
						</a-form-item>
						<a-form-item label="화환" name="wreathFlag">
							<a-radio-group
								v-model:value="modalField.wreathFlag"
								:options="flagOptions"
							/>
						</a-form-item>
						<a-form-item label="비고" name="description">
							<a-input v-model:value="modalField.description" />
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
