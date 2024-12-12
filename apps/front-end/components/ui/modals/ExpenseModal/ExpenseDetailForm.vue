<script setup lang="ts">
import { TreeSelect } from "ant-design-vue"
import {
	type EntityslipHeader,
	FormType,
	Slip,
	UpdatedWriterInfo,
	WriterInfo,
	SlipDetails,
	SlipTaxType,
	SlipDivisionType,
} from "@/types/expenses"

import { type Response, SlipType } from "@/types"
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { deduplicateTreeNodes } from "@/utils"

const { formState, isRead, isLoading, formSlipType, initState } = defineProps<{
	initState: Slip
	formState: Slip
	isRead: boolean
	isLoading: boolean
	formSlipType: SlipType
}>()

const emit = defineEmits<{
	(e: "update:totalAmount", value: number): number
	(e: "update:supplyAmount", value: number): number
	(e: "update:taxAmount", value: number): number
	(e: "update:modifyFlag", value: any): any
	(e: "update:description", value: string): string
}>()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const SHOW_ALL = TreeSelect.SHOW_ALL
const accountTreeData = ref<any[]>([])
const taxInfoData = ref<any>([])
const taxRate = ref<number>(0)
const isTaxDirectChange = ref<boolean>(false)
const accountChangeCnt = ref<number>(0)

const fetchAccountData = async (params: {
	costCenterId?: number
	employeeId?: number
}) => {
	return await useCFetch<Response<any>>("/api/v2/slip/expenses/account", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			...(isRead ? {} : params),
		},
	}).then((res: Response<any>) => {
		const data = res.data || []
		return deduplicateTreeNodes(data)
	})
}

const fetchExpenseTax = async () => {
	await useCFetch<Response<any>>("/api/v2/master/taxes", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			page: 0,
			size: 9999,
		},
	}).then((res: Response<any>) => {
		taxInfoData.value = res.data || []
	})
}

interface TreeNode {
	id: string
	name: string
	children?: TreeNode[]
	[key: string]: any // 다른 속성들을 허용하기 위한 인덱스 시그니처
}

const onChangeTree = async (item: any, obj: any, key: number) => {
	if (obj.managementItemFlag) {
		//관리항목 flag
		const managementItems = await useCFetch<Response<any>>(
			`/api/v2/master/managementItems`,
			{
				method: "GET",
				params: {
					companyCode: getCompanyCode.value,
					accountId: item,
				},
			}
		).then(
			(res: Response<any>) =>
				res.data
					.filter((a: any) => a.disabled)
					.sort((a: any, b: any) => a.orderSequence - b.orderSequence) || []
		)

		formState.entityslipHeader.managementItems = managementItems
		formState.slipDetails[key].taxCode =
			!!obj && obj.nonDeduction ? SlipTaxType.NON_DEDUCTION : SlipTaxType.DEDUCTION
		console.log("managementItems ", managementItems)
	}
	formState.slipDetails[key].accountChangeCnt = accountChangeCnt.value++
	if (
		formState.slipDetails[key].accountChangeCnt < 2 &&
		!!formState.slipDetails[key].supplyAmount
	)
		setTexRate(key)
}

const setTexRate = (key: number) => {
	if (!!formState.slipDetails && formState.slipDetails.length > 0) {
		const form = formState.slipDetails[key]
		const divisionFlag = formState.entityslipHeader.divisionSlipFlag
		const taxType =
			form.taxCode === "A" || form.taxCode === SlipTaxType.NON_DEDUCTION
				? SlipTaxType.NON_DEDUCTION
				: SlipTaxType.DEDUCTION
		const divisionType = divisionFlag
			? SlipDivisionType.CARD_DIVISION
			: SlipDivisionType.CARD
		taxRate.value = taxInfoData.value.filter(
			(x: any) =>
				x.deductionTypeName === taxType && x.slipEvidenceTypeCode === divisionType
		)[0].rate //세금 공제율 계산

		if (taxRate.value > 0 && !isTaxDirectChange.value) {
			// 공제이고 직접수정 아닐 경우
			form.taxAmount = ((form.supplyAmount as number) * taxRate.value) / 100
			if (divisionFlag) form.supplyAmount = (form.supplyAmount as number) - form.taxAmount
		}
		if (taxRate.value === 0 && form.taxAmount) {
			// 불공제
			form.supplyAmount = (form.supplyAmount as number) + form.taxAmount
			form.taxAmount = 0
		}
	}
}

