<script setup lang="ts">
import { materialIcons } from "~/composables/icons"
import { type Response } from "@/types"
import type { FormInstance } from "ant-design-vue"
import type { FormData } from "@/types/approvals/document"
import { ApprovalRules } from "@/types/master/approval-flows"

type Props = {
	data: FormData
	pending: boolean
	rules: ApprovalRules
}
type Data = {
	comment: string
	type: string
}

/**
 * 결재 승인(완료)
 */
const { data: documentData, rules } = defineProps<Props>()

const emit = defineEmits<{
	(e: "callback", value: any): void
	(e: "update:pending", value: boolean): boolean
}>()

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const open = ref<boolean>(false)
const formRef = useTemplateRef<FormInstance>("formRef")
const approvalData = ref<Data>({
	comment: "",
	type: "",
})

const { data: approvalStatuses, refresh } = await useAsyncData(`approval-types`, () =>
	useCFetch<Response<any>>("/api/v2/approvals/types/approvalStatuses", {
		method: "GET",
	}).then((res: Response<any>) => {
		const isFinalized = rules?.finalApprovalEmployees?.some(
			(e) => e === getEmployeeId.value
		)
		const excludeCodes = [
			"PENDING", // 대기
			"DELEGATED", // 대결
			"POST_APPROVAL_DELEGATED", // 후결대결
			"POST_APPROVAL_PENDING", // 후결대기
			...(rules.finalApprovalFlag && isFinalized ? [] : ["FINALIZED"]), // 전결
			...(rules.postApprovalFlag ? [] : ["POST_APPROVAL_APPROVED"]), // 후결 승인
		]
		return res.data
			.filter((item: any) => !excludeCodes.includes(item.code))
			.map((item: any) => ({
				label: item.label,
				value: item.code,
			}))
	})
)
const onCompleted = () => {
	formRef.value
		?.validate()
		.then(async (response) => {
			const approvalTypeInfo: {
				[key: string]: { url: string; message: string }
			} = {
				APPROVED: {
					url: "/api/v2/approvals/approve",
					message: "결재문서가 승인 되었습니다.",
				},
				REJECTED: {
					url: "/api/v2/approvals/reject",
					message: "결재문서가 반려 되었습니다.",
				},
				FINALIZED: {
					url: "/api/v2/approvals/approve/finalize",
					message: "결재문서가 전결 되었습니다.",
				},
				POST_APPROVAL_APPROVED: {
					url: "/api/v2/approvals/approve/postApprovals",
					message: "결재문서가 후결 승인 되었습니다.",
				},
			}

			const body = {
				companyCode: documentData.companyCode,
				approvalHeaderId: documentData.id,
				actualApprovalEmployeeId: documentData.actualApprovalEmployeeId,
				comment: response.comment,
				// approvalDetailId: 1,
				// approvalNumber: documentData.approvalNumber,
				// approvalEmployeeId: 1,
				// title: documentData.title,
				// description: documentData.description,
			}
			//
			await useCFetch<Response<any>>(approvalTypeInfo[response.type]["url"], {
				method: "PATCH",
				body: body,
			}).then((res: Response<any>) => {
				if (res.status === 0) {
					open.value = false
					message[response.type === "REJECTED" ? "error" : "success"](
						approvalTypeInfo[response.type]["message"]
					)
					emit("callback", res.data)
				}
			})
		})
		.catch((error) => console.error(error))
		.finally(() => emit("update:pending", false))
}

watch(
	() => open.value,
	async () => {
		if (open.value) {
			await refresh()
			emit("update:pending", true)
		} else {
			emit("update:pending", false)
		}
	}
)
</script>
<template>
	<a-button
		type="primary"
		:icon="materialIcons('mso', 'edit_square')"
		@click="open = true"
	>
		결재
	</a-button>

	<field-modal
		title="결재 선택"
		:showed="open"
		:field="approvalData"
		@closed="open = false"
		@submit="onCompleted"
	>
		<template #content="{ field }">
			<a-flex align="start" class="mb-lg" :gap="10">
				<component
					:is="materialIcons('mso', 'error')"
					class="text-warning"
					style="font-size: 3rem"
				/>
				<div>
					<a-typography-title :level="4" class="mb-none">
						결재 종류를 선택하세요.
					</a-typography-title>
				</div>
			</a-flex>

			<a-form ref="formRef" :model="field" label-align="left" :colon="false">
				<a-form-item
					:wrapper-col="{ offset: 2, span: 22 }"
					name="type"
					:rules="[{ required: true, message: '필수값 입니다.' }]"
				>
					<a-radio-group
						v-model:value="field.type"
						:options="approvalStatuses"
						@change="(e) => (field.type = e.target.value)"
					/>
				</a-form-item>

				<a-form-item
					class="mb-none"
					name="comment"
					label="결재 의견"
					:label-col="{ offset: 2, span: 22 }"
					:wrapper-col="{ offset: 2, span: 22 }"
				>
					<a-textarea
						v-model:value="field.comment"
						placeholder="결재 의견을 입력하세요."
						style="resize: none"
						:rows="6"
					/>
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
