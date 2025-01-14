import { computed } from "vue"
import type { Code, RequestParams, Response } from "@/types"
import { SlipActivityType, TSlipSearch } from "@/types/slips/list"
import { TSlipConfirmSearch } from "@/types/slips/confirm"
import { TSlipResultSearch } from "@/types/slips/result"

/**
 * 전표내역(코스트센터/프로젝트/법인카드) 정보 및 API 기능
 * @returns
 */
export const useSlips = () => {
	/**
	 * 전표내역(코스트센터/프로젝트/법인카드) 관련 ref 변화하는 액티비에 따라 호출 경로 다름.
	 * @param activityType
	 * @returns
	 */
	const list = (
		activityType: Ref<SlipActivityType>,
		params: ComputedRef<TSlipSearch>
	) => {
		const apiPath = computed(() =>
			activityType.value === SlipActivityType.SLIPS_CARD
				? "/api/v2/slips/managements/card"
				: "/api/v2/slips/managements/cost-center-project"
		)
		return useAsyncData<Response<any>>(
			`slips-activity-type-${apiPath.value}-${activityType.value}-${JSON.stringify(params.value)}`,
			() =>
				useCFetch<Response<any>>(`${apiPath.value}`, {
					method: "GET",
					params: {
						...params.value,
						filterDate: undefined,
						employeeIds: undefined,
						costCenterIds: undefined,
						workplaceCodes: undefined,
					},
				}),
			{
				watch: [() => activityType.value, () => ({ ...params.value })],
				immediate: true,
				deep: true,
				transform: (response: Response<any>) => ({
					...response,
					data: response.data ? response.data : [],
				}),
			}
		)
	}

	/**
	 * 전표검인/확정 조회
	 * @param params
	 * @returns
	 */
	const checks = (params: ComputedRef<TSlipConfirmSearch>) => {
		return useAsyncData<Response<any>>(
			`slips-activity-type-${JSON.stringify(params.value)}`,
			() =>
				useCFetch<Response<any>>(`/api/v2/slips/managements/check`, {
					method: "GET",
					params: {
						...params.value,
						filterDate: undefined,
						employeeIds: undefined,
						departmentIds: undefined,
					},
				}),
			{
				watch: [() => ({ ...params.value })],
				immediate: true,
				deep: true,
				transform: (response: Response<any>) => ({
					...response,
					data: response.data ? response.data : [],
				}),
			}
		)
	}

	/**
	 * 전표확정현황 조회
	 * @param params
	 * @returns
	 */
	const complete = (params: ComputedRef<TSlipResultSearch>) => {
		return useAsyncData<Response<any>>(
			`slips-activity-type-${JSON.stringify(params.value)}`,
			() =>
				useCFetch<Response<any>>(`/api/v2/slips/managements/complete`, {
					method: "GET",
					params: {
						...params.value,
						filterDate: undefined,
						employeeIds: undefined,
						departmentIds: undefined,
						finalCheckEmployeeIds: undefined,
					},
				}),
			{
				watch: [() => ({ ...params.value })],
				immediate: true,
				deep: true,
				transform: (response: Response<any>) => ({
					...response,
					data: response.data ? response.data : [],
				}),
			}
		)
	}

	/**
	 * 전표관리 공통 전표유형
	 * @returns
	 */
	const slipsManagementTypes = () => {
		return useAsyncData<Response<Array<Code>>>(
			`slips-managements-commons-slip-types`,
			() =>
				useCFetch<Response<any>>(`/api/v2/slips/managements/commons/types/slipTypes`, {
					method: "GET",
				}),
			{
				transform: (response: Response<Array<Code>>) => ({
					...response,
					data:
						response.data?.map((x: Code) => ({
							...x,
							value: x.code,
						})) || [],
				}),
			}
		)
	}

	/**
	 * 전표관리 공통 전표상태
	 * @returns
	 */
	const slipsManagementStatus = () => {
		return useAsyncData<Response<Array<Code>>>(
			`slips-managements-commons-slip-status`,
			() =>
				useCFetch<Response<any>>(`/api/v2/slips/managements/commons/types/slipStatuses`, {
					method: "GET",
				}),
			{
				transform: (response: Response<Array<Code>>) => ({
					...response,
					data:
						response.data?.map((x: Code) => ({
							...x,
							value: x.code,
						})) || [],
				}),
			}
		)
	}

	/**
	 * 전표관리 프로젝트 정보목록 조회
	 * @returns
	 */
	const slipsManagementProjects = () => {
		return useAsyncData<Response<Array<Code>>>(
			`slips-managements-commons-slip-projects`,
			() =>
				useCFetch<Response<any>>(`/api/v2/slips/managements/commons/projects`, {
					method: "GET",
				}),
			{
				transform: (response: Response<Array<Code>>) => ({
					...response,
					data:
						response.data?.map((x: Code) => ({
							...x,
							value: x.id,
							label: x.name,
						})) || [],
				}),
			}
		)
	}

	return {
		list,
		checks,
		complete,
		slipsManagementTypes,
		slipsManagementStatus,
		slipsManagementProjects,
	}
}
