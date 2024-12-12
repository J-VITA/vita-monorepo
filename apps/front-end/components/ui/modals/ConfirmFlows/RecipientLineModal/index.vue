<script lang="ts" setup>
import { Form } from "ant-design-vue"
import { Response, createViewParams } from "@/types"
import {
	ConfirmFlowsProps,
	RApprovalFromType,
	ReceiverDetail,
	TApprovalFromType,
	TRecipientsReponse,
	useRecipientsParams,
} from "@/types/master/confirm-flows"

const open = defineModel<boolean>("open")

const props = defineProps<ConfirmFlowsProps>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const useForm = Form.useForm

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "submit", value: Response<any>): any
}>()

const loading = ref<boolean>(false)

const { modelRef, updateModelRef } = useRecipientsParams(getCompanyCode.value)

const rulesRef = ref<any>({
	name: [
		{
			required: true,
			message: "수신명을 입력해주세요.",
		},
	],
	approvalFormType: [
		{
			required: true,
			message: "결재문서를 입력해주세요.",
		},
	],
	receiveEmployeeIds: [
		{
			required: true,
			type: "array",
			message: "수신자를 선택해주세요.",
		},
	],
})

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

const onSubmit = () => {
	validate()
		.then(async () => {
			loading.value = true
			await useCFetch<Response<any>>(
				`/api/v2/master/approvalReceivers${props.itemId ? "/" + props.itemId : ""}`,
				{
					method: props.itemId ? "PATCH" : "POST",
					body: Object.assign(
						{ id: props.itemId ? props.itemId : undefined },
						modelRef.value,
						{
							receiveEmployeeIds: modelRef.value.receiveEmployeeIds?.map(
								(id: string | number) => ({ id })
							),
						}
					),
				}
			).then((res: Response<any>) => {
				if (res.status === 0) {
					message.success(`${props.itemId ? "수정되었습니다" : "생성되었습니다"}.`)
					open.value = false
				} else {
					loading.value = false
				}
				emit("submit", res)
			})
		})
		.catch((err) => {
			console.log("error", err)
			loading.value = false
		})
}

const onAfterClose = () => {
	loading.value = false
	resetFields()
}

const getApprovalFormTypes = async (): Promise<RApprovalFromType[]> => {
	const res = await useCFetch<Response<TApprovalFromType>>(
		"/api/v2/master/approvalReceivers/types/approvalFormTypes"
	)
	if (res.status === 0 && res.data) {
		return res.data.map((item: RApprovalFromType) => ({ ...item }))
	}
	return []
}
const approvalFormTypeOptions = ref<RApprovalFromType[]>([])
const radioOptions = computed(() =>
	approvalFormTypeOptions.value.map((item) => ({
		label: item.label,
		value: item.code,
	}))
)

const getEmployees = async (): Promise<any> => {
	const res = await useCFetch<Response<any>>("/api/v2/settings/commons/employees", {
		method: "GET",
		params: { companyCode: getCompanyCode.value },
	})
	if (res.status === 0 && res.data) {
		return res.data.map((item: any) => ({ ...item }))
	}
	return []
}
const employeesOptions = ref<any[]>([])
const selecteOptions = computed(() =>
	employeesOptions.value.map((item) => ({
		label: item.name,
		value: item.id,
	}))
)

watch(
	() => open,
	async () => {
		if (open.value && props.itemId) {
			const res = await useCFetch<TRecipientsReponse>(
				`/api/v2/master/approvalReceivers/${props.itemId}`
			)
			if (res.status === 0 && res.data) {
				const item = res.data
				updateModelRef({
					...item,
					approvalFormType: item.approvalFormTypeName,
					receiveEmployeeIds:
						item.approvalReceiverDetailDtos?.map(
							(employee: ReceiverDetail) => employee.receiveEmployeeId
						) || [],
				})
			} else {
				updateModelRef({
					name: "",
					description: "",
					approvalFormType: "",
					receiveEmployeeIds: [],
				})
			}
		}
	},
	{ immediate: true, deep: true }
)

onMounted(async () => {
	const [approvalFormType, employees] = await Promise.all([
		getApprovalFormTypes(),
		getEmployees(),
	])

	approvalFormTypeOptions.value = approvalFormType
	employeesOptions.value = employees
})

onBeforeRouteLeave(() => {
	open.value = false
})
</script>

<template>
	<a-modal
		centered
		v-model:open="open"
		title="수신자 추가"
		ok-text="저장"
		:destroy-on-close="true"
		:confirm-loading="loading"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-form
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
		>
			<a-form-item label="수신명" v-bind="validateInfos.name">
				<a-input v-model:value="modelRef.name" />
			</a-form-item>

			<a-form-item label="설명">
				<a-input v-model:value="modelRef.description" />
			</a-form-item>

			<a-form-item label="결재문서 선택" v-bind="validateInfos.approvalFormType">
				<a-radio-group
					v-model:value="modelRef.approvalFormType"
					:options="radioOptions"
				/>
			</a-form-item>

			<a-form-item label="수신자 선택" v-bind="validateInfos.receiveEmployeeIds">
				<a-select
					:label-in-value="false"
					mode="multiple"
					:max-tag-count="4"
					v-model:value="modelRef.receiveEmployeeIds"
					:options="selecteOptions"
					placeholder="수신자를 선택해주세요"
					:filter-option="
						(input: string, option: any) =>
							option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
					"
				/>
			</a-form-item>
			<a-form-item label="사용여부">
				<a-switch v-model:checked="modelRef.used" size="small" />
			</a-form-item>
		</a-form>

		<a-typography-text type="secondary">
			<a-space :size="5">
				* 수신자로 등록되면 해당 결재문서의 수신처리 담당자가 됩니다. 내부결재완료시
				등록된 수신자에게 수신처리 알람이 발생합니다.
			</a-space>
			<a-space :size="5">
				* 예산신청 수신자는 예산신청서 작성시 모든 코스트센터를 선택할 수 있습니다.
			</a-space>
			<a-space :size="5">
				* 공용법인카드 수신자는 등록된 모든 공용법인카드의 불출신청내역을 관리할 수
				있습니다.
			</a-space>
		</a-typography-text>
	</a-modal>
</template>
