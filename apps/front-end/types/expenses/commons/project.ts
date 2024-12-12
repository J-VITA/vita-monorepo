interface IProject {
	id: number
	companyCode: string
	code: string
	name: string
	startYearMonth: string
	endYearMonth: string
	employeeAmount: number
	used: boolean
}
export type CommonProject = Partial<IProject>
