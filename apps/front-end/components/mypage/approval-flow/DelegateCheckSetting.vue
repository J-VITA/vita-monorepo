<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs"
import { type Response, dateTimeFormat } from "@/types"
import type { FormInstance } from "ant-design-vue"

type FormState = {
	companyCode: string | number
	delegateType: string
	startDate: string
	endDate: string
	delegatingEmployeeId: number // 접속한 사람
	delegatedEmployeeId: (string | number) | undefined // 위임할 사람
	used: boolean
	date?: [Dayjs, Dayjs]
	employeeId: (string | number)[]
}

const formRef = useTemplateRef<FormInstance>("formRef")
const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId, getWorkplaceId } = storeToRefs(authStore)

const formState = ref<FormState>({
	companyCode: getCompanyCode.value,
	delegateType: "CHECK",
	startDate: "",
	endDate: "",
	delegatingEmployeeId: getEmployeeId.value,
	delegatedEmployeeId: undefined,
	used: false,
	employeeId: [],
})

const { refresh } = await useAsyncData("delegate-approval", () =>
	useCFetch<Response<any>>("/api/v2/persons/approvalDelegates", {
		method: "GET",
		params: {
			delegateType: "CHECK",
			delegatingEmployeeId: getEmployeeId.value,
		},
	}).then((res: Response<any>) => {
		if (res.data) {
			formState.value = {
				...res.data,
				delegatingEmployeeId: getEmployeeId.value,
				employeeId: [res.data.delegatedEmployeeId],
				date: res.data.startDate
					? [dayjs(res.data.startDate), dayjs(res.data.endDate)]
					: undefined,
			}
		}
	})
)

const post = () => {
	formRef.value
		?.validate()
		.then(async () => {
			const body = Object.assign({}, formState.value, {
				delegatedEmployeeId: formState.value.employeeId[0],
			})

			await useCFetch<Response<any>>("/api/v2/persons/approvalDelegates", {
				method: "POST",
				body: body,
			}).then((res: Response<any>) => {
				if (res.status === 0) refresh()
			})
		})
		.catch((error) => console.error(error))
}
</script>
<template>
	<a-row :wrap="false" :gutter="10">
		<a-col flex="24%">대체검인자 설정</a-col>
		<a-col flex="1">
			<a-flex :gap="15" class="mb-md text-secondary">
				<a-switch
					size="small"
					v-model:checked="formState.used"
					@change="async () => await post()"
				/>
				<span>
					부재시 본인을 대신해 검인/확정을 해줄 사용자를 지정합니다.
					<br />
					자신과 대체검인자 모두에게 검인문서가 도착합니다.
				</span>
			</a-flex>
			<template v-if="formState.used">
				<a-form
					ref="formRef"
					class="box"
					label-align="left"
					autocomplete="off"
					:model="formState"
					:colon="false"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
				>
					<a-form-item
						class="mb-sm"
						label="부재기간"
						name="date"
						:rules="[
							{
								required: formState.used,
								message: '필수값 입니다.',
							},
						]"
					>
						<a-range-picker
							v-model:value="formState.date"
							:value-format="dateTimeFormat"
							@change="
								async (_, dateString) => {
									formState.startDate = dateString[0]
									formState.endDate = dateString[1]
									await post()
								}
							"
						/>
					</a-form-item>
					<a-form-item
						class="mb-none"
						label="대체 검인자"
						name="employeeId"
						:rules="[
							{
								type: 'array',
								required: formState.used,
								message: '필수값 입니다.',
							},
						]"
					>
						<eacc-select-table
							url="/api/v2/masters/commons/employees"
							v-model:value="formState.employeeId"
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
								{ title: '사업장', data: (row: any) => row.workplaceName },
							]"
							@update:value="async () => await post()"
						/>
					</a-form-item>
				</a-form>
			</template>
		</a-col>
	</a-row>
</template>
