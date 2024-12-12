import { MemberStatusCode, MemberStatusLabel, type Author, type User } from "@/types"

// auth store
export const useAuthStore = defineStore("auth", {
	state: () => {
		return {
			user: {} as User,
		}
	},
	getters: {
		getRoleId: (state): number => state.user.roleId,
		getEmail: (state): string => state.user.email,
		getCompanyId: (state): number => state.user.companyId,
		getCompanyCode: (state): string => state.user.companyCode,
		getCompanyName: (state): string | undefined => state.user.companyName,
		getCostCenterId: (state): number => state.user.costCenterId,
		getLoginId: (state): string => state.user.loginId,
		getName: (state): string => state.user.name,
		getEmployeeId: (state): number => state.user.employeeId,
		getUserId: (state): number => state.user.userId,
		getRole: (state): string => state.user.role,
		getPositionName: (state): string => state.user.positionName,
		getWorkplaceId: (state): number => state.user.workplaceId,
		getWorkplaceCode: (state): string => state.user.workplaceCode,
		getDepartmentId: (state): number => state.user.departmentId,
		getDepartmentName: (state): string => state.user.departmentName,
		getJobTitleId: (state): number => state.user.jobTitleId,
		getUser: (state): User => state.user,
	},
	actions: {
		setUser(data: User) {
			this.user = data
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
