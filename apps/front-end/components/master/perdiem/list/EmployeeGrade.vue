<script setup lang="ts">
import EmployeeGradeListTable from "../table/EmployeeGradeListTable.vue"
import EmployeeGradeDetailTable from "../table/EmployeeGradeDetailTable.vue"
import { PerdiemPosition, PerdiemGrade, PositionList } from "@/types/master/perdiem"
import { error } from "console"
import errorHandler from "~/plugins/error-handler"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const showPerdiemGradeModal = ref<boolean>(false)
const showPerdiemPositionModal = ref<boolean>(false)
const completeCnt = ref<number>(0)
const selectedGradeParams = ref<PerdiemGrade[]>([])
const selectedPositionParams = ref<PerdiemPosition[]>([])
const perdiemPositionData = ref<PerdiemPosition[]>([])
const positionOptions = ref<PositionList[]>([])
const perdiemGradeParams = ref<PerdiemGrade>({
	gradeName: "",
	code: "",
	orderSeq: 0,
})

const perdiemPositionParams = ref<PerdiemPosition[]>([])

/**
 * 임직원 등급 조회
 */
const {
	data: perdiemGradeData,
	status: perdiemGradeStatus,
	refresh: perdiemGradeRefresh,
} = await useAsyncData(`business-trip-employees`, () =>
	useCFetch<any>("/api/v2/masters/businessTripEmployees", {
		method: "GET",
	}).then((res: any) => {
		return res.data
	})
)

/**
 * 임직원 등급 정보 조회
 */
const getPerdiumPosition = async (value: PerdiemGrade) => {
	await useCFetch<any>(`/api/v2/masters/businessTripPositions`, {
		method: "GET",
		params: { employeeId: value.id },
	}).then((res: any) => {
		perdiemPositionData.value = res.data
	})
}

/** 임직원 등급 추가/수정 */
const onOpenGradeModal = (rowData: PerdiemGrade) => {
	if (!rowData.showed) return
	perdiemGradeParams.value = rowData
	showPerdiemGradeModal.value = rowData.showed
}

/** 임직원 등록 정보 추가/수정 */
const onOpenInfoModal = (rowData: PerdiemPosition) => {
	if (!rowData.showed) return
	showPerdiemPositionModal.value = rowData.showed
	onGetPositionData()
}

/** 등급 행 선택 */
const onGetRowData = (rowData: PerdiemGrade[]) => {
	selectedGradeParams.value = rowData
	if (rowData.length == 1) getPerdiumPosition(rowData[0])
}

/** 등급 정보 행 선택 */
const onGetPositionRowData = (rowData: PerdiemPosition[]) => {
	selectedPositionParams.value = rowData
}

/** 등급 행 삭제 */
const onDeleteGradeRowData = async (keys: number[]) => {
	keys.forEach(async (key: any) => {
		await useCFetch<any>(`/api/v2/masters/businessTripEmployees/${key}`, {
			method: "DELETE",
			params: { id: key },
		}).then((res: any) => {
			if (res.status === 0) {
				completeCnt.value++
				if (completeCnt.value === keys.length) {
					message.success("삭제되었습니다.")
					completeCnt.value = 0
					perdiemGradeRefresh()
				}
			} else {
				message.error(res.message)
			}
		})
	})
}

/** 등급 정보 행 삭제 */
const onDeleteInfoRowData = (keys: number[]) => {
	keys.forEach(async (key: any) => {
		await useCFetch<any>(`/api/v2/masters/businessTripPositions/${key}`, {
			method: "DELETE",
			params: { id: key },
		}).then((res: any) => {
			if (res.status === 0) {
				completeCnt.value++
				if (completeCnt.value === keys.length) {
					message.success("삭제되었습니다.")
					completeCnt.value = 0
					onGetRowData(selectedGradeParams.value)
				}
			} else {
				message.error(res.message)
			}
		})
	})
}

