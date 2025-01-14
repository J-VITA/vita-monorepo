<script setup lang="ts">
import { Search, TravelExpenseParams, LocationTypeOptions } from "@/types/master/perdiem"
import type { Response } from "@/types"
import type { TreeProps, FormInstance } from "ant-design-vue"
import PerdiemExpenseTypeTabel from "../table/PerdiemExpenseTypeTabel.vue"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)
const formRef = useTemplateRef<FormInstance>("formRef")
const showTravelExpenseModal = ref<boolean>(false)
const locationTypeOptions = ref<LocationTypeOptions[]>()
const tripOptions = ref<LocationTypeOptions[]>()
const copyTreeData = ref<any[]>([])
const checkedKeys = ref<number[]>([])
const expandedKeys = ref<(string | number)[]>([])
const searchValue = ref<string>("")
const autoExpandParent = ref<boolean>(true)
const travelExpenseModaParams = ref<TravelExpenseParams>({
	companyCode: getCompanyCode.value,
	locationType: undefined,
	name: "",
	code: undefined,
	businessTripTypeAccountDtos: [],
	businessTripTypeAccountRequests: [],
	used: false,
})
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	name: undefined,
	page: 0,
	size: 10,
})

/**
 * 출장비 유형 목록 조회
 */
const {
	data: perdiemData,
	status: perdiemStatus,
	refresh: perdiemRefresh,
} = await useAsyncData(`business-trip-type-info-list`, () =>
	useCFetch<any>("/api/v2/masters/businessTripType", {
		method: "GET",
		params: searchParams.value,
	}).then((res: any) => {
		return res
	})
)

const {
	data: treeData,
	status: treeStatus,
	refresh,
} = await useAsyncData(`accounts-tree-list-travel-expense`, () =>
	useCFetch<Response<any>>("/api/v2/masters/accounts", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
		},
	}).then((res: Response<any>) => {
		copyTreeData.value = res.data
		return res.data
	})
)
/**
 * 트리 필터링 New (keyup 이벤트)
 * @param e Keyboard Event
 */
const onQueryChanged = (e: any) => {
	e.preventDefault()

	const getMatchingKeysInList = (flatTree: any[]) => {
		const ids = travelExpenseModaParams.value.businessTripTypeAccountRequests?.filter(
			(account) => !account.halfChecked
		)
		return ids
			?.filter((x) => flatTree.some((e) => e.id === x.accountId)) // ids의 id가 flatTree에 있는지 확인
			.map((x) => x.accountId) // 일치하는 id만 반환
	}

	searchValue.value = e.target.value
	if ((isHangulComplete(e.target.value) && e.isComposing) || isNumeric(e.target.value)) {
		copyTreeData.value = filterTreeData(treeData.value, e.target.value)
	}
	if (e.target.value === "") {
		copyTreeData.value = treeData.value
	}

	// 검색되는 트리 리스트에 따라 체크키 변동
	checkedKeys.value =
		getMatchingKeysInList(transformTreeToFlatArray(copyTreeData.value)) || []
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	autoExpandParent.value = false
}

const onCheck: TreeProps["onCheck"] = (keys, info) => {
	let checkList: any[] = []

	Array.from(keys as []).map((x) => checkList.push({ id: x, halfChecked: false }))

	Array.from(info.halfCheckedKeys as []).map((x) =>
		checkList.push({ id: x, halfChecked: true })
	)

	travelExpenseModaParams.value.businessTripTypeAccountRequests = checkList
}

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

/** 출장비 유형 모달 오픈 */
const onOpenTravelExpenseModal = (id?: any) => {
	if (id) onGetTravelExpenseData(id)
	showTravelExpenseModal.value = true
	getLocationData()
}

/** 모달 디테일 조회 */
const onGetTravelExpenseData = async (id: any) => {
	console.log(id)
	await useCFetch<any>(`/api/v2/masters/businessTripType/${id}`, {
		method: "GET",
		params: { id: id },
	}).then((res: any) => {
		console.log(res.data)
		const element = res.data
		travelExpenseModaParams.value = {
			id: element.id,
			companyCode: element.companyCode,
			locationType: element.locationType.code,
			name: element.name,
			code: element.code,
			used: element.used,
			businessTripTypeAccountRequests: element.businessTripTypeAccountDtos,
		}
	})
}

/** 출장비유형 목록 조회 */
const getBusinessTripType = async () => {
	await useCFetch<any>(`/api/v2/masters/businessTrip/types/businessTripTypes`, {
		method: "GET",
		params: {
			locationType: travelExpenseModaParams.value.locationType,
			companyCode: getCompanyCode.value,
		},
	}).then((res: any) => {
		tripOptions.value = res.data
	})
}

/** 출장비 유형 추가 데이터 저장 */
const onSubmitTavelExpenseModal = async () => {
	formRef.value?.validate().then(async () => {
		const id: number | string | undefined = travelExpenseModaParams.value.id
		await useCFetch<any>("/api/v2/masters/businessTripType", {
			method: id ? "PATCH" : "POST",
			body: travelExpenseModaParams.value,
		}).then((res: any) => {
			if (res.status === 0) {
				message.success("저장했습니다.")
				showTravelExpenseModal.value = false
				perdiemRefresh()
			} else {
				message.error(res.message)
			}
		})
	})
}

