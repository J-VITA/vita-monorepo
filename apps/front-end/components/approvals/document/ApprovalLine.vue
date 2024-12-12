<script setup lang="ts">
import { SlipFormType, type Response } from "@/types"
// import type { FormData } from '@/types/approvals/document';
import { materialIcons } from "@/composables/icons"
import ApprovalLines from "@/components/ui/table/ApprovalLines.vue"
import ApprovalLineButton from "@/components/approvals/document/ApprovalLineButton/index.vue"
import { useApprovalRules } from "~/composables/useApprovalRules"

type ApprovalLineListData = {
	id: number
	companyCode: string
	employeeId: string
	employeeNumber: string
	employeeName: string
	employeePositionCode: string
	employeePositionName: string
	approvalLineName: string
	mainApprovalLineFlag: boolean
	agreementOptionTypeName: string
	agreementOptionTypeLabel: string
	orderSeq: number
	used: boolean
	approvalLineDetails: any[]
	approvalLineReferrerDtos: any[]
}

const { getApprovalRules } = useApprovalRules()
const formData = defineModel<any>("formData", { required: true })

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const { type } = defineProps<{ type: "write" | "read" }>()

/**
 * 결재선 Select
 * 개인결재선 API 연동
 */
const setApprovalLineList = ref<ApprovalLineListData[]>([])
const approvalLineType = ref<any>(undefined)
const isCollapse = ref<boolean>(false)

/**
 * 대리기안자
 */
const setDeputyApprovalLineList = ref<ApprovalLineListData[]>([])
const approvalLineDeputyType = ref<any>(undefined)

const myEmployeesInfo = async () => {
	return await useCFetch<Response<any>>(
		`/api/v2/settings/employees/${getEmployeeId.value}`,
		{
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				id: getEmployeeId.value,
			},
		}
	).then((res: Response<any>) => (res.data || []) as Array<any>)
}

const setRefer = (data: any): string => {
	return data
		.map(
			(el: any) =>
				`${el.name || el.referEmployeeName}(${el.upperDepartmentName || el.referEmployeeDepartmentName})`
		)
		.join(", ")
}

const getApprovalLine = async (id: number) => {
	await useCFetch<Response<any>>(`/api/v2/persons/approvalLines/${id}`, {
		method: "GET",
		params: {
			id,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			formData.value.agreementOptionType = res.data.agreementOptionTypeName
			formData.value.approvalDetails = res.data.approvalLineDetails
			formData.value.approvalDetailRequests = res.data.approvalLineDetails.map(
				(x: any) => ({
					id: x.id,
					companyCode: x.companyCode,
					approvalType: x.approvalTypeName,
					approvalEmployeeId: x.approvalEmployeeId,
				})
			)

			formData.value.approvalReferrers = res.data.approvalLineReferrerDtos
			formData.value.referenceEmployeeIds = res.data.approvalLineReferrerDtos.map(
				(e: any) => ({
					id: e.referEmployeeId,
				})
			)
		}
	})
}

const onUpdateApprovalLineType = async (value: any) => {
	approvalLineDeputyType.value = undefined
	approvalLineType.value = value
	await getApprovalLine(Number(value))
}

const onUpdateApprovalLineDeputyType = async (value: any) => {
	approvalLineType.value = undefined
	approvalLineDeputyType.value = value
	await getApprovalLine(Number(value))
}

const onCallback = (data: any) => {
	formData.value.approvalDetails = data.approvalLines.map((x: any) => x)
	formData.value.approvalDetailRequests = data.approvalLines.map((x: any) => x)
	formData.value.approvalReferrers = data.references.map((x: any) => x)
	formData.value.referenceEmployeeIds = data.references.map((e: any) => ({
		id: e.referEmployeeId ? e.referEmployeeId : e.id,
	}))
	formData.value.agreementOptionType = data.agreementOptionType
}

