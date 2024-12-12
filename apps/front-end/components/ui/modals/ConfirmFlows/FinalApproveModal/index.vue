<script lang="ts" setup>
import { Response } from "@/types"
import type { TreeProps, FormInstance } from "ant-design-vue"
import {
	ConfirmFlowsProps,
	LineApprovalFormError,
	LineApprovalFormTypeDtos,
	LineCostCenterDtos,
	LineDetailRequest,
	RErrorFinalApproveReponse,
	RFinalApprovalFromType,
	TErrorFinalApproveReponse,
	TFinalApprovalFromType,
	TFinalApproveReponse,
	useFinalApproveParams,
} from "@/types/master/confirm-flows"

const open = defineModel<boolean>("open")

const props = defineProps<ConfirmFlowsProps>()

const treeAllChecked = ref(false)
// const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<(string | number)[]>([])
const checkedNodes = ref<any[]>([])

const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)

const formRef = useTemplateRef<FormInstance>("formRef")

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "submit", value: Response<any>): any
}>()

const loading = ref<boolean>(false)
const errorModalOpen = ref<boolean>(false)
const errorModelRef = ref<RErrorFinalApproveReponse[]>()

const {
	data: costCenterList,
	status,
	refresh,
} = await useAsyncData(
	`cost-centers-tree`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/costCenters", {
			method: "GET",
			params: {
				companyCode: getRole.value === "ROOT" ? "" : getCompanyCode.value,
			},
		}),
	{
		transform: (response: Response<any>) => response.data,
	}
)

const { modelRef, updateModelRef } = useFinalApproveParams(getCompanyCode.value)

const onSubmit = () => {
	formRef.value
		?.validate()
		.then(async () => {
			loading.value = true
			if (!modelRef.value.costCenterIds || modelRef.value.costCenterIds.length === 0) {
				message.error("비용부서를 선택하세요.")
				loading.value = false
				return
			}

			await useCFetch<Response<any>>(
				`/api/v2/master/checkLines${props.itemId ? "/" + props.itemId : ""}`,
				{
					method: props.itemId ? "PATCH" : "POST",
					body: Object.assign(
						{ ...modelRef.value },
						{ id: props.itemId ? props.itemId : undefined },
						{
							approvalFormTypes: modelRef.value.approvalFormTypes.map(
								(approvalFormType: string) => ({ approvalFormType })
							),
							costCenterIds: modelRef.value.costCenterIds?.map((id: string | number) => ({
								id,
							})),
							checkLineDetailRequests: modelRef.value?.checkLineDetailRequests?.map(
								(request) => {
									// Create a shallow copy of the request without 'checkEmployeeIds'
									const { checkEmployeeIds, ...rest } = request
									return rest // Return the rest of the properties
								}
							),
							checkLineDetailDtos: undefined,
							checkLineApprovalFormTypeDtos: undefined,
							checkLineCostCenterDtos: undefined,
						}
					),
				}
			).then((res: Response<any>) => {
				if (res.status === 0) {
					message.success(`${props.itemId ? "수정되었습니다" : "생성되었습니다"}.`)
					open.value = false
					emit("submit", res)
				} else {
					loading.value = false

					const resErrorData = res as TErrorFinalApproveReponse
					if (resErrorData.data) {
						errorModelRef.value = resErrorData.data
						errorModalOpen.value = true
					}
				}
			})
		})
		.catch((err) => {
			console.log("error", err)
			loading.value = false
		})
}

const onAfterClose = () => {
	updateModelRef({
		name: "",
		description: "",
		approvalFormTypes: [],
		costCenterIds: [],
		checkLineDetailRequests: [],
	})
	checkedKeys.value = []
	checkedNodes.value = []

	loading.value = false
	treeAllChecked.value = false
	formRef.value?.resetFields()
}

// 모든 노드의 키를 가져오는 함수
const getAllKeysAndNodes = (data: any): { keys: string[]; nodes: any[] } => {
	let keys: string[] = []
	let nodes: any[] = []
	data.forEach((item: any) => {
		keys.push(item.id)
		nodes.push(item)
		if (item.children) {
			const childResult = getAllKeysAndNodes(item.children)
			keys = keys.concat(childResult.keys)
			nodes = nodes.concat(childResult.nodes)
		}
	})
	return { keys, nodes }
}

