<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import WorkPlaceForm from "@/components/settings/workplaces/WorkPlaceForm.vue"

import type { MenuProps } from "ant-design-vue"
import type { Response } from "@/types"
import {
	type Workplace,
	type Address,
	type WorkplaceTree,
	initWorkPlaceData,
	WorkplaceTreeClass,
} from "@/types/settings/workplaces"
import type {
	AntTreeNodeDragEnterEvent,
	AntTreeNodeDropEvent,
	TreeProps,
} from "ant-design-vue/es/tree"

const props = withDefaults(
	defineProps<{
		dataSource: any
		dragNoneLabel: string
		icon?: any
		/** load 와 함께 노드 지연여부, 활성화 시 load 함수 사용 가능 */
		lazy?: boolean
		/** 노드 unique key */
		nodeKey?: string
		/** 노드 아이템 사이즈 */
		itemSize?: number
		/** 트리 구조의 properties field 등 설정 */
		treeProps: any
		/** 검색필터의 stream 문자열 */
		query?: string
		/** 검색 필터 활성 여부 */
		searched?: boolean
		/** 드래그 여부 */
		draggabled?: boolean
		/** node item 클릭 시 펼칠지 말지 여부 false 인 경우 아이콘 클릭하여야 펼침  */
		expandOnClickNode?: boolean
		/** parent data loading */
		loading?: boolean
		/** 삭제 모달 */
		deleteModalShowed?: boolean
	}>(),
	{
		lazy: false,
		searched: false,
		draggabled: false,
		expandOnClickNode: true,
		pending: false,
		deleteModalShowed: false,
	}
)

const deleteData = ref<WorkplaceTree>()
const selectNodeItem = ref<Workplace>(initWorkPlaceData)

const emit = defineEmits<{
	(e: "DragStart", value: any): any
	(e: "DragEnter", value: any): any
	(e: "DragLeave", value: any): any
	(e: "DragOver", value: any): any
	(e: "DragEnd", value: any): any
	(e: "Drop", value: any): any
	(e: "SelectNode", value: any): any
	(e: "createSubWorkplace", value: any): any
	(e: "appendWorkplace"): void
	(e: "refresh"): void
}>()

const searchQuery = ref<string>("")
let oldValue = "" // 초기 oldValue
const expandedKeys = ref<(string | number | null | undefined)[]>([])
const autoExpandParent = ref<boolean>(true)
const gData = ref<any>(props.dataSource)

const treeItem = ref<Array<string | number> | undefined>([1])
const dataList: Array<WorkplaceTree> = []

watch(
	() => props.dataSource,
	(value) => {
		gData.value = value
	}
)

watch(searchQuery, (value) => {
	const expanded = dataList
		.map((item: WorkplaceTree) => {
			if (item.name.indexOf(value) > -1) {
				// console.log("Search parentKey ", item.id)
				return getParentKey(item.id, gData.value)
			}
			return null
		})
		.filter((item: any, i: any, self: any) => item && self.indexOf(item) === i)

	expandedKeys.value = expanded || []
	searchQuery.value = value
	autoExpandParent.value = true
})

const onExpand: TreeProps["onExpand"] = (key, info) => {
	expandedKeys.value = key || info.node.key
	autoExpandParent.value = false
}

const getParentKey = (
	key: string | number,
	tree: Array<WorkplaceTree>
): string | number | undefined => {
	let parentKey
	for (let i = 0; i < tree.length; i++) {
		const node = tree[i]
		if (node.children) {
			if (node.children.some((item: WorkplaceTree) => item.id === key)) {
				parentKey = node.id
			} else if (getParentKey(key, node.children)) {
				parentKey = getParentKey(key, node.children)
			}
		}
	}
	// console.log("Search parentKey ", parentKey)
	return parentKey
}

const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
	console.log(info)
	// expandedKeys
	// expandedKeys.value = info.expandedKeys;
}

