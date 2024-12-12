<script lang="ts" setup>
import type { Titles } from "@/types/settings/titles"
import TitleTable from "@/components/settings/titles/TitleTable.vue"
import TitleDetailTable from "@/components/settings/titles/TitleDetailTable.vue"

import type { RequestParams, Response } from "@/types"
import type { Rule } from "ant-design-vue/es/form"
import { Form } from "ant-design-vue"
import type { EmployeeDetail } from "@/types/master/cctr"

definePageMeta({
	name: "직책관리",
})

type Key = number
const authStore = useAuthStore()
const { getCompanyCode, getCompanyId, getWorkplaceId, getRole } = storeToRefs(authStore)

type TitleParams = RequestParams<
	Partial<{ companyCode: string; companyId: number; used: boolean }>
>

const searchParams = reactive<TitleParams>({
	companyCode: getCompanyCode.value,
	companyId: getCompanyId.value,
	pageNumber: 0,
	size: 10,
	first: true,
	last: false,
	used: true,
})

const {
	data: titleData,
	status,
	error,
	refresh,
} = await useAsyncData("job-titles-list", () =>
	useCFetch<Response<Array<Titles>>>("/api/v2/settings/jobTitles", {
		method: "GET",
		params: searchParams,
	}).then((res: Response<Array<Titles>>) => res.data || [])
)

// const { getModalVisible, setModalVisible } = useAntModals();
// const addModal = computed(() => getModalVisible('addModal'));
const addModal = ref(false)

const modalField = ref<Titles>({
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

const empDetail = ref<Response<Array<EmployeeDetail>>>({})
const empDetailLoading = ref(false)

const search = async (title: Titles) => {
	const page = state.params.page && state.params.page > 1 ? state.params.page - 1 : 0
	const params = {
		companyCode: searchParams.companyCode,
		jobTitleId: title.id,
		jobTitleName: title.name,
		page: page,
		size: state.params.size,
	}
	if (title.id) {
		empDetailLoading.value = true
		await useCFetch<Response<Array<EmployeeDetail>>>(`/api/v2/settings/employees`, {
			method: "GET",
			params,
		})
			.then((res: Response<Array<EmployeeDetail>>) => {
				empDetail.value = res
			})
			.finally(() => {
				refresh()
				empDetailLoading.value = false
			})
	}
}
/**
 * 직책 모달 Form Rules
 */
const titleRulesRef = ref<Record<string, Rule[]>>({
	code: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
	name: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
	orderSeq: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
})

/**
 * Ant Form
 */
const useTitleForm = Form.useForm
const { resetFields, validate, validateInfos } = useTitleForm(modalField, titleRulesRef)

const selectedRowData = (record: any, key: number) => {
	state.selectedRowKeys = key
	state.params = record
	search(record)
}

const modalClose = () => {
	addModal.value = false
}
/**
 * 직위추가 모달 클릭 시점 이벤트
 * @param data
 */
const addTitle = (data: any) => {
	resetFields()
	modalField.value = data
	addModal.value = data.showed
}

/**
 * 직위추가 모달 submit
 * @param position
 */
const addTitleSubmit = (position: any) => {
	const body = Object.assign({ used: true }, position)
	if (body.id) {
		patchTitle(body).finally(() => modalClose())
	} else {
		postTitle(body).finally(() => modalClose())
	}
}

/**
 * 직위 정보 수정
 * @param body
 */
const patchTitle = async (body: Titles) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/jobTitles/${body.id}`, {
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
 * 직책 정보 저장
 * @param body
 */
const postTitle = async (body: Titles) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/jobTitles`, {
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
 * 직책 삭제 기능 UI submit
 * @param id
 */
const deleteTitle = (id: string | number) => {
	useCFetch<Response<any>>(`/api/v2/settings/jobTitles/${id}`, {
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

const setPagination = (pagination: any) => {
	state.params.page = pagination.current
	state.params.size = pagination.pageSize
	search(state.params)
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
				직책정보를 등록하고, 사용자를 할당 할 수 있습니다.
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
					<title-table
						v-if="titleData"
						:title-data="titleData"
						:loading="status === 'pending'"
						@selected-row="selectedRowData"
						@add-title-click="addTitle"
						@delete-title-submit="deleteTitle"
						@refresh="refresh"
					/>
				</a-col>
				<a-col flex="2">
					<title-detail-table
						v-if="searchParams.companyCode"
						:params="state.params"
						:data="empDetail"
						:loading="empDetailLoading"
						:company-code="searchParams.companyCode"
						@pagination="setPagination"
						@refresh="search(state.params)"
					></title-detail-table>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				class="modal"
				:field="modalField"
				title="직책추가"
				:showed="addModal"
				@closed="modalClose()"
				@submit="() => addTitleSubmit(modalField)"
			>
				<template #content="{ field }">
					<a-form
						label-align="left"
						:colon="false"
						:label-col="{ span: 6 }"
						:wrapper-col="{ span: 18 }"
						:model="field"
						:rules="titleRulesRef"
					>
						<a-form-item
							label="직책명"
							name="name"
							v-bind="validateInfos.name"
							has-feedback
						>
							<a-input v-model:value="modalField.name" />
						</a-form-item>
						<a-form-item
							label="코드"
							name="code"
							v-bind="validateInfos.code"
							has-feedback
						>
							<a-input v-model:value="modalField.code" />
						</a-form-item>
						<a-form-item label="순번" name="orderSeq" v-bind="validateInfos.orderSeq">
							<a-input type="number" v-model:value="modalField.orderSeq" />
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
