<script setup lang="ts">
import type { Response } from "@/types"
import type { TreeProps } from "ant-design-vue/es/tree"
interface DataProps {
	/** 받은 데이터 */
	data?: any | undefined | null | unknown
	/** 모달 show/hide */
	show: boolean
}

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const props = withDefaults(defineProps<DataProps>(), { show: false })

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
const loading = ref<boolean>(false)
const searchValue = ref<string>("")
const selectedKey = ref<(string | number)[]>(props.data.currentCode)

const onSelect: TreeProps["onSelect"] = (selectedKeys, _) => {
	selectedKey.value = selectedKeys
}

const ok = () => {
	loading.value = true
	console.log(
		"selectedKey.value ",
		selectedKey.value,
		props.data.currentCode,
		props.data.member
	)
	if (selectedKey.value === props.data.currentCode) {
		message.warning("동일한 부서입니다.")
	} else {
		type EmployeeIdType = { id: string | number }
		const employeeIds: Array<EmployeeIdType> = props.data.member.map((member: any) => {
			return { id: member.id }
		})

		const body = Object.assign(
			{},
			{
				id: selectedKey.value[0],
				companyCode: getCompanyCode.value,
				employeeIds,
			}
		)

		useCFetch<Response<any>>(`/api/v2/settings/departments/reassign/employees`, {
			method: "PATCH",
			body,
		})
			.then((res: Response<any>) => {
				if (res.status == 0) {
					message.success(`${res.message}`)
					refresh()
				} else {
					message.error(`${res.message}`)
				}
			})
			.finally(() => {
				loading.value = false
				open.value = false
				emit("callback", true)
			})
		// try {
		//   // 변경 api 붙일곳
		//   console.log('부서이동 유저', props.data.member);
		//   console.log('기존 부서 코드', props.data.currentCode);
		//   console.log('변경 부서 코드', selectedKey.value);
		// } catch (error) {
		//   console.log(error);
		// } finally {
		//   setTimeout(() => {
		//     open.value = false;
		//     emit('callback', true);
		//   }, 3000);
		// }
	}
}

const {
	data: rowData,
	pending,
	error,
	refresh,
} = await useAsyncData(`department-list`, () =>
	useCFetch<Response<any>>("/api/v2/settings/departments", {
		method: "GET",
	}).then((res: Response<any>) => res.data)
)

watch(searchValue, (value) => {
	console.log(value)
})
watch(props.data, (value) => {
	selectedKey.value = value.currentCode
})
</script>

<template>
	<a-modal
		centered
		width="100rem"
		v-model:open="open"
		title="부서이동"
		:destroyOnClose="true"
		:confirmLoading="loading"
		@ok="ok"
	>
		<a-row :gutter="[15, 15]">
			<a-col flex="auto">
				<a-table
					size="small"
					:data-source="props.data.member"
					:columns="[
						{ title: '부서', dataIndex: 'departmentName' },
						{ title: '이름', dataIndex: 'name' },
						{ title: '직위', dataIndex: 'jobName' },
						{ title: '직책', dataIndex: 'gradeName' },
					]"
					:row-key="(record) => record.id"
				>
					<template #title>사용자</template>
				</a-table>
			</a-col>
			<a-col flex="1rem" class="text-center">
				<a-divider type="vertical" class="full-height" />
			</a-col>
			<a-col flex="1">
				<a-input-search v-model:value="searchValue" placeholder="Search" class="mb-md" />
				<a-tree
					block-node
					:show-icon="true"
					:selected-keys="selectedKey"
					:default-expand-all="true"
					:tree-data="rowData"
					:field-names="{
						children: 'children',
						title: 'name',
						key: 'id',
					}"
					@select="onSelect"
				>
					<template #title="{ name }">
						<span v-if="name.indexOf(searchValue) > -1">
							{{ name.substring(0, name.indexOf(searchValue)) }}
							<span style="color: #f50">{{ searchValue }}</span>
							{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
						</span>
						<span v-else>{{ name }}</span>
					</template>
					<template #icon="{ dataRef }">
						<template v-if="dataRef.children && dataRef.children.length > 0">
							<component :is="materialIcons('m', 'folder')" class="text-warning" />
						</template>
						<template v-else-if="!dataRef.parentId">
							<component :is="materialIcons('mso', 'domain')" class="text-warning" />
						</template>
						<template v-else>
							<component :is="materialIcons('m', 'folder')" class="text-warning" />
						</template>
					</template>
					<!-- <template #switcherIcon="{ dataRef }">
            <component :is="materialIcons('mso', 'folder')" />
          </template> -->
				</a-tree>
			</a-col>
		</a-row>
	</a-modal>
</template>
