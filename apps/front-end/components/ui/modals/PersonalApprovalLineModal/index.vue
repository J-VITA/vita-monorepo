<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import { Edas } from "@/types/mypage/approval-flow"
import { Form } from "ant-design-vue"
import type { TreeProps } from "ant-design-vue/es/tree"
import type {
	ApprovalLines,
	ApprovalDetail,
	TApproval,
} from "@/types/master/approval-flows"

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

const props = withDefaults(
	defineProps<{
		show: boolean
		treeData: any
		user: any
		approvalId?: number | string
		totalElements: number
	}>(),
	{
		show: false,
	}
)

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "refresh"): void
}>()

const open = computed({
	get() {
		return props.show
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
const orgzTreeData = ref<any>()
const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const checkedKeys = ref<(string | number)[]>([])
const checkedNodes = ref<any[]>([])
const autoExpandParent = ref<boolean>(true)
const expandedKeys = ref<(string | number)[]>([1])
const loadKeys = ref<(string | number)[]>([])
const formState = ref<FromStateType>({
	id: undefined,
	approvalLineName: "", //결재선명
	mainApprovalLineFlag: false, //메인결재선명
	agreementOptionType: "SERIAL",
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

const { data: agreeOptions } = await useAsyncData(`agreement-option-types`, () =>
	useCFetch<Response<any>>("/api/v2/master/approvalRules/types/agreementOptionTypes", {
		method: "GET",
	}).then((res: Response<any>) =>
		res.data.map((e: any) => {
			return { label: e.label, value: e.code }
		})
	)
)

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		orgzTreeData.value = props.treeData
		orgzTreeData.value = filterTreeData(props.treeData, query)
	}
	if (!query) {
		orgzTreeData.value = props.treeData
	}
	oldValue = query
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	// Load data when a node is expanded
	if (!info.node.dataRef.children || info.node.dataRef.children.length === 0) {
		await onLoadData(info.node)
	}

	autoExpandParent.value = false
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

const onLoadData = async (treeNode: any) => {
	const items = treeNode.dataRef
	loadKeys.value.push(treeNode.eventKey)
	return await Promise.resolve(
		await useCFetch<Response<any>>(`/api/v2/settings/commons/employees`, {
			method: "GET",
			params: {
				// companyCode: items.type === 'u' ? items.companyCode : items.code,
				companyCode: items.companyCode,
				departmentId: items.id,
			},
		}).then((res: Response<any>) => {
			if (res.data && res.data.length > 0) {
				if (!treeNode.dataRef.children) {
					treeNode.dataRef.children = []
				}
				const employees = res.data
				for (const employee of employees) {
					if (!treeNode.dataRef.children.map((x: any) => x.id).includes(employee.id)) {
						employee.isLeaf = true
						employee.type = "u"
						employee.key = `${employee.id}${employee.employeeNumber}`
						treeNode.dataRef.children.push(employee)
					}
				}
			}
		})
	)
}

const onAfterClose = () => {
	// loading.value = false;
}

const onAdd = (type: Edas) => {
	const user = checkedNodes.value.filter((e) => !e.children)
	user.forEach((e) => {
		const item = {
			stage: formState.value.approvalLineDetails.length + 1,
			approvalType: type,
			approvalEmployeePositionName: e.gradeName,
			approvalEmployeeName: e.name,
			approvalEmployeeDepartmentCode: e.departmentCode,
			approvalEmployeeDepartmentName: e.departmentName,
			...e,
		}
		formState.value.approvalLineDetails.push(item)
	})
	checkedNodes.value = []
	checkedKeys.value = []
}

const onAddReference = () => {
	const user = checkedNodes.value.filter((e) => !e.children)
	user.forEach((item) => {
		formState.value.references.push(item)
	})
	checkedKeys.value = []
}

const onMove = (e: any) => {
	if (e.draggedContext.futureIndex === 0) return false
}

const removeApprovalLine = (index: number) => {
	formState.value.approvalLineDetails.splice(index, 1)
}

const removeReferences = (index: number) => {
	formState.value.references.splice(index, 1)
}

const { resetFields, validate, validateInfos } = useForm(formState, rules)
const onSubmit = () => {
	validate()
		.then(() => {
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
const saveApprovalLines = (form: any) => {
	const body: ApprovalLines = {
		id: form.id,
		employeeId: props.user.id,
		companyCode: getCompanyCode.value,
		agreementOptionType: form.agreementOptionType,
		approvalLineName: form.approvalLineName,
		mainApprovalLineFlag: form.mainApprovalLineFlag,
		used: form.used,
		orderSeq: form.id ? form.stage : props.totalElements + 1,
		approvalLineDetails:
			form.approvalLineDetails.map((x: ApprovalDetail, idx: number) => {
				x.companyCode = getCompanyCode.value
				x.employeeNumber = x.employeeNumber
				x.stage = idx + 1
				x.approvalType =
					Object.keys(Edas)[
						Object.values(Edas).indexOf(x.approvalType as unknown as Edas)
					]
				x.approvalEmployeeId =
					x.approvalType === "DRAFT"
						? props.user.id
						: x.approvalEmployeeId
							? x.approvalEmployeeId
							: x.id
				return x
			}) || [],
		referenceEmployeeIds:
			form?.references?.map((x: ApprovalDetail) => ({ id: x.id })) || [],
	}

	useCFetch<Response<any>>(
		`/api/v2/persons/approvalLines${form.id ? "/" + form.id : ""}`,
		{
			method: form.id ? "PATCH" : "POST",
			body,
		}
	).then(async (res: Response<any>) => {
		if (res.status === 0) {
			message.success(`${form.id ? "수정하였습니다." : "저장하였습니다."}`)
			emit("refresh")
			open.value = false
		} else {
			message.error(`${res.message}`)
			const row = (await getApprovalLinesDetail(formState.value.id)) as any

			formState.value = row
			formState.value.agreementOptionType = row.agreementOptionTypeName
			const approvalLineDetails = row.approvalLineDetails
			formState.value.approvalLineDetails = approvalLineDetails?.map((approval: any) => {
				approval.approvalType = approval.approvalTypeLabel
				return approval
			})

			const referenceEmployeeIds = row.referenceEmployeeIds.split(",")
			if (referenceEmployeeIds && referenceEmployeeIds.length > 0) {
				formState.value.references = []
				referenceEmployeeIds.forEach(async (id: any) => {
					const reference = await Promise.resolve(
						await getEmployees({ companyCode: getCompanyCode.value, id })
					)
					formState.value.references.push(reference)
				})
			} else {
				formState.value.references = []
			}
		}
	})
}

const getEmployees = async (params: any) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/employees/${params.id}`, {
		method: "GET",
		params,
	}).then((res: Response<any>) => (res.data || []) as Array<any>)
}

/**
 * 결재선 정보 상세 조회 API 호출
 * @param id
 */
const getApprovalLinesDetail = async (id: string | number) => {
	return await useCFetch<Response<ApprovalLines>>(`/api/v2/persons/approvalLines/${id}`, {
		method: "GET",
		params: {
			id,
		},
	}).then((res: Response<ApprovalLines>) => res.data || undefined)
}

const { show, user, approvalId, treeData } = toRefs(props)
watch([show, user, approvalId, treeData], async (args) => {
	if (args[3] && args[3].length > 0) {
		orgzTreeData.value = args[3]
		autoExpandParent.value = false
		expandedKeys.value = transformTreeToFlatArray(orgzTreeData.value as any, "key").map(
			(x: any) => x.key
		)
		console.log("expandedKeys.value ", expandedKeys.value)
		// 트리 데이터를 순회하며 비동기적으로 onLoadData 호출
		for (const key of expandedKeys.value) {
			const node = locateTreeNodeByKey(orgzTreeData.value, key)
			if (node && !node.isLeaf) {
				await onLoadData({ dataRef: node, eventKey: key })
			}
		}
	}

	if (args[0] && args[1] && args[2]) {
		const row = (await getApprovalLinesDetail(args[2])) as any

		formState.value = row
		formState.value.agreementOptionType = row.agreementOptionTypeName
		const approvalLineDetails = row.approvalLineDetails
		formState.value.approvalLineDetails = approvalLineDetails?.map((approval: any) => {
			approval.approvalType = approval.approvalTypeLabel
			return approval
		})

		const referers = row.approvalLineReferrerDtos
		if (referers && referers.length > 0) {
			const referenceEmployeeIds = referers.map((x: any) => x.referEmployeeId)
			formState.value.references = []
			referenceEmployeeIds.forEach(async (id: any) => {
				const reference = await Promise.resolve(
					await getEmployees({ companyCode: getCompanyCode.value, id })
				)
				formState.value.references.push(reference)
			})
		} else {
			formState.value.references = []
		}
	} else if (args[0] && args[1] && !args[2]) {
		const user = args[1]

		formState.value.approvalLineDetails.push({
			stage: 0,
			approvalType: "기안",
			approvalEmployeePositionName: user.gradeName,
			approvalEmployeeName: user.name,
			approvalEmployeeDepartmentCode: user.departmentCode,
			approvalEmployeeDepartmentName: user.departmentName,
			...user,
		})
	} else {
		resetFields()
	}
})
</script>
<template>
	<a-modal
		centered
		width="84rem"
		v-model:open="open"
		:title="`결재선 ${approvalId ? '설정 수정' : '설정 추가'}`"
		:destroy-on-close="true"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-spin :spinning="loading">
			<a-form layout="vertical">
				<a-descriptions
					bordered
					size="small"
					:column="2"
					:labelStyle="{ width: '20%' }"
					class="mb-sm"
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

							<a-tree
								block-node
								virtual
								lazy
								v-model:checked-keys="checkedKeys"
								v-model:expanded-keys="expandedKeys"
								:auto-expand-parent="autoExpandParent"
								:loaded-keys="loadKeys"
								:selectable="false"
								:checkable="true"
								:show-icon="true"
								:tree-data="orgzTreeData"
								:load-data="onLoadData"
								:default-expand-all="true"
								:field-names="{
									children: 'children',
									title: 'name',
									key: 'key',
								}"
								@check="onCheck"
								@expand="onExpand"
							>
								<template #icon="{ dataRef }">
									<template v-if="dataRef.type === 'c'">
										<component
											:is="materialIcons('mso', 'domain')"
											class="text-warning"
										/>
									</template>
									<template v-else-if="dataRef.type === 'd'">
										<component :is="materialIcons('m', 'folder')" class="text-warning" />
									</template>
									<template v-else>
										<component :is="materialIcons('mso', 'person')" />
									</template>
								</template>
								<template #title="slot">
									<span v-if="slot.data.name.indexOf(searchValue) > -1">
										{{ slot.data.name.substring(0, slot.data.name.indexOf(searchValue)) }}
										<span class="text-error">{{ searchValue }}</span>
										{{
											slot.data.name.substring(
												slot.data.name.indexOf(searchValue) + searchValue.length
											)
										}}
									</span>
									<span v-else-if="slot.data.type !== 'u'" style="color: #1890ff">{{
										slot.data.name
									}}</span>
									<span v-else>{{ slot.data.type }}-{{ slot.data.name }}</span>
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
										<a-card
											title="결재선"
											size="small"
											:bodyStyle="{ minHeight: '40rem' }"
										>
											<draggable
												:list="formState.approvalLineDetails"
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
																		element.approvalType !== Edas.DRAFT
																			? 'drag_indicator'
																			: 'lock'
																	)
																"
																:class="[
																	'pa-sm',
																	,
																	{
																		'handle cursor-move':
																			element.approvalType !== Edas.DRAFT,
																	},
																]"
															/>

															<a-tag
																:color="
																	element.approvalType === Edas.AGREEMENT
																		? 'purple'
																		: element.approvalType === Edas.APPROVAL
																			? 'blue'
																			: ''
																"
																>{{ element.approvalType }}</a-tag
															>
															{{
																`${element.approvalEmployeeName} ${element.approvalEmployeePositionName} (${element.approvalEmployeeDepartmentName})`
															}}
														</a-space>
														<a-button
															v-if="element.stage !== 0 && index !== 0"
															class="close"
															type="text"
															:icon="materialIcons('mso', 'close')"
															size="small"
															@click="removeApprovalLine(index)"
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
											<span
												v-if="formState.references && formState.references.length === 0"
												>참조자 없음</span
											>
											<a-flex :gap="5" wrap="wrap" v-else>
												<a-tag
													v-for="(user, index) in formState.references"
													class="size-md"
													closable
													@close="removeReferences(index)"
												>
													{{ `${user.name} ${user.jobName} (${user.departmentName})` }}
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
		</a-spin>
	</a-modal>
</template>
