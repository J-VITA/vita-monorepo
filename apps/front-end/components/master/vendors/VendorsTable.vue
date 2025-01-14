<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { MenuProps } from "ant-design-vue"
import { type IAddr, type Response, pageSizeOptions, pagination, pageSize } from "@/types"
import type { FilterParams, SearchParams } from "@/types/master/vendors"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Vendor, VendorType } from "@/types/master/vendors"

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const initModelRef: VendorType = {
	id: undefined,
	companyCode: getCompanyCode.value,
	code: "",
	name: "",
	businessRegistrationNumber: "",
	subBusinessRegistrationNumber: "",
	vendorType: "",
	vendorTypeName: "",
	vendorTypeLabel: "",
	countryType: "KOR",
	countryTypeName: "",
	countryTypeLabel: "",
	representativeName: "",
	businessType: "",
	businessCondition: "",
	address: {
		detailAddr: "",
		engAddr1: "",
		engAddr2: "",
		jibunAddr: "",
		roadAddr: "",
		zonecode: "",
	},
	telNumber: "",
	used: true,
	description: "",
	paymentTerms: "",
	apTermsOfPayment: "",
	arTermsOfPayment: "",
}
const modelRef = ref<VendorType>(initModelRef)

const props = withDefaults(
	defineProps<{ params: FilterParams | undefined; refresh: boolean }>(),
	{}
)

const route = useRoute()
const routePath = computed(() => route.path)

const emit = defineEmits<{
	(e: "select", value: any): void
	(e: "pagination", value: any): any
}>()

const searchParams = ref({
	companyCode: getCompanyCode.value,
	page: 0,
	size: pageSize,
	sort: [],
	type: "name",
	keyword: "",
	vendorTypeCode: "AP",
	used: undefined,
	vendorFlag: true,
	employeeVendorFlag: false,
})

const activeRow = ref<number>(-1)
const columns = ref<ColumnsType<any>>([
	{
		title: "거래처구분",
		dataIndex: "vendorTypeName",
		resizable: true,
		sorter: false,
		width: -1,
	},
	{
		title: "상호명",
		dataIndex: "name",
		resizable: true,
		sorter: false,
		width: -1,
	},
	{
		title: "사업자등록번호/주민번호",
		dataIndex: "businessRegistrationNumber",
		resizable: true,
		sorter: false,
		width: -1,
	},
	{
		title: "대표자명",
		dataIndex: "representativeName",
		resizable: true,
		sorter: false,
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		resizable: true,
		sorter: false,
		width: -1,
	},
])
// const showModal = ref<boolean>(false);
const showVendorModal = ref<boolean>(false)
const showEmployeeVendorModal = ref<boolean>(false)

const {
	data,
	status,
	refresh: vendorRefresh,
} = await useAsyncData("master-vendors-list", () =>
	useCFetch<Response<any>>("/api/v2/masters/vendors", {
		method: "GET",
		params: {
			...searchParams.value,
			name: searchParams.value.type === "name" ? searchParams.value.keyword : undefined,
			businessRegistrationNumber:
				searchParams.value.type === "businessRegistrationNumber"
					? searchParams.value.keyword
					: undefined,
			representativeName:
				searchParams.value.type === "representativeName"
					? searchParams.value.keyword
					: undefined,
		},
	}).then((res: Response<any>) => res)
)
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const cellChange = (pagination: any) => {
	searchParams.value.page = pagination.current - 1
	searchParams.value.size = pagination.pageSize
	vendorRefresh()
}

const vendorMenuItemClick: MenuProps["onClick"] = (e) => {
	if (e.key === "VENDOR") {
		onShowModal("VENDOR")
	} else if (e.key === "EMPLYOEES") {
		// console.log('임직원거래처 등록', e);
		onShowModal("EMPLYOEES")
	} else {
		console.log(e)
	}
}

/**
 * 페이지 콤보박스 체인지 이벤트
 */
const onSelectionchange = (data: number) => {
	searchParams.value.page = 0
	searchParams.value.size = data
	vendorRefresh()
}

// method: 'PATCH' | 'POST'
const onShowModal = async (type: "VENDOR" | "EMPLYOEES", id?: number) => {
	const proms = new Promise(async (resolve) => {
		if (id) {
			const res = (await Promise.resolve(getVendor(id))) as Vendor
			// modelRef.value = res;
			// modelRef.value.vendorType = res.vendorTypeName;

			if (res.vendorTypeName === "AR") {
				modelRef.value.paymentTerms = res.arTermsOfPayment
			} else if (res.vendorTypeName === "AP") {
				modelRef.value.paymentTerms = res.apTermsOfPayment
			} else {
				modelRef.value.paymentTerms = res.arTermsOfPayment || res.apTermsOfPayment
			}
			modelRef.value = {
				...initModelRef,
				...res,
				vendorType: res.vendorTypeName,
				paymentTerms:
					res.vendorTypeName === "AR"
						? res.arTermsOfPayment
						: res.vendorTypeName === "AP"
							? res.apTermsOfPayment
							: res.arTermsOfPayment || res.apTermsOfPayment,
			}
		} else {
			modelRef.value = Object.assign({}, initModelRef)
		}
		resolve(modelRef.value)
	})

	proms.then((data) => {
		if (type === "VENDOR") {
			showVendorModal.value = true
		} else {
			showEmployeeVendorModal.value = true
		}
	})
}

