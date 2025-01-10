<script setup lang="ts">
import {
	Search,
	PerdiemTableData,
	PerdiumStandardInfoParams,
	anounceText,
	LocationTypeOptions,
} from "@/types/master/perdiem"
import type { FormInstance } from "ant-design-vue"
import StandardInfoTable from "../table/StandardInfoTable.vue"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)
const formRef = useTemplateRef<FormInstance>("formRef")
const accountParams: { locationType: string | undefined; companyCode: string } = {
	locationType: "DOMESTIC",
	companyCode: getCompanyCode.value,
}
const showPerdiumInfoModal = ref<boolean>(false)
const locationTypeOptions = ref<LocationTypeOptions[]>()
const businessLocationOptions = ref<LocationTypeOptions[]>()
const tripOptions = ref<LocationTypeOptions[]>()
const standardInfoModalParams = ref<PerdiumStandardInfoParams>({
	companyCode: getCompanyCode.value,
	locationType: undefined,
	locationName: undefined,
	locationCode: "DOMESTIC",
	gradeName: "",
	gradeCode: "",
	businessTripTypeName: "",
	businessTripTypeCode: undefined,
	paymentCategory: "FIXED",
	isReimbursement: false,
	fixedAmount: undefined,
	reimbursementLimit: undefined,
})
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	locationType: "DOMESTIC",
	locationName: "",
	locationCode: "",
	businessTripTypeName: "",
	paymentCategory: "",
	page: 0,
	size: 10,
})

/**
 * 기준정보 목록 조회
 */
const {
	data: perdiemData,
	status: perdiemStatus,
	refresh: perdiemRefresh,
} = await useAsyncData(`perdium-business-trip`, () =>
	useCFetch<any>("/api/v2/masters/businessTrip", {
		method: "GET",
		params: searchParams.value,
	}).then((res: any) => {
		return res
	})
)

/** 추가 모달 급지 목록 조회 */
const getLocationData = async () => {
	await useCFetch<any>("/api/v2/masters/businessTrip/types/locationTypes", {
		method: "GET",
	}).then((res: any) => {
		locationTypeOptions.value = res.data.map((element: any) => {
			return {
				label: element.label,
				code: element.code,
			}
		})
	})
}

/** 추가모달 국가/지역 목록 조회 */
const getBusinessLocationData = async () => {
	standardInfoModalParams.value.locationName = undefined
	standardInfoModalParams.value.locationCode = undefined
	getBusinessTripType()

	await useCFetch<any>("/api/v2/masters/businessTripLocations", {
		method: "GET",
		params: { locationType: standardInfoModalParams.value.locationType },
	}).then((res: any) => {
		businessLocationOptions.value = res.data.map((element: any) => {
			return {
				label: element.name,
				code: element.code,
			}
		})
	})
}

/** 출장비유형 목록 조회 */
const getBusinessTripType = async () => {
	accountParams.locationType = standardInfoModalParams.value.locationType
	await useCFetch<any>(`/api/v2/masters/businessTrip/types/businessTripTypes`, {
		method: "GET",
		params: {
			locationType: accountParams.locationType,
			companyCode: accountParams.companyCode,
		},
	}).then((res: any) => {
		tripOptions.value = res.data
	})
}

/** 검색 */
const onSearch = () => {
	perdiemRefresh()
}

/** 페이지네이션 */
const onUpdatePagination = (pagination: any) => {
	searchParams.value.page = pagination.page
	searchParams.value.size = pagination.size
	perdiemRefresh()
}

/** 출장기준정보 모달 오픈 */
const onOpenPerdiumInfoModal = (id?: any) => {
	initStandardInfoModalData()
	if (id) onGetPerdiumInfoData(id)
	showPerdiumInfoModal.value = true
	getLocationData()
}

