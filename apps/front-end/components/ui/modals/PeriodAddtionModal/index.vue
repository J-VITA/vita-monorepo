<script lang="ts" setup>
import type { Response } from "@/types"
import { Form } from "ant-design-vue"
import { type CreateAccountPeriod, AccountPeriodStatus } from "@/types/master/period"
import type { Dayjs } from "dayjs"

const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const useForm = Form.useForm
const props = withDefaults(
	defineProps<{
		show?: boolean
	}>(),
	{
		show: false,
	}
)

const date = ref<Dayjs>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "submit", value: boolean): any
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})
const loading = ref<boolean>(false)
const modelRef = ref<CreateAccountPeriod>({
	companyId: getCompanyId.value,
	companyCode: getCompanyCode.value,
	accountYear: "",
	accountMonth: "",
	workplaceId: undefined,
	workplaceCode: undefined,
	accountPeriodStatus: AccountPeriodStatus.OPEN,
	description: "",
})

const rulesRef = ref<any>({
	accountYear: [
		{
			required: true,
			message: "신규생성 할 회계년월을 선택하세요",
		},
	],
	companyCode: [
		{
			required: true,
			message: "회사를 선택해주세요.",
		},
	],
})

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

const dateChange = (_: any, dateString: string) => {
	const date = dateString.split("-")
	modelRef.value.accountYear = date[0]
	modelRef.value.accountMonth = date[1]
}

const onSubmit = () => {
	validate()
		.then(async () => {
			loading.value = true
			await useCFetch<Response<any>>("/api/v2/masters/accountPeriods", {
				method: "POST",
				body: Object.assign({}, modelRef.value),
			}).then((res: Response<any>) => {
				if (res.status === 0) {
					message.success(`생성되었습니다.`)
					emit("submit", true)
					open.value = false
				} else {
					loading.value = false
				}
			})
		})
		.catch((err) => {
			console.log("error", err)
			loading.value = false
		})
}

const onAfterClose = () => {
	loading.value = false
	date.value = undefined
	resetFields()
}
</script>

<template>
	<a-modal
		centered
		v-model:open="open"
		title="회계 신규 생성"
		ok-text="저장"
		:destroy-on-close="true"
		:confirm-loading="loading"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-form
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
		>
			<a-form-item label="회계년월" v-bind="validateInfos.accountYear">
				<a-date-picker
					class="full-width"
					v-model:value="date"
					placeholder="회계년월"
					picker="month"
					@change="dateChange"
				/>
			</a-form-item>
			<!-- <a-form-item label="사업장" v-bind="validateInfos.workplaceId">
        <eacc-select
          :url="`/api/v2/settings/commons/workplaces`"
          :on-all-field="false"
          v-model:value="modelRef.workplaceId"
          :field-names="{ label: 'name', value: 'id' }"
          @update:value="(value) => (modelRef.workplaceId = value)"
        />
      </a-form-item> -->
			<a-form-item
				label="회사"
				name="companyCode"
				v-bind="validateInfos.companyCode"
				has-feedback
			>
				<eacc-select
					:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
					:on-all-field="false"
					v-model:value="modelRef.companyCode"
					:field-names="{ label: 'name', value: 'code' }"
					value-type="any"
					:refresh="true"
					@update:any-value="
						(value: any) => {
							modelRef.companyCode = value.code
							modelRef.companyId = value.id
						}
					"
					:disabled="getRole !== 'ROOT'"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item label="상태">
				<a-select
					v-model:value="modelRef.accountPeriodStatus"
					:options="[
						{ label: '오픈', value: AccountPeriodStatus.OPEN },
						{ label: '마감', value: AccountPeriodStatus.CLOSE },
					]"
				/>
			</a-form-item>
			<a-form-item label="설명">
				<a-input v-model:value="modelRef.description" />
			</a-form-item>
			<a-form-item label="사업장명">
				<eacc-select
					:url="`/api/v2/settings/companies?parentId=${modelRef.companyId}`"
					:on-all-field="false"
					v-model:value="modelRef.workplaceCode"
					refresh
					:field-names="{ label: 'name', value: 'workplaceCode' }"
					value-type="any"
					@update:any-value="
						(value: any) => {
							modelRef.workplaceId = value.id
							modelRef.workplaceCode = value.workplaceCode
						}
					"
				>
				</eacc-select>
			</a-form-item>
		</a-form>
	</a-modal>
</template>