// 모든 노드가 체크되어 있는지 확인하는 함수
const areAllNodesChecked = (): boolean => {
	const { keys } = getAllKeysAndNodes(costCenterList.value)
	const allKeys = new Set(keys)
	const checkedKeysSet = new Set(checkedKeys.value)
	return (
		allKeys.size === checkedKeysSet.size &&
		[...allKeys].every((key) => checkedKeysSet.has(key))
	)
}

// 전체 선택 체크박스 핸들러
const handleAllCheck = (e: any): void => {
	const target = e.target as HTMLInputElement
	const { keys, nodes } = getAllKeysAndNodes(costCenterList.value)

	if (target.checked) {
		checkedKeys.value = keys
		checkedNodes.value = nodes
		updateModelRef({ costCenterIds: keys })
	} else {
		checkedKeys.value = []
		checkedNodes.value = []
		updateModelRef({ costCenterIds: [] })
	}
}

const onCheck = (checkedKeysValue: any, info: any) => {
	// 기존 선택과 새로운 선택을 합치고 중복 제거
	const newCheckedKeys = Array.from(
		new Set([
			...(Array.isArray(checkedKeys.value) ? checkedKeys.value : []),
			...checkedKeysValue.checked,
		])
	)

	checkedKeys.value = newCheckedKeys
	checkedNodes.value = info.checkedNodes

	// selectedKeys도 업데이트
	updateModelRef({ costCenterIds: newCheckedKeys })
}

const onSelect: TreeProps["onSelect"] = (selectedKeysValue, info) => {
	const { selected, node } = info
	const key = node.key as string

	let newSelectedKeys = Array.isArray(modelRef.value.costCenterIds)
		? [...modelRef.value.costCenterIds]
		: []

	if (selected) {
		if (!newSelectedKeys.includes(key)) {
			newSelectedKeys.push(key)
		}
	} else {
		newSelectedKeys = newSelectedKeys.filter((k) => k !== key)
	}

	updateModelRef({ costCenterIds: newSelectedKeys })
	checkedKeys.value = newSelectedKeys // checkedKeys도 동기화
}

const onFinalLineAddition = () => {
	if (modelRef.value.checkLineDetailRequests) {
		modelRef.value.checkLineDetailRequests.push({
			id: undefined,
			sequence: undefined,
			checkEmployeeId: undefined,
			used: false,
			checkEmployeeIds: [],
			companyCode: getCompanyCode.value,
			endAmount: undefined,
			startAmount: undefined,
		})
	}
}

const onFinalLineRemove = (item: any) => {
	if (modelRef.value.checkLineDetailRequests) {
		const index = modelRef.value.checkLineDetailRequests.indexOf(item)
		if (index !== -1) {
			modelRef.value.checkLineDetailRequests.splice(index, 1)
		}
	}
}

const getApprovalFormTypes = async (): Promise<RFinalApprovalFromType[]> => {
	const res = await useCFetch<Response<TFinalApprovalFromType>>(
		`/api/v2/master/checkLines/approvalForms/${getCompanyCode.value}`
	)
	if (res.status === 0 && res.data) {
		return res.data.map((item: RFinalApprovalFromType) => ({ ...item }))
	}
	return []
}

/**
 * 에러 모달 태그 키다운 (백스페이스) 이벤트 방지
 */
const errorModalHandleKeyDown = (e: KeyboardEvent) => {
	if (e.key === "Backspace") {
		e.preventDefault()
		e.stopPropagation()
	}
}

watch(
	() => open,
	async () => {
		if (open.value && props.itemId) {
			const res = await useCFetch<TFinalApproveReponse>(
				`/api/v2/master/checkLines/${props.itemId}`
			)
			if (res.status === 0 && res.data) {
				const item = res.data
				updateModelRef({
					...item,
					checkLineDetailRequests: item.checkLineDetailDtos?.map(
						(line: LineDetailRequest) => ({
							...line,
							checkEmployeeIds: line.checkEmployeeId ? [line.checkEmployeeId] : [],
						})
					),
					approvalFormTypes: item.checkLineApprovalFormTypeDtos.map(
						(value: LineApprovalFormTypeDtos) => value.approvalFormTypeName
					),
					costCenterIds: item.checkLineCostCenterDtos.map(
						(value: LineCostCenterDtos) => value.id
					),
				})
				checkedKeys.value = item.checkLineCostCenterDtos.map(
					(value: LineCostCenterDtos) => value.id
				)
			}
			treeAllChecked.value = areAllNodesChecked()
		} else {
			checkedKeys.value = []
			updateModelRef({
				name: "",
				description: "",
				approvalFormTypes: [],
				costCenterIds: [],
				checkLineDetailRequests: [
					{
						id: undefined,
						sequence: undefined,
						checkEmployeeId: undefined,
						used: false,
						checkEmployeeIds: [],
						companyCode: getCompanyCode.value,
						endAmount: undefined,
						startAmount: undefined,
					},
				],
			})
		}
	},
	{ immediate: true, deep: true }
)