/** 목록 조회 */
const onGetPerdiumInfoData = async (id: any) => {
	console.log(id)
	await useCFetch<any>(`/api/v2/masters/businessTrip/${id}`, {
		method: "GET",
		params: { id: id },
	}).then((res: any) => {
		const element = res.data
		standardInfoModalParams.value = {
			locationType: element.locationType.code,
			locationName: element.locationName,
			locationCode: element.locationCode,
			gradeName: element.employeeGrade,
			gradeCode: element.employeeGradeCode,
			businessTripTypeName: element.businessTripTypeName,
			businessTripTypeCode: element.businessTripTypeCode,
			paymentCategory: element.paymentCategory.code,
			isReimbursement: element.isReimbursement,
			fixedAmount: element.fixedAmount,
			reimbursementLimit: element.reimbursementLimit,
		}
	})
}

/** 출장기준정보 추가 데이터 저장 */
const onSubmitStandardInfoModal = async () => {
	formRef.value?.validate().then(async () => {
		const id: number | string | undefined = standardInfoModalParams.value.id
		await useCFetch<any>(
			id ? `/api/v2/masters/businessTrip/${id}` : "/api/v2/masters/businessTrip",
			{
				method: id ? "PATCH" : "POST",
				body: standardInfoModalParams.value,
			}
		).then((res: any) => {
			if (res.status === 0) {
				message.success("저장했습니다.")
				showPerdiumInfoModal.value = false
				perdiemRefresh()
			} else {
				message.error(res.message)
			}
		})
	})
}

/** 모달 데이터 초기화 */
const initStandardInfoModalData = () => {
	standardInfoModalParams.value = {
		companyCode: getCompanyCode.value,
		locationType: "DOMESTIC",
		locationName: undefined,
		locationCode: undefined,
		gradeName: "",
		gradeCode: "",
		businessTripTypeName: undefined,
		businessTripTypeCode: undefined,
		paymentCategory: "FIXED",
		isReimbursement: false,
		fixedAmount: undefined,
		reimbursementLimit: undefined,
	}
}

/** 급지유형 선택에 따른 국가/지역 조회 */
watch(
	() => standardInfoModalParams.value.locationType,
	() => getBusinessLocationData()
)

// watch(
// 	() => standardInfoModalParams.value.isReimbursement,
// 	(value) => {
// 		if(value) standardInfoModalParams.value.fixedAmount=undefined
// 		else standardInfoModalParams.value.reimbursementLimit=undefined
// 	}
// )
</script>

