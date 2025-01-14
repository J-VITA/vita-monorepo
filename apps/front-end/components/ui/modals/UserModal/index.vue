<script setup lang="ts">
import type { TransferProps, TreeProps } from "ant-design-vue"
import type { DataNode } from "ant-design-vue/lib/tree"
interface DataProps {
	show: boolean
}
interface TreeNode extends DataNode {
	id: string
	name?: string
	parent?: string
	disabled?: boolean
	children?: TreeNode[]
	[key: string]: any
}

const props = withDefaults(defineProps<DataProps>(), {
	show: false,
})
const tree: any[] = [
	{
		id: "1",
		name: "전기",
		disabled: true,
		children: [
			{
				id: "2",
				name: "전략기획부서",
				disabled: true,
				children: [
					{
						id: "21",
						name: "전략기획팀",
						disabled: true,
						children: [
							{ id: "3", name: "이철수 이사" },
							{ id: "4", name: "홍길도 부장" },
						],
					},
				],
			},
			{
				id: "5",
				name: "전략기획팀",
				disabled: true,
				children: [
					{ id: "6", name: "이철수 이사" },
					{ id: "7", name: "홍길도 부장" },
				],
			},
		],
	},
]

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()
const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})

const transferDataSource: TransferProps["dataSource"] = []
function flatten(list: TransferProps["dataSource"] = []) {
	list.forEach((item) => {
		transferDataSource?.push(item)
		flatten(item.children)
	})
}
flatten(JSON.parse(JSON.stringify(tree)))

function handleTreeData(treeNodes: TreeNode[], targetKeys: string[] = []): TreeNode[] {
	return treeNodes?.map(({ children, disabled, ...props }) => ({
		...props,
		disabled: targetKeys.includes(props.id) || disabled,
		children: handleTreeData(children ?? [], targetKeys),
	}))
}

function isChecked(selectedKeys: (string | number)[], eventKey: string | number) {
	return selectedKeys.indexOf(eventKey) !== -1
}

const loading = ref<boolean>(false)
const searchValue = ref<string>("")
const targetKeys = ref<string[]>([])
const dataSource = ref<TransferProps["dataSource"]>(transferDataSource)

const treeData = computed(() => {
	return handleTreeData(tree, targetKeys.value)
})

const onChecked = (
	e: any,
	checkedKeys: string[],
	onItemSelect: (key: string, selected: boolean) => void
) => {
	const { eventKey } = e.node
	onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))
}

const ok = () => {
	open.value = false
}

const onSearch = (direction: "left" | "right", value: string) => {
	if (direction === "left") searchValue.value = value
}
</script>

<template>
	<a-modal
		centered
		width="80rem"
		v-model:open="open"
		title="사용자 추가"
		:destroyOnClose="true"
		:confirmLoading="loading"
		@ok="ok"
	>
		<a-transfer
			v-model:target-keys="targetKeys"
			show-search
			:data-source="dataSource"
			:one-way="true"
			:render="(item) => item.name"
			:row-key="(item) => item.id"
			@search="onSearch"
		>
			<template #children="{ direction, selectedKeys, onItemSelect }">
				<template v-if="direction === 'left'">
					<a-tree
						class="ml-sm overflow-auto"
						show-line
						show-icon
						block-node
						:style="{ height: '40rem' }"
						:checkable="true"
						:check-strictly="true"
						:checked-keys="[...selectedKeys, ...targetKeys]"
						:default-expand-all="true"
						:tree-data="treeData"
						:field-names="{
							children: 'children',
							title: 'name',
							key: 'id',
						}"
						@check="
							(_, props) =>
								onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect)
						"
						@select="
							(_, props) =>
								onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect)
						"
					>
						<template #title="{ name }">
							<span v-if="name.indexOf(searchValue) > -1">
								{{ name.substring(0, name.indexOf(searchValue)) }}
								<span style="color: #f50">{{ searchValue }}</span>
								{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
							</span>
							<span v-else>{{ name }}</span>
						</template>
					</a-tree>
				</template>
			</template>
		</a-transfer>
	</a-modal>
</template>
