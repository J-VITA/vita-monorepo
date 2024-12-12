<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { Form } from "ant-design-vue"
import type { Response } from "@/types"
import type { RadioGroupProps, TreeProps } from "ant-design-vue"
import { type AccountItem, initData } from "@/types/master/accounts"

const useForm = Form.useForm
const managementOptions: RadioGroupProps["options"] = [
	{ label: "관리", value: true },
	{ label: "미관리", value: false },
]

const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const isEdit = ref<boolean>(false) // 수정상태
const isNew = ref<boolean>(false) // 신규저장상태
const isAdd = ref<boolean>(false) // 추가저장상태
const selectedKeys = ref<(string | number)[]>([])
const selectedNode = ref<any>()
const modelRef = ref<AccountItem>(Object.assign({}, initData))

const expandedKeys = ref<(string | number)[]>([])
const autoExpandParent = ref<boolean>(true)

const rulesRef = ref<any>({
	code: [
		{
			required: true,
			message: "계정코드는 필수입니다.",
			trigger: ["blur"],
		},
	],
	name: [
		{
			required: true,
			message: "비용항목명은 필수입니다.",
			trigger: ["blur"],
		},
	],
	expenseAccountTypeList: [
		{
			required: true,
			message: "지출유형을 하나이상 선택해주세요.",
			type: "array",
			trigger: ["blur"],
		},
	],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		refresh().finally(() => {
			treeData.value = filterTreeData(treeData.value, query)
		})
	}

	if (!query) {
		refresh()
	}
	oldValue = query
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	autoExpandParent.value = false
}

const onSelect: TreeProps["onSelect"] = (keys, info) => {
	selectedKeys.value = keys
	selectedNode.value = !info.node ? info : info.node

	if (keys.length === 0) {
		isEdit.value = true
		isNew.value = true
		resetFields()
		delete modelRef.value.parentId
	} else {
		isEdit.value = false
		isNew.value = false
		isAdd.value = false
		if (selectedNode.value.depth === 0) {
			delete modelRef.value.parentId
		}
		accountData("GET", Number(keys[0]))
	}
}

const {
	data: treeData,
	status: treeStatus,
	error,
	refresh,
} = await useAsyncData(`accounts-list`, () =>
	useCFetch<Response<any>>("/api/v2/master/accounts", {
		method: "GET",
	}).then((res: Response<any>) => res.data)
)

function parentName(id?: number): string {
	let name = ""

	const loop = (data: any): boolean => {
		if (data.id === id) {
			name = data.name
			return true // 해당 데이터를 찾았을 때 순회를 멈추기 위해 true 반환
		}

		if (data.children?.length) {
			return data.children.some((child: any) => loop(child)) // 자식 중에 찾으면 순회 종료
		}

		return false
	}

	treeData.value.some((e: any) => loop(e)) // 찾으면 순회 종료

	return name
}

const accountData = async (
	method: "GET" | "PATCH" | "DELETE",
	id?: number,
	data?: AccountItem
) => {
	await useCFetch<Response<any>>(`/api/v2/master/accounts/${id}`, {
		method: method,
		body: data ? data : null,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			if (method === "GET") Object.assign(modelRef.value, res.data)
			if (method === "PATCH") {
				isEdit.value = false
				refresh()
				onSelect([res.data.id], res.data)
			}
			if (method === "DELETE") {
				refresh()
				onSelect([treeData.value[0].id], treeData.value[0])
			}
		}
	})
}

const onAddManagement = () => {
	const fieldName = "ATTRIBUTE" + String(modelRef.value.managementItems.length + 1)
	modelRef.value.managementItems.push({
		companyCode: modelRef.value.companyCode ?? "",
		disabled: true,
		required: false,
		managementItemName: "",
		commonCode: "",
		orderSequence: modelRef.value.managementItems.length + 1,
		managementItemTypeName: "TEXT",
		managementItemFieldName: fieldName,
		alignmentDirectionTypeName: "LEFT",
		// defaultValue: '1000',
		// fixedLength: 100,
	})
}

const onDelete = (data: AccountItem) => {
	accountData("DELETE", data.id, data)
}

