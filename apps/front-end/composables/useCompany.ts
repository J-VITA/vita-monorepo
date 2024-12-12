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

	const organizationChart = async (
		params: any,
		draftEmployeeNumber?: string | undefined
	) => {
		return useAsyncData(`organization-chart`, () =>
			useCFetch<Response<any>>("/api/v2/settings/departments/employee-tree", {
				method: "GET",
				params: params,
			}).then((res: Response<any>) => {
				return mergeEmployeesToChildren(res.data)
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
