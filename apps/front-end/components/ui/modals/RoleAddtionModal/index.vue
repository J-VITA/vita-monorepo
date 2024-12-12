<script lang="ts" setup>
import type { ColumnsType } from "ant-design-vue/lib/table/interface"
import { Form } from "ant-design-vue"
import {
	type Roles,
	type RoleMenuIds,
	type RoleMember,
	type RoleMenuItem,
	inquiryLevel,
	selectedData,
} from "@/types/settings/roles"
import type { Response } from "@/types"

const useForm = Form.useForm

const props = withDefaults(defineProps<{ show: boolean; data: Roles }>(), {
	show: false,
})

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
		loading.value = false
	},
})

const columns = ref<ColumnsType<any>>([
	{
		title: "메뉴명",
		dataIndex: "name",
	},
	{
		title: "조회권한",
		dataIndex: "selectLevelTypeName",
		width: "20rem",
	},
])

const loading = ref<boolean>(false)
// const searchValue = ref<string>('');
const selectLevelType = ref<string | undefined>(undefined)
const defaultExpandedRowKeys = ref<(string | number)[]>([1, 2])
const selectedRowKeys = ref<(string | number)[]>([])
const menuIds = ref<RoleMenuIds[]>([])
const modelRef = ref<Roles>({
	id: undefined,
	name: "",
	code: "",
	companyCode: getCompanyCode.value,
	description: "",
	memberIds: [],
	menuIds: [],
}) as any

const rulesRef = ref<any>({
	name: [
		{
			required: true,
			message: "필수 입력값입니다.",
			trigger: "change",
		},
	],
	roleSelectCode: [],
	code: [
		{
			required: true,
			message: "필수 입력값입니다.",
			trigger: "change",
		},
	],
})
const { resetFields, validate, validateInfos } = useForm(props.data, rulesRef)
const menuData = ref<any[]>([])

const { status } = await useAsyncData(
	"roles-menu-list",
	() =>
		useCFetch<Response<any>>("/api/v2/settings/roles/menus", {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				roleCode: props.data.code,
			},
		}).then((res: Response<Array<RoleMenuItem>>) => {
			if (res.data) {
				const selected = selectedData(res.data)
				menuData.value = res.data
				selectedRowKeys.value = selected.checked
				for (const item of selected.rows) {
					const menuItem = {
						id: item.id,
						isRole: item.isRole,
						halfChecked: item.halfChecked,
						...(item.depth > 1 && {
							selectLevelType: item.selectLevelTypeName,
						}),
					}

					menuIds.value.push(menuItem)
				}
			}
		}),
	{ watch: [props.data] }
)

/**
 * 메뉴 선택
 * @param keys : table check id
 */
const onChange = (keys: (string | number)[], selectedRows: any[]) => {
	selectedRowKeys.value = keys

	function menuLoop(data: Array<RoleMenuItem>) {
		data.forEach((item) => {
			if (keys.includes(item.id)) {
				item.isRole = true
			} else {
				item.isRole = false
			}
			if (item.children) menuLoop(item.children)
		})
	}
	menuLoop(menuData.value)

	let result: RoleMenuIds[] = []

	selectedRows.forEach((item) => {
		result.push({
			id: item.id,
			halfChecked: false,
			...(item.selectLevelTypeName && {
				selectLevelType: item.selectLevelTypeName,
			}),
		})
	})

	const loop = (data: Array<RoleMenuItem>, key: number) => {
		data.forEach((item) => {
			if (item.id === key) {
				result.push({
					id: item.id,
					halfChecked: true,
				})
				if (item.parentId) loop(menuData.value, item.parentId)
			}

			if (item.children) loop(item.children, key)
		})
	}

	for (let i = 0; i < selectedRows.length; i++) {
		const el = selectedRows[i]
		loop(menuData.value, el.parentId)
	}
	const uniqueData = Array.from(new Map(result.map((item) => [item.id, item])).values())
	menuIds.value = uniqueData
}

/**
 * 개별 조회 타입 변경 select
 * @param type : PERSONAL | COST_CENTER | GLOBAL
 * @param record : MenuItem
 */
const onSelectChange = (type: any, record: any) => {
	menuIds.value.forEach((e) => {
		if (e.id === record.id) e.selectLevelType = type
	})
}

/**
 * 조회 권한 일괄 변경 select
 * @param data
 */
const onSelectAllChange = (data: any) => {
	menuIds.value.forEach((item) => {
		item.halfChecked = false
		if (item.selectLevelType) item.selectLevelType = data.value
		selectedRowKeys.value.push(item.id)
	})

	const loop = (tree: RoleMenuItem[]) => {
		for (const element of tree) {
			if (element.depth > 1) {
				element.selectLevelTypeName = data.value
				element.selectLevelTypeLabel = data.label
			}
			if (element.children) loop(element.children)
		}
	}
	loop(menuData.value)
}

// const onCheck = (keys: any, info: any) => {
//   const { halfCheckedKeys } = info;
//   // modelRef.value.menuIds = keys as (number | string)[];
//   modelRef.value.menuIds = {
//     checked: keys,
//     halfChecked: halfCheckedKeys,
//   };
// };

const onSubmit = () => {
	validate()
		.then(() => {
			loading.value = true
			emit("callback", { ...props.data, menuIds: menuIds.value })
		})
		.catch((err) => {
			console.error("error", err)
		})
}

