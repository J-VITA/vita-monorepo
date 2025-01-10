<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { type Response, pageSizeOptions, pagination } from "@/types"
import type { AddRef } from "@/types/master/cctr"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { type TableProps, type FormInstance, Form } from "ant-design-vue"
import type {
	AntTreeNodeDropEvent,
	TreeProps,
	// DataNode,
} from "ant-design-vue/es/tree"
import type { Rule } from "ant-design-vue/es/form"

definePageMeta({
	name: "부서관리",
})

const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getWorkplaceId, getWorkplaceCode, getRole } =
	storeToRefs(authStore)
const route = useRoute()
const routePath = computed(() => route.path)

interface DataNode {
	id: number
	companyCode: string
	workplaceCode: string
	code: string
	name: string
	description: string
	orderSeq: number
	depth: number
	used: boolean
	updatedBy: string
	updatedAt: string
	parentId?: number
	workplaceId?: number
	children?: DataNode[]
}

interface DataTableType {
	id: number
	departmentName: string
	name: string
	gradeName: string
	jobName: string
	email: string
}
interface IAddField {
	id?: string | number
	companyId: string | number
	companyCode: string | number
	workplaceId: string | number
	parentId: string | number
	departmentName?: string
	departmentCode?: string
	stage?: "new" | "update"
	orderSeq?: number
	workplaceCode?: string | number
}
interface ISearchCompany {
	companyCode: string | number
	companyId?: string | number
	name?: string
	id: string
	placeTypeName: string
	placeTypeLabel: string
	workplaceCode: string
	workplaceName: string
	registrationNumber: string
	used: boolean
	orderSeq: number
	children: string[]
	deleted: boolean
	parentId: string
}
interface IDeptDataType {
	member: DataTableType[]
	currentCode: (string | number)[] | undefined
}

const showFieldModal = ref<boolean>(false)
const showDeptModal = ref<boolean>(false)
const showUserModal = ref<boolean>(false)
const addDepartmentField = ref<Partial<IAddField>>({
	companyId: getRole.value === "ROOT" ? undefined : getCompanyId.value,
	companyCode: getRole.value === "ROOT" ? undefined : getCompanyCode.value,
	workplaceId: getRole.value === "ROOT" ? undefined : getWorkplaceId.value,
	workplaceCode: getRole.value === "ROOT" ? undefined : getWorkplaceCode.value,
	parentId: "",
	departmentName: "",
	departmentCode: "",
})
const companySearchParams = ref<Partial<ISearchCompany>>({
	companyCode: getRole.value === "ROOT" ? undefined : getCompanyCode.value,
	companyId: getRole.value === "ROOT" ? undefined : getCompanyId.value,
	name: "",
})
interface AddUserRef extends AddRef {
	id?: number | string
}
const addUsersField = ref<Partial<AddUserRef>>({
	id: undefined,
	name: "",
	users: [],
	employeesInfo: [],
})
const expandedKeys = ref<(string | number)[]>([])
const selectedRowKeys = ref<(string | number)[]>([])
const treeSelected = ref<(string | number)[]>([])
const treeSelectedName = ref<string | number>()
const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const deptData = ref<IDeptDataType>({ member: [], currentCode: undefined })

const memberSearchParams = ref({
	page: 0,
	size: 10,
	totalElements: 0,
	first: true,
	last: false,
	companyCode: getRole.value === "ROOT" ? undefined : getCompanyCode.value,
	workPlaceId: getRole.value === "ROOT" ? undefined : getWorkplaceId.value,
	departmentId: undefined,
})

const nuxtApp = useNuxtApp()
/**
 * Ant Form
 */
const useDeptForm = Form.useForm
const useUserForm = Form.useForm

const deptFormRef = ref<FormInstance>()
const userFormRef = ref<FormInstance>()

/**
 * 코드 모달 Form Rules
 */
