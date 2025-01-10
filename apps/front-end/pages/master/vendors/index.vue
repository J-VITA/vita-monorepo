<script lang="ts" setup>
import type { FilterParams } from "@/types/master/vendors"
import VendorsTable from "@/components/master/vendors/VendorsTable.vue"
import VendorManagers from "@/components/master/vendors/VendorManagers.vue"
import VendorBankAccounts from "@/components/master/vendors/VendorBankAccounts.vue"
import type { Response } from "@/types"
definePageMeta({
	name: "거래처관리",
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

// const filters = ref<FilterParams>({
//   type: 'name',
//   keyword: '',
//   vendorTypeCode: 'AP',
//   used: '',
// });

const filterParams = ref<FilterParams>({
	type: "name",
	keyword: "",
	vendorTypeCode: "AP",
	used: "",
	vendorFlag: true,
	employeeVendorFlag: false,
})
const vendorInfo = ref<any>(undefined)
const vendorManagerInfo = ref<any>(undefined)
const vendorManagerLoad = ref(false)
const vendorBankInfo = ref<any>(undefined)
const vendorBankLoad = ref(false)
const onSearchFlag = ref(false)
const onSearch = (data: any) => {
	filterParams.value = data
	onSearchFlag.value = !onSearchFlag.value
}

const onSelected = async (info: any) => {
	// console.log('onSelected', info);
	vendorInfo.value = info
	if (info.id) {
		await getVendorManager(info.id)
		await getVendorBank(info.id)
	}
}

/**
 * 거래처 담당자 목록 조회 API 호출
 * @param id
 */
const getVendorManager = async (vendorId: number | string) => {
	vendorManagerLoad.value = true
	await useCFetch<Response<any>>(`/api/v2/masters/vendorManagers`, {
		method: "GET",
		params: { companyCode: getCompanyCode.value, vendorId },
	})
		.then((res: Response<any>) => {
			if (res.data) {
				vendorManagerInfo.value = res.data
			} else {
				vendorManagerInfo.value = undefined
			}
		})
		.finally(() => (vendorManagerLoad.value = false))
}

/**
 * 거래처 계좌 목록 조회 API 호출
 * @param id
 */
const getVendorBank = async (vendorId: number | string) => {
	vendorBankLoad.value = true
	await useCFetch<Response<any>>(`/api/v2/masters/vendorBankAccounts`, {
		method: "GET",
		params: { vendorId },
	})
		.then((res: Response<any>) => {
			if (res.data) {
				vendorBankInfo.value = res.data
			} else {
				vendorBankInfo.value = undefined
			}
		})
		.finally(() => (vendorBankLoad.value = false))
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				매출/매입 거래처을 정보를 저장하고 담당자를 등록하여 관리할 수 있습니다.
				매입거래처의 경우 계좌정보를 등록해 관리 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="검색필터">
							<a-input-group compact class="filter">
								<a-select
									v-model:value="filterParams.type"
									:options="[
										{ label: '상호명', value: 'name' },
										{ label: '대표자명', value: 'representativeName' },
										{
											label: '사업자/주민번호',
											value: 'businessRegistrationNumber',
										},
									]"
									placeholder="항목선택"
								/>
								<a-input v-model:value="filterParams.keyword" placeholder="검색" />
							</a-input-group>
						</a-form-item>
					</a-col>
					<a-col flex="20rem">
						<a-form-item label="거래처구분">
							<eacc-select
								url="/api/v2/masters/vendors/types/vendorTypes"
								v-model:value="filterParams.vendorTypeCode"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="true"
								@update:value="(value) => (filterParams.vendorTypeCode = value)"
							/>
						</a-form-item>
					</a-col>
					<a-col flex="20rem">
						<a-form-item>
							<a-checkbox v-model:checked="filterParams.vendorFlag">
								<a-typography-text>일반거래처</a-typography-text>
							</a-checkbox>
							<a-checkbox v-model:checked="filterParams.employeeVendorFlag">
								<a-typography-text>임직원거래처</a-typography-text>
							</a-checkbox>
						</a-form-item>
					</a-col>
					<a-col flex="1rem">
						<a-divider type="vertical" class="full-height mx-none" />
					</a-col>
					<a-col flex="20rem">
						<a-form-item label="사용여부">
							<a-select
								v-model:value="filterParams.used"
								:options="[
									{ label: '전체', value: '' },
									{ label: '사용', value: 'true' },
									{ label: '미사용', value: 'false' },
								]"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<eacc-button
							component-is="search"
							size="middle"
							:modal-open="false"
							:data="filterParams"
							@click="onSearch"
						/>
					</a-col>
				</a-row>
			</a-form>
			<a-divider class="my-md" />
			<a-row :wrap="false" :gutter="[15, 15]" style="min-height: calc(100% - 7rem)">
				<a-col flex="1">
					<!-- 거래처 목록 -->
					<vendors-table
						:params="filterParams"
						@select="onSelected"
						:refresh="onSearchFlag"
					/>
				</a-col>
				<a-col flex="1">
					<a-row :gutter="[15, 15]" class="column">
						<a-col span="24">
							<!-- 거래처 담당자 정보 -->
							<vendor-managers
								:load="vendorManagerLoad"
								:info="vendorInfo"
								:data-list="vendorManagerInfo"
								@refresh="getVendorManager(vendorInfo.id)"
							/>
						</a-col>
						<a-col span="24">
							<!-- 매입거래처 계좌정보 -->
							<vendor-bank-accounts
								:load="vendorBankLoad"
								:info="vendorInfo"
								:data-list="vendorBankInfo"
								@refresh="getVendorBank(vendorInfo.id)"
							/>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</template>
	</page-layout>
</template>
