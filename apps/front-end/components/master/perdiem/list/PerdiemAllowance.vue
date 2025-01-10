<script setup lang="ts">
import AllowanceDetailTable from "../table/AllowanceDetailTable.vue"
import AllowanceListTable from "../table/AllowanceListTable.vue"
import { PerdiemAllowanceType, PerdiemAllowanceInfo } from "@/types/master/perdiem"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const showPerdiemInfoModal = ref<boolean>(false)
const perdiemLocationType = ref<string>("")
const perdiemInfoData = ref<PerdiemAllowanceInfo[]>([])
const perdiemGetListInfoParams = ref<PerdiemAllowanceType>({
	locationName: "",
	locationType: "",
	orderSeq: 0,
})

const perdiemAddInfoParams = ref<PerdiemAllowanceInfo>({
	companyCode: getCompanyCode.value,
	name: "",
	code: "",
	locationType: "",
	orderSeq: 0,
})

const perdiemData: PerdiemAllowanceType[] = [
	{
		id: 1,
		locationName: "해외",
		locationType: "ABROAD",
	},
	{
		id: 2,
		locationName: "국내",
		locationType: "DOMESTIC",
	},
]

/** 출장 국가/지역 정보 조회 */
const onGetLocationData = async (locationType: string) => {
	return await useCFetch<any>("/api/v2/masters/businessTripLocations", {
		method: "GET",
		params: {
			locationType,
		},
	}).then((res: any) => res.data)
}

/** 국가/지역 추가/수정 */
const onOpenInfoModal = (rowData: PerdiemAllowanceInfo) => {
	if (!rowData.showed) return
	perdiemAddInfoParams.value = {
		...rowData,
		locationType: perdiemAddInfoParams.value.locationType,
		companyCode: perdiemAddInfoParams.value.companyCode,
	}
	showPerdiemInfoModal.value = rowData.showed
}

/** 급지 선택 행 정보 가져오기 */
const onGetRowData = async (rowData: PerdiemAllowanceType) => {
	if (!rowData.locationType || !rowData.locationName) return
	perdiemInfoData.value = await onGetLocationData(rowData.locationType)
	perdiemLocationType.value = rowData.locationName
	perdiemAddInfoParams.value.locationType = rowData.locationType
}

/** 국가/지역 정보 행 삭제 */
const onDeleteInfoRowData = async (keys: number[]) => {
	keys.forEach(async (key: number) => {
		await useCFetch<any>(`/api/v2/masters/businessTripLocations/${key}`, {
			method: "DELETE",
			params: { id: key },
		}).then(async (res: any) => {
			if (res.status === 0) {
				message.success("삭제되었습니다.")
				if (perdiemAddInfoParams.value.locationType)
					perdiemInfoData.value = await onGetLocationData(
						perdiemAddInfoParams.value.locationType
					)
				showPerdiemInfoModal.value = false
			} else {
				message.error(res.data.message)
			}
		})
	})
}

/** 국가/지역 정보 행 추가 */
const onSubmitPerdiemInfo = async () => {
	await useCFetch<any>("/api/v2/masters/businessTripLocations", {
		method: "POST",
		body: perdiemAddInfoParams.value,
	}).then(async (res: any) => {
		if (res.status === 0) {
			message.success("저장되었습니다.")
			if (perdiemAddInfoParams.value.locationType)
				perdiemInfoData.value = await onGetLocationData(
					perdiemAddInfoParams.value.locationType
				)
			showPerdiemInfoModal.value = false
		} else {
			message.error(res.data.message)
		}
	})
}
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="30">
				<a-col flex="1">
					<AllowanceListTable
						:perdiemData="perdiemData"
						:loading="false"
						@selected-row="onGetRowData"
					/>
				</a-col>
				<a-col flex="2">
					<AllowanceDetailTable
						:data="perdiemInfoData"
						:locationType="perdiemLocationType"
						:params="perdiemGetListInfoParams"
						:loading="false"
						@addPerdiemInfoClick="onOpenInfoModal"
						@deletePerdiemInfo="onDeleteInfoRowData"
					/>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				:title="perdiemAddInfoParams?.id ? '국가/지역 수정' : '국가/지역 추가'"
				:field="perdiemAddInfoParams"
				:showed="showPerdiemInfoModal"
				:size="'small'"
				@closed="showPerdiemInfoModal = false"
				@submit="onSubmitPerdiemInfo"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'국가/지역명'" :span="3">
								<a-input
									type="text"
									placeholder="국가/지역명을 입력하세요"
									v-model:value="perdiemAddInfoParams.name"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'국가/지역코드'" :span="3">
								<a-input
									type="text"
									placeholder="국가/지역코드를 입력하세요"
									v-model:value="perdiemAddInfoParams.code"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="text"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemAddInfoParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
