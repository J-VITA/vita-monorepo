<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import CompanyForm from "@/components/settings/companies/CompanyForm.vue"
import type { Response } from "@/types"
import {
	type Workplace,
	type WorkplaceTree,
	initCompanyData,
	initWorkPlaceData,
} from "@/types/settings/workplaces"
import type { TreeProps } from "ant-design-vue/es/tree"
definePageMeta({
	name: "회사/사업장관리",
	// middleware: [ 'admin-only' ],
})

const appStore = useAppsStore()
const { loading } = storeToRefs(appStore)

const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)

const companyFormData = ref<Workplace>({ ...initCompanyData })
const workplaceFormData = ref<Workplace>({ ...initWorkPlaceData })

const { list, detail } = useCompany()

const treeFildName = {
	key: "id",
	title: "name",
	children: "children",
}
const selectTreeItem = ref<Array<string | number> | undefined>([])

const autoExpandParent = ref<boolean>(true)
const expandedKeys = ref<(string | number)[]>([])

const searchQuery = ref<string>("")
let oldValue = "" // 초기 oldValue

const params = reactive({
	keywork: undefined,
	placeType: undefined,
	companyCode: getRole.value === "ROOT" ? undefined : getCompanyCode.value,
	parentId: undefined,
})

const {
	data: compTreeData,
	pending: compTreepending,
	refresh: compTreeRefresh,
} = await list(params)

const refresh = async (id?: number | string, parentId?: number | string) => {
	await compTreeRefresh()
	companyFormData.value = { ...initCompanyData }
	workplaceFormData.value = { ...initWorkPlaceData }

	if (parentId && id) {
		const [parent, child] = await Promise.all([
			getCompanyInfo(parentId),
			getCompanyInfo(id),
		])
		companyFormData.value = parent
		workplaceFormData.value = child
		selectTreeItem.value = [id, parentId]
	} else if (!parentId && id) {
		const [parent] = await Promise.all([getCompanyInfo(id)])
		companyFormData.value = parent
		workplaceFormData.value = {
			id: undefined,
			name: "",
			code: "",
			registrationNumber: "",
			workplaceCode: "",
			workplaceName: "",
			placeTypeName: "",
			placeTypeLabel: "",
			placeType: "WORKPLACE",
			representativeName: "",
			bizType: "",
			bizItem: "",
			used: true,
			orderSeq: undefined,
			address: {
				detailAddr: "",
				engAddr1: "",
				engAddr2: "",
				jibunAddr: "",
				roadAddr: "",
				zonecode: "",
			},
			updatedBy: "",
			updatedAt: "",
			parentId: undefined,
			status: "read",
		}
		selectTreeItem.value = [id]
	}
}

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
	if (query != oldValue) {
		refresh().finally(() => {
			compTreeData.value = filterTreeData(compTreeData.value, query)
		})
	}

	if (!query) {
		compTreeRefresh()
	}
	oldValue = query
}

/**
 * 회사/사업장 상세 정보 API 호출
 * @param id
 */
const getCompanyInfo = async (id: string | number) => {
	return await detail(id).then((res: Response<Workplace>) => {
		return Object.assign({}, res.data, {
			placeType: res.data?.placeTypeName,
			status: "read",
			address: res.data?.address
				? res.data.address
				: {
						roadAddr: "",
						jibunAddr: "",
						detailAddr: "",
						engAddr1: "",
						engAddr2: "",
					},
			registrationNumber: res.data?.registrationNumber ? res.data.registrationNumber : "",
		})
	})
}

/**
 * 트리 선택 이벤트
 * @param selectedKeys
 * @param info
 */