<template>
	<page-layout>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="급지유형">
							<eacc-select
								:url="'/api/v2/masters/businessTrip/types/locationTypes'"
								:field-names="{ label: 'label', value: 'code' }"
								v-model:value="searchParams.locationType"
								:on-all-field="false"
							></eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="국가/지역">
							<a-input type="text" v-model:value="searchParams.locationName"></a-input>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="출장비 유형">
							<a-input v-model:value="searchParams.businessTripTypeName" />
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="지급구분">
							<eacc-select
								:url="'/api/v2/masters/businessTrip/types/paymentCategories'"
								:field-names="{ label: 'label', value: 'code' }"
								v-model:value="searchParams.paymentCategory"
							></eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<eacc-button
								component-is="search"
								size="middle"
								:modal-open="false"
								:data="searchParams"
								@click="onSearch"
							/>
						</a-space>
					</a-col>
				</a-row>
			</a-form>
			<a-divider />
			<StandardInfoTable
				:perdiemData="perdiemData"
				:loading="perdiemStatus === 'pending'"
				@update-pagination:value="onUpdatePagination"
				@refresh="perdiemRefresh"
				@openPerdiumInfoModal="onOpenPerdiumInfoModal"
			></StandardInfoTable>
		</template>
		<template #modal>
			<field-modal
				ref="formRef"
				:field="perdiemData.data"
				:showed="showPerdiumInfoModal"
				:loading="false"
				:title="'출장 기준정보 추가'"
				@closed="showPerdiumInfoModal = false"
				@submit="onSubmitStandardInfoModal"
			>
				<template #content="{ field }">
					<a-form
						ref="formRef"
						:model="standardInfoModalParams"
						label-align="left"
						:colon="false"
						:label-col="{ span: 4 }"
					>
						<a-flex :gap="5">
							<a-form-item
								label="급지유형/지역"
								name="locationType"
								:rules="[{ required: true, message: '급지유형을 선택해주세요' }]"
								:wrapper-col="{ offset: 7 }"
								style="min-width: 18rem"
							>
								<a-select
									v-model:value="standardInfoModalParams.locationType"
									placeholder="급지유형을 선택해주세요."
									:options="locationTypeOptions"
									:field-names="{ label: 'label', value: 'code' }"
								></a-select>
							</a-form-item>
							<a-form-item
								name="locationCode"
								:rules="[{ required: true, message: '지역을 선택해주세요' }]"
								style="width: 29.5rem"
							>
								<a-select
									v-model:value="standardInfoModalParams.locationCode"
									placeholder="지역을 선택해주세요."
									:options="
										businessLocationOptions && businessLocationOptions.length > 0
											? businessLocationOptions
											: undefined
									"
									:field-names="{ label: 'label', value: 'code' }"
									@change="
										(value, data) => {
											standardInfoModalParams.locationName = Array.isArray(data)
												? data[0].label
												: data.label
										}
									"
								></a-select>
							</a-form-item>
						</a-flex>
						<a-form-item
							label="임직원등급"
							name="gradeCode"
							:rules="[{ required: true }]"
						>
							<eacc-select
								:url="'/api/v2/masters/businessTripEmployees'"
								:field-names="{ label: 'gradeName', value: 'code' }"
								v-model:value="standardInfoModalParams.gradeCode"
								value-type="any"
								@update:any-value="
									(value) => {
										standardInfoModalParams.gradeName = value.gradeName
									}
								"
								:on-all-field="false"
								placeholder="임직원등급을 선택해주세요."
							></eacc-select>
						</a-form-item>
						<a-form-item
							label="출장비 유형"
							name="businessTripTypeCode"
							:rules="[{ required: true }]"
						>
							<a-select
								placeholder="출장비 유형을 선택해주세요."
								:options="tripOptions"
								:field-names="{ label: 'name', value: 'code' }"
								v-model:value="standardInfoModalParams.businessTripTypeCode"
							></a-select>
						</a-form-item>
						<a-form-item label="지급구분" name="type">
							<a-radio-group v-model:value="standardInfoModalParams.paymentCategory">
								<a-radio value="FIXED">정액지급</a-radio>
								<a-radio value="ACTUAL">실비지급</a-radio>
							</a-radio-group>
						</a-form-item>
						<a-form-item
							v-if="standardInfoModalParams.paymentCategory === 'ACTUAL'"
							:wrapper-col="{ offset: 2, span: 22 }"
							label="실비금액 통제"
							name="isReimbursement"
						>
							<a-switch v-model:checked="standardInfoModalParams.isReimbursement" />
						</a-form-item>
						<a-form-item
							v-if="standardInfoModalParams.paymentCategory === 'FIXED'"
							:wrapper-col="{ offset: 2, span: 22 }"
							label="정액지급액"
							name="fixedAmount"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<a-input
								type="text"
								v-model:value="standardInfoModalParams.fixedAmount"
								placeholder="정액지급액을 작성해주세요."
							/>
						</a-form-item>
						<a-form-item
							v-if="standardInfoModalParams.isReimbursement"
							:wrapper-col="{ offset: 2, span: 22 }"
							label="통제금액"
							name="reimbursementLimit"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<a-input
								type="text"
								v-model:value="standardInfoModalParams.reimbursementLimit"
								placeholder="통제금액을 작성해주세요."
							/>
						</a-form-item>
					</a-form>
					<div
						:style="{
							padding: '10px 10px',
							borderRadius: '10px',
							backgroundColor: '#F7F7F7',
							color: '#666666E0',
						}"
						v-html="anounceText.text"
					></div>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