const customRow = (record: any) => {
	return {
		onClick: () => {
			activeRow.value = record.id
			emit("select", record)
		},
		className: record.id === activeRow.value ? "active-row" : "",
	}
}

/**
 * 거래처 상세 조회 API 호출
 * @param id
 */
const getVendor = async (id: number | string) => {
	return await useCFetch<Response<Vendor>>(`/api/v2/masters/vendors/${id}`, {
		method: "GET",
		params: { id },
	}).then((res: Response<Vendor>) => res.data)
}

const updateVendorModal = () => {
	vendorRefresh()
}

watch(props, (data) => {
	if (data.params) {
		const params = Object.assign({}, searchParams.value, data.params) as any
		if (params.used == "true") {
			params.used = true
		} else if (params.used == "false") {
			params.used = false
		} else {
			params.used = undefined
		}
		searchParams.value = params
		// console.log('>>>> ', searchParams.value);
	}

	vendorRefresh()
})
</script>

<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-sm" wrap="wrap">
		<a-typography-title :level="4" class="page-title"> 거래처 목록 </a-typography-title>
		<a-space :size="5">
			<eacc-excel-button
				req-type="download"
				label="엑셀다운로드"
				file-name="거래처관리"
				:data="data?.data"
				:disabled="!data?.data || data?.data.length === 0"
			/>
			<eacc-excel-button
				ghost
				type="primary"
				url="/api/v2/masters/vendors/validate"
				req-type="upload"
				label="엑셀일괄등록"
				:sample-file-key="routePath"
				@submit="() => vendorRefresh()"
			/>
			<a-dropdown :trigger="['click']">
				<a-button type="primary" :icon="materialIcons('mso', 'add_circle')"
					>거래처 등록</a-button
				>
				<template #overlay>
					<a-menu @click="vendorMenuItemClick">
						<a-menu-item key="VENDOR">
							<component :is="materialIcons('mso', 'account_balance_wallet')" />
							<span class="ml-sm">거래처 등록</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="EMPLYOEES">
							<component :is="materialIcons('mso', 'person_add')" />
							<span class="ml-sm">임직원거래처 등록</span>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>

			<a-select
				v-model:value="searchParams.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="(page: any) => onSelectionchange(page)"
			/>
		</a-space>
	</a-flex>
	<a-table
		size="small"
		:loading="status === 'pending'"
		:columns="columns"
		:data-source="data?.data"
		row-key="id"
		:show-sorter-tooltip="false"
		:pagination="
			Object.assign({}, pagination, {
				current: searchParams.page + 1 || 1,
				pageSize: searchParams.size,
				total: data?.totalElements || 0,
			})
		"
		:custom-row="customRow"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'name'">
				<a-typography-link
					@click="
						record.employeeVendorFlag
							? onShowModal('EMPLYOEES', record.id)
							: onShowModal('VENDOR', record.id)
					"
				>
					{{ text }}
				</a-typography-link>
			</template>
			<template v-if="column.dataIndex === 'vendorTypeName'">
				<a-space :size="1">
					<a-tag color="cyan" v-if="record.vendorTypeName.indexOf('AR') > -1">
						매출
					</a-tag>
					<a-tag color="orange" v-if="record.vendorTypeName.indexOf('AP') > -1">
						매입
					</a-tag>
					<a-tag color="purple" v-if="record.employeeVendorFlag"> 임직원 </a-tag>
				</a-space>
			</template>
			<template v-if="column.dataIndex === 'used'">
				<a-badge
					:status="text ? 'success' : 'error'"
					:text="text ? '사용중' : '미사용'"
				/>
			</template>
		</template>
	</a-table>
	<vendor-modal
		v-if="showVendorModal"
		:show="showVendorModal"
		:title="modelRef?.id ? '거래처 수정' : '거래처 추가'"
		:vendor-info="modelRef"
		@update:show="(value: boolean) => (showVendorModal = value)"
		@refresh="updateVendorModal"
	/>

	<employees-vendor-modal
		v-if="showEmployeeVendorModal"
		v-model:open="showEmployeeVendorModal"
		:title="modelRef?.id ? '임직원 거래처 수정' : '임직원 거래처 추가'"
		:vendor-info="modelRef"
		@update:open="(value: boolean) => (showEmployeeVendorModal = value)"
		@refresh="updateVendorModal"
	/>
</template>
