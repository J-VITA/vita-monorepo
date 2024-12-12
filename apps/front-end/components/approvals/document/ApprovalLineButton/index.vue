<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { type FormInstance, RadioGroupProps } from "ant-design-vue"
import { Edas } from "@/types/mypage/approval-flow"
import { ApprovalRules } from "@/types/master/approval-flows"
import { useApprovalRules } from "@/composables/useApprovalRules"

type ConfirmFieldType = {
	companyCode: string
	approvalHeaderId: number
	changeEmployeeId: number
	reason: string
	agreementOptionType: string
	approvalDetailRequests: Array<{
		companyCode: string
		approvalType: string
		approvalEmployeeId: number
	}>
	referenceEmployeeIds: Array<{ id: number }>
}

/**
 * 결재선 변경 및 결재선 설정 버튼
 */
const formData = defineModel<any>("formData", { required: true })
const { name, isDispatch = false } = defineProps<{
	name: string
	isDispatch?: boolean
}>()

const emit = defineEmits<{
	(e: "callback", value: any): void
}>()

const { agreementOptions, getApprovalRules } = useApprovalRules()
const { organizationChart } = useCompany()

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const rules = ref<ApprovalRules>()
const agreeOptions = ref<RadioGroupProps["options"]>()

let oldValue = "" // 초기 oldValue

const approvalLines = ref<any[]>([])
const references = ref<any[]>([])
const agreementOptionType = ref<string>("")

const open = ref<boolean>(false)
const drag = ref<boolean>(false)
const treeDataCopy = ref<any[]>([])
const searchValue = ref<string>("")
const checkedKeys = ref<(string | number)[]>([])
const checkedNodes = ref<any[]>([])

const formRef = useTemplateRef<FormInstance>("formRef")
const isConfirm = ref<boolean>(false)
const confirmFieldData = ref<ConfirmFieldType>({
	companyCode: formData.value.companyCode, // 필수
	approvalHeaderId: formData.value.id, // 필수
	changeEmployeeId: getEmployeeId.value, // 필수
	reason: "",
	agreementOptionType: "",
	approvalDetailRequests: [],
	referenceEmployeeIds: [],
})

/**
 * 조직도 API 호출
 */
const {
	data: treeData,
	status,
	refresh,
} = await organizationChart({
	companyCode: getCompanyCode.value,
	used: true,
})

const onShow = async () => {
	await refresh()
	open.value = true

	if (formData.value.approvalDetails) {
		approvalLines.value = formData.value.approvalDetails.map((x: any) => {
			x.key = x.approvalEmployeeId
			x.title = `${x.approvalEmployeeName} ${x.approvalEmployeePositionName ? x.approvalEmployeePositionName : ""}`
			x.approvalType = x.approvalTypeName
			checkedKeys.value.push(x.key)
			checkedNodes.value.push(x)
			return x
		})
	}

	if (formData.value.approvalReferrers) {
		references.value = formData.value.approvalReferrers.map((x: any) => {
			x.key = x.referEmployeeId
			x.title = `${x.referEmployeeName} ${x.referEmployeePositionName ? x.referEmployeePositionName : ""}`
			checkedKeys.value.push(x.key)
			checkedNodes.value.push(x)
			return x
		})
	}

	if (formData.value.agreementOptionType) {
		agreementOptionType.value = formData.value.agreementOptionType
	}

	treeLoop()
}

const treeLoop = () => {
	const loop = (data: any[], ids: any) => {
		return data.map((item) => {
			if (item.employeeNumber) {
				item.disabled = ids.some((x: any) => x === item.key)
			}

			if (item.children) {
				item.children = loop(item.children, checkedKeys.value)
			}
			return item
		})
	}
	treeDataCopy.value = loop(treeDataCopy.value, checkedKeys.value)
}

const filterCheckedNodes = () => {
	return checkedNodes.value.filter(
		(item) =>
			!approvalLines.value.some((x: any) => x.key === item.key) &&
			!references.value.some((x: any) => x.key === item.key)
	)
}

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
	if (query != oldValue) {
		treeDataCopy.value = treeData.value || []
		treeDataCopy.value = filterTreeData(treeData.value, query)
	}
	if (!query) {
		treeDataCopy.value = treeData.value || []
	}
	oldValue = query

	treeLoop()
}

const onCheck = async (
	keys: any,
	info: {
		event: "check"
		checked: boolean
		node: any
		checkedNodes: any[]
		nativeEvent: MouseEvent
	}
) => {
	checkedKeys.value = keys
	checkedNodes.value = info.checkedNodes
}

