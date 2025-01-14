<script lang="ts" setup>
import type { Dayjs } from "dayjs"
import { type FormInstance } from "ant-design-vue"
import { type Response, dateTimeFormat } from "@/types"
import { useTaxInvoiceListSearch } from "@/types/expenses/tax-invoice"
import TaxInvoiceTable from "@/components/expenses/TaxInvoiceTable.vue"

definePageMeta({
	name: "매입세금계산서 작성",
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = useTaxInvoiceListSearch(getCompanyCode.value)

const selectedData = ref<any[]>([])

const isApprovalModal = ref<boolean>(false)
const isApprovalLoading = ref<boolean>(false)

const formRef = useTemplateRef<FormInstance>("formRef")
const isForwardModal = ref<boolean>(false)
const isForwardLoading = ref<boolean>(false)
const forwardFormState = ref<any>({ employeeIds: [], employeeId: undefined })

const isTaxInvoiceModal = ref<boolean>(false)

const { data, status, refresh } = await useAsyncData("tax-invoice-list", async () => {
	return {
		data: [
			{
				id: 1,
				taxInvoiceType: "ELECTRONIC",
				slipNumber: "EA20241018-00010",
				searchDate: "2024-01-01",
				taxInvoiceNumber: "2024080142",
				writer: "홍길동",
				supplierName: "마포 인쇄소",
				amount: 1000000,
				taxAmount: 100000,
				totalAmount: 1100000,
				email: "test@test.com",
				state: "WRITTEN",
			},
			{
				id: 2,
				taxInvoiceType: "MANUAL",
				slipNumber: "EA20241018-00010",
				searchDate: "2024-01-01",
				taxInvoiceNumber: "2024080142",
				writer: "홍길동",
				supplierName: "마포 인쇄소",
				amount: 1000000,
				taxAmount: 100000,
				totalAmount: 1100000,
				email: "test@test.com",
				state: "WRITTEN",
			},
		],
		totalElements: 1,
		size: searchParams.value.size,
		pageNumber: searchParams.value.pageNumber,
	}
})

/**
 * 서치 기간 변경
 * @param value 선택한 기간
 * @param dateString 선택한 기간 문자열
 */
const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		searchDateFrom: dateString[0],
		searchDateTo: dateString[1],
	})
}

/**
 * datatable pagination
 * @param pagination 페이지네이션 정보
 * @param sorter 정렬 정보
 */
const onPagination = (pagination: any, sorter: any) => {
	updateSearchParams({
		sort: sorter,
		pageNumber: pagination.current,
		size: pagination.pageSize,
	})
	refresh()
}

/**
 * 결재상신 모달 토글
 * @param status 모달 상태
 */
const toggleApprovalModal = (status: boolean) => {
	console.log("결재상신버튼액션", status)
	isApprovalModal.value = status
	if (!status) {
		isApprovalLoading.value = false
	}
}

/**
 * 결재상신 컴펌 모달 확인 버튼 클릭 시 발생
 * @param data 선택한 세금계산서 항목
 */
const submitApproval = () => {
	console.log("결재상신Submit액션", selectedData.value)
	isApprovalLoading.value = true
	setTimeout(() => {
		isApprovalModal.value = false
		isApprovalLoading.value = false
		selectedData.value = []
		refresh()
	}, 1000)
}

/**
 * 전달 모달 토글
 * @param status 모달 상태
 */
const toggleForwardModal = (status: boolean) => {
	console.log("전달버튼액션", status)
	isForwardModal.value = status
	if (!status) {
		isForwardLoading.value = false
	}
}

/**
 * 전달 컴펌 모달 확인 버튼 클릭 시 발생
 * @param data 선택한 세금계산서 항목
 */
const submitForward = () => {
	console.log("전달Submit액션", selectedData.value)
	formRef.value
		?.validate()
		.then((res) => {
			console.log(res)
			isForwardLoading.value = true
			setTimeout(() => {
				isForwardModal.value = false
				isForwardLoading.value = false
				selectedData.value = []
				forwardFormState.value.employeeIds = []
				forwardFormState.value.employeeId = undefined

				refresh()
			}, 1000)
		})
		.catch((err) => console.error(err))
}

