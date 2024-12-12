<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import { Edas } from "@/types/mypage/approval-flow"
import type { TreeProps } from "ant-design-vue/es/tree"
import { useApprovalRules } from "~/composables/useApprovalRules"

const { show, setData } = defineProps<{ show: boolean; setData: any }>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "return", value: any): any
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const appStore = useAppsStore()
const { loading } = storeToRefs(appStore)
const treeData = ref()
const treeDataCopy = ref()
const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const checkedKeys = ref<(string | number)[]>([])
const checkedNodes = ref<any[]>([])
const autoExpandParent = ref<boolean>(true)
const expandedKeys = ref<(string | number)[]>([1])
const loadKeys = ref<(string | number)[]>([])

const lineData = ref<any>({
	approvalLineDetails: [],
	approvalLineReferrerDtos: [],
	agreementOptionType: "",
})
const drag = ref<boolean>(false)
const { agreementOptions } = useApprovalRules()

const agreeOptions = ref<any[]>([])

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		treeData.value = treeDataCopy.value
		treeData.value = filterTreeData(treeDataCopy.value, query)
	}
	if (!query) {
		treeData.value = treeDataCopy.value
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
		useCFetch<Response<any>>(`/api/v2/settings/commons/employees`, {
			method: "GET",
			params: {
				companyCode: items.type === "u" ? items.companyCode : items.code,
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
						employee.disabled = employee.id === getEmployeeId.value
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
	lineData.value.agreementOptionType = ""
	lineData.value.approvalLineDetails = []
	lineData.value.approvalLineReferrerDtos = []
}

const onAdd = (type: Edas) => {
	const user = checkedNodes.value.filter((e) => !e.children)
	const typeName = type === Edas.APPROVAL ? "APPROVAL" : "AGREEMENT"

	user.forEach((e) => {
		const item = {
			stage: lineData.value.approvalLineDetails.length + 1,
			approvalTypeLabel: type,
			approvalTypeName: typeName,
			approvalEmployeePositionName: e.gradeName,
			approvalEmployeeName: e.name,
			approvalEmployeeDepartmentCode: e.departmentCode,
			approvalEmployeeDepartmentName: e.departmentName,
			...e,
		}
		lineData.value.approvalLineDetails.push(item)
	})
	checkedNodes.value = []
	checkedKeys.value = []
}

const onAddReference = () => {
	const user = checkedNodes.value.filter((e) => !e.children)
	user.forEach((item) => {
		if (!lineData.value.approvalLineReferrerDtos)
			lineData.value.approvalLineReferrerDtos = []
		lineData.value.approvalLineReferrerDtos.push(item)
	})
	checkedKeys.value = []
}

const onMove = (e: any) => {
	if (e.draggedContext.futureIndex === 0) return false
}

const removeApprovalLine = (index: number) => {
	lineData.value.approvalLineDetails.splice(index, 1)
}

const removeReferences = (index: number) => {
	lineData.value.approvalLineReferrerDtos.splice(index, 1)
}

const onSubmit = () => {
	emit("return", lineData.value)
	open.value = false
}

onMounted(async () => {
	const orgz = await Promise.resolve(useOrgzTree())

	treeData.value = orgz
	treeDataCopy.value = orgz

	autoExpandParent.value = false
	expandedKeys.value = transformTreeToFlatArray(orgz as any, "key").map((x: any) => x.key)

	// 트리 데이터를 순회하며 비동기적으로 onLoadData 호출
	for (const key of expandedKeys.value) {
		const node = locateTreeNodeByKey(treeData.value, key)
		if (node && !node.isLeaf) {
			await onLoadData({ dataRef: node, eventKey: key })
		}
	}
})

onBeforeUpdate(async () => {
	agreeOptions.value = await agreementOptions()
	if (show) {
		if (setData) {
			// console.log('setData ', setData);
			lineData.value = { ...setData }
		}
	}
})
</script>
<template>
	<a-modal
		centered
		width="84rem"
		v-model:open="open"
		title="결재선 설정"
		:destroy-on-close="true"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-spin :spinning="loading">
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
							v-model:expanded-keys="expandedKeys"
							:loaded-keys="loadKeys"
							:selectable="false"
							:checkable="true"
							:show-icon="true"
							:tree-data="treeData"
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
									<component :is="materialIcons('mso', 'domain')" class="text-warning" />
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
											v-model:value="lineData.agreementOptionType"
											:options="agreeOptions"
										/>
									</a-flex>
								</a-col>
								<a-col flex="auto">
									<a-card title="결재선" size="small" :bodyStyle="{ minHeight: '40rem' }">
										<draggable
											:list="lineData.approvalLineDetails"
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
											v-if="
												lineData.approvalLineReferrerDtos &&
												lineData.approvalLineReferrerDtos.length === 0
											"
										>
											참조자 없음
										</span>
										<a-flex :gap="5" wrap="wrap" v-else>
											<a-tag
												v-for="(user, index) in lineData.approvalLineReferrerDtos"
												class="size-md"
												closable
												@close="removeReferences(index)"
											>
												{{
													`${user.name || user.referEmployeeName} ${user.jobName || user.referEmployeePositionName} (${user.departmentName || user.referEmployeeDepartmentName})`
												}}
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
</template>