const descriptionContext = (e: any) => {
	emit("update:description", e.target.value)
}

const amountUpdate = (key?: number) => {
	const divisionFlag = formState.entityslipHeader.divisionSlipFlag
	if (key !== undefined && !divisionFlag) setTexRate(key)
	const taxAmount = formState.slipDetails
		?.map((x: any) => x.taxAmount || 0)
		?.reduce((prev, next) => {
			return prev + next
		}, 0)
	const supplyAmount = formState.slipDetails
		?.map((x: any) => x.supplyAmount || 0)
		?.reduce((prev, next) => {
			return prev + next
		}, 0)
	const divisionType = divisionFlag
		? SlipDivisionType.CARD_DIVISION
		: SlipDivisionType.CARD
	if (!formState.entityslipHeader.id || !divisionType.includes("CARD"))
		emit("update:totalAmount", taxAmount + supplyAmount)
	emit("update:supplyAmount", supplyAmount)
	emit("update:taxAmount", taxAmount)
}

const updateDirectModify = (check: any, idx: number) => {
	isTaxDirectChange.value = check.target.checked
	if (check.target.checked) {
	} else {
		//['slipDetails', idx, 'taxAmount']
		if (!formState.slipDetails?.[idx].totalAmount) {
			amountUpdate()
			emit("update:modifyFlag", ["slipDetails", idx, "taxAmount"])
		}
		// props.formRef?.resetFields([
		// ['slipDetails', idx, 'taxAmount']
		// ] as any)
	}
}

// const getFullLabel = (node: any): TreeSelectProps['treeNodeLabelProp'] => {
//   console.log(" node ", node)
//   return node
// }

const onSetTaxAmount = (value: any, key: number) => {
	// A: '불공제', B: '공제'
	const form = formState.slipDetails[key]
	const initialForm = initState.slipDetails[key] // initialState는 부모로부터 받은 초기 데이터
	if (form.supplyAmount === undefined) return

	const divisionFlag = formState.entityslipHeader.divisionSlipFlag
	const divisionType = divisionFlag
		? SlipDivisionType.CARD_DIVISION
		: SlipDivisionType.CARD
	if (divisionType === SlipDivisionType.CARD) {
		//일반 지출 작성 화면
		form.supplyAmount = initialForm.supplyAmount || 0
		form.taxAmount = initialForm.taxAmount || 0
		if (value.code === SlipTaxType.NON_DEDUCTION || value.code === "A") {
			// 불공제 선택
			// 공급가액 = 기존 공급가액 + 부가세액
			if (form.supplyAmount && form.taxAmount) {
				form.supplyAmount = form.supplyAmount + form.taxAmount
				form.taxAmount = 0 // 부가세는 0으로 설정
				form.taxCode = "A"
			}
		}
		if (value.code === SlipTaxType.DEDUCTION || value.code === "B") {
			// 공제 선택
			// 처음 부모로 받은 formState의 값을 그대로 세팅
			if (initState.slipDetails && initState.slipDetails.length > 0) {
				form.supplyAmount = initialForm.supplyAmount
				form.taxAmount = initialForm.taxAmount
				form.taxCode = "B"
			}
		}
	}
	if (divisionType === SlipDivisionType.CARD_DIVISION) {
		// 분할 지출 작성 화면
		form.supplyAmount = 0
		form.taxAmount = 0
		form.accountChangeCnt = 0
		setTexRate(key)
	}
}

const detailWriterUpdate = (values: WriterInfo[]): UpdatedWriterInfo => {
	const [firstValue] = values

	if (!firstValue) {
		throw new Error("Writer information is missing")
	}

	return {
		employee: values.map((v) => v.id),
		employeeId: firstValue.id,
		workplaceCode: firstValue.workplaceCode,
		costCenterId: firstValue.costCenterId,
	}
}

