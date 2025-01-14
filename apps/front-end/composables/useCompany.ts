import {
	type Workplace,
	type WorkplaceTree,
	initWorkPlaceData,
	initCompanyData,
} from "@/types/settings/workplaces"
import type { Response } from "@/types"

export const useCompany = () => {
	const list = async (params: any) => {
		const { data, pending, refresh } = await useAsyncData("settings-companies-list", () =>
			useCFetch<Response<Array<WorkplaceTree>>>("/api/v2/settings/companies", {
				method: "GET",
				params,
			}).then((res: Response<any>) => {
				return res.data.map((data: WorkplaceTree) => {
					if (!data.isLeaf) {
						data.isLeaf = false
					}
					data.status = "read"
					return data
				})
			})
		)
		return {
			data,
			pending,
			refresh,
		}
	}

	const detail = async (id: string | number) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/settings/companies/${id}`, {
				method: "GET",
				params: {
					id,
				},
			}).then((res: Response<any>) => res)
		)
	}

	const save = async (body: Workplace) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/settings/companies`, {
				method: "POST",
				body,
			}).then((res: Response<any>) => res)
		)
	}

	const update = async (body: Workplace, id: string | number) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/settings/companies/${id}`, {
				method: "PATCH",
				body,
			}).then((res: Response<any>) => res)
		)
	}

	const remove = async (id: string | number) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/settings/companies/${id}`, {
				method: "DELETE",
				body: { id },
			}).then((res: Response<any>) => res)
		)
	}

	function mergeEmployeesToChildren(data: any[]): any[] {
		return data.map((item) => {
			item.key = item.code ? `${item.code}` : item.id
			item.title = `${item.name} ${item.positionName ? item.positionName : ""}`
			item.approvalEmployeePositionName = item.positionName
			item.referEmployeePositionName = item.positionName
			item.approvalEmployeeId = item.id
			item.approvalEmployeeName = item.name
			item.referEmployeeName = item.name
			item.disabled = !item.employeeNumber

			// 'employee' 배열이 존재하면 'children' 배열에 추가
			if (item.employee) {
				if (!item.children) {
					item.children = []
				}
				// employee 항목에 부모의 approvalEmployeeName을 추가
				item.children.push(
					...item.employee.map((emp: any) => {
						// 부모의 approvalEmployeeName을 각 employee에 추가
						emp.approvalEmployeePositionName = item.approvalEmployeeName
						emp.referEmployeeDepartmentName = item.approvalEmployeeName
						return emp
					})
				)
				delete item.employee // 'employee' 배열은 삭제
			}

			// 자식 항목이 있으면 재귀적으로 처리
			if (item.children) {
				item.children = mergeEmployeesToChildren(item.children)
			}

			return item
		})
	}

	/**
	 * 트리 데이터 구조를 유지하면서, 각 레벨에서 children 속성이 없는 항목들을 상단에 배치 후 새로운 배열을 반환
	 * @param data
	 * @returns
	 */
	const preprocessTreeData = (data: any[]): any[] => {
		return (
			data
				// 1. 정렬: children이 없는 항목을 상단에 배치
				.sort((a, b) => {
					if (!a.children && b.children) return -1 // a는 children이 없고 b는 children이 있을 때 a를 상단으로 이동
					if (a.children && !b.children) return 1 // a는 children이 있고 b는 children이 없을 때 b를 상단으로 이동
					return 0 // 둘 다 children이 있거나 없으면 순서를 유지
				})
				// 2. 재귀적으로 children을 처리
				.map((item) => {
					if (item.children && item.children.length > 0) {
						// children이 있는 경우, 현재 항목의 복사본을 생성하고 children 배열에 대해 재귀적으로 동일한 처리를 수행
						return { ...item, children: preprocessTreeData(item.children) }
					}
					// children이 없는 경우, 현재 항목을 그대로 반환
					return item
				})
		)
	}

	const organizationChart = async (
		params: any,
		draftEmployeeNumber?: string | undefined
	) => {
		return useAsyncData(`organization-chart`, () =>
			useCFetch<Response<any>>("/api/v2/settings/departments/employee-tree", {
				method: "GET",
				params: params,
			}).then((res: Response<any>) => {
				return preprocessTreeData(mergeEmployeesToChildren(res.data))
			})
		)
	}

	return {
		list,
		detail,
		save,
		update,
		remove,
		organizationChart,
	}
}
