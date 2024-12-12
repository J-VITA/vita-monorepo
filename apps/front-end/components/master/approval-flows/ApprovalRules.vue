<script setup lang="ts">
import type { Response } from "@/types"
import type { RadioGroupProps, SelectProps } from "ant-design-vue"
import { useApprovalRules } from "@/composables/useApprovalRules"
import { ApprovalRules } from "@/types/master/approval-flows"

const authStore = useAuthStore()
// 반응형 객체로 변환
const { getCompanyCode } = storeToRefs(authStore)
const router = useRouter()

const { getApprovalRules, agreementOptions } = useApprovalRules()

const delayDaysOptions = ref<SelectProps["options"]>([])
const agreeOptions = ref<RadioGroupProps["options"]>([])
const approvalRuleData = ref<ApprovalRules>({
	agreementOptionType: "",
	documentModifierType: "",
})
const finalApprovalEmployees = ref<number[]>([])
const loading = ref<boolean>(false)

const refresh = async () => {
	loading.value = true
	agreeOptions.value = await agreementOptions().then((res: any) => res)
	approvalRuleData.value = await getApprovalRules().then((res: any) => {
		loading.value = false
		if (res.data.finalApprovalEmployees) {
			finalApprovalEmployees.value = res.data.finalApprovalEmployees
		}
		return res.data
	})
}

/**
 * 결재 옵션 업데이트 API 호출
 */
const patchApprovalRules = (body: any) => {
	// 전결 권한자 지정
	if (finalApprovalEmployees.value.length > 0) {
		body.finalApprovalEmployees = finalApprovalEmployees.value.map((x: number) => ({
			id: x,
		}))
	}
	useCFetch<Response<any>>(`/api/v2/master/approvalRules/${body.id}`, {
		method: "PATCH",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			refresh()
		} else {
			message.error(`${res.message}`)
		}
	})
}

// 라우터 변경 시
router.afterEach(async () => {
	await refresh()
})

onBeforeMount(async () => {
	let days: { label: string; value: number }[] = []
	for (let i = 1; i < 11; i++) {
		days.push({ label: `${i}일`, value: i })
	}
	delayDaysOptions.value = days
	await refresh()
})
</script>
<template>
	<a-spin :spinning="loading">
		<a-row :gutter="[15, 0]">
			<a-col flex="1">
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">합의 옵션 기본설정</a-col>
					<a-col flex="1">
						<a-radio-group
							v-model:value="approvalRuleData.agreementOptionType"
							:options="agreeOptions"
							@change="patchApprovalRules(approvalRuleData)"
						/>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">결재 비밀번호 사용</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.approvalPasswordFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span> 결재시 결재자의 비밀번호를 입력해야 합니다. </span>
						</a-flex>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">진행중인 결재문서 조회</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.documentSearchFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span
								>결재선에 내가 포함된 문서는 '결재진행' 페이지에서 미리 조회할 수
								있습니다.
							</span>
						</a-flex>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">참조자 결재문서 조회여부</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.referenceSearchFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span
								>'사용' 선택시 참조자도 결재 진행중인 상태에서 문서 열람이 가능합니다.
								'미사용' 선택시 결재 완료 후 에만 열람 가능합니다.
							</span>
						</a-flex>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">결재 지연 알람 설정</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="mb-md text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.approvalDelayFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span>
								결재대기에 도착한 문서의 결재가 지연될 경우, 결재자에게 알람을 발송합니다.
							</span>
						</a-flex>
						<template v-if="approvalRuleData.approvalDelayFlag">
							<a-space class="box" :size="10">
								<label>지연일수설정</label>
								<a-select
									v-model:value="approvalRuleData.approvalDelayDay"
									:options="delayDaysOptions"
									@change="patchApprovalRules(approvalRuleData)"
								></a-select>
							</a-space>
						</template>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">결재진행 문서 수정 여부</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="mb-md text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.documentModificationFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span>
								사용시 진행중인 결재문서에 대해 결재선과 내용을 수정할 수 있습니다.
								<br />(문서정보에 수정이력이 남습니다.)
							</span>
						</a-flex>
						<template v-if="approvalRuleData.documentModificationFlag">
							<a-space class="box" :size="10">
								<label>수정 가능자</label>
								<a-radio-group
									v-model:value="approvalRuleData.documentModifierType"
									:options="[
										{ label: '결재자', value: 'APPROVER' },
										{ label: '기안자', value: 'DRAFTER' },
										{ label: '결재자 및 기안자', value: 'ALL' },
									]"
									@change="patchApprovalRules(approvalRuleData)"
								/>
							</a-space>
						</template>
					</a-col>
				</a-row>
			</a-col>
			<a-col flex="5rem" class="text-center">
				<a-divider type="vertical" class="full-height mx-none" dashed />
			</a-col>
			<a-col flex="1">
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">전결 사용</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="mb-md text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.finalApprovalFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span>
								다음결재자 상관없이 문서가 최종 결재완료됩니다. 전결시 결재문서에
								'결재일(전결)'로 표시됩니다.
							</span>
						</a-flex>
						<template v-if="approvalRuleData.finalApprovalFlag">
							<a-flex class="box" align="center" :gap="10">
								<label style="flex: 0 1 30%">전결 권한자 지정</label>
								<div style="flex: auto">
									<eacc-select-multi-table
										url="/api/v2/masters/commons/employees"
										v-model:value="finalApprovalEmployees"
										key-props="id"
										:columns="[
											{
												title: '이름',
												data: (row: any) => row.name,
												width: '10rem',
											},
											{ title: '직위', data: (row: any) => row.jobName },
											{ title: '부서', data: (row: any) => row.departmentName },
											{
												title: '사업장',
												data: (row: any) => row.workplaceName,
											},
										]"
										@update:value="(value) => (finalApprovalEmployees = value)"
										@selection-change="patchApprovalRules(approvalRuleData)"
									/>
								</div>
							</a-flex>
						</template>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">후결처리 사용</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.postApprovalFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span>
								결재자가 부재중인 경우 후결처리를 통해 중간결재자들을 건너뛸 수 있습니다.
								최종결재자는 후결처리 할 수 없으며 후결은 결승인만 가능합니다.
							</span>
						</a-flex>
					</a-col>
				</a-row>
				<a-row :wrap="false" :gutter="10" class="pb-xl">
					<a-col flex="30%">대결 사용</a-col>
					<a-col flex="1">
						<a-flex :gap="15" class="text-secondary">
							<a-switch
								size="small"
								v-model:checked="approvalRuleData.delegateApprovalFlag"
								@change="patchApprovalRules(approvalRuleData)"
							/>
							<span>
								결재자가 부재시 자신외의 결재가 가능한 대결자를 지정할 수 있습니다. 대결자
								지정은 개인 결재선 설정에서 추가가 가능합니다.
							</span>
						</a-flex>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</a-spin>
</template>