const removeExpenseDetail = (idx: number) => {
	Modal.confirm({
		title: "해당 지출내역을 삭제하시겠습니까?",
		icon: createVNode(ExclamationCircleOutlined),
		okType: "primary",
		type: "error",
		okText: "확인",
		cancelText: "취소",
		centered: true,
		onOk() {
			nextTick(() => {
				if (formState.slipDetails && formState.slipDetails.length > 1) {
					formState.slipDetails.splice(idx, 1)
					if (formState.slipDetails.length === 1) {
						formState.entityslipHeader.divisionSlipFlag = false
					}
					amountUpdate()
				}
			})
		},
	})
}

const prevValues = ref<
	Array<{ costCenterId?: number | null; employeeId?: number | null }>
>([])

watch(
	() => formState.slipDetails,
	(newList) => {
		if (newList) {
			const fetchData = async () => {
				const newAccountTreeData = [...accountTreeData.value]
				for (let index = 0; index < newList.length; index++) {
					const item = newList[index]
					const prevValue = prevValues.value[index] || {}
					if (
						item.costCenterId !== prevValue.costCenterId ||
						item.employeeId !== prevValue.employeeId
					) {
						const params: { costCenterId?: number; employeeId?: number } = {}
						if (item.costCenterId) params.costCenterId = item.costCenterId
						if (item.employeeId) params.employeeId = item.employeeId

						if (Object.keys(params).length > 0) {
							newAccountTreeData[index] = await fetchAccountData(params)
						} else {
							newAccountTreeData[index] = null
							// formState.slipDetails[index].accountId = undefined;
						}

						prevValues.value[index] = { ...item }
					}
				}
				accountTreeData.value = newAccountTreeData
				console.log("newAccountTreeData: ", newAccountTreeData)
			}
			fetchData()
		}
	},
	{ deep: true }
)