type TreeDataItem = WorkplaceTree
const onDrop = (info: AntTreeNodeDropEvent) => {
	console.log(info)
	const dropKey = info.node.key
	const dragKey = info.dragNode.key
	const dropPos = info.node?.pos?.split("-") || []
	const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
	const loop = (data: Array<WorkplaceTree>, key: string | number, callback: any) => {
		data.forEach((item, index) => {
			if (item.id === key) {
				return callback(item, index, data)
			}
			if (item.children) {
				return loop(item.children, key, callback)
			}
		})
	}
	const data = [...gData.value]

	// Find dragObject
	let dragObj: TreeDataItem = {
		id: 0,
		name: "",
	}
	loop(data, dragKey, (item: WorkplaceTree, index: number, arr: Array<WorkplaceTree>) => {
		arr.splice(index, 1)
		dragObj = item
	})
	if (!info.dropToGap) {
		// Drop on the content
		loop(data, dropKey, (item: WorkplaceTree) => {
			item.children = item.children || []
			/// where to insert
			item.children.unshift(dragObj)
		})
	} else if (
		(info.node.children || []).length > 0 && // Has children
		info.node.expanded && // Is expanded
		dropPosition === 1 // On the bottom gap
	) {
		loop(data, dropKey, (item: WorkplaceTree) => {
			item.children = item.children || []
			// where to insert
			item.children.unshift(dragObj)
		})
	} else {
		let ar: Array<WorkplaceTree> = []
		let i = 0
		loop(
			data,
			dropKey,
			(_item: WorkplaceTree, index: number, arr: Array<WorkplaceTree>) => {
				ar = arr
				i = index
			}
		)
		if (dropPosition === -1) {
			ar.splice(i, 0, dragObj)
		} else {
			ar.splice(i + 1, 0, dragObj)
		}
	}
	gData.value = data
}

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
	if (query != oldValue) {
		gData.value = props.dataSource
		gData.value = filterTreeData(props.dataSource, query)
	}
	if (!query) {
		gData.value = props.dataSource
	}
	oldValue = query
}

/**
 * 트리 선택 이벤트
 * @param selectedKeys
 * @param info
 */
const antSelectNode: TreeProps["onSelect"] = async (selectedKeys, info) => {
	if (selectedKeys.length > 0) {
		const items = Object.assign({}, info.node.dataRef, {
			status: "read",
		}) as any
		deleteData.value = items
		setCurrentFormData(items as any)
	} else {
		selectNodeItem.value = initWorkPlaceData
		selectNodeItem.value.status = "create"
	}
}

/**
 * 최상단 회사 트리 UI 추가 액션(폼 상태값 초기화)
 */
const appendWorkplace = (): void => {
	selectNodeItem.value = initWorkPlaceData
	deleteData.value = undefined
}

/**
 * 회사 추가 이후 회사명 form 에서 입력 시 tree name 데이터 변경
 * @param str
 */
const attachCompanyName = (str: string) => {
	gData.value
		.filter((f: WorkplaceTreeClass) => ["create", "update"].includes(f.status))
		.map((f: WorkplaceTreeClass) => {
			f.name = str
			return f
		})
}

/**
 * 회사정보 셋업
 * @param item
 */
const setCurrentFormData = async (item: WorkplaceTree) => {
	// console.log('setCurrentFormData status', item.status);
	if (item.id && item.status == "read") {
		const res = await Promise.all([
			useCFetch<Response<Workplace>>(`/api/v2/settings/companies/${item.id}`, {
				method: "GET",
				params: { id: item.id },
			}).then((res: Response<Workplace>) => {
				if (res.data?.address) {
					return Object.assign({}, res.data, {
						placeType: res.data?.placeTypeName,
					})
				} else {
					return Object.assign(
						{},
						res.data,
						{ placeType: res.data?.placeTypeName },
						{
							address: {
								roadAddr: "",
								jibunAddr: "",
								detailAddr: "",
								engAddr1: "",
								engAddr2: "",
							},
						}
					)
				}
			}),
		])
		selectNodeItem.value = res[0] || initWorkPlaceData
		selectNodeItem.value.status = "read"
	} else {
		const newData = initWorkPlaceData
		newData.status = "create"
		newData.placeType = "MAIN"
		newData.orderSeq = item.orderSeq
		selectNodeItem.value = Object.assign({}, newData, {
			address: {
				roadAddr: "",
				jibunAddr: "",
				detailAddr: "",
				engAddr1: "",
				engAddr2: "",
			},
		})
		deleteData.value = newData as WorkplaceTree
	}
}