const onCancel = () => {
	isEdit.value = false
	isNew.value = false
	isAdd.value = false
	resetFields()
	const id = selectedKeys.value[0] ?? 1
	accountData("GET", Number(id))
}

const onAdd = () => {
	isEdit.value = true
	isAdd.value = true

	const newValue = Object.assign({}, initData, {
		depth: selectedNode.value.depth + 1,
		parentId: selectedNode.value.id,
		accountLevelLabel:
			selectedNode.value.accountLevelName === "GROUP" ? "ACCOUNT" : "SUB_ACCOUNT",
		managementItems: [],
	})

	resetFields(newValue)
}

const onSubmit = () => {
	validate()
		.then(async () => {
			let managementItemList: any[] = []
			modelRef.value.managementItems.forEach((e) => {
				const item = {
					...e,
					managementItemType: e.managementItemTypeName,
					managementItemField: e.managementItemFieldName,
					alignmentDirectionType: e.alignmentDirectionTypeName,
				}
				managementItemList.push(item)
			})

			if (isAdd.value || isNew.value) {
				await useCFetch<Response<any>>("/api/v2/master/accounts", {
					method: "POST",
					body: Object.assign({}, modelRef.value, {
						// managementItemFlag: true,
						accountLevel: modelRef.value.accountLevelLabel,
						managementItemList: managementItemList,
					}),
				}).then((res: any) => {
					if (res.status === 0) {
						refresh()
						isEdit.value = false
						isAdd.value = false
						isNew.value = false
						onSelect([res.data.id], res.data)
					}
				})
			} else {
				accountData(
					"PATCH",
					modelRef.value.id,
					Object.assign({}, modelRef.value, {
						managementItemFlag: true,
						accountLevel: modelRef.value.accountLevelName,
						managementItemList: managementItemList,
					})
				)
			}
		})
		.catch((err) => {
			console.error("error", err)
		})
}