onMounted(async () => {
	if (formState.slipDetails && formState.slipDetails.length > 0) {
		const newAccountTreeData = []
		for (const [index, item] of formState.slipDetails.entries()) {
			formState.slipDetails[index].employee = [item.employeeId as number]
			const params: { costCenterId?: number; employeeId?: number } = {}
			if (item.costCenterId) params.costCenterId = item.costCenterId
			if (item.employeeId) params.employeeId = item.employeeId
			console.log("item.costCenterId : ", item.costCenterId)
			newAccountTreeData[index] = await fetchAccountData(params)
		}
		accountTreeData.value = newAccountTreeData
		fetchExpenseTax()
	}
})
</script>
<template>
	<template v-if="!!formState.entityslipHeader.divisionSlipFlag">
		<a-row :gutter="40">
			<a-divider type="horizontal" class="full-height mt-sm mb-md" />
			<a-col
				class="ml-lg"
				:span="11"
				v-for="(form, key) in formState.slipDetails"
				:key="key"
			>
				<a-divider v-if="key > 1" direction="horizontal" class="mt-sm mb-md"></a-divider>

				<a-flex justify="space-between" wrap="wrap" class="mb-md">
					<a-space :size="3">
						<a-typography-title :level="5" class="ml-none mb-md"
							>분할 지출정보{{ key + 1 }}</a-typography-title
						>
					</a-space>
					<a-button
						danger
						size="small"
						v-if="key > 0"
						@click="() => removeExpenseDetail(key)"
					>
						<stop-outlined></stop-outlined>
					</a-button>
				</a-flex>
				<a-form-item
					v-if="formState.entityslipHeader.divisionSlipFlag"
					label="참석자"
					has-feedback
					:name="['slipDetails', key, 'employee']"
					:rules="[
						{
							type: 'array',
							required: true,
							message: '필수 입력값 입니다.',
						},
					]"
				>
					<eacc-select-table
						v-model:value="form.employee"
						:disabled="isRead"
						key-props="id"
						label-prop="name"
						url="/api/v2/slips/commons/employees"
						:columns="[
							{ title: '회사', data: (row: any) => row.companyName },
							{ title: 'id', data: (row: any) => row.id },
							{ title: '사업장', data: (row: any) => row.workplaceName },
							{
								title: '코스트센터',
								data: (row: any) => row.costCenterName,
							},
							{ title: '직위', data: (row: any) => row.gradeName },
							{ title: '이름', data: (row: any) => row.name },
						]"
						@selection-change="
							(value: any) => {
								if (isLoading && !isRead && value && value.length > 0) {
									const {
										employee: a,
										employeeId: b,
										workplaceCode: c,
										costCenterId: d,
									} = detailWriterUpdate(value)
									form.employee = a
									form.employeeId = b
									form.workplaceCode = c
									form.costCenterId = formState.slipDetails[key].costCenterId || d
									if (!formState.entityslipHeader.id) form.accountId = undefined
								}
							}
						"
						@remove="
							(value: any) => {
								form.employee = []
								form.employeeId = undefined
								form.costCenterId = -1
								accountTreeData[key] = []
								form.workplaceCode = undefined
								form.accountId = undefined
							}
						"
					/>
				</a-form-item>

				<!-- TODO: 1. API 제공받아 작성해야함 2. 법인카드의 경우 과세유형이 업종에 따라 결정되지만 계정항목이 불공제이면 과세유형은 불공제로 세팅 3. 업종이 공제, 계정항목이 불공제라면 세액이 0로 빠지고, 세액만큼 공급가액을 합산해줘야함 -->
				<a-form-item
					label="과세유형"
					:name="['slipDetails', key, 'taxCode']"
					:rules="[
						{
							required: true,
							message: '필수 입력값 입니다.',
						},
					]"
				>
					<eacc-select
						url="/api/v2/slip/expenses/types/deductionTypes"
						placeholder="과세유형을 선택하세요."
						v-model:value="form.taxCode"
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="false"
						value-type="any"
						:disabled="formSlipType === SlipType.PERSONAL_EXPENSE"
						@update:any-value="(value: any) => onSetTaxAmount(value, key)"
					/>
				</a-form-item>

				<a-form-item
					label="공급가액"
					:name="['slipDetails', key, 'supplyAmount']"
					:rules="[
						{
							required: true,
							message: '필수 입력값 입니다.',
						},
						{
							type: 'number',
							min: 1,
							message: '0 이상 이어야합니다.',
						},
					]"
				>
					<eacc-amount-input
						v-model:value="form.supplyAmount"
						@update:value="amountUpdate(key)"
						:disabled="isRead"
					/>
				</a-form-item>
				<a-form-item label="부가세" class="mb-none">
					<a-flex :gap="5" justify="space-between">
						<a-form-item
							class="full-width"
							:name="['slipDetails', key, 'taxAmount']"
							:rules="[
								{
									required: form.isDirectModify,
									message: '필수 입력값 입니다.',
								},
							]"
						>
							<eacc-amount-input
								v-model:value="form.taxAmount"
								@update:value="amountUpdate(key)"
								:disabled="!form.isDirectModify"
							/>
						</a-form-item>
						<a-form-item style="width: 8rem">
							<a-checkbox
								v-model:checked="form.isDirectModify"
								@change="(check: any) => updateDirectModify(check, key)"
							>
								직접수정
							</a-checkbox>
						</a-form-item>
					</a-flex>
				</a-form-item>

				<a-form-item
					label="내용"
					:name="['slipDetails', key, 'description']"
					:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
				>
					<a-input v-model:value="form.description" @change="descriptionContext" />
				</a-form-item>
				<a-form-item
					label="코스트센터"
					:name="['slipDetails', key, 'costCenterId']"
					:rules="[
						{
							required: true,
							message: '필수 입력값 입니다.',
						},
					]"
				>
					<eacc-select
						v-model:value="form.costCenterId"
						:url="`/api/v2/slip/expenses/costCenter?employeeId=${form.employeeId}`"
						:params="{
							companyCode: getCompanyCode,
							employeeId: form.employeeId,
						}"
						placeholder="코스트센터를 선택해주세요."
						:refresh="form.employeeId ? true : false"
						:field-names="{ label: 'name', value: 'id' }"
						:on-all-field="false"
						:disabled="isRead"
					/>
				</a-form-item>

				<a-form-item
					label="계정항목"
					:name="['slipDetails', key, 'accountId']"
					:rules="[
						{
							required: true,
							message: '필수 입력값 입니다.',
						},
					]"
				>
					<a-tree-select
						v-model:value="form.accountId"
						show-search
						:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
						placeholder="계정항목을 선택해주세요."
						:allow-clear="false"
						tree-default-expand-all
						:show-checked-strategy="SHOW_ALL"
						:tree-data="accountTreeData[key]"
						:tree-line="true"
						:field-names="{
							children: 'children',
							label: 'name',
							value: 'id',
						}"
						tree-node-filter-prop="name"
						@select="(value: any, option: any) => onChangeTree(value, option, key)"
					>
					</a-tree-select>
				</a-form-item>
				<a-form-item
					v-for="(item, index) in formState.entityslipHeader.managementItems"
					:key="item.id"
					:label="item.managementItemName"
					:name="['managementItems', index, 'value']"
					:rules="{
						required: item.required,
						message: '필수 입력값 입니다.',
					}"
				>
					<a-input
						v-model:value="item.value"
						v-if="item.managementItemTypeName === FormType.TEXT"
						:placeholder="item.managementItemFieldName"
					/>
					<a-date-picker
						v-model:value="item.value"
						v-if="item.managementItemTypeName === FormType.DATE"
						:placeholder="item.managementItemFieldName"
					/>
					<a-input
						v-model:value="item.value"
						v-if="item.managementItemTypeName === FormType.CODE"
						:placeholder="item.managementItemFieldName"
					/>
				</a-form-item>

				<a-form-item label="프로젝트">
					<eacc-select
						placeholder="프로젝트를 선택해주세요 (선택)"
						url="/api/v2/slips/commons/projects"
						:params="{
							companyCode: getCompanyCode,
							employeeId: form.employeeId,
							used: true,
							page: 0,
							size: 1000,
						}"
						v-model:value="form.projectId"
						:field-names="{ label: 'name', value: 'id' }"
						:on-all-field="false"
						:disabled="isRead"
						@update:value="(value: any) => (form.projectId = value)"
					/>
				</a-form-item>

				<a-form-item label="사업장">
					<eacc-select
						v-if="getCompanyCode"
						:url="`/api/v2/slips/commons/companies`"
						:params="{
							code: getCompanyCode,
							placeType: 'WORKPLACE',
							page: 0,
							size: 1000,
						}"
						:on-all-field="false"
						v-model:value="form.workplaceCode"
						refresh
						:field-names="{ label: 'name', value: 'workplaceCode' }"
						placeholder="사업장을 선택해주세요 (선택)"
						value-type="any"
						@update:any-value="
							(value: any) => {
								form.workplaceId = value.id
								form.workplaceCode = value.workplaceCode
							}
						"
						:disabled="isRead"
					>
					</eacc-select>
				</a-form-item>
			</a-col>
		</a-row>
	</template>
	<template v-else>
		<div v-for="(form, key) in formState.slipDetails" :key="key">
			<!-- TODO: 1. API 제공받아 작성해야함 2. 법인카드의 경우 과세유형이 업종에 따라 결정되지만 계정항목이 불공제이면 과세유형은 불공제로 세팅 3. 업종이 공제, 계정항목이 불공제라면 세액이 0로 빠지고, 세액만큼 공급가액을 합산해줘야함 -->
			<a-form-item
				label="과세유형"
				:name="['slipDetails', key, 'taxCode']"
				:rules="[
					{
						required: true,
						message: '필수 입력값 입니다.',
					},
				]"
			>
				<eacc-select
					url="/api/v2/slip/expenses/types/deductionTypes"
					placeholder="과세유형을 선택하세요."
					v-model:value="form.taxCode"
					:field-names="{ label: 'label', value: 'code' }"
					:on-all-field="false"
					value-type="any"
					:disabled="formSlipType === SlipType.PERSONAL_EXPENSE"
					@update:any-value="(value: any) => onSetTaxAmount(value, key)"
				/>
			</a-form-item>

			<a-form-item
				label="공급가액"
				:name="['slipDetails', key, 'supplyAmount']"
				:rules="[
					{
						required: true,
						message: '필수 입력값 입니다.',
					},
					{
						type: 'number',
						min: 1,
						message: '0 이상 이어야합니다.',
					},
				]"
			>
				<eacc-amount-input
					v-model:value="form.supplyAmount"
					@update:value="amountUpdate(key)"
					:disabled="isRead"
				/>
			</a-form-item>
			<a-form-item label="부가세" class="mb-none">
				<a-flex :gap="5" justify="space-between">
					<a-form-item
						class="full-width"
						:name="['slipDetails', key, 'taxAmount']"
						:rules="[
							{
								required: form.isDirectModify,
								message: '필수 입력값 입니다.',
							},
						]"
					>
						<eacc-amount-input
							v-model:value="form.taxAmount"
							@update:value="amountUpdate(key)"
							:disabled="!form.isDirectModify"
						/>
					</a-form-item>
					<a-form-item style="width: 8rem">
						<a-checkbox
							v-model:checked="form.isDirectModify"
							@change="(check: any) => updateDirectModify(check, key)"
						>
							직접수정
						</a-checkbox>
					</a-form-item>
				</a-flex>
			</a-form-item>

			<a-form-item
				label="내용"
				:name="['slipDetails', key, 'description']"
				:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
			>
				<a-input v-model:value="form.description" @change="descriptionContext" />
			</a-form-item>
			<a-form-item
				label="코스트센터"
				:name="['slipDetails', key, 'costCenterId']"
				:rules="[
					{
						required: true,
						message: '필수 입력값 입니다.',
					},
				]"
			>
				<eacc-select
					:url="`/api/v2/slip/expenses/costCenter?employeeId=${form.employeeId}`"
					:params="{
						companyCode: getCompanyCode,
						employeeId: form.employeeId,
					}"
					v-model:value="form.costCenterId"
					placeholder="코스트센터를 선택해주세요."
					:refresh="form.employeeId ? true : false"
					first
					:field-names="{ label: 'name', value: 'id' }"
					:on-all-field="false"
					:disabled="isRead"
				/>
			</a-form-item>

			<a-form-item
				label="계정항목"
				:name="['slipDetails', key, 'accountId']"
				:rules="[
					{
						required: true,
						message: '필수 입력값 입니다.',
					},
				]"
			>
				<a-tree-select
					v-model:value="form.accountId"
					show-search
					:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
					placeholder="계정항목을 선택해주세요."
					:allow-clear="false"
					tree-default-expand-all
					:show-checked-strategy="SHOW_ALL"
					:tree-data="accountTreeData[key]"
					:tree-line="true"
					:field-names="{
						children: 'children',
						label: 'name',
						value: 'id',
					}"
					tree-node-filter-prop="name"
					@select="(value: any, option: any) => onChangeTree(value, option, key)"
				>
				</a-tree-select>
			</a-form-item>
			<a-form-item
				v-for="(item, index) in formState.entityslipHeader.managementItems"
				:key="item.id"
				:label="item.managementItemName"
				:name="['managementItems', index, 'value']"
				:rules="{
					required: item.required,
					message: '필수 입력값 입니다.',
				}"
			>
				<a-input
					v-model:value="item.value"
					v-if="item.managementItemTypeName === FormType.TEXT"
					:placeholder="item.managementItemFieldName"
				/>
				<a-date-picker
					v-model:value="item.value"
					v-if="item.managementItemTypeName === FormType.DATE"
					:placeholder="item.managementItemFieldName"
				/>
				<a-input
					v-model:value="item.value"
					v-if="item.managementItemTypeName === FormType.CODE"
					:placeholder="item.managementItemFieldName"
				/>
			</a-form-item>

			<a-form-item label="프로젝트">
				<eacc-select
					placeholder="프로젝트를 선택해주세요 (선택)"
					url="/api/v2/slips/commons/projects"
					:params="{
						companyCode: getCompanyCode,
						employeeId: form.employeeId,
						used: true,
						page: 0,
						size: 1000,
					}"
					refresh
					v-model:value="form.projectId"
					:field-names="{ label: 'name', value: 'id' }"
					:on-all-field="false"
					:disabled="isRead"
					@update:value="(value: any) => (form.projectId = value)"
				/>
			</a-form-item>

			<a-form-item label="사업장">
				<eacc-select
					v-if="getCompanyCode"
					:url="`/api/v2/slips/commons/companies`"
					:params="{
						code: getCompanyCode,
						placeType: 'WORKPLACE',
						page: 0,
						size: 1000,
					}"
					:on-all-field="false"
					v-model:value="form.workplaceCode"
					refresh
					:field-names="{ label: 'name', value: 'workplaceCode' }"
					value-type="any"
					placeholder="사업장을 선택해주세요 (선택)"
					@update:any-value="
						(value: any) => {
							form.workplaceId = value.id
							form.workplaceCode = value.workplaceCode
						}
					"
					:disabled="isRead"
				>
				</eacc-select>
			</a-form-item>
		</div>
	</template>
</template>
