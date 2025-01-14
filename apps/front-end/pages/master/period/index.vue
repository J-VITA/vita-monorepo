<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import PeriodTable from "@/components/master/period/PeriodTable.vue"
import { type Response, pageSize, dateTimeFormat } from "@/types"
import {
	AccountPeriodStatus,
	type AccountPeriod,
	type ConfirmProps,
	type SearchParams,
} from "@/types/master/period"
import type { Dayjs } from "dayjs"

definePageMeta({
	name: "회계기간관리",
})

const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const confirmModalProps = ref<ConfirmProps>({
	showed: false,
	type: undefined,
	title: "",
	content: "",
	okTitle: "",
	data: [],
})
const createModalOpend = ref(false)
const yearMonth = ref<[Dayjs, Dayjs]>()

const searchParams = ref<SearchParams>({
	companyId: getCompanyId.value,
	companyCode: getCompanyCode.value,
	accountPeriodStatus: "",
	workplaceId: undefined,
	workplaceCode: "",
	page: 0,
	size: pageSize,
})

// const params = ref<SearchParams>();

const { data, status, refresh } = await useAsyncData(
	"period-list",
	() =>
		useCFetch<Response<AccountPeriod>>("/api/v2/masters/accountPeriods", {
			method: "GET",
			// lazy: true,
			params: Object.assign(
				{},
				{
					companyCode: searchParams.value.companyCode,
					accountPeriodStatus: searchParams.value.accountPeriodStatus || undefined,
					workplaceCode: searchParams.value.workplaceCode || undefined,
					searchYearMonthFrom: searchParams.value.searchYearMonthFrom || undefined,
					searchYearMonthTo: searchParams.value.searchYearMonthTo || undefined,
					page:
						searchParams.value.page && searchParams.value.page > 0
							? searchParams.value.page - 1
							: 0,
					size: searchParams.value.size,
				}
			),
		}).then((res: Response<any>) => {
			searchParams.value.page = res.pageNumber
			searchParams.value.size = res.size
			return res
		})
	// { watch: [searchParams.value] }
)

/**
 * 월별 마감 모달 데이터 세팅
 * @param list
 */
const accountPeriodClose = (list: Array<AccountPeriod>): void => {
	if (list.length > 0) {
		confirmModalProps.value = {
			showed: true,
			type: AccountPeriodStatus.CLOSE,
			title: "선택한 월의 회계관리를 마감할까요?",
			content: "회계기간이 마감되면 해당월의 지출입력과 결재상신이 불가능 합니다.",
			okTitle: "마감",
			data: list,
		}
	} else {
		message.error("마감처리 할 행을 선택해주세요.")
	}
}

/**
 * 월별 오픈 데이터 세팅
 * @param list
 */
const accountPeriodOpen = (list: Array<AccountPeriod>): void => {
	if (list.length > 0) {
		confirmModalProps.value = {
			showed: true,
			type: AccountPeriodStatus.OPEN,
			title: "선택한 월의 회계관리를 오픈할까요?",
			content: "회계기간이 오픈되면 해당월의 지출입력과 결재상신이 가능 합니다.",
			okTitle: "오픈",
			data: list,
		}
	} else {
		message.error("오픈처리 할 행을 선택해주세요.")
	}
}

/**
 * 월별 마감/오픈 API 호출
 * @param state : close, open
 * @param list
 */
const confirmModalSubmit = async (
	state: ConfirmProps["type"],
	list: Array<AccountPeriod>
) => {
	await Promise.all(
		list.map((item) =>
			useCFetch<Response<any>>(`/api/v2/masters/accountPeriods/${state}/${item.id}`, {
				method: "PATCH",
				params: { action: state, id: item.id },
			})
		)
	)

	message.success(
		`회계기간이 ${state === "CLOSE" ? "마감되었습니다." : "오픈되었습니다."}`
	)
	refresh()
	confirmModalProps.value.showed = false
}

/**
 * 회계기간 삭제 API 호출
 * @param list
 */
