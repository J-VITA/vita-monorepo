<script lang="ts" setup>
import { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { type FormProps, Form, FormInstance } from "ant-design-vue"
import {
	type Response,
	type RequestParams,
	pageSizeOptions,
	pagination,
	dateTimeFormat,
} from "@/types"
import type {
	FormData,
	FuelInfoData,
	FuelEventParams,
	Search,
} from "@/types/master/fuels"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
definePageMeta({
	name: "유류단가관리",
})

const { $dayjs } = useNuxtApp()
const searchFilterDate = ref<[Dayjs, Dayjs]>()

const fuelFormRef = ref<FormInstance>()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const selectedRowKeys = ref<(string | number)[]>([])
const isShowFuelModal = ref<boolean>(false)
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	searchYearMonthFrom: undefined,
	searchYearMonthTo: undefined,
	page: 0,
	size: 10,
})

const modalField = ref<FormData>({
	companyCode: getCompanyCode.value,
	searchYearMonth: "",
	gasolinePrice: undefined,
	gasolineMileage: undefined,
	dieselPrice: 0,
	dieselMileage: 0,
	lpgPrice: 0,
	lpgMileage: 0,
	electricPrice: 0,
	electricMileage: 0,
})

/**
 * 기준년월 > 오늘기준 년월 세팅
 **/
const from = dayjs().subtract(1, "M")
const to = dayjs()
searchFilterDate.value = [from, to]
searchParams.value.searchYearMonthFrom =
	from.year() + "-" + ("00" + (from.month() + 1)).slice(-2)
searchParams.value.searchYearMonthTo =
	to.year() + "-" + ("00" + (to.month() + 1)).slice(-2)

const columns = ref<ColumnsType<any>>([
	{
		title: "기준월",
		dataIndex: "standardYearMonth",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "휘발유 단가 / 연비(km/l)",
		dataIndex: "gasolinePrice",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "경유 단가 / 연비(km/l)",
		dataIndex: "dieselPrice",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "LPG 단가 / 연비(km/l)",
		dataIndex: "lpgPrice",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "전기 단가 / 연비(km/l)",
		dataIndex: "electricPrice",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "최종수정일",
		dataIndex: "updatedAt",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "최종수정자",
		dataIndex: "updatedBy",
		resizable: true,
		align: "center",
		width: -1,
	},
])

const {
	data: eventData,
	status,
	refresh,
} = await useAsyncData("oils-list", () =>
	useIFetch<Response<Array<FuelInfoData>>>("/api/v2/masters/oils", {
		method: "GET",
		params: searchParams.value,
	})
		.then((res: any) => res.data.value)
		.then((res: Response<Array<FuelInfoData>>) => res)
)

const onSearch = () => {
	refresh()
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.searchYearMonthFrom = dateString[0]
	searchParams.value.searchYearMonthTo = dateString[1]
}

const showModal = async (id?: number) => {
	if (id) {
		await useIFetch<Response<FuelInfoData>>(`/api/v2/masters/oils/${id}`, {
			method: "GET",
			params: { companyCode: getCompanyCode.value },
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				modalField.value.id = id
				modalField.value.companyCode = res.data.companyCode
				modalField.value.gasolinePrice = res.data.gasolinePrice
				modalField.value.gasolineMileage = res.data.gasolineMileage
				modalField.value.dieselPrice = res.data.dieselPrice
				modalField.value.dieselMileage = res.data.dieselMileage
				modalField.value.lpgPrice = res.data.lpgPrice
				modalField.value.lpgMileage = res.data.lpgMileage
				modalField.value.electricPrice = res.data.electricPrice
				modalField.value.electricMileage = res.data.electricMileage
				modalField.value.searchYearMonth = $dayjs(res.data.standardYearMonth)
			})
			.finally(() => (isShowFuelModal.value = true))
	} else {
		modalField.value.companyCode = getCompanyCode.value
		modalField.value.gasolinePrice = 0
		modalField.value.gasolineMileage = 0
		modalField.value.dieselPrice = 0
		modalField.value.dieselMileage = 0
		modalField.value.lpgPrice = 0
		modalField.value.lpgMileage = 0
		modalField.value.electricPrice = 0
		modalField.value.electricMileage = 0
		modalField.value.searchYearMonth = ""
		isShowFuelModal.value = true
	}
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
}

const cellChange = (pagination: any) => {
	searchParams.value.page = pagination.current
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onDelete = (users: number[]) => {
	let num = 0
	users.forEach(async (id) => {
		await useIFetch<Response<any>>(`/api/v2/masters/oils/${id}`, {
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
					message.success(`${num}개의 목록이 삭제 되었습니다.`)
					selectedRowKeys.value = []
					refresh()
				}
			})
	})
}

const dateChange = (_: any, dateString: string) => {
	const date = dateString.split("-")
	modalField.value.searchYearMonth = `${date[0]}-${date[1]}`
}

const onSubmit = (data: FuelEventParams) => {
	fuelFormRef.value
		?.validate()
		.then(async () => {
			const send = Object.assign({}, data)
			delete send.method
			const url = data.id ? `/api/v2/masters/oils/${data.id}` : "/api/v2/masters/oils"
			await useIFetch<Response<any>>(url, {
				method: data.id ? "PATCH" : "POST",
				body: send,
			})
				.then((res: any) => res.data.value)
				.then((res: Response<any>) => {
					if (res.status !== 0) return
					isShowFuelModal.value = false
					fuelFormRef.value?.resetFields()
					message.success(res.message)
					refresh()
				})
		})
		.catch((err) => {
			console.log("error", err)
		})
}

onMounted(() => {
	// const from = dayjs().subtract(1, 'M');
	// const to = dayjs();
	// searchFilterDate.value = [from, to];
})
</script>