const deptRulesRef = ref<Record<string, Rule[]>>({
	companyCode: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "blur",
		},
	],
	// workplaceId: [
	//   {
	//     required: true,
	//     message: '필수입력입니다.',
	//     trigger: 'change',
	//   },
	// ],
	parentId: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "blur",
		},
	],
	departmentName: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "blur",
		},
	],
	departmentCode: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "blur",
		},
	],
})

/**
 * 사용자 모달 Form Rules
 */
const userRulesRef = ref<Record<string, Rule[]>>({
	users: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "blur",
		},
	],
})

const {
	resetFields: deptResetFields,
	validate: deptValidate,
	clearValidate: deptClearValidate,
	validateInfos: deptValidateInfos,
} = useDeptForm(addDepartmentField, deptRulesRef)

const {
	resetFields: userResetFields,
	validate: userValidate,
	validateInfos: userValidateInfos,
} = useUserForm(addUsersField, userRulesRef)

/**
 * 트리 Expand Event
 */
const onExpand: TreeProps["onExpand"] = (key) => {
	expandedKeys.value = key
}

/**
 * 트리 아이템 선택 이벤트
 * @param selectedKeys
 * @param info
 */
const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
	console.log("onSelect: ", info.node)
	selectedRowKeys.value = []
	treeSelected.value = selectedKeys
	deptData.value.currentCode = selectedKeys
	if (selectedKeys && selectedKeys.length > 0) {
		treeSelectedName.value = info.node.name

		addDepartmentField.value.parentId = info.node.parentId
		addDepartmentField.value.id = info.node.id
		addDepartmentField.value.companyCode = info.node.companyCode

		memberSearchParams.value.departmentId = info.selected ? info.node.id : undefined
		if (memberSearchParams.value.departmentId) {
			getDepartmentEmployees(memberSearchParams.value.departmentId)
		} else {
			memberList.value = []
		}
	} else {
		treeSelectedName.value = undefined
		addDepartmentField.value.parentId = undefined
		addDepartmentField.value.id = undefined
		memberSearchParams.value.departmentId = undefined
		addDepartmentField.value.companyCode =
			getRole.value === "ROOT" ? undefined : getCompanyCode.value
		memberList.value = []
	}
}

/**
 * Tree 아이템 Drop Event
 * * 자식들에 대한 순번 변화를 위한 기능을 담고 있음. 여기서 드랍할 때의 기능을 작성하면 됨.
 * @param info
 */