/** 모달 데이터 초기화 */
const initTravelExpenseModalData = () => {
	travelExpenseModaParams.value = {
		companyCode: getCompanyCode.value,
		locationType: "DOMESTIC",
		name: undefined,
		code: undefined,
		businessTripTypeAccountDtos: [],
		businessTripTypeAccountRequests: [],
		used: false,
	}
	checkedKeys.value = []
}

/** 급지유형 선택에 따른 국가/지역 조회 */
watch(
	() => travelExpenseModaParams.value.locationType,
	() => getBusinessTripType()
)

watch(
	() => showTravelExpenseModal.value,
	(value) => {
		if (value) {
			initTravelExpenseModalData()
			searchValue.value = ""
			refresh()
			if (treeData.value) {
				expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "id").map(
					(x: any) => x.id
				)
			}
		}
	}
)
</script>

<template>
	<page-layout>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="출장비 유형">
							<a-input v-model:value="searchParams.name" />
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
			<PerdiemExpenseTypeTabel
				:perdiemData="perdiemData"
				:loading="perdiemStatus === 'pending'"
				@update-pagination:value="onUpdatePagination"
				@refresh="perdiemRefresh"
				@openPerdiumInfoModal="onOpenTravelExpenseModal"
			/>
		</template>
		<template #modal>
			<field-modal
				ref="formRef"
				:field="perdiemData.data"
				:showed="showTravelExpenseModal"
				:loading="false"
				:title="'출장 기준정보 추가'"
				@closed="showTravelExpenseModal = false"
				@submit="onSubmitTavelExpenseModal"
			>
				<template #content="{ field }">
					<a-form
						ref="formRef"
						:model="travelExpenseModaParams"
						label-align="left"
						:colon="false"
						:label-col="{ span: 4 }"
					>
						<a-form-item
							label="급지유형"
							name="locationType"
							:rules="[{ required: true, message: '급지유형을 선택해주세요' }]"
						>
							<a-select
								v-model:value="travelExpenseModaParams.locationType"
								placeholder="급지유형을 선택해주세요."
								:options="locationTypeOptions"
								:field-names="{ label: 'label', value: 'code' }"
							></a-select>
						</a-form-item>

						<a-form-item
							label="출장비 유형"
							name="name"
							:rules="[{ required: true, message: '출장비유형을 선택해주세요.' }]"
						>
							<a-select
								placeholder="출장비유형을 선택해주세요."
								:options="tripOptions"
								:field-names="{ label: 'name', value: 'code' }"
								v-model:value="travelExpenseModaParams.name"
							></a-select>
						</a-form-item>
						<a-form-item
							label="출장비유형코드"
							name="code"
							:rules="[{ required: true, message: '출장비 유형 코드를 작성해주세요.' }]"
						>
							<a-input
								v-model:value="travelExpenseModaParams.code"
								placeholder="출장비 유형 코드를 작성해주세요."
							></a-input>
						</a-form-item>
						<a-form-item label="계정항목비용">
							<a-spin :spinning="treeStatus === 'pending'">
								<a-input-search
									class="mb-sm"
									v-model:value="searchValue"
									placeholder="검색"
									@keyup="onQueryChanged"
								/>
								<a-tree
									block-node
									checkable
									v-model:checkedKeys="checkedKeys"
									v-model:expanded-keys="expandedKeys"
									:auto-expand-parent="autoExpandParent"
									:selectable="false"
									:show-icon="true"
									:default-expand-all="true"
									:tree-data="copyTreeData"
									:height="500"
									:field-names="{
										children: 'children',
										title: 'name',
										key: 'id',
									}"
									@check="onCheck"
									@expand="onExpand"
								>
									<template #icon="{ dataRef }">
										<template v-if="dataRef.accountLevelName === 'GROUP'">
											<component
												:is="materialIcons('m', 'folder')"
												class="text-warning"
											/>
										</template>
										<template v-else>
											<component :is="materialIcons('mso', 'description')" />
										</template>
									</template>
									<template #title="{ dataRef }">
										<span
											v-if="
												dataRef.name.indexOf(searchValue) > -1 ||
												dataRef.code.toString().indexOf(searchValue) > -1
											"
										>
											<span
												v-if="
													dataRef.name.includes(searchValue) ||
													dataRef.code.toString().includes(searchValue)
												"
											>
												{{
													`${dataRef.name}(${dataRef.code})`.substring(
														0,
														`${dataRef.name}(${dataRef.code})`.indexOf(searchValue)
													)
												}}
											</span>
											<span class="text-error">{{ searchValue }}</span>
											{{
												`${dataRef.name}(${dataRef.code})`.substring(
													`${dataRef.name}(${dataRef.code})`.indexOf(searchValue) +
														searchValue.length
												)
											}}
										</span>
										<span v-else>{{ dataRef.name }} ({{ dataRef.code }})</span>
									</template>
								</a-tree>
							</a-spin>
						</a-form-item>
						<a-form-item
							:wrapper-col="{ offset: 2, span: 22 }"
							label="사용여부"
							name="used"
						>
							<a-switch v-model:checked="travelExpenseModaParams.used" />
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