<template>
	<page-layout>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="기준년월">
							<a-range-picker
								v-model:value="searchFilterDate"
								:value-format="dateTimeFormat"
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
							>유류단가 추가</a-button
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
							searchParams?.page === 0 ? searchParams?.page + 1 : searchParams?.page,
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
					<template v-if="column.dataIndex === 'standardYearMonth'">
						<a-typography-link @click="showModal(record.id)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'gasolinePrice'">
						<a-space :size="2">
							{{ record.gasolinePrice }}
							<span>/</span>
							{{ record.gasolineMileage }}
						</a-space>
					</template>
					<template v-if="column.dataIndex === 'dieselPrice'">
						<a-space :size="2">
							{{ record.dieselPrice }}
							<span>/</span>
							{{ record.dieselMileage }}
						</a-space>
					</template>
					<template v-if="column.dataIndex === 'lpgPrice'">
						<a-space :size="2">
							{{ record.lpgPrice }}
							<span>/</span>
							{{ record.lpgMileage }}
						</a-space>
					</template>
					<template v-if="column.dataIndex === 'electricPrice'">
						<a-space :size="2">
							{{ record.electricPrice }}
							<span>/</span>
							{{ record.electricMileage }}
						</a-space>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<field-modal
				title="유류단가 추가"
				okText="저장"
				cancelText="취소"
				:field="modalField"
				:showed="isShowFuelModal"
				@closed="
					() => {
						fuelFormRef?.resetFields()
						isShowFuelModal = false
					}
				"
				@submit="(data: FormData) => onSubmit(data)"
			>
				<template #content="{ field }">
					<a-form
						ref="fuelFormRef"
						:model="field"
						label-align="left"
						layout="horizontal"
						:colon="false"
						:label-col="{ span: 4 }"
						:wrapper-col="{ span: 20 }"
					>
						<a-form-item
							label="기준년월"
							name="filterDate"
							:rules="[
								{
									required: false,
									message: '기준년월을 선택해주세요.',
									trigger: 'change',
								},
							]"
							has-feedback
						>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-date-picker
										class="full-width"
										picker="month"
										:disabled="field.id"
										v-model:value="field.searchYearMonth"
										@change="dateChange"
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form
							name="gasoline_info"
							layout="inline"
							:colon="false"
							:style="{
								display: 'inline-flex',
								flexWrap: 'nowrap',
								marginTop: '20px',
							}"
						>
							<a-form-item
								label="휘발유 단가"
								name="gasolinePrice"
								:wrapper-col="{ span: 14 }"
								:rules="[
									{
										required: false,
										message: '휘발유 단가를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.gasolinePrice"
									placeholder="1ℓ당 금액(단위:원)"
								/>
							</a-form-item>

							<a-form-item
								label="연비(km/ℓ)"
								name="gasolineMileage"
								:wrapper-col="{ span: 14 }"
								:rules="[
									{
										required: false,
										message: '연비를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.gasolineMileage"
									placeholder="(단위: km/ℓ)"
								/>
							</a-form-item>
						</a-form>
						<a-form
							name="diesel_info"
							layout="inline"
							:colon="false"
							:style="{
								display: 'inline-flex',
								flexWrap: 'nowrap',
								marginTop: '20px',
							}"
						>
							<a-form-item
								label="경유 단가"
								name="dieselPrice"
								:wrapper-col="{ span: 15, offset: 1 }"
								:rules="[
									{
										required: false,
										message: '경유 단가를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.dieselPrice"
									placeholder="1ℓ당 금액(단위:원)"
								/>
							</a-form-item>

							<a-form-item
								label="연비(km/ℓ)"
								name="dieselMileage"
								:wrapper-col="{ span: 15 }"
								:rules="[
									{
										required: false,
										message: '연비를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.dieselMileage"
									placeholder="(단위: km/ℓ)"
								/>
							</a-form-item>
						</a-form>
						<a-form
							name="lpg_info"
							layout="inline"
							:colon="false"
							:style="{
								display: 'inline-flex',
								flexWrap: 'nowrap',
								marginTop: '20px',
							}"
						>
							<a-form-item
								label="LPG 단가"
								name="lpgPrice"
								:wrapper-col="{ span: 15, offset: 1 }"
								:rules="[
									{
										required: false,
										message: 'LPG 단가를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.lpgPrice"
									placeholder="1ℓ당 금액(단위:원)"
								/>
							</a-form-item>

							<a-form-item
								label="연비(km/ℓ)"
								name="lpgMileage"
								:wrapper-col="{ span: 15 }"
								:rules="[
									{
										required: false,
										message: '연비를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.lpgMileage"
									placeholder="(단위: km/ℓ)"
								/>
							</a-form-item>
						</a-form>
						<a-form
							name="electric_info"
							layout="inline"
							:colon="false"
							:style="{
								display: 'inline-flex',
								flexWrap: 'nowrap',
								marginTop: '20px',
							}"
						>
							<a-form-item
								label="전기 단가"
								name="electricPrice"
								:wrapper-col="{ span: 15, offset: 1 }"
								:rules="[
									{
										required: false,
										message: '전기 단가를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.electricPrice"
									placeholder="1ℓ당 금액(단위:원)"
								/>
							</a-form-item>

							<a-form-item
								label="연비(km/ℓ)"
								name="electricMileage"
								:wrapper-col="{ span: 15 }"
								:rules="[
									{
										required: false,
										message: '연비를 작성해주세요.',
									},
								]"
							>
								<a-input
									type="number"
									v-model:value="modalField.electricMileage"
									placeholder="(단위: km/ℓ)"
								/>
							</a-form-item>
						</a-form>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
