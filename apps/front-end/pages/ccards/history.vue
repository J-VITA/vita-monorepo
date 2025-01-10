<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import { type FormInstance } from "ant-design-vue"
import type { Dayjs } from "dayjs"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import {
	pagination,
	generateSortParams,
	pageSizeOptions,
	type Response,
	dateTimeFormat,
} from "@/types"
import {
	type CardHistoryItem,
	type CardIssueApproveOrRejectRequest,
	useCardHistoryColumns,
	useCardHistorySearch,
} from "@/types/ccards/history"
import { myCardOptions } from "@/types/ccards"

definePageMeta({
	name: "법인카드 불출 신청내역",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const { $dayjs } = useNuxtApp()

const { searchParams, updateSearchParams } = useCardHistorySearch(getCompanyCode.value)
const columns = useCardHistoryColumns()

const isDetail = ref<boolean>(false)
const detailData = ref<any>(undefined)

const isApproval = ref<boolean>(false)
const formState = ref<CardIssueApproveOrRejectRequest>({
	approvedBy: getEmployeeId.value,
	cardIssueRequestStatus: "",
	comment: "",
	companyCode: getCompanyCode.value,
})
const formRef = useTemplateRef<FormInstance>("formRef")

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onSelectionchange = (size: number) => {
	searchParams.value.size = size
	refresh()
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const { current, pageSize } = pagination
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: current - 1,
		size: pageSize,
		sort: sortParams,
	})
	refresh()
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		startDate: dateString[0],
		endDate: dateString[1],
	})
}

const onSearch = () => {
	updateSearchParams({ pageNumber: 0 })
	refresh()
}

const showDetail = (id: number) => {
	detailData.value = {
		current: id,
		list: dataSource.value?.data?.map((item) => item.id) || [],
	}
	isDetail.value = true
}

const showModalAction = async (id: number, type: "APPROVED" | "REJECTED") => {
	await useCFetch<Response<CardHistoryItem>>(`/api/v2/cards/issues/${id}`, {
		method: "GET",
		params: { id },
	}).then(async (res) => {
		formState.value.id = res.data?.id
		formState.value.cardIssueRequestStatus = type
		formState.value.comment = ""

		if (type === "APPROVED") {
			formState.value.requestedBy = res.data?.requestedBy
			formState.value.cardOptions = await myCardOptions(
				getCompanyCode.value,
				getEmployeeId.value
			)
			formState.value.date = [$dayjs(res.data?.startDate), $dayjs(res.data?.endDate)]
		} else {
			formState.value.cardOptions = []
			formState.value.date = undefined
		}
		isApproval.value = true
	})
}

