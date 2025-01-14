import { computed } from "vue"
import type { RequestParams, Response } from "@/types"
import { FlowsActivityType } from "@/types/master/confirm-flows"

/**
 * 검인/수신 라인 정보 및 API 기능
 * @returns
 */
export const useConfirmFlows = () => {
	/**
	 * 검인/수신 라인 관련 ref 변화하는 액티비에 따라 호출 경로 다름.
	 * @param activityType
	 * @returns
	 */
	const list = (
		activityType: Ref<FlowsActivityType>,
		params: ComputedRef<RequestParams<any>>
	) => {
		// TODO: 화면 변화에 따라 API 경로를 지정하고, 각 파라미터를 호출 부분에서 셋업해줘야하고, 응답값 세팅을 해줘야 하므로 useCFetch 적용해야함.
		const apiPath = computed(() =>
			activityType.value === FlowsActivityType.FINAL_APPROVE
				? "/api/v2/masters/checkLines"
				: "/api/v2/masters/approvalReceivers"
		)
		return useAsyncData<Response<any>>(
			`confirm-flows-lines-${apiPath.value}-${JSON.stringify(params.value)}`,
			() =>
				useCFetch<Response<any>>(`${apiPath.value}`, {
					method: "GET",
					params: {
						...params.value,
					},
				}),
			{
				watch: [activityType, params.value],
				immediate: true,
				deep: true,
				transform: (response: Response<any>) => response,
			}
		)
	}

	return {
		list,
	}
}