/**
 * form에서 수정, 삭제 등 이벤트 적용 이후 refresh 될 때 재조회와 트리 셀렉트 값 설정
 * @param idx
 */
const refreshCurrentPage = (idx?: number) => {
	if (idx) {
		const getCurrentData = (tree: any) => {
			let obj = undefined
			const traverse = (node: any) => {
				if (node.id == idx) {
					node.status = "read"
					obj = node
				}

				if (node.children && node.children.length > 0) {
					for (let child of node.children) {
						traverse(child)
					}
				}
			}

			if (Array.isArray(tree)) {
				for (let node of tree) {
					traverse(node)
				}
			} else {
				traverse(tree)
			}
			return obj
		}
		const data = getCurrentData(gData.value)
		if (data) {
			setCurrentFormData(data)
			treeItem.value = [idx]
			expandedKeys.value = [idx, ...expandedKeys.value]
		} else {
			setCurrentFormData(gData.value[0])
			treeItem.value = [1]
			expandedKeys.value = [1, ...expandedKeys.value]
		}
	}

	emit("refresh")
}

onMounted(async () => {
	if (gData.value) {
		const data = gData.value[0] as WorkplaceTree
		setCurrentFormData(data)
		expandedKeys.value = [1, ...expandedKeys.value]
	}
})
</script>

<template>
	<div>
		<a-row :gutter="[15, 15]" :wrap="false">
			<a-col flex="35rem">
				<div>
					<a-input-search
						class="mb-sm"
						v-if="props.searched"
						v-model:value="searchQuery"
						placeholder="검색"
						@input="onQueryChanged(searchQuery)"
					/>

					<a-tree
						v-model:selected-keys="treeItem"
						:tree-data="gData"
						:default-expand-all="true"
						:auto-expand-parent="autoExpandParent"
						:field-names="props.treeProps"
						:draggable="props.draggabled"
						:show-icon="true"
						block-node
						@dragenter="onDragEnter"
						@drop="onDrop"
						@expand="onExpand"
						@select="antSelectNode"
						:lazy="true"
					>
						<template #title="slot">
							<slot
								name="tree-item"
								:node="slot"
								:item="slot.data"
								:searchQuery="searchQuery"
							></slot>
						</template>
						<template #icon="{ dataRef }">
							<template v-if="dataRef.children && dataRef.children.length > 0">
								<component :is="materialIcons('mso', 'business')" class="text-warning" />
							</template>
							<template v-else-if="!dataRef.parentId">
								<component :is="materialIcons('mso', 'business')" class="text-warning" />
							</template>
							<template v-else>
								<component :is="materialIcons('m', 'pin_drop')" class="text-warning" />
							</template>
						</template>
						<!-- <template
              #switcherIcon="{
                active,
                checked,
                expanded,
                loading,
                selected,
                halfChecked,
                title,
                key,
                children,
                dataRef,
                data,
                defaultIcon,
                switcherCls,
              }"
            >
              <component
                :is="
                  materialIcons('mso', expanded ? 'domain' : 'domain_disabled')
                "
              />
            </template> -->
					</a-tree>
				</div>
			</a-col>
			<a-col flex="5rem" class="text-center">
				<a-divider type="vertical" class="full-height mx-none" />
			</a-col>
			<a-col flex="auto">
				<work-place-form
					:node="selectNodeItem"
					:max-order-seq="determineTreeMaxId(gData, 'orderSeq')"
					@company-input="attachCompanyName"
					@refresh="refreshCurrentPage"
					@append-workplace="appendWorkplace"
				>
				</work-place-form>
			</a-col>
		</a-row>
	</div>
</template>