/** 등급 정보 추가 모달의 선택된 등급 정보 */
const onSelectedPosition = (key: any, value: any) => {
	perdiemPositionParams.value = value.map((element: PositionList, idx: number) => {
		return {
			...element,
			employeeGradeId: selectedGradeParams.value[0].id,
			orderSeq: idx,
		}
	})
}

/** 시스템관리 > 직위관리 데이터 조회 - 셀렉박스 옵션용  */
const onGetPositionData = async () => {
	await useCFetch<any>(`/api/v2/settings/positions`, {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			used: true,
		},
	}).then((res: any) => {
		if (res.status === 0) {
			positionOptions.value = []
			positionOptions.value = res.data.map((element: any) => {
				return {
					id: element.id,
					companyCode: element.companyCode,
					positionCode: element.code,
					positionName: element.name,
				}
			})
		}
	})
}

/** 등급 저장 */
const onSubmitPerdiemGrade = async () => {
	const body = {
		...perdiemGradeParams.value,
		gradeCode: perdiemGradeParams.value.code,
		orderSeq: Number(perdiemGradeParams.value.orderSeq),
	}
	await useCFetch<any>(`/api/v2/masters/businessTripEmployees`, {
		method: "POST",
		body: body,
	}).then((res: any) => {
		if (res.status === 0) {
			message.success("저장되었습니다.")
			perdiemGradeRefresh()
			showPerdiemGradeModal.value = false
		} else {
			message.error(res.message)
		}
	})
}

/** 등급 정보 저장 */
const onSubmitPerdiemPosition = async () => {
	console.log("perdiemPositionParams", perdiemPositionParams.value)
	perdiemPositionParams.value.forEach(async (element: any) => {
		await useCFetch<any>(`/api/v2/masters/businessTripPositions`, {
			method: "POST",
			body: element,
		}).then((res: any) => {
			if (res.status === 0) {
				completeCnt.value++
				if (completeCnt.value == perdiemPositionParams.value.length) {
					message.success("저장되었습니다.")
					showPerdiemPositionModal.value = false
					completeCnt.value = 0
					onGetRowData(selectedGradeParams.value)
				}
			} else {
				message.error(res.message)
			}
		})
	})
}
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="30">
				<a-col flex="1">
					<EmployeeGradeListTable
						:perdiemData="perdiemGradeData"
						:loading="false"
						@addPerdiemGradeClick="onOpenGradeModal"
						@deletePerdiemGrade="onDeleteGradeRowData"
						@selected-row="onGetRowData"
						@selected-row-keys="onGetRowData"
					/>
				</a-col>
				<a-col flex="2">
					<EmployeeGradeDetailTable
						:data="perdiemPositionData"
						:params="selectedGradeParams"
						:loading="false"
						@addPerdiemPositionClick="onOpenInfoModal"
						@deletePerdiemInfo="onDeleteInfoRowData"
						@selected-row="onGetPositionRowData"
					/>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				:title="perdiemGradeParams?.id ? '임직원 등급수정' : '임직원 등급추가'"
				:field="perdiemGradeParams"
				:showed="showPerdiemGradeModal"
				:size="'small'"
				@closed="showPerdiemGradeModal = false"
				@submit="onSubmitPerdiemGrade"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'등급명'" :span="3">
								<a-input
									type="text"
									placeholder="등급명을 입력하세요"
									v-model:value="perdiemGradeParams.gradeName"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'코드'" :span="3">
								<a-input
									type="text"
									placeholder="코드를 입력하세요"
									v-model:value="perdiemGradeParams.code"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="number"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemGradeParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>

			<field-modal
				:title="'직급 추가'"
				:field="perdiemPositionParams"
				:showed="showPerdiemPositionModal"
				:size="'small'"
				@closed="showPerdiemPositionModal = false"
				@submit="onSubmitPerdiemPosition"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'직급'" :span="3">
								<a-select
									:fieldNames="{ label: 'positionName', value: 'positionCode' }"
									:options="positionOptions"
									mode="multiple"
									showArrow
									:style="{ width: '100%' }"
									@change="onSelectedPosition"
								></a-select>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
