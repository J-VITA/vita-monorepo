<script lang="ts" setup>
import type { Positions } from "@/types/settings/positions"
import PositionTable from "@/components/settings/positions/PositionTable.vue"
import PositionDetailTable from "@/components/settings/positions/PositionDetailTable.vue"
import type { EmployeeDetail } from "@/types/master/cctr"

import type { RequestParams, Response } from "@/types"

definePageMeta({
	name: "직위관리",
})

const authStore = useAuthStore()
const { getCompanyCode, getCompanyId, getWorkplaceId, getRole } = storeToRefs(authStore)
type PositionParams = RequestParams<
	Partial<{ companyCode: string; companyId: number; used: boolean }>
>

const searchParams = reactive<PositionParams>({
	companyCode: getCompanyCode.value,
	companyId: getCompanyId.value,
	pageNumber: 0,
	size: 10,
	first: true,
	last: false,
	used: true,
})

const {
	data: positionData,
	status,
	error,
	refresh,
} = await useAsyncData(
	"positions-list",
	() =>
		useCFetch<Response<Array<Positions>>>("/api/v2/settings/positions", {
			method: "GET",
			params: searchParams,
		}).then((res: Response<Array<Positions>>) => res.data),
	{
		watch: [searchParams],
	}
)

type Key = number
const addModal = ref(false)
const modalField = ref<Positions>({
	code: "",
	name: "",
	workplaceId: getWorkplaceId.value,
	orderSeq: -1,
})

const state = reactive<{
	selectedRowKeys: Key
	loading: boolean
	params: any
	updown: "up" | "down" | undefined
}>({
	selectedRowKeys: -1, // Check here to configure the default column
	loading: false,
	params: {
		page: 0,
		size: 10,
		totalElements: 0,
		first: true,
		last: false,
	},
	updown: undefined,
})

const empDetail = ref<Response<Array<EmployeeDetail>>>({} as any)
const empDetailLoading = ref(false)

const modalClose = () => {
	addModal.value = false
}
/**
 * 직위추가 모달 클릭 시점 이벤트
 * @param data
 */
const addPosition = (data: any) => {
	modalField.value = data
	addModal.value = data.showed
}

/**
 * 직위추가 모달 submit
 * @param position
 */
const addPositionSubmit = (position: any) => {
	console.log("position : ", position)
	const body = Object.assign({ used: true }, position)
	if (body.id) {
		patchPosition(body).finally(() => modalClose())
	} else {
		postPosition(body).finally(() => modalClose())
	}
}

/**
 * 직위 정보 수정
 * @param body
 */
const patchPosition = async (body: Positions) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/positions/${body.id}`, {
		method: "PATCH",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success("변경하였습니다.")
			refresh()
			selectedRowData(res.data, state.selectedRowKeys)
			search(state.params)
		} else {
			message.error(res.message)
		}
	})
}

/**
 * 직위 정보 저장
 * @param body
 */
const postPosition = async (body: Positions) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/positions`, {
		method: "POST",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success("저장하였습니다.")
			refresh()
		} else {
			message.error(res.message)
		}
	})
}

/**
 * 직위 삭제 기능 UI submit
 * @param position
 */
const deletePosition = (id: string | number) => {
	useCFetch<Response<any>>(`/api/v2/settings/positions/${id}`, {
		method: "DELETE",
		body: { id },
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success("삭제하였습니다.")
			refresh()
		} else {
			message.error(res.message)
		}
	})
}

const selectedRowData = (record: any, key: number) => {
	state.selectedRowKeys = key
	state.params = record
	search(record)
}

const setPagination = (pagination: any) => {
	state.params.page = pagination.current
	state.params.size = pagination.pageSize
	search(state.params)
}

const search = async (position: Positions) => {
	const page = state.params.page && state.params.page > 1 ? state.params.page - 1 : 0
	const params = {
		companyCode: searchParams.companyCode,
		// workPlaceId: getRole.value === 'ROOT' ? undefined : getWorkplaceId.value,
		positionId: position.id,
		positionName: position.name,
		page: page,
		size: state.params.size,
	}
	if (position.id) {
		empDetailLoading.value = true
		await useCFetch<Response<Array<EmployeeDetail>>>(
			`/api/v2/settings/commons/employees/paging`,
			{
				method: "GET",
				params,
			}
		)
			.then((res: Response<Array<EmployeeDetail>>) => {
				empDetail.value = res
			})
			.finally(() => {
				refresh()
				empDetailLoading.value = false
			})
	}
}

onMounted(() => {
	refresh()
})
onActivated(() => {
	refresh()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				직위정보를 등록하고, 사용자를 할당 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-flex :gap="10" v-if="getRole === 'ROOT'">
				<a-space :size="10">
					<eacc-select
						:style="{ width: '24rem' }"
						label="회사"
						:first="searchParams.companyCode ? false : true"
						:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
						:on-all-field="false"
						v-model:value="searchParams.companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						value-type="any"
						:refresh="true"
						@update:any-value="
							(value: any) => {
								searchParams.companyCode = value.code
								searchParams.companyId = value.id
								state.params.page = 0
								search(state.params)
							}
						"
						:disabled="getRole !== 'ROOT'"
					>
					</eacc-select>
				</a-space>
				<eacc-button
					componentIs="search"
					type="primary"
					:modal-open="false"
					:data="searchParams"
					@click="
						(value) => {
							refresh()
							search(state.params)
						}
					"
				>
				</eacc-button>
			</a-flex>
			<a-divider v-if="getRole === 'ROOT'" class="my-md" />
			<a-row :gutter="30">
				<a-col flex="1">
					<position-table
						v-if="positionData"
						:position-data="positionData"
						:loading="status === 'pending' ? true : false"
						@selected-row="selectedRowData"
						@add-position-click="addPosition"
						@delete-position-submit="deletePosition"
						@refresh="refresh"
					/>
				</a-col>
				<a-col flex="2">
					<position-detail-table
						v-if="searchParams.companyCode"
						:params="state.params"
						:data="empDetail"
						:company-code="searchParams.companyCode"
						:loading="empDetailLoading"
						@pagination="setPagination"
						@refresh="search(state.params)"
					/>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				class="modal"
				:field="modalField"
				title="직위추가"
				:showed="addModal"
				@closed="modalClose()"
				@submit="() => addPositionSubmit(modalField)"
			>
				<template #content="{ field }">
					<a-form
						label-align="left"
						:colon="false"
						:label-col="{ span: 6 }"
						:wrapper-col="{ span: 18 }"
						:model="field"
					>
						<a-form-item label="직위명" name="name" v-bind="field.name" has-feedback>
							<a-input v-model:value="modalField.name" />
						</a-form-item>
						<a-form-item label="코드" name="code" v-bind="field.code" has-feedback>
							<a-input
								v-model:value="modalField.code"
								:disabled="modalField.id ? true : false"
							/>
						</a-form-item>
						<a-form-item label="순번" name="orderSeq" v-bind="field.orderSeq">
							<a-input type="number" v-model:value="modalField.orderSeq" />
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