watch(
	() => setApprovalLineList.value,
	async (options) => {
		if (options.length > 0) {
			for (let i = 0; i < options.length; i++) {
				const option = options[i]
				if (option.mainApprovalLineFlag) {
					approvalLineType.value = option.id
					await getApprovalLine(option.id)
				} else {
					approvalLineType.value = options[0].id
					await getApprovalLine(options[0].id)
				}
			}
		} else {
			if (!formData.value.id) {
				await getApprovalRules().then(async (res: any) => {
					await myEmployeesInfo().then(async (myInfo: any) => {
						formData.value = {
							...formData.value,
							agreementOptionType: res.data.agreementOptionType,
							approvalDetails: [
								{
									stage: 1,
									companyCode: myInfo.companyCode,
									approvalType: "DRAFT",
									approvalTypeName: "DRAFT",
									approvalTypeLabel: "기안",
									approvalEmployeeId: myInfo.id,
									approvalEmployeeNumber: myInfo.employeeNumber,
									approvalEmployeeName: myInfo.name,
									approvalEmployeePositionCode: myInfo.dutyCode,
									approvalEmployeePositionName: myInfo.dutyName,
									approvalEmployeeDepartmentCode: myInfo.liabilityDeptCode,
									approvalEmployeeDepartmentName: myInfo.liabilityDeptName,
									actualEmployeeId: myInfo.id,
									actualEmployeeName: myInfo.name,
									actualEmployeePositionCode: myInfo.dutyCode,
									actualEmployeePositionName: myInfo.dutyName,
								},
							],
							approvalDetailRequests: [
								{
									stage: 1,
									companyCode: myInfo.companyCode,
									approvalType: "DRAFT",
									approvalEmployeeId: myInfo.id,
								},
							],
							approvalReferrers: [],
							referenceEmployeeIds: [],
						}
					})
				})
			}
		}
	}
)
</script>
<template>
	<a-flex justify="space-between">
		<a-space>
			<a-button
				:icon="
					materialIcons(
						'mso',
						isCollapse ? 'keyboard_arrow_right' : 'keyboard_arrow_down'
					)
				"
				type="text"
				@click="isCollapse = !isCollapse"
			/>
			<a-typography-title :level="4" class="ml-none mb-none"> 결재선 </a-typography-title>
			(<approval-lines
				v-model:data="formData.approvalDetails"
				v-model:type="formData.agreementOptionType"
				:next-stage="formData.nextApprovalStage"
				:status="!['SAVED', 'WITHDRAWN'].includes(formData.documentStatusName)"
			/>)
		</a-space>
		<a-space v-if="type === 'write'">
			<!-- TODO: 경조금일 때 대리기안자 선택이 필요함. 피그마 참조 사용자를 변경해야함. -->
			<eacc-select
				v-if="formData.approvalFormType === SlipFormType.FAMILY_EVENT"
				placeholder="대리기안자 선택"
				style="min-width: 20rem"
				:url="`/api/v2/persons/approvalLines`"
				:params="{
					companyCode: getCompanyCode,
					employeeId: 2,
				}"
				v-model:value="approvalLineDeputyType"
				:field-names="{ label: 'approvalLineName', value: 'id' }"
				:on-all-field="false"
				:value-type="undefined"
				@update:value="onUpdateApprovalLineDeputyType"
				@on-options="(value) => (setDeputyApprovalLineList = value || [])"
			/>

			<eacc-select
				placeholder="결재선 선택"
				style="min-width: 20rem"
				:url="`/api/v2/persons/approvalLines`"
				:params="{
					companyCode: getCompanyCode,
					employeeId: getEmployeeId,
				}"
				v-model:value="approvalLineType"
				:field-names="{ label: 'approvalLineName', value: 'id' }"
				:on-all-field="false"
				:value-type="undefined"
				@update:value="onUpdateApprovalLineType"
				@on-options="(value) => (setApprovalLineList = value || [])"
			/>
			<approval-line-button
				name="결재선 설정"
				v-model:form-data="formData"
				@callback="onCallback"
			/>
		</a-space>
	</a-flex>
	<div class="approval-line-wrap" :class="{ hide: isCollapse }">
		<a-row :gutter="[5, 5]">
			<a-col v-for="(item, idx) in formData.approvalDetails" class="col">
				<a-flex vertical :gap="2" align="center">
					<a-typography-title :level="5" class="mb-none">
						{{ item.approvalTypeLabel }}
					</a-typography-title>
					<a-card
						size="small"
						:body-style="{
							textAlign: 'center',
							minHeight: '11.5rem',
							width: '10rem',
						}"
					>
						<div class="mb-sm">
							{{ item.approvalEmployeeName }}
							{{ item.approvalEmployeePositionName }}
						</div>
						<div
							:class="[
								'stamp',
								{
									draft: item.approvalTypeName === 'DRAFT',
									saved: formData.documentStatusName === 'SAVED',
									active: formData.nextApprovalStage === item.stage,
									success: ['APPROVED', 'DELEGATED'].includes(item.approvalStatusName),
									error: item.approvalStatusName === 'REJECTED',
									warning: item.approvalStatusName === 'WITHDRAWN',
								},
							]"
						>
							<template
								v-if="
									item.approvalTypeName === 'DRAFT' ||
									['APPROVED', 'DELEGATED'].includes(item.approvalStatusName)
								"
							>
								{{ item.approvalTypeLabel }}
							</template>
							<template
								v-if="
									formData.documentStatusName !== 'SAVED' &&
									formData.documentStatusName !== 'WITHDRAWN' &&
									item.approvalStatusName === 'PENDING' &&
									formData.nextApprovalStage === item.stage
								"
							>
								{{ item.approvalTypeLabel }}중
							</template>
							<template
								v-if="
									['POST_APPROVAL_PENDING', 'REJECTED'].includes(
										item.approvalStatusName
									) && formData.documentStatusName !== 'WITHDRAWN'
								"
							>
								{{ item.approvalStatusLabel }}
							</template>
						</div>
					</a-card>
					<a-typography-text>{{ item.approvalDate }}</a-typography-text>
				</a-flex>
				<template v-if="formData.agreementOptionType === 'PARALLEL'">
					<div
						class="arrow"
						v-if="
							item.approvalTypeName === 'DRAFT' ||
							!(
								item.approvalTypeName === 'AGREEMENT' &&
								formData.approvalDetails[idx + 1] &&
								formData.approvalDetails[idx + 1]?.approvalTypeName === 'AGREEMENT'
							)
						"
					></div>
				</template>
				<template v-else>
					<div class="arrow"></div>
				</template>
			</a-col>
		</a-row>
		<a-flex
			align="center"
			:gap="10"
			class="mt-sm"
			v-if="setRefer(formData.approvalReferrers)"
		>
			<label style="flex-shrink: 0">참조</label>
			<a-input :value="setRefer(formData.approvalReferrers)" readonly />
		</a-flex>
	</div>
</template>