const onAdd = (type: Edas) => {
	filterCheckedNodes().forEach((data) => {
		approvalLines.value.push({
			...data,
			companyCode: getCompanyCode.value,
			approvalTypeLabel: type,
			approvalTypeName: Object.keys(Edas)[Object.values(Edas).indexOf(type as Edas)],
			approvalType: Object.keys(Edas)[Object.values(Edas).indexOf(type as Edas)],
			stage: approvalLines.value.length + 1,
		})
	})
	treeLoop()
}

const onAddReference = () => {
	filterCheckedNodes().forEach((item) => references.value.push(item))
	treeLoop()
}

const onMove = (e: any, e2: any, e3: any) => {
	if (e.draggedContext.futureIndex === 0) return false
}

/**
 * 결재선/참조 삭제 Action
 * @param user
 * @param type 'approvalLine'(결재선) | 'references(참조)'
 */
const removeUser = (user: any, type: "line" | "refer") => {
	if (type === "line") {
		approvalLines.value = approvalLines.value.filter((x: any) => x.key !== user.key)
	} else {
		references.value = references.value.filter((x: any) => x.key !== user.key)
	}
	checkedNodes.value = checkedNodes.value.filter((x: any) => x.key !== user.key)
	checkedKeys.value = checkedKeys.value.filter((x: any) => x !== user.key)

	treeLoop()
}

const onDispatch = (data: ConfirmFieldType) => {
	formRef.value
		?.validate()
		.then(async (res: any) => {
			await useCFetch("/api/v2/approvals/changes/approvalLines", {
				method: "PATCH",
				body: {
					...data,
					reason: res.reason,
				},
			})
				.then((res) => {
					emit("callback", res)
				})
				.catch((err) => console.error(err))
				.finally(() => {
					isConfirm.value = false
					open.value = false
					approvalLines.value = []
					references.value = []
					agreementOptionType.value = ""
					formRef.value?.resetFields()
				})
		})
		.catch((err) => console.error(err))
}

const onSubmit = () => {
	const data = {
		approvalLines: approvalLines.value,
		references: references.value,
		agreementOptionType: agreementOptionType.value,
	}

	if (isDispatch) {
		confirmFieldData.value.agreementOptionType = agreementOptionType.value
		confirmFieldData.value.approvalDetailRequests = approvalLines.value.map((x: any) => x)
		confirmFieldData.value.referenceEmployeeIds = references.value.map((e: any) => ({
			id: e.id,
		}))
		isConfirm.value = true
	} else {
		emit("callback", {
			approvalLines: approvalLines.value,
			references: references.value,
			agreementOptionType: agreementOptionType.value,
		})
		open.value = false
		approvalLines.value = []
		references.value = []
		agreementOptionType.value = ""
	}
}