const onApproval = (data: any) => {
	formRef.value?.validate().then(async () => {
		console.log("onApproval", data)
		const body = Object.assign({}, data)
		delete body.requestedBy
		delete body.cardOptions
		delete body.date

		await useCFetch<Response<any>>(`/api/v2/cards/issues/${data.id}/approval`, {
			method: "PATCH",
			params: {
				id: data.id,
			},
			body: body,
		}).then(() => {
			isApproval.value = false
			refresh()
		})
	})
}

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"card-issues-list",
	() =>
		useCFetch<Response<Array<CardHistoryItem>>>("/api/v2/cards/issues", {
			method: "GET",
			params: {
				page: searchParams.value.pageNumber,
				...searchParams.value,
			},
		}),
	{
		transform: (res: Response<Array<CardHistoryItem>>) => res,
	}
)
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				법인카드 불출신청 내역을 확인하여 수신처리 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 15]" wrap>
				<a-col>
					<a-space>
						<label>신청일</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<eacc-select-table
						label="부서"
						url="/api/v2/cards/commons/departments"
						v-model:value="searchParams.departmentIds"
						key-props="id"
						label-prop="name"
						:columns="[
							{ title: '부서명', data: (row: any) => row.name },
							{ title: '부서코드', data: (row: any) => row.code },
						]"
						@update:value="(value) => (searchParams.departmentCode = value[0])"
					/>
				</a-col>
				<a-col>
					<eacc-select-table
						label="신청자"
						url="/api/v2/cards/commons/employees"
						v-model:value="searchParams.employeeIds"
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
						@update:value="(value) => (searchParams.requestedBy = value[0])"
					/>
				</a-col>
				<a-col>
					<eacc-select
						label="상태"
						style="min-width: 10rem"
						url="/api/v2/cards/commons/requestStatus"
						v-model:value="searchParams.cardIssueRequestStatus"
						:field-names="{ value: 'code', label: 'label' }"
						:on-all-option="true"
					/>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						@click="onSearch"
					/>
				</a-col>
			</a-row>

			<a-divider />
			<a-flex justify="flex-end" gap="5" class="mb-sm">
				<a-select
					v-model:value="searchParams.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="(page: any) => onSelectionchange(page)"
				/>
			</a-flex>
			<a-table
				size="small"
				:loading="status === 'pending'"
				:columns="columns"
				:data-source="dataSource?.data"
				:row-key="(record) => record.id"
				:show-sorter-tooltip="false"
				:pagination="{
					...pagination,
					current: (searchParams.pageNumber || 0) + 1,
					pageSize: searchParams.size,
					total: dataSource?.totalElements,
				}"
				@resize-column="handleResizeColumn"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'cardIssueNumber'">
						<a-typography-link @click="showDetail(record.id)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'cardIssueRequestStatus'">
						<a-badge
							:status="
								text.code === 'APPROVED'
									? 'success'
									: text.code === 'REJECTED'
										? 'error'
										: 'warning'
							"
							:text="text.label"
						/>
					</template>
					<template v-if="column.dataIndex === 'approvalHeaderId'">
						<a-button
							type="text"
							:icon="materialIcons('mso', 'open_in_new')"
							size="small"
							@click="() => console.log(record.approvalHeaderId)"
						/>
					</template>
					<template v-if="column.dataIndex === 'actions'">
						<a-space v-if="record.cardIssueRequestStatus.code === 'PENDING'">
							<a-button
								danger
								size="small"
								:icon="materialIcons('mso', 'cancel')"
								@click="showModalAction(record.id, 'REJECTED')"
								>반려</a-button
							>
							<a-button
								type="primary"
								size="small"
								:icon="materialIcons('mso', 'task_alt')"
								@click="showModalAction(record.id, 'APPROVED')"
							>
								승인
							</a-button>
						</a-space>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<field-modal
				:title="formState.cardIssueRequestStatus === 'REJECTED' ? '신청반려' : '신청승인'"
				:showed="isApproval"
				:field="formState"
				:is-danger="formState.cardIssueRequestStatus === 'REJECTED'"
				:ok-text="formState.cardIssueRequestStatus === 'REJECTED' ? '반려' : '승인'"
				cancel-text="취소"
				@closed="isApproval = false"
				@submit="onApproval"
			>
				<template #content="{ field }">
					<a-flex align="start" class="mb-lg" :gap="10">
						<component
							:is="materialIcons('mso', 'error')"
							class="text-warning"
							style="font-size: 3rem"
						/>
						<div>
							<a-typography-title :level="4" class="mb-none">
								신청내용을 승인할까요?
							</a-typography-title>
						</div>
					</a-flex>

					<a-form
						ref="formRef"
						label-align="left"
						:model="field"
						:colon="false"
						:label-col="{ offset: 2, span: 22 }"
						:wrapper-col="{ offset: 2, span: 22 }"
					>
						<a-form-item name="comment" label="의견">
							<a-textarea
								v-model:value="field.comment"
								placeholder="의견을 입력하세요."
								style="resize: none"
								:rows="4"
							/>
						</a-form-item>
						<a-form-item
							class="mb-none"
							v-if="field.cardIssueRequestStatus === 'APPROVED'"
						>
							<a-descriptions
								:column="1"
								size="small"
								title="신청정보확인"
								bordered
								:label-style="{ width: '30%' }"
							>
								<a-descriptions-item label="불출카드지정">
									<a-form-item
										class="mb-none"
										name="cardId"
										:rules="[
											{
												required: true,
												message: '불출카드할 카드를 선택하세요.',
											},
										]"
									>
										<a-select
											placeholder="선택하세요."
											class="full-width"
											v-model:value="field.cardId"
											:options="field.cardOptions"
										/>
									</a-form-item>
								</a-descriptions-item>
								<a-descriptions-item label="카드신청자">
									<a-input
										class="full-width"
										disabled
										v-model:value="field.requestedBy"
									/>
								</a-descriptions-item>
								<a-descriptions-item label="사용기간">
									<a-range-picker
										:show-time="true"
										class="full-width"
										disabled
										v-model:value="field.date"
										:value-format="dateTimeFormat"
									/>
								</a-descriptions-item>
							</a-descriptions>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
			<!-- <field-modal
        size="small"
        title="신청반려"
        :showed="isReturn"
        :field="sendData"
        :is-danger="true"
        ok-text="반려"
        cancel-text="취소"
        @closed="isReturn = false"
        @submit="onApproval"
      >
        <template #content="{ field }">
          <a-flex align="start" class="mb-lg" :gap="10">
            <component
              :is="materialIcons('mso', 'cancel')"
              class="text-error"
              style="font-size: 3rem"
            />
            <div>
              <a-typography-title :level="4" class="mb-none">
                신청내용을 반려할까요?
              </a-typography-title>
            </div>
          </a-flex>

          <a-form
            ref="returnFormRef"
            label-align="left"
            :model="field"
            :colon="false"
            :label-col="{ offset: 2, span: 22 }"
            :wrapper-col="{ offset: 2, span: 22 }"
          >
            <a-form-item name="comment" label="의견">
              <a-textarea
                v-model:value="field.comment"
                placeholder="의견을 입력하세요."
                style="resize: none"
                :rows="4"
              />
            </a-form-item>
          </a-form>
        </template>
      </field-modal> -->

			<card-release-detail-modal
				:show="isDetail"
				:data="detailData"
				@update:show="(value) => (isDetail = value)"
			/>
		</template>
	</page-layout>
</template>
