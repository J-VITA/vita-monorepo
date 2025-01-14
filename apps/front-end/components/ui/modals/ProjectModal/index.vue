<script setup lang="ts">
import type { Response } from "@/types"
import { Form } from "ant-design-vue"
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { type Node, type FormState, initFormData } from "@/types/master/project"

const props = withDefaults(
	defineProps<{
		show: boolean
		node?: Node
		companyCode?: string
	}>(),
	{
		show: false,
	}
)

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})
const useForm = Form.useForm
const loading = ref<boolean>(false)
const startDate = ref<Dayjs>()
const endDate = ref<Dayjs>()
const users = ref<(string | number)[]>([])
const modelRef = ref<FormState>(initFormData)
const rulesRef = ref<any>({
	name: [
		{
			required: true,
			message: "필수 입력값입니다.",
			trigger: "change",
		},
	],
	code: [
		{
			required: true,
			message: "필수 입력값입니다.",
			trigger: "change",
		},
	],
})

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

const onSubmit = () => {
	validate()
		.then(async () => {
			loading.value = true
			const url = props.node
				? `/api/v2/masters/projects/${props.node.id}`
				: "/api/v2/masters/projects"

			await useCFetch<Response<any>>(url, {
				method: props.node ? "PATCH" : "POST",
				body: Object.assign({}, modelRef.value),
			}).then((res: Response<any>) => {
				if (res.status === 0) {
					emit("callback", res.message)
					open.value = false
				}
				loading.value = false
			})
		})
		.catch((err) => {
			console.log("error", err)
		})
}

const onAfterClose = () => {
	modelRef.value = initFormData
	users.value = []
	startDate.value = undefined
	endDate.value = undefined
	loading.value = false
	resetFields()
}

watch(props, (items) => {
	if (items.show && props.companyCode) {
		if (items.node) {
			modelRef.value = items.node
			startDate.value = items.node.startYearMonth
				? dayjs(items.node.startYearMonth)
				: undefined
			endDate.value = items.node.endYearMonth ? dayjs(items.node.endYearMonth) : undefined
			users.value = items.node.employeeIds.map((e) => e.id)
		} else {
			modelRef.value.companyCode = props.companyCode
		}
	}
})
</script>
<template>
	<a-modal
		centered
		v-model:open="open"
		title="프로젝트 추가"
		:after-close="onAfterClose"
		:destroy-on-close="true"
		:confirmLoading="loading"
		@ok="onSubmit"
	>
		<a-form
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
		>
			<a-form-item label="프로젝트명" v-bind="validateInfos.name">
				<a-input v-model:value="modelRef.name" />
			</a-form-item>
			<a-form-item label="프로젝트 기간">
				<a-row :wrap="false" align="middle">
					<a-col flex="1">
						<a-date-picker
							class="full-width"
							v-model:value="startDate"
							picker="month"
							:disabled-date="(current: Dayjs) => current && current > endDate!"
							@change="(_, dateString) => (modelRef.startYearMonth = dateString)"
						/>
					</a-col>
					<a-col flex="2rem" class="text-center">-</a-col>
					<a-col flex="1">
						<a-date-picker
							class="full-width"
							v-model:value="endDate"
							:disabled="startDate === undefined"
							:disabled-date="(current: Dayjs) => current && current < startDate!"
							picker="month"
							@change="(_, dateString) => (modelRef.endYearMonth = dateString)"
						/>
					</a-col>
				</a-row>
			</a-form-item>
			<a-form-item label="프로젝트 설명">
				<a-input v-model:value="modelRef.description" />
			</a-form-item>
			<a-form-item label="프로젝트코드" v-bind="validateInfos.code">
				<a-input v-model:value="modelRef.code" :disabled="props.node ? true : false" />
			</a-form-item>
			<a-form-item label="사용여부">
				<a-switch v-model:checked="modelRef.used" size="small" />
			</a-form-item>

			<a-form-item label="사용자추가">
				<eacc-select-multi-table
					url="/api/v2/masters/commons/employees"
					v-model:value="users"
					key-props="id"
					:columns="[
						{ title: '이름', data: (row: any) => row.name, width: '10rem' },
						{ title: '직위', data: (row: any) => row.jobName },
						{ title: '부서', data: (row: any) => row.departmentName },
						{ title: '회사', data: (row: any) => row.companyName },
					]"
					@update:value="(value) => (users = value)"
					@selection-change="
						(v) => {
							modelRef.employeeIds = v.map((e: any) => {
								return {
									id: e.id,
								}
							})
						}
					"
				/>
			</a-form-item>
		</a-form>
	</a-modal>
</template>