onMounted(() => {
	isEdit.value = false
	isNew.value = false
	isAdd.value = false
	if (treeData.value) {
		expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "id").map(
			(x: any) => x.id
		)
		onSelect([treeData.value[0].id], treeData.value[0])
	}
})
</script>
<template>
	<a-row :gutter="[15, 15]">
		<a-col flex="32rem">
			<a-spin :spinning="treeStatus === 'pending'">
				<a-input-search
					class="mb-sm"
					v-model:value="searchValue"
					placeholder="검색"
					@input="onQueryChanged(searchValue)"
				/>
				<a-tree
					class="tree-limit"
					block-node
					:show-icon="true"
					:selectedKeys="selectedKeys"
					v-model:expanded-keys="expandedKeys"
					:auto-expand-parent="autoExpandParent"
					:default-expand-all="true"
					:tree-data="treeData"
					:field-names="{
						children: 'children',
						title: 'name',
						key: 'id',
					}"
					@select="onSelect"
					@expand="onExpand"
				>
					<template #icon="{ dataRef }">
						<template v-if="dataRef.accountLevelName === 'GROUP'">
							<component :is="materialIcons('m', 'folder')" class="text-warning" />
						</template>
						<template v-else>
							<component :is="materialIcons('mso', 'description')" />
						</template>
					</template>

					<template #title="{ name }">
						<span v-if="name.indexOf(searchValue) > -1">
							{{ name.substring(0, name.indexOf(searchValue)) }}
							<span class="text-error">{{ searchValue }}</span>
							{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
						</span>
						<span v-else>{{ name }}</span>
					</template>
				</a-tree>
			</a-spin>
		</a-col>
		<a-col flex="1rem">
			<a-divider type="vertical" class="full-height mx-none" />
		</a-col>
		<a-col flex="1">
			<a-flex
				gap="small"
				justify="space-between"
				align="center"
				class="mb-md"
				wrap="wrap"
			>
				<a-typography-title :level="4" class="page-title">
					계정/비용 세부정보
				</a-typography-title>
				<a-space :size="5">
					<a-button
						ghost
						type="primary"
						:icon="materialIcons('mso', 'add')"
						v-if="isEdit && isNew"
						@click="onSubmit"
					>
						신규생성
					</a-button>
					<a-button
						v-if="
							!isEdit &&
							(modelRef.accountLevelName === 'ACCOUNT' ||
								modelRef.accountLevelName === 'GROUP')
						"
						:icon="materialIcons('mso', 'add_circle')"
						@click="onAdd"
					>
						추가
					</a-button>
					<eacc-button
						component-is="delete"
						:data="selectedNode"
						:modal-open="true"
						@click="onDelete"
						v-if="!isEdit"
					/>
					<a-button
						v-if="isEdit && !isNew"
						danger
						:icon="materialIcons('mso', 'cancel')"
						@click="onCancel"
						>취소</a-button
					>
					<a-button
						v-if="isEdit && !isNew"
						type="primary"
						:icon="materialIcons('mso', 'save')"
						@click.prevent="onSubmit"
					>
						저장
					</a-button>
					<a-button
						v-if="!isEdit"
						type="primary"
						:icon="materialIcons('mso', 'edit')"
						@click="() => (isEdit = true)"
						>수정</a-button
					>
				</a-space>
			</a-flex>
			<a-form :disabled="!isEdit">
				<a-descriptions
					bordered
					size="small"
					:column="2"
					:labelStyle="{ width: '15%' }"
					:contentStyle="{ width: '35%' }"
				>
					<a-descriptions-item>
						<template #label>
							<span class="text-error" v-if="isEdit">*</span>
							계정코드
						</template>
						<template v-if="!isEdit">{{ modelRef.code }}</template>
						<a-form-item v-bind="validateInfos.code" v-else>
							<a-input v-model:value="modelRef.code" :disabled="!(isAdd || isNew)" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="상위계정">
						<template v-if="!isEdit">
							{{ parentName(modelRef.parentId) }}
						</template>
						<a-form-item v-else>
							<a-input :value="parentName(modelRef.parentId)" disabled />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label>
							<span class="text-error" v-if="isEdit">*</span>
							비용항목명
						</template>
						<template v-if="!isEdit">{{ modelRef.name }}</template>
						<a-form-item v-bind="validateInfos.name" v-else>
							<a-input v-model:value="modelRef.name" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="계정레벨">
						<template v-if="!isEdit">{{ modelRef.accountLevelLabel }}</template>
						<a-form-item v-else>
							<eacc-select
								url="/api/v2/master/accounts/types/accountLevels"
								v-model:value="modelRef.accountLevelLabel"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
								@update:value="(value) => (modelRef.accountLevelLabel = value)"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="설명" :span="2">
						<template v-if="!isEdit">{{ modelRef.description }}</template>
						<a-form-item v-else>
							<a-input v-model:value="modelRef.description" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="사용여부">
						<template v-if="!isEdit">{{ modelRef.used ? "사용중" : "미사용" }}</template>
						<a-form-item v-else>
							<a-switch v-model:checked="modelRef.used" size="small" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label>
							<span class="text-error" v-if="isEdit">*</span>
							지출유형
						</template>
						<a-form-item v-bind="validateInfos.expenseAccountTypeList">
							<a-checkbox-group
								v-model:value="modelRef.expenseAccountTypeList"
								:options="[
									{ label: '개인경비', value: 'PERSONAL_EXPENSE' },
									{ label: '법인카드', value: 'CARD' },
									{ label: '세금계산서', value: 'BILL_INVOICE' },
								]"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="경비지출계정">
						<template v-if="!isEdit">{{
							modelRef.expenseAccountFlag ? "대상" : "비대상"
						}}</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.expenseAccountFlag"
								:options="[
									{ label: '대상', value: true },
									{ label: '비대상', value: false },
								]"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="전표입력계정">
						<template v-if="!isEdit">
							{{ modelRef.slipInputFlag ? "가능" : "불가능" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.slipInputFlag"
								:options="[
									{ label: '가능', value: true },
									{ label: '불가능', value: false },
								]"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="예산관리">
						<template v-if="!isEdit">
							{{ modelRef.budgetFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.budgetFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="미결관리">
						<template v-if="!isEdit">
							{{ modelRef.undecidedFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.undecidedFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="차대변관리">
						<template v-if="!isEdit">
							{{ modelRef.debitAndCreditFlag ? "차변" : "대변" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.debitAndCreditFlag"
								:options="[
									{ label: '차변', value: true },
									{ label: '대변', value: false },
								]"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="거래처관리">
						<template v-if="!isEdit">
							{{ modelRef.customerFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.customerFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="외화관리">
						<template v-if="!isEdit">
							{{ modelRef.foreignCurrencyFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.foreignCurrencyFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="부가세관리">
						<template v-if="!isEdit">
							{{ modelRef.taxFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.taxFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="선급금">
						<template v-if="!isEdit">
							{{ modelRef.advancePaymentsFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.advancePaymentsFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="선수금">
						<template v-if="!isEdit">
							{{ modelRef.advanceReceivedFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.advanceReceivedFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="ERP계정여부" :span="2">
						<template v-if="!isEdit">
							{{ modelRef.erpAccountFlag ? "관리" : "미관리" }}
						</template>
						<a-form-item v-else>
							<a-radio-group
								v-model:value="modelRef.erpAccountFlag"
								:options="managementOptions"
							/>
						</a-form-item>
					</a-descriptions-item>
				</a-descriptions>

				<section class="mt-xl">
					<a-flex :gap="10" class="mb-md">
						<a-space :size="3">
							<a-typography-text>관리항목</a-typography-text>
							<a-popover placement="right">
								<template #content>
									<p>사용함으로 설정하면, 해당 계정항목이 선택되었을때</p>
									<p>관리가 필요한 항목들을 추가로 입력할 수 있습니다.</p>
								</template>
								<component :is="materialIcons('m', 'help')" class="popover-help" />
							</a-popover>
						</a-space>
						<a-button
							size="small"
							type="primary"
							ghost
							:icon="materialIcons('mso', 'add_circle')"
							@click="onAddManagement"
						>
							관리항목추가
						</a-button>
					</a-flex>
					<template v-for="(item, idx) in modelRef.managementItems" :key="idx">
						<a-flex
							align="top"
							justify="space-between"
							:class="['row-box', { disabled: !isEdit }]"
							v-if="modelRef.managementItems[idx]"
						>
							<a-flex wrap="wrap" justify="space-between" class="full-width mr-sm">
								<a-space>
									<a-input-number v-model:value="item.orderSequence" :min="1" />
									<eacc-select
										url="/api/v2/master/managementItems/types/managementItemFields"
										v-model:value="item.managementItemFieldName"
										:field-names="{ label: 'label', value: 'code' }"
										:on-all-field="false"
										:disabled="!isEdit"
										@update:value="(value: any) => (item.managementItemFieldName = value)"
									/>
									<a-input
										style="width: initial"
										v-model:value="item.managementItemName"
										placeholder="항목명"
									/>
									<a-space>
										<eacc-select
											url="/api/v2/master/managementItems/types/managementItemTypes"
											v-model:value="item.managementItemTypeName"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											:disabled="!isEdit"
											@update:value="
												(value: any) => (item.managementItemTypeName = value)
											"
										/>
										<a-input
											v-if="item.managementItemTypeName === 'CODE'"
											v-model:value="item.commonCode"
											placeholder="공통코드명"
										/>
									</a-space>
									<eacc-select
										v-if="item.managementItemTypeName === 'TEXT'"
										url="/api/v2/master/managementItems/types/alignmentDirectionTypes"
										v-model:value="item.alignmentDirectionTypeName"
										:field-names="{ label: 'label', value: 'code' }"
										:on-all-field="false"
										:disabled="!isEdit"
										@update:value="
											(value: any) => (item.alignmentDirectionTypeName = value)
										"
									/>
								</a-space>
								<a-space>
									<a-checkbox v-model:checked="item.required">필수입력</a-checkbox>
									<a-space :size="4" align="center">
										<a-switch v-model:checked="item.disabled" size="small" />
										<span>사용여부</span>
									</a-space>
								</a-space>
							</a-flex>

							<a-button
								v-if="isEdit || isAdd"
								style="min-width: 3.2rem"
								ghost
								danger
								:icon="materialIcons('mso', 'remove_circle_outline')"
								@click="() => modelRef.managementItems.splice(idx, 1)"
							/>
						</a-flex>
					</template>
				</section>
			</a-form>
		</a-col>
	</a-row>
</template>
