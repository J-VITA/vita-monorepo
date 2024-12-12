import type { RequestParams, Response } from "@/types"

type Employee = {
	id: number
	employeeNumber: string
	name: string
	deleted: boolean
}

type EmployeeTree = {
	id: number
	companyCode: string
	code: string
	name: string
	orderSeq: number
	depth: number
	used: boolean
	parentId?: number
	employee?: Array<Employee>
	children?: Array<EmployeeTree>
	type?: "c" | "d" | "u"
	key?: string
	disabled?: boolean
	disableCheckbox?: boolean
	isLeaf?: boolean
	employeeData: any
}

/**
 * 회사, 부서, 임직원 데이터를 관리하는 컴포저블 API
 *
 * 주요 기능:
 * - 전체 회사 > 부서 > 임직원 계층 구조 데이터 조회
 * - 회사와 부서 데이터를 트리 구조로 재가공
 * - 트리 노드 선택 시 해당 임직원 데이터 조회 및 처리
 *
 * @returns {Object} 다음 속성을 포함하는 객체:
 *   - treeList: 회사와 부서 구조의 트리 데이터
 *   - selectedNode: 현재 선택된 트리 노드 객체
 *   - loading: 임직원 데이터 조회 시 로딩 상태 플래그
 *   - dataTable: 조회 및 가공된 임직원 데이터
 *   - onSelect: 트리 노드 선택 이벤트 핸들러 함수
 *   - cellChange: 미사용 (페이징 처리 불필요)
 */
export const useEmployeeTree = () => {
	const selectedNode = ref<EmployeeTree | null>(null)
	const dataTable = ref<Employee[]>([])
	const loading = ref<boolean>(false)
	// 임직원을 부서에 포함시키는 함수 (사용안해서 주석)
	// const processTreeItem = (item: EmployeeTree): EmployeeTree => {
	//   const processedItem: EmployeeTree = {
	//     ...item,
	//     type: item.parentId ? 'd' : 'c',
	//     disabled: false,
	//     disableCheckbox: false,
	//     key: `${item.id}${item.code}`,
	//     isLeaf: !item.children || item.children.length === 0
	//   };

	//   let employeeNodes: EmployeeTree[] = [];
	//   if (processedItem.employee && processedItem.employee.length > 0) {
	//     employeeNodes = processedItem.employee.map(emp => ({
	//       id: emp.id,
	//       name: emp.name,
	//       companyCode: processedItem.companyCode,
	//       code: emp.employeeNumber,
	//       orderSeq: 0,
	//       depth: processedItem.depth + 1,
	//       used: true,
	//       key: `emp-${emp.id}`,
	//       type: 'u',
	//       isLeaf: true,
	//       children: [],
	//       employeeNumber: emp.employeeNumber,
	//       deleted: emp.deleted
	//     }));
	//   }

	//   if (processedItem.children) {
	//     processedItem.children = processedItem.children.map(child => processTreeItem(child));
	//   }

	//   processedItem.children = [...(processedItem.children || []), ...employeeNodes];
	//   processedItem.isLeaf = processedItem.children.length === 0;

	//   // employee 배열 제거
	//   delete (processedItem as any).employee;

	//   return processedItem;
	// }

	const processTreeItem = (item: EmployeeTree): EmployeeTree => {
		const processedItem: EmployeeTree = {
			...item,
			type: item.parentId ? "d" : "c",
			disabled: false,
			disableCheckbox: false,
			key: `${item.id}${item.code}`,
			isLeaf: !item.children || item.children.length === 0,
		}

		if (processedItem.children) {
			processedItem.children = processedItem.children.map((child) =>
				processTreeItem(child)
			)
		}

		// employee 정보는 트리에서 제외하지만, 나중에 사용하기 위해 보존
		if (processedItem.employee) {
			processedItem.employeeData = processedItem.employee
			delete processedItem.employee
		}

		return processedItem
	}

	const treeList = async (params: Ref<RequestParams<any>>) => {
		const { data, status, error, execute, refresh } = await useAsyncData(
			`departments-employee-tree-${JSON.stringify(params.value)}`,
			() =>
				useCFetch<Response<Array<EmployeeTree>>>(
					"/api/v2/settings/departments/employee-tree",
					{
						method: "GET",
						params: params.value,
					}
				),
			{
				transform: (response: Response<Array<EmployeeTree>>) =>
					response.data ? response.data.map(processTreeItem) : [],
				watch: [params],
				immediate: true,
				deep: true,
			}
		)

		return {
			data,
			status,
			error,
			execute,
			refresh,
		}
	}

	const fetchEmployeeDetails = async (employeeId: number) => {
		const { data } = await useCFetch<Response<Employee>>(
			`/api/v2/settings/employees/${employeeId}`,
			{
				method: "GET",
			}
		).then((response: Response<Employee>) => response || ({} as any))
		return data
	}

	// (keys: (string | number)[], id: number) =>
	const onSelect = async (selectedKeys: (string | number)[], info: any) => {
		selectedNode.value = info.node
		if (selectedNode.value?.employeeData) {
			loading.value = true
			try {
				const detailedEmployees = await Promise.all(
					selectedNode.value.employeeData.map(async (emp: Employee) => {
						const details = await fetchEmployeeDetails(emp.id)
						return { ...emp, ...details }
					})
				)
				dataTable.value = detailedEmployees
			} catch (error) {
				console.error("Error fetching employee details:", error)
				dataTable.value = selectedNode.value.employeeData
			} finally {
				loading.value = false
			}
		} else {
			dataTable.value = []
		}
	}

	const cellChange = () => {
		// 테이블 변경 로직 구현
	}

	return {
		treeList,
		selectedNode,
		loading,
		dataTable,
		onSelect,
		cellChange,
	}
}
