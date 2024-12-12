<script lang="ts" setup>
// import type Node from 'element-plus/es/components/tree/src/model/node';
import type { Workplace } from "@/types/settings/workplaces"
import { ArrowRightBold, CaretRight } from "@element-plus/icons-vue"
import type { Response } from "@/types"
import WorkplaceTree from "@/components/settings/workplaces/WorkPlacesTree.vue"
import WorkPlaceForm from "@/components/settings/workplaces/WorkPlaceForm.vue"

const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)

const treeProps = {
	key: "id",
	title: "name",
	children: "children",
}

definePageMeta({
	name: "회사/사업장관리",
	// middleware: [ 'admin-only' ],
})

const params = reactive({
	keywork: undefined,
	placeType: undefined,
	companyCode: getRole.value === "ROOT" ? undefined : getCompanyCode.value,
	parentId: undefined,
})

const { data, pending, error, refresh } = await useAsyncData(
	"workplaces-list",
	() =>
		useIFetch<Response<Array<WorkplaceTree>>>("/api/v2/settings/companies", {
			method: "GET",
			params,
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				return res.data.map((data: WorkplaceTree) => {
					if (!data.isLeaf) {
						data.isLeaf = false
					}
					data.status = "read"
					return data
				})
			}),
	{
		watch: [params],
	}
)

// const treeData = ref<Array<WorkplaceTree> | null>()

enum DragState {
	START,
	ENTER,
	LEAVE,
	OVER,
	END,
	DROP,
}

const treeDragEvent = (data: any, type: DragState) => {
	console.log(`drag type ${type} : `, data)
	if (type == DragState.START) {
	}
	if (type == DragState.ENTER) {
	}
	if (type == DragState.LEAVE) {
	}
	if (type == DragState.OVER) {
	}
	if (type == DragState.END) {
	}
	if (type == DragState.DROP) {
	}
}

/**
 * 조직도 트리 아이템 클릭 시 이벤
 * @param tree {data: Tree, node: Node, e: MouseEvent}
 */
const treeClickEvent = async (tree: any) => {
	// console.log("tree ", tree)
	// if(tree.data.id) {
	//   const item = {
	//     data: tree.data as WorkplaceTree,
	//     node: tree.node as Node,
	//     e: tree.e as MouseEvent
	//   }
	//   const res = await Promise.all([
	//     useIFetch<Response<Workplace>>(`/api/v2/settings/companies/${item.data.id}`, {
	//       method: 'GET',
	//       params: { id: item.data.id }
	//     })
	//     .then(res => res.data)
	//     .then(data => data.value?.data)
	//   ])
	//   selectNodeItem.value = res[0] || new WorkplaceClass();
	// } else {
	//   selectNodeItem.value = new WorkplaceClass()
	// }
}
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
			<work-places-tree
				ref="workplacestree"
				:data-source="data"
				:loading="pending"
				:icon="CaretRight"
				node-key="id"
				:item-size="35"
				:tree-props="treeProps"
				drag-none-label="일진그룹"
				:searched="true"
				:draggabled="false"
				:expandOnClickNode="true"
				@drag-start="(data: any) => treeDragEvent(data, DragState.START)"
				@drag-enter="(data: any) => treeDragEvent(data, DragState.ENTER)"
				@drag-leave="(data: any) => treeDragEvent(data, DragState.LEAVE)"
				@drag-over="(data: any) => treeDragEvent(data, DragState.OVER)"
				@drag-end="(data: any) => treeDragEvent(data, DragState.END)"
				@drop="(data: any) => treeDragEvent(data, DragState.DROP)"
				@select-node="(data: any) => treeClickEvent(data)"
				@create-sub-workplace="refresh()"
				@refresh="refresh()"
			>
				<template #tree-item="{ node, item, searchQuery }">
					<template v-if="item.name?.indexOf(searchQuery) > -1">
						<template v-if="['create', 'append'].includes(node.data.status)">
							<span :title="item.name">
								{{ item.name }}
							</span>
						</template>
						<template v-else>
							<span :title="item.name">
								{{ item.name.substring(0, item.name.indexOf(searchQuery)) }}
								<span style="color: #f50">{{ searchQuery }}</span>
								{{
									item.name.substring(item.name.indexOf(searchQuery) + searchQuery.length)
								}}
							</span>
						</template>
					</template>
					<template v-else>
						{{ item.name }}
					</template>
					<!-- <span
            class="list-group-item node-treeview2"
            :class="{
              'node-selected': node.isLeaf,
              'is-leaf': node.isLeaf,
              active: node.selected,
            }"
          >
            <span v-if="item.name.indexOf(searchQuery) > -1">
              <span class="material-icons text-warning"> folder </span>
              {{ item.name.substring(0, item.name.indexOf(searchQuery)) }}
              <span style="color: #f50">{{ searchQuery }}</span>
              {{
                item.name.substring(
                  item.name.indexOf(searchQuery) + searchQuery.length
                )
              }}
            </span>
            <span v-else>
              <span class="material-icons text-warning"> folder </span>
              {{ item.name }}
            </span>
          </span> -->
				</template>
			</work-places-tree>
		</template>
	</page-layout>
</template>

<style scoped></style>
