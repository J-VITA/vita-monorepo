<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { GroupCode } from "@/types/settings/codes"
import type { Roles } from "@/types/settings/roles"
import {
	type RequestParams,
	type Response,
	type User,
	pagination,
	pageSize,
	pageSizeOptions,
} from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"

definePageMeta({
	name: "권한관리",
})

const nuxtApp = useNuxtApp()
const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)
const companyCode = ref<string>("")

const selectedRowKeys = ref<(string | number)[]>([])
const selectedNode = ref<Roles>({})
const showRoleAddModal = ref<boolean>(false)

// type CodeParams = { companyCode: string; groupCode: string; used: boolean };

// const codeParams = ref<CodeParams>({
//   companyCode: getCompanyCode.value,
//   groupCode: 'ROLE_SELECT_CODE',
//   used: true,
// });

const roleParams = ref<RequestParams<any>>({
	pageNumber: 1,
	size: pageSize,
	first: true,
	last: false,
	sort: [],
})

const columns = ref<ColumnsType<any>>([
	{ title: "권한명", dataIndex: "name", width: -1 },
	{ title: "권한코드", dataIndex: "code", width: -1 },
	{
		title: "권한사용자",
		dataIndex: "employeeCount",
		width: -1,
		align: "center",
	},
	{
		title: "접근가능한 메뉴수",
		dataIndex: "menuCount",
		width: -1,
		align: "center",
	},
	{ title: "권한설명", dataIndex: "description", width: -1 },
])

// const {
//   data: codes,
//   error: codeError,
//   status: codeStatus,
//   refresh: codeRefresh,
//   execute: codeExecute,
// } = await useAsyncData(
//   'group-code-list',
//   () =>
//     useCFetch<Response<Array<GroupCode>>>(
//       '/api/v2/settings/codes/subCodes/select',
//       {
//         method: 'GET',
//         params: {
//           ...codeParams.value,
//         },
//       }
//     ).then(
//       (res: Response<Array<GroupCode>>) =>
//         res.data?.map((x) => {
//           if (x.code === '10') {
//             x.color = 'blue';
//           } else if (x.code === '20') {
//             x.color = 'orange';
//           } else {
//             x.color = '';
//           }
//           return x;
//         }) || []
//     ),
//   { watch: [codeParams] }
// );

const {
	data: roleData,
	status: roleStatus,
	refresh: roleRefresh,
	execute: roleExecute,
} = await useAsyncData(
	"settings-roles",
	() =>
		useCFetch<Response<any>>("/api/v2/settings/roles", {
			method: "GET",
			params: {
				...roleParams.value,
				companyCode: getRole.value === "ROOT" ? companyCode.value : getCompanyCode.value,
				pageNumber: roleParams.value.pageNumber - 1,
			},
		}),
	{
		watch: [roleParams.value],
		transform: (res: Response<any>) => {
			const list = res.data.filter((item: any) => item.code !== "ROOT")
			return { ...res, data: list }
		},
	}
)

const rowSelection = ref({
	onChange: (keys: (string | number)[], selectedRows: Array<any>) => {
		selectedRowKeys.value = keys
		console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows)
	},
})

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	console.log("pagination", pagination, rows)
	roleParams.value.pageNumber = pagination.current
	roleParams.value.size = pagination.pageSize
}
/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onRoleUpdateModal = async (id: number | string) => {
	await useCFetch<Response<Roles>>(`/api/v2/settings/roles/${id}`, {
		method: "GET",
		params: {
			id,
		},
	}).then((res: Response<Roles>) => {
		if (res.status === 0) {
			selectedNode.value = res.data!
			showRoleAddModal.value = true
		} else {
			message.error(`${res.message}`)
		}
	})
}

const onRoleAddModal = () => {
	selectedNode.value = {
		id: undefined,
		name: "",
		code: "",
		companyCode: getCompanyCode.value,
		description: "",
		memberIds: [],
		menuIds: [],
	}
	showRoleAddModal.value = true
}
/**
 * 권한 삭제 API 호출
 * @param ids
 */
const deleteRole = async (ids: (string | number)[]) => {
	for (const id of ids) {
		await useCFetch<Response<any>>(`/api/v2/settings/roles/${id}`, {
			method: "DELETE",
			body: { id },
		}).then((res: Response<any>) => {
			if (res.status === 0) roleRefresh()
		})
	}
}

/**
 * 권한 추가 API 호출
 * @param Roles
 */