const onDrop = (info: AntTreeNodeDropEvent) => {
	// console.log(info);
	const dropKey = info.node.id
	const dragKey = info.dragNode.id
	const dropPos = info.node.pos!.split("-")
	const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
	const loop = (data: DataNode[], id: string | number, callback: any) => {
		data!.forEach((item, index) => {
			if (item.id === id) {
				return callback(item, index, data)
			}
			if (item.children) {
				return loop(item.children, id, callback)
			}
		})
	}

	const data = [...rowData.value!] as DataNode[]

	// 드래그된 객체와 드롭된 객체 찾기
	let dragObj: DataNode | undefined
	let dropObj: DataNode | undefined
	loop(data, dragKey, (item: DataNode, index: number, arr: DataNode[]) => {
		arr.splice(index, 1)
		dragObj = item
	})
	loop(data, dropKey, (item: DataNode, index: number, arr: DataNode[]) => {
		dropObj = item
	})

	// if (dragObj && dropObj) {
	//   // orderSeq 값 교환
	//   const swapOrderSeq = (node1: DataNode, node2: DataNode) => {
	//     const tempOrderSeq = node1.orderSeq;
	//     node1.orderSeq = node2.orderSeq;
	//     node2.orderSeq = tempOrderSeq;
	//   };

	//   swapOrderSeq(dragObj, dropObj);
	//   console.log("dropObj ", dropObj)
	//   // 자식 노드들도 순회하면서 orderSeq 값을 교환
	//   const swapChildrenOrderSeq = (children1: DataNode[] = [], children2: DataNode[] = []) => {
	//     const len = Math.min(children1.length, children2.length);
	//     for (let i = 0; i < len; i++) {
	//       swapOrderSeq(children1[i], children2[i]);
	//       // 재귀적으로 자식 노드의 자식 노드도 처리
	//       swapChildrenOrderSeq(children1[i].children, children2[i].children);
	//     }
	//   };

	//   swapChildrenOrderSeq(dragObj.children, dropObj.children);
	// }

	if (dragObj) {
		// // 이전 부모에서 제거된 상태로 유지
		// console.log("dropKey ", dropKey)
		// if (dragObj.parentId !== dropKey) {
		//   // 드래그된 객체의 부모 ID를 제거
		//   dragObj.parentId = dropKey;
		// }
		// // else  {
		// //   dragObj.parentId = dropKey;
		// // }
		// dragObj.parentId = dropKey;

		if (!info.dropToGap) {
			// Drop on the content
			loop(data, dropKey, (item: DataNode) => {
				item.children = item.children || []
				/// where to insert 示例添加到头部，可以是随意位置
				item.children.unshift(dragObj!)
				// 자식들의 orderSeq 값을 재정렬
				// updateOrderSeq(item.children);
			})
		} else if (
			(info.node.children || []).length > 0 && // 자식이 있음
			info.node.expanded && // 확장됨
			dropPosition === 1 // 하단 간격에 드롭
		) {
			loop(data, dropKey, (item: DataNode) => {
				item.children = item.children || []
				// where to insert 示例添加到头部，可以是随意位置
				item.children.unshift(dragObj!)
			})
		} else {
			let ar: DataNode[] = []
			let i = 0
			loop(data, dropKey, (_item: DataNode, index: number, arr: DataNode[]) => {
				ar = arr
				i = index
			})
			if (dropPosition === -1) {
				ar.splice(i, 0, dragObj!)
			} else {
				ar.splice(i + 1, 0, dragObj!)
			}
			// 동일 레벨의 노드들 orderSeq 재정렬
			// updateOrderSeq(ar);
		}
		// 드래그된 객체의 새로운 부모 ID를 설정
		// if (!info.dropToGap) {
		//   // 드롭된 객체의 자식으로 추가된 경우
		//   console.log("--------------------------------", dropKey)
		//   dragObj.parentId = dropKey;
		// }
	}
	let refreshData: DataNode[] = data
	updateOrderSeq(refreshData)

	if (dragObj && dragObj.parentId) {
		loop(data, dragObj.parentId, (item: DataNode, index: number, arr: DataNode[]) => {
			if (Array.isArray(item.children)) {
				item.children.forEach((child: DataNode) => {
					patchDepartments(child)
				})
			}
		})
	} else {
		refresh()
	}
}

const columns = ref<ColumnsType<any>>([
	{
		title: "부서",
		dataIndex: "departmentName",
		resizable: true,
		sorter: (a: any, b: any) => a.departmentName!.length - b.departmentName!.length,
		width: -1,
	},
	{
		title: "이름",
		dataIndex: "name",
		resizable: true,
		sorter: (a: any, b: any) => a.name!.length - b.name!.length,
		width: -1,
	},
	{
		title: "직위",
		dataIndex: "gradeName",
		resizable: true,
		sorter: (a: any, b: any) => a.name!.gradeName - b.gradeName!.length,
		width: -1,
	},
	{
		title: "직책",
		dataIndex: "jobName",
		resizable: true,
		sorter: (a: any, b: any) => a.name!.jobName - b.jobName!.length,
		width: -1,
	},
	{ title: "이메일", dataIndex: "email", resizable: true, width: -1 },
])

/**
 * orderSeq 재정렬 재귀함수
 * @param data
 */
const updateOrderSeq = (data: DataNode[]) => {
	data.forEach((item, index) => {
		item.orderSeq = index + 1
		if (item.children) {
			updateOrderSeq(item.children)
		}
	})
}

/**
 * 부서 정보 수정
 * @param data
 */