onMounted(async () => {
	rules.value = (await getApprovalRules()).data
	agreeOptions.value = await agreementOptions().then((res) => res)
	treeDataCopy.value = treeData.value || []
})
</script>
<template>
	<a-button :icon="materialIcons('mso', 'search')" @click="onShow">
		{{ name }}
	</a-button>

	<a-modal
		centered
		width="84rem"
		v-model:open="open"
		:title="name"
		:destroy-on-close="true"
		@ok="onSubmit"
	>
		<a-spin :spinning="status === 'pending'">
			<a-row :gutter="[15, 15]" :wrap="false">
				<a-col flex="34rem" style="min-height: 100%">
					<a-card
						title="조직도"
						size="small"
						class="full-height"
						:body-style="{ minHeight: '100%' }"
					>
						<a-input-search
							class="mb-sm"
							v-model:value="searchValue"
							placeholder="검색"
							@input="onQueryChanged(searchValue)"
						/>

						<a-tree
							block-node
							v-model:checked-keys="checkedKeys"
							:default-expand-all="true"
							:selectable="false"
							:checkable="true"
							:show-icon="true"
							:tree-data="treeDataCopy"
							@check="onCheck"
						>
							<template #icon="{ dataRef }">
								<template v-if="dataRef.depth === 1">
									<component :is="materialIcons('mso', 'domain')" class="text-warning" />
								</template>
								<template v-else-if="dataRef.depth !== 1 && dataRef.code">
									<component :is="materialIcons('mso', 'tenancy')" class="text-warning" />
								</template>
								<template v-else>
									<component :is="materialIcons('mso', 'person')" />
								</template>
							</template>
							<template #title="slot">
								<span v-if="slot.data.title.indexOf(searchValue) > -1">
									{{ slot.data.title.substring(0, slot.data.title.indexOf(searchValue)) }}
									<span class="text-error">{{ searchValue }}</span>
									{{
										slot.data.title.substring(
											slot.data.title.indexOf(searchValue) + searchValue.length
										)
									}}
								</span>
								<span v-else>{{ slot.data.title }}</span>
							</template>
						</a-tree>
					</a-card>
				</a-col>
				<a-col flex="1">
					<a-row :gutter="[15, 15]">
						<a-col span="24">
							<a-row align="middle" :gutter="[15, 15]" :wrap="false">
								<a-col flex="10rem">
									<a-flex vertical :gap="10">
										<a-button
											class="row-reverse"
											:icon="materialIcons('mso', 'chevron_right')"
											@click="onAdd(Edas.APPROVAL)"
											>결재</a-button
										>
										<a-button
											class="row-reverse"
											:icon="materialIcons('mso', 'chevron_right')"
											@click="onAdd(Edas.AGREEMENT)"
											>합의</a-button
										>
										<a-radio-group
											v-model:value="agreementOptionType"
											:options="agreeOptions"
										/>
									</a-flex>
								</a-col>
								<a-col flex="auto">
									<a-card title="결재선" size="small" :bodyStyle="{ minHeight: '40rem' }">
										<draggable
											:list="approvalLines"
											:move="onMove"
											item-key="name"
											ghost-class="ghost"
											handle=".handle"
											@start="drag = true"
											@end="drag = false"
										>
											<template #item="{ element, index }">
												<div class="dragga-item">
													<a-space :size="5">
														<component
															:is="
																materialIcons(
																	'mso',
																	(element.approvalTypeLabel !== Edas.DRAFT &&
																		!formData.documentStatusName) ||
																		element.stage > formData.nextApprovalStage
																		? 'drag_indicator'
																		: 'lock'
																)
															"
															:class="[
																'pa-sm',
																{
																	'handle cursor-move':
																		(element.approvalTypeLabel !== Edas.DRAFT &&
																			!formData.documentStatusName) ||
																		element.stage > formData.nextApprovalStage,
																},
															]"
														/>
														<a-tag
															:color="
																element.approvalTypeLabel === Edas.AGREEMENT
																	? 'purple'
																	: element.approvalTypeLabel === Edas.APPROVAL
																		? 'blue'
																		: ''
															"
															>{{ element.approvalTypeLabel }}</a-tag
														>
														{{ element.title }}
													</a-space>
													<a-button
														v-if="
															(element.approvalTypeLabel !== Edas.DRAFT &&
																!formData.documentStatusName) ||
															element.stage > formData.nextApprovalStage
														"
														class="close"
														type="text"
														:icon="materialIcons('mso', 'close')"
														size="small"
														@click="removeUser(element, 'line')"
													/>
												</div>
											</template>
										</draggable>
									</a-card>
								</a-col>
							</a-row>
						</a-col>
						<a-col span="24">
							<a-row :wrap="false">
								<a-col flex="10rem">
									<a-button
										class="row-reverse"
										:icon="materialIcons('mso', 'chevron_right')"
										@click="onAddReference"
										>참조</a-button
									>
								</a-col>
								<a-col flex="auto">
									<a-card title="참조" size="small">
										<span v-if="references && references.length === 0">
											참조자 없음
										</span>
										<a-flex :gap="5" wrap="wrap" v-else>
											<a-tag
												v-for="user in references"
												class="size-md"
												closable
												@close="removeUser(user, 'refer')"
											>
												{{ user.title }}({{ user.referEmployeeDepartmentName }})
											</a-tag>
										</a-flex>
									</a-card>
								</a-col>
							</a-row>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</a-spin>
	</a-modal>

	<!--  결재선 저장 모달  -->
	<field-modal
		title="결재"
		:showed="isConfirm"
		:field="confirmFieldData"
		cancel-text="취소"
		@closed="open = false"
		@submit="onDispatch"
	>
		<template #content="{ field }">
			<a-flex align="start" class="mb-lg" :gap="10">
				<component
					:is="materialIcons('mso', 'error')"
					class="text-warning"
					style="font-size: 3rem"
				/>
				<div>
					<a-typography-title :level="4" class="mb-sm">
						결재선을 변경하시겠습니까?
					</a-typography-title>
					<a-typography-text>
						문서변경이력에 남고 다음 결재자에게 알림이 발생합니다.
					</a-typography-text>
				</div>
			</a-flex>

			<a-form
				ref="formRef"
				label-align="left"
				:colon="false"
				:model="field"
				:label-col="{ offset: 2, span: 22 }"
				:wrapper-col="{ offset: 2, span: 22 }"
			>
				<a-form-item name="reason" label="결재선 변경사유">
					<a-textarea
						class="fixed"
						placeholder="문서변경 사유를 입력하세요"
						v-model:value="field.reason"
					/>
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
