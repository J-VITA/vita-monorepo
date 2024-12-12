<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { MenuManagement } from "@/types/settings/menu"
import { iwxGrid } from "@iwx/ui"

definePageMeta({
	name: "MenuTable",
})

const props = withDefaults(
	defineProps<{
		fetchData: Array<MenuManagement>
		theme?: "alpine" | "quartz" | "balham" | "material"
	}>(),
	{
		theme: "balham",
	}
)

const rowDrag = (params: any) => {
	// only rows that are NOT groups should be draggable
	return !params.node.group
}

const columnDefs = ref([
	{ field: "id", cellRenderer: (params: any) => params.value },
	// { field: 'parentId', rowGroup: true, rowGroupIndex: 2, hide: true, cellRenderer: (params: any) => params.value ? params.value : params.data.name},
	// { field: 'children', rowGroup: true, rowGroupIndex: 3, hide: true, cellRenderer: (params: any) => params.value},
	{ field: "name", cellRenderer: (params: any) => params.value },
	{ field: "description" },
	{ field: "path" },
	{ field: "relateImageName" },
	{ field: "orderSeq" },
	{ field: "depth" },
	{
		field: "used",
		width: 100,
		cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
	},
])
const gridApi = ref()
const defaultColDef = ref({
	flex: 1,
})
const autoGroupColumnDef = ref<any>(null)
const getDataPath = ref<any>(null)
const rowData = ref<Array<MenuManagement> | []>([]) as any

const groupDefaultExpanded = ref()

onBeforeMount(() => {
	autoGroupColumnDef.value = {
		rowDrag: true,
		headerName: "메뉴번호",
		cellRendererParams: {
			suppressCount: true,
			innerRenderer: (params: any) => params.value,
		},
	}
	groupDefaultExpanded.value = -1
	rowData.value = props.fetchData
	// rowData.value = props.fetchData.filter((f: any) => f.upperMenuNumber && f.menuNumber !== '0').map((x: any) => x);
	// console.log("rowData.value ",  rowData.value)

	// getDataPath.value = (data: any, id: string | number, callback: any) => {
	//   if(data && data.length > 0) {
	//     data.forEach((item: any, index: number) => {
	//       if (item.id === id) {
	//         return callback(item, index, data);
	//       }
	//       if(item.children) {
	//         return getDataPath.value(item.children, id, callback);
	//       }
	//     });
	//   }
	// };

	getDataPath.value = (data: any) => {
		if (data && data.length > 0) {
			data.forEach((item: any, index: number) => {
				if (item.name) {
					return item.name
				}
				if (item.children && item.children.length > 0) {
					getDataPath.value(item.children)
				}
			})
		}
	}
})

const onGridReady = (params: any) => {
	console.log("onGridReady", props.fetchData)
	gridApi.value = params.api
	// console.log("transformTreeToFlatArray(props.fetchData) ", transformTreeToFlatArray(props.fetchData))
	// params.api.setGridOption("rowData", transformTreeToFlatArray(props.fetchData).filter((f: any) => f.upperMenuNumber && f.upperMenuNumber !== '0').map(x => x));
	// rowData.value = transformTreeToFlatArray(props.fetchData).filter((f: any) => f.upperMenuNumber).map(x => x) as any;
	// params.api.setGridOption("rowData", props.fetchData);
	// rowData.value = props.fetchData;
}

const onRowDragMove = (event: any) => {
	var movingNode = event.node
	var overNode = event.overNode
	// find out what country group we are hovering over
	var groupUpperMenuNumber
	if (overNode.group) {
		console.log("overNode.group", overNode.key)
		// if over a group, we take the group key (which will be the
		// country as we are grouping by country)
		groupUpperMenuNumber = overNode.key
	} else {
		// console.log("overNode.data.level ", overNode.data.level)
		// if over a non-group, we take the country directly
		if (overNode.data.level == 1) {
			groupUpperMenuNumber = overNode.data.id
		} else {
			groupUpperMenuNumber = overNode.data.parentId
		}
	}
	var needToChangeParent = movingNode.data.parentId !== groupUpperMenuNumber
	if (needToChangeParent) {
		var movingData = movingNode.data
		movingData.parentId = groupUpperMenuNumber
		gridApi.value.applyTransaction({
			update: [movingData],
		})
		gridApi.value.clearFocusedCell()
	}
	// console.log("gridApi.value", rowData.value);
}

const emit = defineEmits<{
	(e: "callEdit", value: MenuManagement): MenuManagement
	(e: "callDelete", value: MenuManagement): MenuManagement
	(e: "handleCurrentChange", value: MenuManagement): MenuManagement
	(e: "handleDragEnd", value: MenuManagement): MenuManagement
}>()

const handleEdit = (index: number, row: MenuManagement) => {
	// row.editabled = !row.editabled;
	// if (!row.editabled) {
	//   emit('callEdit', row);
	// }
}
const handleDelete = (index: number, row: MenuManagement) => {
	console.log(index, row)
}

const handleDragEnd = (event: any) => {
	console.log(" dragging ", event)
}
const handleCurrentChange = (val: any | undefined) => {
	console.log(" handleCurrentChange ", val)
	// emit('submit', form)
	emit("handleCurrentChange", val)
}

watch(
	() => props.fetchData,
	(data) => {
		// if(data && data.length > 0) {
		// }
		rowData.value = props.fetchData //props.fetchData;
	}
)

const gridOptions = {
	rowDragManaged: true,
	treeData: true,
	animateRows: true,
	getDataPath: function (data: any) {
		return data.hierarchy
	},
	autoGroupColumnDef: {
		headerName: "Menu",
		cellRendererParams: {
			suppressCount: true,
		},
	},
}
const treeProps = {
	key: "id",
	title: "name",
	children: "children",
}
</script>

<template>
	<!-- <iwx-grid
    style="width: 100%; height: 500px"
    :class="`ag-theme-${props.theme} w-full h-full`"
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    :defaultColDef="defaultColDef"
    :grid-options="gridOptions"
    :groupDefaultExpanded="groupDefaultExpanded"
    :autoGroupColumnDef="autoGroupColumnDef"
    :rowData="rowData"
    :rowDragManaged="true"
    :cell-selection="true"
    :stop-editing-when-cells-lose-focus="false"
    :suppress-menu-hide="true"
    :suppress-row-click-selection="true"
    @row-drag-move="onRowDragMove"
    :treeData="true"
    :getDataPath="getDataPath"
    ></iwx-grid> -->
	<!-- :treeData="true"
    :getDataPath="getDataPath" -->
	<!--  -->

	<a-tree
		class="draggable-tree"
		draggable
		block-node
		:show-icon="true"
		:expandOnClickNode="true"
		node-key="id"
		:tree-props="treeProps"
		:tree-data="rowData"
	>
		<template #title="{ name, dataRef }">
			<span>{{ name }}</span>
		</template>
		<template #icon="{ dataRef }">
			<template v-if="dataRef.depth === 0">
				<component :is="materialIcons('mso', 'home')" class="text-warning" />
			</template>
			<template v-else-if="dataRef.depth === 1">
				<component :is="materialIcons('m', 'folder')" class="text-warning" />
			</template>
			<template v-else>
				<component :is="materialIcons('mso', 'description')" class="text-warning" />
			</template>
		</template>
	</a-tree>
	<!-- @dragenter="onDragEnter"
    @drop="onDrop" -->
</template>
