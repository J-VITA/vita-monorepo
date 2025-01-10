<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { TApproval } from "@/types/master/approval-flows"
import { ApprovalRules, Edas } from "@/types/master/approval-flows"
import { Form, RadioGroupProps } from "ant-design-vue"
import { useApprovalRules } from "~/composables/useApprovalRules"

type FromStateType = {
	id?: number
	approvalLineName: string
	mainApprovalLineFlag: boolean
	agreementOptionType: string
	orderSeq: number
	used: boolean
	approvalLineDetails: Array<TApproval>
	references: Array<TApproval>
}

const {
	show = false,
	user = undefined,
	approvalId,
	treeData = [],
	userDetail,
} = defineProps<{
	show: boolean
	user: any
	approvalId?: number | string
	treeData: Array<any>
	userDetail?: any
}>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "refresh", id: string | number): string | number
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})
const useForm = Form.useForm

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const appStore = useAppsStore()
const { loading } = storeToRefs(appStore)

const { getApprovalRules, agreementOptions } = useApprovalRules()

const agreeOptions = ref<RadioGroupProps["options"]>()
const approvalRules = ref<ApprovalRules>()
const treeDataCopy = ref<any[]>([])

const checkedKeys = ref<(string | number)[]>([])
const checkedNodes = ref<any[]>([])
const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const formState = ref<FromStateType>({
	id: undefined,
	approvalLineName: "", //결재선명
	mainApprovalLineFlag: false, //메인결재선명
	agreementOptionType: "",
	orderSeq: 0, //
	used: true,
	approvalLineDetails: [],
	references: [],
}) as any

const rules = ref<any>({
	approvalLineName: [
		{
			required: true,
			message: "필수값입니다.",
			trigger: "change",
		},
	],
})

const drag = ref<boolean>(false)

const filterCheckedNodes = () => {
	return checkedNodes.value.filter(
		(item) =>
			!formState.value.approvalLineDetails.some((x: any) => x.key === item.key) &&
			!formState.value.references.some((x: any) => x.key === item.key)
	)
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
		formState.value.approvalLineDetails.push({
			...data,
			companyCode: getCompanyCode.value,
			approvalTypeLabel: type,
			approvalType: Object.keys(Edas)[Object.values(Edas).indexOf(type as Edas)],
			approvalEmployeeId: data.id,
			stage: formState.value.approvalLineDetails.length + 1,
		})
	})
	treeDataCopy.value = treeLoop(treeDataCopy.value, checkedKeys.value)
}

const onAddReference = () => {
	filterCheckedNodes().forEach((item) => formState.value.references.push(item))

	treeDataCopy.value = treeLoop(treeDataCopy.value, checkedKeys.value)
}

const onMove = (e: any, e2: any, e3: any) => {
	if (e.draggedContext.futureIndex === 0) return false
}

/**
 * 결재선/참조 삭제 Action
 * @param user
 * @param type 'approvalLine'(결재선) | 'references(참조)'
 */
const removeUser = (user: any, type: "approvalLine" | "references") => {
	const field = type === "approvalLine" ? "approvalLineDetails" : "references"

	formState.value[field] = formState.value[field].filter((x: any) => x.key !== user.key)
	checkedNodes.value = checkedNodes.value.filter((x: any) => x.key !== user.key)
	checkedKeys.value = checkedKeys.value.filter((x: any) => x !== user.key)

	treeDataCopy.value = treeLoop(treeDataCopy.value, checkedKeys.value)
}

const { resetFields, validate, validateInfos } = useForm(formState, rules)
const onSubmit = () => {
	validate()
		.then(() => {
			// console.log("form ", toRaw(formState).value)
			saveApprovalLines(toRaw(formState).value)
		})
		.catch((err) => {
			console.log("error", err)
		})
}

/**
 * 결재선 저장/수정 API 호출
 * @param form
 */
const saveApprovalLines = async (form: any) => {
	const isNew = !form.id
	const body = {
		id: isNew ? undefined : form.id,
		companyCode: isNew ? getCompanyCode.value : form.companyCode,
		employeeId: isNew ? user.id : form.employeeId,
		approvalLineName: form.approvalLineName,
		mainApprovalLineFlag: form.mainApprovalLineFlag,
		agreementOptionType: form.agreementOptionType,
		orderSeq: isNew ? form.orderSeq : form.orderSeq, // orderSeq는 form에서 그대로 가져옴
		used: form.used,
		approvalLineDetails: form.approvalLineDetails,
		referenceEmployeeIds: form.references.map((x: any) => ({ id: x.key })),
	}

	const url = isNew
		? `/api/v2/masters/approvalLines`
		: `/api/v2/masters/approvalLines/${form.id}`
	const method = isNew ? "POST" : "PATCH"

	try {
		const res = await useCFetch<Response<any>>(url, {
			method,
			body,
		})

		if (res.status === 0) {
			emit("refresh", res.data.employeeId)
			message.success(isNew ? "결재선이 등록되었습니다." : "결재선이 수정되었습니다.")
			open.value = false
		}
	} catch (err) {
		console.error(err)
	}
}

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
	if (query != oldValue) {
		treeDataCopy.value = filterTreeData(treeData, query)
	}

	if (!query) {
		treeDataCopy.value = treeData
	}
	oldValue = query
}