const saveRole = (body: Roles) => {
	const method = body.id ? "PATCH" : "POST"
	const menuIds = body.menuIds
	const memberIds =
		body.memberIds && body.memberIds.length > 0
			? body.memberIds.map((id) => {
					return { id }
				})
			: []
	const onPromise =
		method === "PATCH"
			? Promise.all([
					new Promise((resolve, reject) => {
						useCFetch<Response<any>>(
							`/api/v2/settings/roles${body.id ? "/" + body.id : ""}`,
							{ method, body }
						)
							.then((res: Response<any>) => resolve(res.status))
							.catch((error) => reject(error))
					}),
					new Promise((resolve, reject) => {
						if (menuIds && body.id) {
							useCFetch<Response<any>>(`/api/v2/settings/roles/assign/menu`, {
								method: "PUT",
								body: { id: body.id, companyCode: body.companyCode, menuIds },
							})
								.then((res: Response<any>) => resolve(res.status))
								.catch((error) => reject(error))
						} else {
							resolve(0)
						}
					}),
					new Promise((resolve, reject) => {
						if (memberIds && body.id) {
							useCFetch<Response<any>>(`/api/v2/settings/roles/assign/members`, {
								method: "PUT",
								body: {
									id: body.id,
									companyCode: body.companyCode,
									memberIds,
								},
							})
								.then((res: Response<any>) => resolve(res.status))
								.catch((error) => reject(error))
						} else {
							resolve(0)
						}
					}),
				])
			: Promise.all([
					new Promise((resolve, reject) => {
						useCFetch<Response<any>>(`/api/v2/settings/roles`, { method, body })
							.then((res: Response<any>) => {
								if (res.status === 0) {
									if (menuIds && res.data.id) {
										useCFetch<Response<any>>(`/api/v2/settings/roles/assign/menu`, {
											method: "PUT",
											body: {
												id: res.data.id,
												companyCode: res.data.id,
												menuIds,
											},
										}).finally(() => roleRefresh())
									}
									if (memberIds && memberIds.length > 0 && res.data.id) {
										useCFetch<Response<any>>(`/api/v2/settings/roles/assign/members`, {
											method: "PUT",
											body: {
												id: res.data.id,
												companyCode: res.data.companyCode,
												memberIds,
											},
										}).finally(() => roleRefresh())
									}
								}
								resolve(res.status)
							})
							.catch((error) => reject(error))
					}),
				])
	onPromise
		.then((result: any) => {
			const count = result.reduce((prev: number, next: number) => {
				return prev + next
			}, 0)
			if (count === 0) {
				message.success(`${method === "PATCH" ? "수정되었습니다." : "저장되었습니다."}`)
				showRoleAddModal.value = false
				roleRefresh()
			}
		})
		.catch((error) => message.error(error.message))
}

const onSearch = () => {
	roleExecute()
}

nuxtApp.hook("page:finish", () => {
	if (companyCode.value) {
		nextTick(() => {
			roleExecute()
		})
	}
})

onActivated(() => {
	// codeExecute();
	roleExecute()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				페이지별 접근권한과 조회권한을 설정할 수 있고, 해당되는 사용자를 등록할 수
				있습니다.
			</a-space>
		</template>
		<template #content>
			<template v-if="getRole === 'ROOT'">
				<a-flex :gap="5">
					<eacc-select
						style="width: 30rem"
						url="/api/v2/settings/companies"
						:params="{ placeType: 'COMPANY' }"
						:on-all-field="false"
						v-model:value="companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						:first="true"
						:refresh="true"
						@update:value="(value: any) => (companyCode = value)"
					/>
					<eacc-button
						componentIs="search"
						type="primary"
						:modal-open="false"
						:data="companyCode"
						@click="onSearch"
					/>
				</a-flex>
				<a-divider class="my-md" />
			</template>

			<a-flex justify="space-between" class="mb-sm">
				<span></span>
				<a-space>
					<eacc-button
						component-is="delete"
						:data="selectedRowKeys"
						:modal-open="true"
						:disabled="selectedRowKeys.length === 0"
						@click="deleteRole"
					/>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="onRoleAddModal"
						>권한추가</a-button
					>
					<a-select
						v-model:value="roleParams.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
					/>
				</a-space>
			</a-flex>

			<a-table
				size="small"
				:loading="roleStatus === 'pending'"
				:row-key="(record) => record.id"
				:columns="columns"
				:data-source="roleData?.data"
				:pagination="
					Object.assign({}, pagination, {
						current: roleParams.pageNumber,
						pageSize: roleParams.size,
						total: roleData?.totalElements,
					})
				"
				:row-selection="rowSelection"
				@change="cellChange"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record, value }">
					<template v-if="column.dataIndex === 'name'">
						<a-typography-link @click="onRoleUpdateModal(record.id)">{{
							text
						}}</a-typography-link>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<role-addtion-modal
				v-if="showRoleAddModal"
				:show="showRoleAddModal"
				:data="selectedNode"
				@update:show="(value) => (showRoleAddModal = value)"
				@callback="saveRole"
			/>
		</template>
	</page-layout>
</template>