onMounted(async () => {
	const { show, data } = props

	if (show && data) {
		modelRef.value = data
		if (data.code) {
			const [memberIds] = await Promise.all([
				await Promise.resolve(
					useCFetch<Response<Array<RoleMember>>>("/api/v2/settings/roles/members", {
						method: "GET",
						params: {
							companyCode: getCompanyCode.value,
							roleCode: data.code,
						},
					}).then(
						(res: Response<any>) => res.data.map((x: RoleMember) => x.memberId) || []
					)
				),
			])

			modelRef.value.memberIds = memberIds
		}

		if (!data.id) {
			function loop(data: RoleMenuItem[]): void {
				for (const item of data) {
					item.halfChecked = false
					if (item.depth && item.depth > 1) {
						item.selectLevelTypeName = "PERSONAL"
					}

					if (item.children) loop(item.children)
				}
			}
			loop(menuData.value)
		}
	}
})
</script>
<template>
	<a-modal
		centered
		width="100rem"
		v-model:open="open"
		title="권한추가"
		ok-text="저장"
		:destroy-on-close="true"
		:confirm-loading="loading"
		@ok="onSubmit"
	>
		<a-row :gutter="[30, 0]">
			<a-col flex="1">
				<a-form
					:colon="false"
					label-align="left"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
				>
					<a-typography-title :level="5"> 권한 정보 </a-typography-title>
					<a-form-item label="권한명" v-bind="validateInfos.name">
						<a-input v-model:value="modelRef.name" placeholder="권한명을 입력해주세요." />
					</a-form-item>
					<a-form-item label="권한코드" v-bind="validateInfos.code">
						<a-input
							v-model:value="modelRef.code"
							placeholder="권한코드를 입력해주세요."
						/>
					</a-form-item>
					<a-form-item label="권한설명">
						<a-input
							v-model:value="modelRef.description"
							placeholder="권한설명을 입력해주세요."
						/>
					</a-form-item>
					<br />
					<a-typography-title :level="5"> 사용자 선택 </a-typography-title>
					<a-form-item label="사용자">
						<eacc-select-multi-table
							:url="`/api/v2/settings/roles/members?companyCode=${getCompanyCode}`"
							v-model:value="modelRef.memberIds"
							key-props="memberId"
							:columns="[
								{ title: 'ID', data: (row: any) => row.loginId },
								{ title: '부서', data: (row: any) => row.departmentName },
								{ title: '직위', data: (row: any) => row.jobTitleName },
								{ title: '이름', data: (row: any) => row.name, width: '10rem' },
							]"
							@update:value="(value) => (modelRef.memberIds = value)"
						/>
						<!-- @selection-change="(value) => console.log(value)" -->
					</a-form-item>
				</a-form>
			</a-col>
			<a-col flex="1rem">
				<a-divider type="vertical" class="full-height mx-none" />
			</a-col>
			<a-col flex="50rem" style="max-height: 80vh; overflow-y: auto">
				<a-typography-title :level="5"> 메뉴 및 조회 권한 상세 </a-typography-title>
				<a-flex justify="space-between" align="center" class="mb-sm">
					<a-typography-text>조회권한 일괄 변경</a-typography-text>
					<a-select
						v-if="!props.data.id"
						style="width: 12rem"
						placeholder="선택해주세요."
						v-model:value="selectLevelType"
						:options="inquiryLevel"
						@change="(_, data) => onSelectAllChange(data)"
					/>
				</a-flex>
				<a-table
					size="small"
					:loading="status === 'pending'"
					:pagination="false"
					:row-key="(record: any) => record.id"
					:columns="columns"
					:data-source="menuData"
					:default-expanded-row-keys="defaultExpandedRowKeys"
					:default-expand-all-rows="false"
					:row-selection="{
						checkStrictly: false,
						selectedRowKeys,
						onChange: onChange,
					}"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.dataIndex === 'selectLevelTypeName'">
							<a-select
								v-if="record.depth > 1"
								:disabled="!record.isRole"
								style="width: 100%"
								placeholder="선택해주세요."
								v-model:value="record.selectLevelTypeName"
								:options="inquiryLevel"
								@change="(value) => onSelectChange(value, record)"
							/>
							<span v-else></span>
						</template>
					</template>
				</a-table>
				<!-- <a-input-search
          class="mb-sm"
          v-model:value="searchValue"
          placeholder="검색"
        /> -->
				<!-- <a-tree
          block-node
          checkable
          v-model:checkedKeys="modelRef.menuIds"
          :check-strictly="false"
          :selectable="false"
          :show-icon="true"
          :default-expand-all="true"
          :tree-data="menuData"
          :height="500"
          :field-names="{
            children: 'children',
            title: 'name',
            key: 'id',
          }"
          @check="onCheck"
        >
          <template #icon="{ dataRef }">
            <template v-if="dataRef.children && dataRef.children.length > 0">
              <component
                :is="materialIcons('mso', 'folder')"
                class="text-warning"
              />
            </template>
            <template v-else>
              <component :is="materialIcons('mso', 'description')" />
            </template>
          </template>

          <template #title="{ name }">
            <span v-if="name.indexOf(searchValue) > -1">
              {{ name.substring(0, name.indexOf(searchValue)) }}
              <span class="text-error">{{ searchValue }}</span>
              {{
                name.substring(name.indexOf(searchValue) + searchValue.length)
              }}
            </span>
            <span v-else>{{ name }}</span>
          </template>
        </a-tree> -->
			</a-col>
		</a-row>
	</a-modal>
</template>