const treeLoop = (data: any[], ids: any) => {
	return data.map((item) => {
		if (item.employeeNumber) {
			item.disabled = ids.some((x: any) => x === item.key)
		}

		if (item.children) {
			item.children = treeLoop(item.children, ids)
		}
		return item
	})
}

onBeforeMount(async () => {
	await agreementOptions().then((res) => (agreeOptions.value = res))
	approvalRules.value = (await getApprovalRules()).data
	treeDataCopy.value = treeData
})

watch(
	() => [show, userDetail],
	(arg) => {
		if (arg[0]) {
			if (arg[1]) {
				// userDetail 있음
				formState.value = {
					...userDetail,
					agreementOptionType: arg[1].agreementOptionTypeName,
					approvalLineDetails: arg[1].approvalLineDetails.map((x: any) => {
						x.key = x.approvalEmployeeId
						x.title = `${x.approvalEmployeeName} ${x.approvalEmployeePositionName ? x.approvalEmployeePositionName : ""}`
						x.approvalType = x.approvalTypeName
						checkedKeys.value.push(x.key)
						checkedNodes.value.push(x)
						return x
					}),
					references: arg[1].approvalLineReferrerDtos.map((x: any) => {
						x.key = x.referEmployeeId
						x.title = `${x.referEmployeeName} ${x.referEmployeePositionName ? x.referEmployeePositionName : ""}`
						checkedKeys.value.push(x.key)
						checkedNodes.value.push(x)
						return x
					}),
				}
			} else {
				// userDetail 없음
				formState.value.approvalLineDetails.push({
					...user,
					title: user.title ? user.title : `${user.name} ${user.gradeName}`,
					companyCode: getCompanyCode.value,
					employeeNumber: user.employeeNumber,
					stage: 1,
					approvalTypeLabel: Edas.DRAFT,
					approvalType:
						Object.keys(Edas)[Object.values(Edas).indexOf(Edas.DRAFT as Edas)],
					approvalEmployeeId: user.id,
				})
				checkedKeys.value.push(user.key)
				checkedNodes.value.push(user)

				formState.value.agreementOptionType = approvalRules.value?.agreementOptionTypeName
			}

			treeDataCopy.value = treeLoop(treeDataCopy.value, checkedKeys.value)
		} else {
			resetFields()
			checkedKeys.value = []
			checkedNodes.value = []
		}
	}
)
</script>
<template>
	<a-modal
		centered
		width="84rem"
		v-model:open="open"
		:title="`결재선 ${approvalId ? '설정 수정' : '설정 추가'}`"
		:destroy-on-close="true"
		:confirm-loading="loading"
		@ok="onSubmit"
	>
		<a-form layout="vertical">
			<a-descriptions
				bordered
				size="small"
				:column="2"
				:labelStyle="{ width: '20%' }"
				:style="{ 'margin-bottom': '0.4rem' }"
			>
				<a-descriptions-item :span="2">
					<template #label>
						<span class="text-error">*</span>
						결재선명
					</template>
					<a-form-item label-align="left" v-bind="validateInfos.approvalLineName">
						<a-input
							v-model:value="formState.approvalLineName"
							placeholder="결재선명을 입력해주세요."
						/>
					</a-form-item>
				</a-descriptions-item>
				<a-descriptions-item>
					<template #label>
						<span class="text-error">*</span>
						대표결재선여부
					</template>
					<a-form-item label-align="left">
						<a-checkbox v-model:checked="formState.mainApprovalLineFlag"
							>대표결재선으로 설정</a-checkbox
						>
						<!-- <a-input
              type="checkbox"
              v-model:value="formState.mainApprovalLineFlag"
              size="small"
            /> -->
					</a-form-item>
				</a-descriptions-item>
				<a-descriptions-item>
					<template #label>
						<span class="text-error">*</span>
						사용여부
					</template>
					<a-form-item label-align="left">
						<a-switch v-model:checked="formState.used" size="small" />
					</a-form-item>
				</a-descriptions-item>
			</a-descriptions>

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
						<!-- {{ loadKeys }} -->
						<!--              v-model:expanded-keys="expandedKeys"-->
						<a-tree
							block-node
							lazy
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
											v-model:value="formState.agreementOptionType"
											:options="agreeOptions"
										/>
									</a-flex>
								</a-col>
								<a-col flex="auto">
									<a-card title="결재선" size="small" :bodyStyle="{ minHeight: '40rem' }">
										<draggable
											:list="formState.approvalLineDetails"
											:move="onMove"
											item-key="stage"
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
																	element.approvalTypeLabel !== Edas.DRAFT
																		? 'drag_indicator'
																		: 'lock'
																)
															"
															:class="[
																'pa-sm',
																,
																{
																	'handle cursor-move':
																		element.approvalTypeLabel !== Edas.DRAFT,
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
														{{ `${element.title}` }}
													</a-space>
													<a-button
														v-if="element.stage !== 0 && index !== 0"
														class="close"
														type="text"
														:icon="materialIcons('mso', 'close')"
														size="small"
														@click="removeUser(element, 'approvalLine')"
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
										<span v-if="formState.references && formState.references.length === 0"
											>참조자 없음</span
										>
										<a-flex :gap="5" wrap="wrap" v-else>
											<a-tag
												v-for="user in formState.references"
												class="size-md"
												closable
												@close="removeUser(user, 'references')"
											>
												{{ `${user.title}(${user.referEmployeeDepartmentName})` }}
											</a-tag>
										</a-flex>
									</a-card>
								</a-col>
							</a-row>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>
