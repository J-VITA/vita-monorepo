<script setup lang="ts">
import type { Response } from "@/types"
import type { TreeProps, FormInstance } from "ant-design-vue"

const showFuelsModal = ref<boolean>(false)
const copyTreeData = ref<any[]>([])
const checkedKeys = ref<number[]>([])
const expandedKeys = ref<(string | number)[]>([])
const searchValue = ref<string>("")
const autoExpandParent = ref<boolean>(true)
const accountParams = ref<{ accountId: number; halfChecked: boolean }[]>()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

/** 모달 오픈 */
const showModal = () => {
	showFuelsModal.value = true
}

/** 계정항목 저장 */
const onSubmit = () => {
	useCFetch<Response<any>>("/api/v2/masters/accounts", {
		method: "POST",
		body: accountParams.value,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			showFuelsModal.value = false
			message.success("저장하였습니다.")
		} else {
			message.error(res.message)
		}
	})
}

/** 계정항목 조회 */
const {
	data: fuelsAccountData,
	status: fuelsAccountStatus,
	refresh: fuelsAccountRefresh,
} = await useAsyncData(`fuels-accounts-list`, () =>
	useCFetch<Response<any>>("/api/v2/masters/oils/account", {
		method: "GET",
	}).then((res: Response<any>) => res.data)
)

/** 계정항목 조회 */
const {
	data: treeData,
	status: treeStatus,
	refresh,
} = await useAsyncData(`accounts-tree-list-travel-expense`, () =>
	useCFetch<Response<any>>("/api/v2/masters/accounts", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
		},
	}).then((res: Response<any>) => {
		copyTreeData.value = res.data
		return res.data
	})
)

/**
 * 트리 필터링 New (keyup 이벤트)
 * @param e Keyboard Event
 */
const onQueryChanged = (e: any) => {
	e.preventDefault()

	const getMatchingKeysInList = (flatTree: any[]) => {
		const ids = accountParams.value?.filter((account) => !account.halfChecked)
		return ids
			?.filter((x) => flatTree.some((e) => e.id === x.accountId)) // ids의 id가 flatTree에 있는지 확인
			.map((x) => x.accountId) // 일치하는 id만 반환
	}

	searchValue.value = e.target.value
	if ((isHangulComplete(e.target.value) && e.isComposing) || isNumeric(e.target.value)) {
		copyTreeData.value = filterTreeData(treeData.value, e.target.value)
	}
	if (e.target.value === "") {
		copyTreeData.value = treeData.value
	}

	// 검색되는 트리 리스트에 따라 체크키 변동
	checkedKeys.value =
		getMatchingKeysInList(transformTreeToFlatArray(copyTreeData.value)) || []
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	autoExpandParent.value = false
}

const onCheck: TreeProps["onCheck"] = (keys, info) => {
	let checkList: any[] = []

	Array.from(keys as []).map((x) => checkList.push({ id: x, halfChecked: false }))

	Array.from(info.halfCheckedKeys as []).map((x) =>
		checkList.push({ id: x, halfChecked: true })
	)

	accountParams.value = checkList
}

const initModalData = () => {
	accountParams.value = []
	checkedKeys.value = []
}

watch(
	() => showFuelsModal.value,
	(value) => {
		if (value) {
			initModalData()
			searchValue.value = ""
			refresh()
			if (treeData.value) {
				expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "id").map(
					(x: any) => x.id
				)
			}
		}
	}
)
</script>

<template>
	<page-layout>
		<template #content>
			<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
				<a-col></a-col>
				<a-col>
					<a-space :size="5">
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'add_circle')"
							@click="showModal()"
							>계정과목 추가</a-button
						>
					</a-space>
				</a-col>
			</a-row>
			<a-row :gutter="30">
				<a-col flex="1">
					<a-descriptions bordered :label-style="{ width: '15%' }">
						<a-descriptions-item label="사용할 계정/비용항목">
							<a-typography-link @click="showModal()">
								{{
									fuelsAccountData
										.map((item: any) => `${item.name} < ${item.parentName}`)
										.join(", ")
								}}
							</a-typography-link>
						</a-descriptions-item>
					</a-descriptions>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<a-modal
				centered
				v-model:open="showFuelsModal"
				title="계정비용항목 추가/수정"
				@ok="onSubmit"
				ok-text="저장"
			>
				<a-spin :spinning="treeStatus === 'pending'">
					<a-input-search
						class="mb-sm"
						v-model:value="searchValue"
						placeholder="검색"
						@keyup="onQueryChanged"
					/>
					<a-tree
						block-node
						checkable
						v-model:checkedKeys="checkedKeys"
						v-model:expanded-keys="expandedKeys"
						:auto-expand-parent="autoExpandParent"
						:selectable="false"
						:show-icon="true"
						:default-expand-all="true"
						:tree-data="copyTreeData"
						:height="500"
						:field-names="{
							children: 'children',
							title: 'name',
							key: 'id',
						}"
						@check="onCheck"
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
						<template #title="{ dataRef }">
							<span
								v-if="
									dataRef.name.indexOf(searchValue) > -1 ||
									dataRef.code.toString().indexOf(searchValue) > -1
								"
							>
								<span
									v-if="
										dataRef.name.includes(searchValue) ||
										dataRef.code.toString().includes(searchValue)
									"
								>
									{{
										`${dataRef.name}(${dataRef.code})`.substring(
											0,
											`${dataRef.name}(${dataRef.code})`.indexOf(searchValue)
										)
									}}
								</span>
								<span class="text-error">{{ searchValue }}</span>
								{{
									`${dataRef.name}(${dataRef.code})`.substring(
										`${dataRef.name}(${dataRef.code})`.indexOf(searchValue) +
											searchValue.length
									)
								}}
							</span>
							<span v-else>{{ dataRef.name }} ({{ dataRef.code }})</span>
						</template>
					</a-tree>
				</a-spin>
			</a-modal>
		</template>
	</page-layout>
</template>
