import type { Response } from "@/types"

interface FilledTree {
	id: number
	parentId: number
	code: string
	name: string
	placeTypeName: string
	placeTypeLabel: string
	workplaceCode: string
	workplaceName: string
	registrationNumber: string
	used: boolean
	orderSeq: number
	companyCode: string
	description: string
	depth: number
	updatedBy: string
	updatedAt: string
	employeeNumber: string
	companyName: string
	departmentCode: string
	departmentName: string
	costCenterCode: string
	costCenterName: string
	upperDepartmentCode: string
	upperDepartmentName: string
	employeeDivisionCode: string
	employeeDivisionName: string
	gradeCode: string
	gradeName: string
	jobCode: string
	jobName: string
	joinedDate: string
	email: string
	phoneNumber: string
	mobileNumber: string
	departmentId: number
	positionId: number
	jobTitleId: number
	costCenterId: number
	children: Array<FilledTree>
	type: "c" | "d" | "u"
	key: string
	disabled: boolean
	disableCheckbox: boolean
	isLeaf: boolean
}

/**
 *
 * @returns
 */
export const useOrgzTree = async () => {
	const authStore = useAuthStore()
	const { getCompanyCode } = storeToRefs(authStore)

	const getCompanies = async (companyCode: string) => {
		const { list } = useCompany()

		return list({ companyCode })
			.then((res: any) => res.data.value)
			.then((data: Array<FilledTree>) => (data || []) as Array<FilledTree>)
	}

	const getDepartment = async (code: string) => {
		return await useCFetch<Response<Array<FilledTree>>>(
			`/api/v2/settings/departments?companyCode=${code}`,
			{
				method: "GET",
				params: { companyCode: code },
			}
		).then((res: Response<Array<FilledTree>>) => res.data || [])
	}

	// const getEmployees = async (params: any) => {
	//   return await useIFetch<Response<FilledTree>>(`/api/v2/settings/employees?departmentId=${params.id}&departmentCode=${params.code}`, {
	//     method: 'GET',
	//     params
	//   }).then((res: any) => res.data.value).then((res: Response<FilledTree>) => (res.data || []) as Array<FilledTree>);
	// };

	const departmentLoop = (departments: FilledTree) => {
		departments.type = "d"
		departments.disabled = true
		departments.disableCheckbox = true
		departments.key = `${departments.id}${departments.code}`

		const __departmentLoop = (items: Array<FilledTree>) => {
			items.forEach((item: FilledTree) => {
				item.type = "d"
				item.disabled = true
				item.disableCheckbox = true

				item.key = `${item.id}${item.code}`

				if (item.children && !item.employeeNumber) {
					__departmentLoop(item.children)
				}
			})
		}

		if (departments.children) {
			__departmentLoop(departments.children)
		}
		return departments
	}

	return new Promise((resolve, reject) => {
		getCompanies(getCompanyCode.value).then(async (data: Array<FilledTree>) => {
			const companies = data.map((company: FilledTree) => {
				company.type = "c"
				company.disabled = true
				company.disableCheckbox = true
				company.key = `${company.id}${company.code}`
				company.children = []
				return company
			})

			const departments = companies.map(async (company: any) => {
				const _dept = await Promise.all([await getDepartment(company.code)])

				company.children =
					Object.keys(_dept[0]).length > 0
						? _dept[0].map((department: FilledTree) => {
								return departmentLoop(department)
							})
						: []
				return company
			})

			const result = await Promise.all(departments)

			if (result && result.length > 0) {
				resolve(result)
			} else {
				reject()
			}
		})
	})
}