const antSelectNode = async (
	selectedKeys: any,
	info: {
		event: "select"
		selected: boolean
		node: any
		selectedNodes: any[]
		nativeEvent: MouseEvent
	}
) => {
	if (selectedKeys.length > 0) {
		if (info.node.dataRef.id && info.node.dataRef.parentId) {
			refresh(info.node.dataRef.id, info.node.dataRef.parentId)
		} else if (!info.node.dataRef.parentId && info.node.dataRef.id) {
			refresh(info.node.dataRef.id)
		} else {
			refresh()
		}
	} else {
		companyFormData.value = { ...initCompanyData }
		workplaceFormData.value = { ...initWorkPlaceData }
	}
}

const onExpand: TreeProps["onExpand"] = (key, info) => {
	expandedKeys.value = key || info.node.key
	autoExpandParent.value = false
}

onMounted(() => {
	if (compTreeData.value && compTreeData.value.length > 0) {
		console.log("onMounted")
		expandedKeys.value = transformTreeToFlatArray(compTreeData.value, "id").map(
			(x: any) => x.id
		)
	}
})

onActivated(() => {
	if (compTreeData.value && compTreeData.value.length > 0) {
		console.log("onActivated")
		expandedKeys.value = transformTreeToFlatArray(compTreeData.value, "id").map(
			(x: any) => x.id
		)
	}
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				사업장이 여러개 존재 할 경우 사업장 정보를 추가 관리 합니다.
			</a-space>
		</template>
		<template #content>
			<a-spin :spinning="loading">
				<a-row :gutter="[15, 15]" :wrap="false">
					<!-- tree start. -->
					<a-col flex="35rem">
						<a-input-search
							class="mb-sm"
							v-model:value="searchQuery"
							placeholder="검색"
							@input="onQueryChanged(searchQuery)"
						/>
						<a-tree
							class="scroll-area is-search"
							v-model:selected-keys="selectTreeItem"
							v-model:expanded-keys="expandedKeys"
							:tree-data="compTreeData"
							:default-expand-all="true"
							:auto-expand-parent="autoExpandParent"
							:field-names="treeFildName"
							:show-icon="true"
							block-node
							@select="antSelectNode"
							@expand="onExpand"
						>
							<template #title="slot">
								<template v-if="slot.data.name?.indexOf(searchQuery) > -1">
									<template v-if="['create', 'append'].includes(slot.data.status)">
										<span :title="slot.data.name">
											{{ slot.data.name }}
										</span>
									</template>
									<template v-else>
										<span :title="slot.data.name">
											{{
												slot.data.name.substring(0, slot.data.name.indexOf(searchQuery))
											}}
											<span style="color: #f50">{{ searchQuery }}</span>
											{{
												slot.data.name.substring(
													slot.data.name.indexOf(searchQuery) + searchQuery.length
												)
											}}
										</span>
									</template>
								</template>
								<template v-else>
									{{ slot.data.name }}
								</template>
							</template>
							<template #icon="{ dataRef }">
								<template v-if="dataRef.children && dataRef.children.length > 0">
									<component
										:is="materialIcons('mso', 'business')"
										class="text-warning"
									/>
								</template>
								<template v-else-if="!dataRef.parentId">
									<component
										:is="materialIcons('mso', 'business')"
										class="text-warning"
									/>
								</template>
								<template v-else>
									<component :is="materialIcons('m', 'pin_drop')" class="text-warning" />
								</template>
							</template>
						</a-tree>
					</a-col>
					<!-- tree end. -->
					<a-col flex="5rem" class="text-center">
						<a-divider type="vertical" class="full-height mx-none" />
					</a-col>
					<!-- 회사/사업장의 폼 start. -->
					<a-col flex="auto">
						<company-form
							v-if="!compTreepending"
							:company-form-data="companyFormData"
							:workplace-form-data="workplaceFormData"
							:comp-tree-data="compTreeData"
							@refresh="(id?: number, parentId?: number) => refresh(id, parentId)"
						/>
					</a-col>
					<!-- 회사/사업장의 폼 end. -->
				</a-row>
			</a-spin>
		</template>
	</page-layout>
</template>

<style scoped></style>