const showTaxInvoiceModal = (id?: number) => {
	if (id) {
		console.log("id", id)
	}
	isTaxInvoiceModal.value = true
}
</script>
<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				수집된 전자세금계산서를 작성할 수 있으며, 수기세금계산서 내역을 추가할 수
				있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기간설정</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>분류</label>
						<a-select
							style="min-width: 15rem"
							v-model:value="searchParams.taxInvoiceType"
							:options="[
								{ label: '전체', value: '' },
								{ label: '전자세금계산서', value: 'ELECTRONIC' },
								{ label: '수기세금계산서', value: 'MANUAL' },
							]"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>상태</label>
						<a-select
							style="min-width: 10rem"
							v-model:value="searchParams.state"
							:options="[
								{ label: '전체', value: '' },
								{ label: '미처리', value: 'UNPROCESSED' },
								{ label: '작성완료', value: 'WRITTEN' },
								{ label: '결재중', value: 'APPROVAL' },
								{ label: '검인중', value: 'CHECKING' },
								{ label: '확정', value: 'CONFIRMED' },
							]"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-input-group compact class="full-width">
						<a-select
							style="width: 45%"
							v-model:value="searchParams.titleItem"
							:options="[
								{ label: '공급거래처명', value: 'SUPPLIER_NAME' },
								{ label: '담당자 이메일', value: 'SUPPLIER_EMAIL' },
								{ label: '계산서 승인번호', value: 'APPROVAL_NUMBER' },
							]"
						/>
						<a-input v-model:value="searchParams.title" style="width: 55%" />
					</a-input-group>
				</a-col>
				<a-col>
					<eacc-select-table
						label="작성자"
						url="/api/v2/approvals/commons/employees"
						v-model:value="searchParams.writerId"
						key-props="id"
						label-prop="name"
						:columns="[
							{ title: '이름', data: (row: any) => row.name },
							{ title: '직위', data: (row: any) => row.gradeName },
							{
								title: '코스트센터',
								data: (row: any) => row.costCenterName,
							},
							{ title: '회사', data: (row: any) => row.companyName },
							{
								title: '사업장',
								data: (row: any) => row.workplaceName,
							},
						]"
						@update:value="(value: any) => (searchParams.writer = value[0])"
					/>
					<!-- <eacc-select
					placeholder=""
					:url="`/api/v2/approvals/commons/employees`"
						:params="{
							companyCode: getCompanyCode,
						}"
						v-model:value="searchParams.writer"
						:field-names="{ label: 'approvalLineName', value: 'id' }"
						:on-all-field="true"
						@update:value="onUpdateApprovalLineType"
				/> -->
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						size="middle"
						:modal-open="false"
						:data="searchParams"
						@click="() => console.log('searchParams', searchParams)"
					/>
				</a-col>
			</a-row>

			<a-divider class="my-md" />

			<tax-invoice-table
				:data-source="data"
				:status="status"
				v-model:selected-rows="selectedData"
				@tax-invoice-modal="showTaxInvoiceModal"
				@approval="(value: boolean) => toggleApprovalModal(value)"
				@forward="(value: boolean) => toggleForwardModal(value)"
				@pagination="onPagination"
				@refresh="refresh()"
			/>
		</template>
		<template #modal>
			<!-- 결재 상신 모달 -->
			<confirm-modal
				type="warning"
				modal-title-text="결재상신"
				title="선택한 항목으로 결재문서를 작성하시겠습니까?"
				:loading="isApprovalLoading"
				:icon="() => materialIcons('mso', 'error_outline')"
				:showed="isApprovalModal"
				@close="toggleApprovalModal(false)"
				@submit="submitApproval"
			/>
			<!-- 세금 계산서 전달 모달 -->
			<field-modal
				title="세금계산서 전달"
				:field="forwardFormState"
				:showed="isForwardModal"
				:loading="isForwardLoading"
				ok-text="전달"
				cancel-text="취소"
				@close="toggleForwardModal(false)"
				@submit="submitForward"
			>
				<template #content="{ field }">
					<a-flex align="start" class="mb-lg" :gap="10">
						<component
							:is="materialIcons('mso', 'error')"
							class="text-warning"
							style="font-size: 3rem"
						/>
						<div>
							<a-typography-title :level="4" class="mb-sm">
								세금계산서를 전달할 사용자를 선택하세요
							</a-typography-title>
							<a-typography-text>
								세금계산서를 전달하면, 미처리 매입세금계산서가 할당되며 전표입력이
								가능합니다.
							</a-typography-text>
						</div>
					</a-flex>
					<a-form
						ref="formRef"
						label-align="left"
						:colon="false"
						:model="field"
						:label-col="{ offset: 2, span: 22 }"
						:wrapper-col="{ offset: 2, span: 22 }"
					>
						<a-form-item
							name="employeeId"
							:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
						>
							<eacc-select-table
								url="/api/v2/approvals/commons/employees"
								v-model:value="field.employeeIds"
								key-props="id"
								label-prop="name"
								:columns="[
									{ title: '이름', data: (row: any) => row.name },
									{ title: '직위', data: (row: any) => row.gradeName },
									{
										title: '코스트센터',
										data: (row: any) => row.costCenterName,
									},
								]"
								:disabled="field.id ? true : false"
								@update:value="(value) => (field.employeeId = value[0])"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>

			<!-- 세금 계산서 등록/상세 모달 -->
			<tax-invoice-modal
				:show="isTaxInvoiceModal"
				@update:show="(value: boolean) => (isTaxInvoiceModal = value)"
				@refresh="refresh()"
			/>
		</template>
	</page-layout>
</template>