const patchDepartments = async (data: DataNode) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/departments/${data.id}`, {
		method: "PATCH",
		body: data,
	}).finally(() => {
		refresh()
		getDepartmentEmployees(memberSearchParams.value.departmentId)
		treeSelectedName.value = addDepartmentField.value.departmentName
	})
}

/**
 * 부서 정보 저장
 * @param data
 */
const postDepartments = async (data: DataNode) => {
	return await useCFetch<Response<any>>(`/api/v2/settings/departments`, {
		method: "POST",
		body: data,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			refresh()
		} else {
			message.error(`${res.message}`)
		}
	})
}

/**
 * 부서 사용자 할당 수정
 * @param data
 */
const patchDepartmentsAssignEmployees = async (data: AddUserRef) => {
	type EmployeeIdType = { id: string | number }
	const employeeIds: Array<EmployeeIdType> = []
	data.users.forEach((item) => {
		employeeIds.push({ id: item })
	})
	const body = Object.assign(
		{},
		{
			id: data.id,
			companyCode: addDepartmentField.value.companyCode,
			employeeIds,
		}
	)

	return await useCFetch<Response<any>>(`/api/v2/settings/departments/assign/employees`, {
		method: "PATCH",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success(`${res.message}`)
			refresh()
		} else {
			message.error(`${res.message}`)
		}
	})
}

/**
 * 테이블 체크박스 선택 변경 이벤트
 */
const onSelectChange = (keys: (string | number)[], rows: DataTableType[]) => {
	//아이템 선택(체크) 키
	selectedRowKeys.value = keys
	//아이템 선택 시 부서이동 임직원 리스트 초기화
	deptData.value.member = rows
}
/**
 * 부서 추가 전달 이벤트
 * * 성공 시 API(저장/수정) 호출
 * * 실패 시 필드 리젝
 */
const submitDept = (v: IAddField) => {
	deptValidate()
		.then((res: IAddField) => {
			const loop = (data: DataNode[], id: string | number, callback: any) => {
				data!.forEach((item, index) => {
					if (item.id === id) {
						return callback(item, index, data)
					}
					if (item.children) {
						return loop(item.children, id, callback)
					}
				})
			}
			if (v.stage === "new") {
				let lastOrderSeq = 0
				let depth = 0
				loop(
					rowData.value,
					res.parentId,
					(item: DataNode, index: number, arr: DataNode[]) => {
						lastOrderSeq = determineTreeMaxId(arr, "orderSeq") + 1
						depth = determineTreeMaxId(arr, "depth")
					}
				)

				const postData = {
					companyCode: res.companyCode, //
					workplaceCode: addDepartmentField.value.workplaceCode,
					name: res.departmentName, //
					code: res.departmentCode, //
					orderSeq: lastOrderSeq,
					parentId: res.parentId, //
					depth,
					used: true,
				} as DataNode

				postDepartments(postData).finally(() => deptModalClose())
			} else {
				const patchData = {
					id: v.id,
					// workplaceId: res.workplaceId,
					workplaceCode: addDepartmentField.value.workplaceCode,
					companyCode: res.companyCode,
					name: res.departmentName,
					code: res.departmentCode,
					orderSeq: v.orderSeq,
					parentId: res.parentId,
				} as DataNode
				patchDepartments(patchData).finally(() => deptModalClose())
			}
		})
		.catch((err) => {
			console.error("부서 추가 필드 리젝", err)
		})
}

/**
 * 부서 모달 오픈
 */
const deptModalOpen = async (stage: "new" | "update") => {
	if (stage === "new") {
		await nextTick(() => {
			// deptResetFields(['departmentName', 'departmentCode']);
			addDepartmentField.value.companyCode =
				rowData.value.length > 0
					? rowData.value[0].companyCode
					: companySearchParams.value.companyCode
			addDepartmentField.value.companyId =
				rowData.value.length > 0
					? rowData.value[0].companyId
					: companySearchParams.value.companyId
			addDepartmentField.value.departmentCode = ""
			addDepartmentField.value.departmentName = ""
			deptClearValidate(["departmentName", "departmentCode"])
			// addDepartmentField.value.parentId = memberSearchParams.value.departmentId || '';
			setTimeout(() => {
				showFieldModal.value = true
			}, 100)
		})
	} else {
		if (treeSelected.value && treeSelected.value.length > 0) {
			await useCFetch<Response<any>>(
				`/api/v2/settings/departments/${addDepartmentField.value.id}`,
				{
					method: "GET",
					params: {
						companyCode: getCompanyCode.value,
						workPlaceId: getRole.value === "ROOT" ? undefined : getWorkplaceId.value,
					},
				}
			)
				.then((res: Response<any>) => {
					if (res.status === 0) {
						addDepartmentField.value.id = res.data.id
						addDepartmentField.value.parentId = res.data.parentId
						addDepartmentField.value.departmentCode = res.data.code
						addDepartmentField.value.departmentName = res.data.name
						addDepartmentField.value.orderSeq = res.data.orderSeq
					}
				})
				.finally(() => (showFieldModal.value = true))
		} else {
			showFieldModal.value = false
			message.info("부서를 선택해주세요.")
		}
	}
}

/**
 * 부서 모달 닫기
 */
const deptModalClose = () => {
	if (treeSelected.value && treeSelected.value.length > 0) {
		deptFormRef.value?.resetFields(["departmentName", "departmentCode"])
	} else {
		// deptResetFields();
		deptClearValidate()
	}

	showFieldModal.value = false
}

/**
 * 사용자 추가 전달 이벤트
 * * 성공 시 API(저장/수정) 호출
 * * 실패 시 필드 리젝
 */
const submitUser = (v: AddUserRef) => {
	userValidate()
		.then(() => {
			patchDepartmentsAssignEmployees(v).finally(() => userModalClose())
		})
		.catch((err) => {
			console.error("사용자 추가 필드 리젝", err)
		})
}

/**
 * 사용자 모달 오픈
 */
const userModalOpen = async () => {
	userResetFields()
	selectedRowKeys.value = []
	await getDepartmentEmployees(memberSearchParams.value.departmentId, "/commons").finally(
		() => (showUserModal.value = true)
	)
}

/**
 * 사용자 모달 닫기
 */
const userModalClose = async () => {
	userResetFields()
	await getDepartmentEmployees(memberSearchParams.value.departmentId, "/commons").finally(
		() => (showUserModal.value = false)
	)
}

/**
 * 부서 삭제
 * @param data
 */
const deleteTree = async (id: string | number) => {
	await useCFetch<Response<any>>(`/api/v2/settings/departments/${id}`, {
		method: "DELETE",
		body: { id },
	}).then((res: Response<any>) => {
		if (res.status === 0) refresh()
	})
}

/**
 * 부서이동 Submit 콜백
 * @param value
 */
const callbackDeptModal = (value: any) => {
	console.log("callbackDeptModal", value)
	if (value) {
		// treeSelected.value = [];
		// deptData.value.currentCode = [];

		refresh()
		getDepartmentEmployees(memberSearchParams.value.departmentId)
		selectedRowKeys.value = []
	}
}

/**
 * 트리 필터링 watcher
 */
watch(searchValue, (value) => {
	console.log(value)
})

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		refresh().finally(() => {
			rowData.value = filterTreeData(rowData.value, query)
		})
	}

	if (!query) {
		refresh()
	}
	oldValue = query
}

/**
 * 임직원 변수
 */
const memberList = ref<DataTableType[]>([])
/**
 * 임직원 조회 로딩 플래그
 */
const memberLoad = ref<boolean>(false)
/**
 * 부서별 임직원 조회
 * @param id
 */
const getDepartmentEmployees = async (id?: string, path: string = "") => {
	if (id) {
		memberLoad.value = true
		const page =
			memberSearchParams.value.page && memberSearchParams.value.page > 1
				? memberSearchParams.value.page - 1
				: 0

		return await useCFetch<Response<DataTableType[]>>(
			`/api/v2/settings${path}/employees`,
			{
				method: "GET",
				params: {
					companyCode: addDepartmentField.value.companyCode
						? addDepartmentField.value.companyCode
						: getCompanyCode.value,
					//companyCode: addDepartmentField.value.companyCode,
					workPlaceId: getRole.value === "ROOT" ? undefined : getWorkplaceId.value,
					departmentId: id,
					page: page,
					size: memberSearchParams.value.size,
				},
			}
		)
			.then((res: Response<DataTableType[]>) => {
				if (res.status === 0) {
					memberList.value = res.data as DataTableType[]
					addUsersField.value.id = id
					addUsersField.value.users = memberList.value
						.filter((member) => member.id)
						.map((member) => member.id) as (string | number)[]
					if (!path) {
						memberSearchParams.value.page = res.pageNumber || 0
						// memberSearchParams.value.size = res.size || 0;
					}
					memberSearchParams.value.totalElements = res.totalElements || 0
				} else {
					memberList.value = []
				}
			})
			.finally(() => (memberLoad.value = false))
	}
}

/**
 * 페이징 처리할 때 필요한 이벤트(테이블 이벤트 변경)
 * @param
 */
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	memberSearchParams.value.page = pagination.current
	memberSearchParams.value.size = pagination.pageSize
	getDepartmentEmployees(memberSearchParams.value.departmentId)
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const {
	data: rowData,
	refresh,
	clear,
	execute,
	status,
} = await useAsyncData(`department-list`, () =>
	useCFetch<Response<any>>("/api/v2/settings/departments", {
		method: "GET",
		params: {
			companyCode: companySearchParams.value.companyCode,
		},
	}).then((res: Response<any>) => res.data)
)

const companyCodeUpdate = (value: any) => {
	addDepartmentField.value.companyCode = value.code
	addDepartmentField.value.companyId = value.id
	addDepartmentField.value.workplaceCode = value.workplaceCode
}

const handleMenuClick = (e: any) => {
	if (e.key === "delete") {
		Modal.confirm({
			title: "삭제하시겠습니까?",
			okText: "삭제",
			cancelText: "취소",
			icon: materialIcons("mso", "cancel", 2.4),
			okButtonProps: {
				danger: true,
			},
			onOk: () => {
				deleteTree(treeSelected.value[0])
			},
			onCancel: () => {
				console.log("cancel")
			},
		})
	}
	if (e.key === "edit") {
		deptModalOpen((addDepartmentField.value.stage = "update"))
	}
}

nuxtApp.hook("page:finish", () => {
	if (companySearchParams.value.companyCode) {
		nextTick(() => {
			clear()
			refresh()
		})
	}
})

onActivated(() => {
	execute()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				조직도를 만들고, 조직에 사용자를 추가할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-flex :gap="10" v-if="getRole === 'ROOT'">
				<a-space :size="10">
					<eacc-select
						:style="{ width: '24rem' }"
						label="회사"
						:first="companySearchParams.companyCode ? false : true"
						:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
						:on-all-field="false"
						v-model:value="companySearchParams.companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						value-type="any"
						:refresh="true"
						@update:any-value="
							(value: any) => {
								companySearchParams.companyCode = value.code
								companySearchParams.companyId = value.id
								if (addDepartmentField.companyCode) value.code
								if (addDepartmentField.companyId) value.id
							}
						"
						:disabled="getRole !== 'ROOT'"
					>
					</eacc-select>
				</a-space>
				<eacc-button
					componentIs="search"
					type="primary"
					:modal-open="false"
					:data="companySearchParams"
					@click="() => refresh()"
				>
				</eacc-button>
			</a-flex>
			<a-divider v-if="getRole === 'ROOT'" class="my-md" />
			<a-row :gutter="[15, 15]" :wrap="false">
				<a-col flex="40rem">
					<a-flex gap="small" justify="end" class="mb-md">
						<!-- <eacc-button
							component-is="delete"
							:data="treeSelected"
							:modal-open="true"
							:disabled="treeSelected.length === 0 || !addDepartmentField.parentId"
							@click="(id: Array<string | number>) => deleteTree(id[0])"
						></eacc-button>
						<a-button
							:icon="materialIcons('mso', 'edit')"
							:disabled="treeSelected.length === 0 || !addDepartmentField.parentId"
							@click="deptModalOpen((addDepartmentField.stage = 'update'))"
						>
							수정
						</a-button> -->
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'add_circle')"
							@click="deptModalOpen((addDepartmentField.stage = 'new'))"
						>
							부서추가
						</a-button>
						<eacc-excel-button
							url="/api/v2/settings/departments/validate"
							req-type="upload"
							label="일괄등록"
							:sample-file-key="routePath"
							@submit="() => refresh()"
						/>
						<a-dropdown :trigger="['click']">
							<a-button :icon="materialIcons('mso', 'more_vert')" />
							<template #overlay>
								<a-menu @click="handleMenuClick">
									<a-menu-item
										key="edit"
										:icon="materialIcons('mso', 'edit')"
										:disabled="treeSelected.length === 0 || !addDepartmentField.parentId"
									>
										수정
									</a-menu-item>
									<a-menu-divider />
									<a-menu-item
										danger
										key="delete"
										:icon="materialIcons('mso', 'delete')"
										:disabled="treeSelected.length === 0 || !addDepartmentField.parentId"
									>
										삭제
									</a-menu-item>
								</a-menu>
							</template>
						</a-dropdown>
					</a-flex>
					<div class="tree-wrap">
						<a-input-search
							v-model:value="searchValue"
							placeholder="Search"
							class="mb-md"
							@input="onQueryChanged(searchValue)"
						/>
						<a-tree
							draggable
							block-node
							:show-icon="true"
							:selected-keys="treeSelected"
							:default-expand-all="true"
							:tree-data="rowData"
							:field-names="{
								children: 'children',
								title: 'name',
								key: 'id',
							}"
							:checkable="false"
							@expand="onExpand"
							@select="onSelect"
							@drop="onDrop"
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
								<component :is="materialIcons('m', 'folder')" class="text-warning" />
							</template>
						</a-tree>
					</div>
				</a-col>
				<a-col :flex="3">
					<a-flex gap="small" justify="space-between" align="center" class="mb-md">
						<a-typography-title :level="4" class="page-title">
							부서정보
							{{ treeSelectedName ? "[" + treeSelectedName + "]" : "" }}
						</a-typography-title>
						<a-space :size="5">
							<a-button
								type="primary"
								ghost
								:icon="materialIcons('mso', 'arrow_outward')"
								@click="
									() => {
										showDeptModal = true
									}
								"
								:disabled="selectedRowKeys.length === 0"
								>부서이동</a-button
							>
							<a-button
								type="primary"
								:icon="materialIcons('mso', 'person_add')"
								@click="userModalOpen()"
								:disabled="treeSelected.length === 0"
								>사용자추가</a-button
							>

							<a-select
								v-model:value="memberSearchParams.size"
								:options="pageSizeOptions"
								@change="getDepartmentEmployees(memberSearchParams.departmentId)"
								value-field="key"
								text-field="label"
							/>
						</a-space>
					</a-flex>

					<a-table
						size="small"
						:data-source="memberList"
						:columns="columns"
						:showSorterTooltip="false"
						:row-key="(record) => record.id"
						:row-selection="{
							selectedRowKeys,
							onChange: onSelectChange,
						}"
						:pagination="
							Object.assign({}, pagination, {
								current: memberSearchParams.page ? memberSearchParams.page + 1 : 1,
								pageSize: memberSearchParams.size,
								total: memberSearchParams.totalElements,
							})
						"
						:loading="memberLoad"
						@change="cellChange"
						@resizeColumn="handleResizeColumn"
					></a-table>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				:field="addDepartmentField"
				:title="addDepartmentField.stage === 'new' ? '부서추가' : '부서수정'"
				:showed="showFieldModal"
				@closed="deptModalClose()"
				@submit="(data: any) => submitDept(data)"
			>
				<template #content="{ field }">
					<a-form
						ref="deptFormRef"
						label-align="left"
						:colon="false"
						:label-col="{ span: 6 }"
						:wrapper-col="{ span: 18 }"
						:model="field"
						:rules="deptRulesRef"
					>
						<a-form-item
							v-if="getRole === 'ROOT'"
							label="회사"
							name="companyCode"
							v-bind="deptValidateInfos.companyCode"
							has-feedback
						>
							<eacc-select
								:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
								:on-all-field="false"
								v-model:value="field.companyCode"
								:field-names="{ label: 'name', value: 'code' }"
								value-type="any"
								:disabled="getRole === 'ROOT'"
								@update:anyValue="companyCodeUpdate"
							>
							</eacc-select>
						</a-form-item>
						<a-form-item
							label="상위부서"
							name="parentId"
							v-bind="deptValidateInfos.parentId"
							has-feedback
						>
							<!-- :url="`/api/v2/settings/departments/select?companyCode=${field.companyCode}${field.id ? '&id=' + field.id : ''}${field.departmentCode ? '&code=' + field.departmentCode : ''}`" -->
							<!-- :url="`/api/v2/settings/commons/departments/parent?companyCode=${field.companyCode}${field.id ? '&id=' + field.id : ''}${field.departmentCode ? '&code=' + field.departmentCode : ''}`" -->
							<eacc-select
								:url="`/api/v2/settings/departments/select?companyCode=${companySearchParams.companyCode}${companySearchParams.companyId ? '&id=' + companySearchParams.companyId : ''}`"
								:on-all-field="false"
								:refresh="true"
								v-model:value="field.parentId"
								:field-names="{ label: 'name', value: 'id' }"
								@update:value="(value) => (field.parentId = value)"
							>
							</eacc-select>
						</a-form-item>
						<a-form-item
							label="부서명"
							name="departmentName"
							v-bind="deptValidateInfos.departmentName"
							has-feedback
						>
							<a-input v-model:value="field.departmentName" />
						</a-form-item>
						<a-form-item
							label="부서코드"
							name="departmentCode"
							v-bind="deptValidateInfos.departmentCode"
							has-feedback
						>
							<a-input v-model:value="field.departmentCode" />
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
			<dept-modal
				:show="showDeptModal"
				:data="deptData"
				@update:show="(value) => (showDeptModal = value)"
				@callback="callbackDeptModal"
			/>
			<!-- <user-modal
        :show="showUserModal"
        :tree="rowData"
        @update:show="(value) => (showUserModal = value)"
      /> -->
			<field-modal
				:field="addUsersField"
				title="사용자추가"
				size="large"
				:showed="showUserModal"
				@closed="userModalClose()"
				@submit="(data: any) => submitUser(data)"
			>
				<template #content="{ field }">
					<a-form
						ref="userFormRef"
						label-align="left"
						:colon="false"
						:model="field"
						:rules="userRulesRef"
						:style="{
							padding: '1.5rem 0 1.5rem',
						}"
					>
						<a-form-item name="users" v-bind="userValidateInfos.users" has-feedback>
							<eacc-select-multi-table
								url="/api/v2/settings/commons/employees/paging"
								v-model:value="field.users"
								key-props="id"
								:columns="[
									{
										title: '이름',
										data: (row: any) => row.name,
									},
									{ title: '직위', data: (row: any) => row.jobName },
									{ title: '부서', data: (row: any) => row.departmentName },
									{ title: '회사', data: (row: any) => row.companyName },
								]"
								@update:value="(value) => (field.users = value)"
								@selection-change="(value) => (field.employeesInfo = value)"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
