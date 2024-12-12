<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { Employee, CostItem, TreeItem } from "@/types/master/cctr"
import type { TreeProps } from "ant-design-vue"
// import type { TreeProps } from 'ant-design-vue/es/tree';
interface DataProps {
	//** Tree */
	tree: TreeItem[]
	/** 선택된 코스트센터 정보*/
	costCenterInfo: CostItem | undefined
	/** 받은 데이터 */
	data: Employee[]
	/** 모달 show/hide */
	show: boolean
}

const props = withDefaults(defineProps<DataProps>(), { show: false })

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
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
const loading = ref<boolean>(false)
const searchValue = ref<string>("")
const selectedKey = ref<(string | number)[]>([])
const companyCode = ref<string>("")
const costCenterId = ref<number>(0)

const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
	const { dataRef } = info.node
	selectedKey.value = selectedKeys
	companyCode.value = dataRef?.companyCode
	costCenterId.value = dataRef?.id
}

const onSubmit = async () => {
	loading.value = true
	const users = props.data.map((e) => ({ id: e.id }))
	const send = {
		id: costCenterId.value,
		companyCode: companyCode.value,
		employeeIds: users,
	}

	await useCFetch<Response<any>>("/api/v2/master/costCenters/employees", {
		method: "PUT",
		body: send,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			emit("callback", true)
			loading.value = false
			open.value = false
		}
	})
}

watch(props, (value) => {
	const { show, costCenterInfo } = value
	if (show) {
		selectedKey.value = [costCenterInfo?.code!]
	}
})
</script>

<template>
	<a-modal
		centered
		width="100rem"
		v-model:open="open"
		title="코스트센터 이동"
		:destroyOnClose="true"
		:confirmLoading="loading"
		@ok="onSubmit"
	>
		<a-row :gutter="[15, 15]">
			<a-col flex="auto">
				<a-table
					size="small"
					:data-source="props.data"
					:columns="[
						{ title: '코스트센터', dataIndex: 'costCenterName' },
						{ title: '이름', dataIndex: 'employeeName' },
						{ title: '직위', dataIndex: 'positionName' },
						{ title: '직책', dataIndex: 'jobTitleName' },
					]"
					:row-key="(record) => record.id"
				>
					<template #title>선택된 사용자</template>
				</a-table>
			</a-col>
			<a-col flex="1rem" class="text-center">
				<a-divider type="vertical" class="full-height" />
			</a-col>
			<a-col flex="1">
				<a-input-search class="mb-sm" v-model:value="searchValue" placeholder="검색" />

				<a-tree
					block-node
					v-model:selectedKeys="selectedKey"
					:show-icon="true"
					:tree-data="props.tree"
					:default-expand-all="true"
					:field-names="{
						children: 'children',
						title: 'name',
						key: 'code',
					}"
					@select="onSelect"
				>
					<template #icon="{ dataRef }">
						<template v-if="!dataRef.parentId">
							<component :is="materialIcons('mso', 'business')" class="text-warning" />
						</template>
						<template v-else>
							<component :is="materialIcons('m', 'folder')" class="text-warning" />
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
			</a-col>
		</a-row>
	</a-modal>
</template>
