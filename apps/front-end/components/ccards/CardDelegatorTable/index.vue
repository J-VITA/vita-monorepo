<script setup lang="ts">
import {
	useCardDelegatorsColumns,
	RangePickerPresets,
	type CardDelegatorItem,
	type DelegatorDetail,
	type FormData,
} from "@/components/ccards/CardDelegatorTable/type"
import { type Response, pagination, dateTimeFormat } from "@/types"
import type { FormInstance } from "ant-design-vue"

const { id: cardId } = defineProps<{
	id: number
}>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const { $dayjs } = useNuxtApp()

const columns = useCardDelegatorsColumns()

const formRef = useTemplateRef<FormInstance>("formRef")
const open = ref<boolean>(false)

const params = ref<{ pageNumber: number; size: number }>({
	pageNumber: 0,
	size: 3,
})

const delegatorFormState = ref<FormData>({
	dates: ["", ""],
	companyCode: getCompanyCode.value,
	cardId: cardId,
	delegateStartDate: "",
	delegateEndDate: "",
	used: true,
	description: "",
	employeeId: undefined,
	employeeIds: [],
})

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData<Response<Array<CardDelegatorItem>>>(
	"card-delegators-list",
	() =>
		useCFetch<Response<Array<CardDelegatorItem>>>("/api/v2/cards/delegators", {
			method: "GET",
			params: {
				page: params.value.pageNumber,
				size: params.value.size,
				companyCode: getCompanyCode.value,
				cardId: cardId,
			},
		}),
	{
		transform: (response: Response<Array<CardDelegatorItem>>) => response,
	}
)

const cellChange = (pagination: any) => {
	params.value.pageNumber = pagination.current - 1 || 0
	refresh()
}

/**
 * 대리작성자 디테일 정보 조회
 * @param id
 */
const getDetail = async (id: number) => {
	return await useCFetch<Response<DelegatorDetail>>(`/api/v2/cards/delegators/${id}`, {
		method: "GET",
		params: { id: id },
	}).then((res: Response<DelegatorDetail>) => res.data)
}

/**
 * 대리작성자 삭제
 * @param record
 */
const onDelete = async (record: any) => {
	await getDetail(record.id).then(async (res) => {
		const body = {
			...res,
			cardId: res?.cardManagementId,
		} as FormData

		await useCFetch<Response<any>>(`/api/v2/cards/delegators/${record.id}`, {
			method: "DELETE",
			params: { id: record.id },
			body: body,
		}).then((res: Response<any>) => {
			if (res.status === 0) refresh()
		})
	})
}

/**
 * 대리작성자 추가/수정
 * @param record
 */
const onShow = async (record?: any) => {
	if (record) {
		await getDetail(record.id).then(async (res) => {
			if (res) {
				console.log([res.delegateStartDate, res.delegateEndDate])

				delegatorFormState.value.id = res?.id
				delegatorFormState.value.used = res?.used
				delegatorFormState.value.employeeId = res?.employeeId
				delegatorFormState.value.description = record.description
				delegatorFormState.value.employeeIds = [res?.employeeId as number]
				delegatorFormState.value.dates = [
					$dayjs(res.delegateStartDate).format(dateTimeFormat),
					$dayjs(res.delegateEndDate).format(dateTimeFormat),
				]
				delegatorFormState.value.delegateStartDate = res.delegateStartDate
				delegatorFormState.value.delegateEndDate = res.delegateEndDate
				open.value = true
			}
		})
	} else {
		delegatorFormState.value.id = undefined
		delegatorFormState.value.used = true
		delegatorFormState.value.employeeId = undefined
		delegatorFormState.value.employeeIds = []
		delegatorFormState.value.description = ""
		delegatorFormState.value.dates = ["", ""]
		delegatorFormState.value.delegateStartDate = ""
		delegatorFormState.value.delegateEndDate = ""
		open.value = true
	}
}

/**
 * 대리작성자 추가/수정 제출
 * @param data
 */
const onSubmit = (data: any) => {
	formRef.value
		?.validate()
		.then(async () => {
			const url = data.id
				? `/api/v2/cards/delegators/${data.id}`
				: "/api/v2/cards/delegators"
			await useCFetch<Response<any>>(url, {
				method: data.id ? "PATCH" : "POST",
				body: {
					...data,
					delegateStartDate: data.dates[0],
					delegateEndDate: data.dates[1],
				},
			}).then((res: Response<any>) => {
				if (res.status === 0) refresh()
				open.value = false
			})
		})
		.catch((err) => console.log(err))
}
</script>
<template>
	<a-flex align="center" justify="space-between" class="mb-sm">
		<a-typography-title :level="5" class="mb-none">
			<a-space align="center" :size="2" style="line-height: 1">
				전표 대리 작성자
				<a-popover placement="right" class="text-secondary">
					<template #content>
						카드사용내역을 열람 및 경비청구까지 진행가능한 사용자입니다.
						<br />
						다수의 인원이 지정가능합니다.
					</template>
					<component
						class="cursor-pointer text-secondary"
						style="font-size: 1.6rem"
						:is="materialIcons('mso', 'help')"
					/>
				</a-popover>
			</a-space>
		</a-typography-title>
		<a-button :icon="materialIcons('mso', 'add_circle')" @click="onShow()">
			추가
		</a-button>
	</a-flex>
	<a-table
		size="small"
		:columns="columns"
		:loading="status === 'pending'"
		:data-source="dataSource?.data"
		:pagination="
			Object.assign({}, pagination, {
				current: params.pageNumber + 1 || 1,
				pageSize: params.size,
				total: dataSource?.totalElements,
			})
		"
		@change="cellChange"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'used'">
				<a-badge :color="text ? 'green' : 'red'" :text="text ? '사용' : '미사용'" />
			</template>
			<template v-if="column.dataIndex === 'actions'">
				<a-button
					size="small"
					type="text"
					class="text-secondary"
					:icon="materialIcons('mso', 'edit')"
					@click="onShow(record)"
				/>
				<a-button
					size="small"
					type="text"
					class="text-secondary"
					:icon="materialIcons('mso', 'delete')"
					@click="onDelete(record)"
				/>
			</template>
		</template>
	</a-table>
	<field-modal
		:title="`전표 대리작성자 추가`"
		:showed="open"
		:field="delegatorFormState"
		cancel-text="취소"
		@closed="open = false"
		@submit="onSubmit"
	>
		<template #content="{ field }">
			<a-form
				ref="formRef"
				label-align="left"
				:colon="false"
				:model="field"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
			>
				<a-form-item
					name="employeeId"
					label="전표 대리작성자"
					:rules="[{ required: true }]"
				>
					<eacc-select-table
						url="/api/v2/cards/commons/employees"
						v-model:value="field.employeeIds"
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
						:disabled="field.id ? true : false"
						@update:value="(value) => (field.employeeId = value[0])"
					/>
				</a-form-item>
				<a-form-item name="dates" label="대리작성기간" :rules="[{ required: true }]">
					{{ field.dates }}
					<a-range-picker
						class="full-width"
						v-model:value="field.dates"
						show-time
						format="YYYY-MM-DD HH:mm"
						:value-format="dateTimeFormat"
						:presets="RangePickerPresets"
					/>
				</a-form-item>
				<a-form-item name="used" label="사용여부">
					<a-switch v-model:checked="field.used" size="small" />
				</a-form-item>
				<a-form-item name="description" label="비고">
					<a-input v-model:value="field.description" />
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