// checkedKeys의 변경을 감지하는 watch 함수 추가
watch(
	() => checkedKeys.value,
	(newCheckedKeys) => {
		const { keys } = getAllKeysAndNodes(costCenterList.value)
		treeAllChecked.value = newCheckedKeys.length === keys.length
	}
)

const approvalFormTypeOptions = ref<RFinalApprovalFromType[]>([])
onMounted(async () => {
	const [approvalFormType] = await Promise.all([getApprovalFormTypes()])
	approvalFormTypeOptions.value = approvalFormType
})

onBeforeRouteLeave(() => {
	errorModalOpen.value = false
})
</script>
<template>
	<a-modal
		centered
		width="100rem"
		v-model:open="open"
		title="검인라인 추가"
		ok-text="저장"
		:destroy-on-close="true"
		:keyboard="false"
		:mask-closable="false"
		:confirm-loading="loading"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-row :gutter="[0, 18]">
			<a-col span="6">
				<a-checkbox v-model:checked="treeAllChecked" @change="handleAllCheck"
					>전체 선택</a-checkbox
				>
				<a-divider type="horizontal" class="mt-sm mb-sm" />
				<a-tree
					class="tree-limit"
					virtual
					lazy
					v-model:checked-keys="checkedKeys"
					v-model:selected-keys="modelRef.costCenterIds"
					:tree-data="costCenterList"
					:default-expand-all="true"
					:field-names="{
						children: 'children',
						title: 'name',
						key: 'id',
					}"
					show-icon
					block-node
					checkable
					multiple
					:check-strictly="true"
					@check="onCheck"
					@select="onSelect"
				>
					<template #icon="{ dataRef }">
						<template v-if="!dataRef.parentId">
							<component :is="materialIcons('mso', 'domain')" class="text-warning" />
						</template>
						<template v-else>
							<component :is="materialIcons('mso', 'database')" class="text-warning" />
						</template>
					</template>
				</a-tree>
			</a-col>
			<a-col span="2" class="text-center">
				<a-divider type="vertical" class="full-height" />
			</a-col>
			<a-col span="16">
				<a-form
					ref="formRef"
					label-align="left"
					:colon="false"
					:label-col="{ span: 4 }"
					:wrapper-col="{ span: 20 }"
					:model="modelRef"
					:fields="modelRef"
				>
					<a-form-item
						label="검인라인명"
						name="name"
						:rules="[
							{
								type: 'string',
								required: true,
								message: '검인라인명을 입력해주세요.',
							},
						]"
						has-feedback
					>
						<a-input v-model:value="modelRef.name" />
					</a-form-item>
					<a-form-item label="설명" name="description">
						<a-input v-model:value="modelRef.description" />
					</a-form-item>
					<a-form-item
						label="결재문서 선택"
						name="approvalFormTypes"
						:rules="[
							{
								type: 'array',
								required: true,
								message: '결재문서를 하나 이상 선택해주세요.',
							},
						]"
						has-feedback
					>
						<a-checkbox-group v-model:value="modelRef.approvalFormTypes">
							<a-row>
								<a-col
									:span="8"
									v-for="item in approvalFormTypeOptions"
									:key="item.approvalFormTypeName"
								>
									<a-checkbox :value="item.approvalFormTypeName">
										{{ item.approvalFormTypeLabel }}
									</a-checkbox>
								</a-col>
							</a-row>
						</a-checkbox-group>
					</a-form-item>
					<a-form-item label="사용여부">
						<a-switch v-model:checked="modelRef.used" />
					</a-form-item>
					<a-divider type="horizontal" class="mb-sm mt-sm" />
					<a-form-item label="검인라인 설정" class="bold">
						<a-typography-text type="secondary">
							* 검인조건 금액은 결재문서 내 전표들의 총 합계금액 입니다.
						</a-typography-text>
					</a-form-item>

					<a-form-item
						v-for="(item, index) in modelRef.checkLineDetailRequests"
						:label="`순서 ${index + 1}`"
					>
						<a-row :gutter="[30, 0]">
							<a-col span="12">
								<a-form-item
									:name="['checkLineDetailRequests', index, 'checkEmployeeIds']"
									:rules="[
										{
											type: 'array',
											required: true,
											message: '필수 입력값 입니다.',
											trigger: ['blur', 'change'],
										},
									]"
									has-feedback
								>
									<eacc-select-table
										url="/api/v2/approvals/commons/employees"
										v-model:value="item.checkEmployeeIds"
										key-props="id"
										label-prop="name"
										:columns="[
											{ title: '이름', data: (row: any) => row.name },
											{ title: '직위', data: (row: any) => row.gradeName },
											{
												title: '코스트센터',
												data: (row: any) => row.costCenterName,
											},
											{ title: '회사', data: (row: any) => row.companyName },
											{
												title: '사업장',
												data: (row: any) => row.workplaceName,
											},
										]"
										@update:value="(value: any) => (item.checkEmployeeId = value[0])"
									/>
								</a-form-item>
							</a-col>
							<a-col span="12">
								<a-space align="center">
									<a-switch v-model:checked="item.used"></a-switch>검인조건사용
									<a-button
										v-if="index > 0"
										shape="circle"
										size="small"
										danger
										@click="onFinalLineRemove(item)"
										:icon="materialIcons('mso', 'remove')"
									/>
								</a-space>
							</a-col>
							<a-col span="24" class="mt-md" v-if="item.used">
								<a-row :wrap="false" :gutter="10">
									<a-col flex="1">
										<a-flex class="box" :gap="20">
											검인조건
											<eacc-amount-input
												v-model:value="item.startAmount"
												:disabled="false"
												suffix="원 이상"
												style="width: 20rem"
											/>
											<eacc-amount-input
												v-model:value="item.endAmount"
												:disabled="false"
												suffix="원 미만"
												style="width: 20rem"
											/>
										</a-flex>
									</a-col>
								</a-row>
							</a-col>
						</a-row>
					</a-form-item>
				</a-form>
				<a-button
					type="primary"
					ghost
					:icon="materialIcons('mso', 'add_circle')"
					@click="onFinalLineAddition"
				>
					검인라인 추가
				</a-button>
			</a-col>
		</a-row>

		<a-modal
			centered
			width="60rem"
			v-model:open="errorModalOpen"
			title="오류"
			:destroy-on-close="true"
			:keyboard="false"
			:mask-closable="false"
		>
			<a-flex align="start" class="mb-lg" :gap="10">
				<component
					:is="materialIcons('mso', 'error')"
					class="text-error"
					style="font-size: 3rem"
				/>
				<a-flex vertical :gap="2">
					<a-typography-title :level="3" class="mb-sm">
						중복된 조건이 이미 존재합니다.
					</a-typography-title>
					<a-typography-text strong class="mb-sm">
						* 검인라인 조건은 중복될 수 없습니다. 하단의 중복된 조건을 참고하세요.
					</a-typography-text>
					<a-divider class="mb-sm mt-none" />

					<a-row
						:wrap="false"
						:gutter="10"
						:style="{
							width: '50rem',
							'max-height': '25rem',
							'overflow-y': 'auto',
						}"
					>
						<a-col flex="1">
							<a-descriptions
								class="mt-md mb-none"
								v-for="(approvals, approvalsIdx) in errorModelRef"
								bordered
								:key="approvalsIdx"
								:labelStyle="{ width: '12rem', paddingTop: '5px' }"
								:style="{ width: 'auto' }"
								:column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }"
							>
								<template #title>
									<a-typography-title :level="4" class="mb-none">
										검인라인명 : {{ approvals.checkLineName }}
									</a-typography-title>
								</template>
								<a-descriptions-item
									v-for="(
										costCenters, costCenterIdx
									) in approvals.checkLineCostCenterError"
									:label="costCenters.costCenterName"
									:key="costCenterIdx"
								>
									<a-typography-text strong>
										{{
											costCenters.checkLineApprovalFormError
												.map((form: LineApprovalFormError) => form.approvalFormTypeLabel)
												.join(", ")
										}}
									</a-typography-text>
								</a-descriptions-item>
							</a-descriptions>
						</a-col>
					</a-row>
				</a-flex>
			</a-flex>
			<template #footer>
				<a-button type="primary" @click="() => (errorModalOpen = false)">확인</a-button>
			</template>
		</a-modal>
	</a-modal>
</template>