const onDelete = async (items: Array<AccountPeriod>) => {
	try {
		await Promise.all(
			items.map((item) =>
				useCFetch<Response<any>>(`/api/v2/masters/accountPeriods/${item.id}`, {
					method: "DELETE",
					body: { id: item.id },
				})
			)
		)

		message.success("삭제되었습니다.")
		refresh()
	} catch (error) {
		console.error("삭제 실패:", error)
		// 필요 시 에러 메시지 표시
	}
}

const setPagination = (pagination: any) => {
	searchParams.value.page = pagination.current
	searchParams.value.size = pagination.pageSize
	refresh()
}

const onSearch = (params: any) => {
	refresh()
}

// onMounted(async () => {
//   refresh();
// });
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				회계오픈/마감을 할 수 있는 회계기간을 관리할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" :colon="false" :model="searchParams">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="기간설정">
							<a-range-picker
								v-model:value="yearMonth"
								:value-format="dateTimeFormat"
								picker="month"
								@change="
									(_, dateStrings) => {
										searchParams.searchYearMonthFrom = dateStrings[0]
										searchParams.searchYearMonthTo = dateStrings[1]
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col span="4">
						<a-form-item label="회사" name="companyCode" has-feedback>
							<eacc-select
								:url="`/api/v2/settings/companies`"
								:params="{
									code: getRole === 'ROOT' ? undefined : getCompanyCode,
									placeType: 'COMPANY',
								}"
								:on-all-field="false"
								v-model:value="searchParams.companyCode"
								:field-names="{ label: 'name', value: 'code' }"
								value-type="any"
								refresh
								@update:any-value="
									(value: any) => {
										console.log(value)
										searchParams.companyCode = value.code
										searchParams.companyId = value.id
									}
								"
							>
								<!-- :disabled="getRole !== 'ROOT'" -->
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col span="4">
						<a-form-item label="사업장명">
							<eacc-select
								:url="`/api/v2/settings/companies`"
								:params="{
									parentId: searchParams.companyId,
									placeType: 'WORKPLACE',
								}"
								:on-all-field="true"
								v-model:value="searchParams.workplaceCode"
								refresh
								:field-names="{ label: 'name', value: 'workplaceCode' }"
								value-type="any"
								@update:any-value="
									(value: any) => {
										searchParams.workplaceId = value.id
										searchParams.workplaceCode = value.workplaceCode
									}
								"
							>
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col span="4">
						<a-form-item label="상태">
							<eacc-select
								:url="`/api/v2/masters/accountPeriods/types/status`"
								:on-all-field="true"
								v-model:value="searchParams.accountPeriodStatus"
								:field-names="{ label: 'label', value: 'code' }"
								@update:value="(value) => (searchParams.accountPeriodStatus = value)"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<eacc-button
							component-is="search"
							:modal-open="false"
							:data="searchParams"
							@click="onSearch"
						/>
					</a-col>
				</a-row>
			</a-form>

			<a-divider class="my-md" />

			<period-table
				:fetch-data="data"
				:loading="status === 'pending'"
				@create-period="(opend) => (createModalOpend = opend)"
				@account-period-close="accountPeriodClose"
				@account-period-open="accountPeriodOpen"
				@delete="onDelete"
				@pagination="setPagination"
			></period-table>
		</template>
		<template #modal>
			<confirm-modal
				size="small"
				:showed="confirmModalProps.showed"
				:type="confirmModalProps.type === AccountPeriodStatus.CLOSE ? 'error' : 'info'"
				:title="confirmModalProps.title"
				:btn-ok-title="confirmModalProps.okTitle"
				:data="confirmModalProps.data"
				@close="confirmModalProps.showed = false"
				@submit="
					(data: AccountPeriod[]) => confirmModalSubmit(confirmModalProps.type, data)
				"
			>
				<template #icon>
					<component :is="materialIcons('mso', 'error_outline')" class="text-warning" />
				</template>
				<template #content>
					<a-typography-text type="secondary">
						{{ confirmModalProps.content }}
					</a-typography-text>
				</template>
			</confirm-modal>

			<period-addtion-modal
				:show="createModalOpend"
				@update:show="() => (createModalOpend = false)"
				@submit="() => refresh()"
			>
			</period-addtion-modal>
		</template>
	</page-layout>
</template>
