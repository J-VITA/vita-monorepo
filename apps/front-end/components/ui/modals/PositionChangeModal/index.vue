<script lang="ts" setup>
import type { Response } from "@/types"
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"

interface DataProps {
	/** 받은 데이터 */
	data?: any | undefined | null | unknown
	/** 모달 show/hide */
	show: boolean
	companyCode: string
}

interface DataTableType {
	id: number
	departmentName: string
	name: string
	gradeName: string
	jobName: string
	email: string
}

const { data, show, companyCode } = defineProps<DataProps>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const loading = ref<boolean>(false)

const selectedKey = ref<string | number>(-1)
const selectedRowKeys = ref<string | number>(-1)
const selectedRowName = ref<string>()

//submit 변수 타입
type EmployeeIdType = { id: string | number }
//최종 submit 변수
const ids = ref<Array<EmployeeIdType>>([])

/**
 * 그룹코드 행 선택
 */
const rowClick = (record: any, idx: string | number) => {
	console.log("record.id", record)
	selectedRowKeys.value = record.id
	selectedRowName.value = record.name
	selectedKey.value = idx
	getDepartmentEmployees(record.id)
}

/**
 * 직위별 임직원 조회 및 셋업
 * @param id
 */
const getDepartmentEmployees = async (id: string) => {
	if (id) {
		return await useCFetch<Response<DataTableType[]>>(
			`/api/v2/settings/commons/employees`,
			{
				method: "GET",
				params: {
					companyCode: companyCode,
					positionId: id,
				},
			}
		).then((res: Response<DataTableType[]>) => {
			if (res.status === 0) {
				ids.value = []
				const memberList = res.data as DataTableType[]
				const t = memberList.filter((member) => member.id).map((member) => member.id) as (
					| string
					| number
				)[]
				data.member.forEach((member: any) => {
					t.push(member.id)
				})
				t.forEach((member: any) => {
					ids.value.push(member)
				})
				console.log("props.data.member ", ids.value)
			}
		})
	}
}

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: any, index: string | number) => {
	return index === selectedKey.value ? "active-row cursor-pointer" : "cursor-pointer"
}

const {
	data: rowData,
	pending,
	error,
	refresh,
} = await useAsyncData(`positions-list`, () =>
	useCFetch<Response<any>>("/api/v2/settings/positions", {
		method: "GET",
		params: {
			companyCode: companyCode,
			used: true,
		},
	}).then((res: Response<any>) => res.data)
)

const ok = () => {
	if (selectedRowKeys.value === data.member[0].positionId) {
		message.warning("동일한 직위 입니다.")
	} else {
		if (selectedRowName.value) {
			Modal.confirm({
				title: "직위변경",
				// icon: createVNode(ExclamationCircleOutlined),
				content: createVNode(
					"div",
					{ style: "font-weight: bold" },
					`선택된 사용자의 직위를 '${selectedRowName.value}'(으)로 변경할까요?`
				),
				onOk() {
					loading.value = true

					const employeeIds: Array<EmployeeIdType> = ids.value.map((id: any) => {
						return { id }
					})

					const body = Object.assign(
						{},
						{
							id: selectedRowKeys.value,
							companyCode: companyCode,
							employeeIds,
						}
					)

					useCFetch<Response<any>>(`/api/v2/settings/positions/reassign/employees`, {
						method: "PUT",
						body,
					})
						.then((res: Response<any>) => {
							if (res.status == 0) {
								message.success(`${res.message}`)
								refresh()
							} else {
								message.error(`${res.message}`)
							}
						})
						.finally(() => {
							loading.value = false
							open.value = false
							emit("callback", true)
						})
				},
				onCancel() {
					console.log("Cancel")
				},
				class: "test",
			})
		} else {
			message.error(`변경할 직위를 선택하세요.`)
		}
	}
}
</script>

<template>
	<a-modal
		centered
		width="100rem"
		v-model:open="open"
		:destroyOnClose="true"
		:confirmLoading="loading"
		@ok="ok"
	>
		<template #title>
			<a-typography-title :level="3" class="mb-none"> 직위 변경 </a-typography-title>
		</template>
		<a-row :gutter="[15, 15]">
			<a-col flex="auto">
				<a-table
					bordered
					size="small"
					:data-source="data.member"
					:columns="[
						{ title: '이름', dataIndex: 'name' },
						{ title: '직위', dataIndex: 'gradeName' },
						{ title: '부서', dataIndex: 'departmentName' },
						{ title: '사번', dataIndex: 'employeeNumber' },
					]"
					:pagination="false"
					row-key="id"
				>
					<!-- :row-key="(record) => record.id" -->
					<template #title>
						<a-typography-title :level="5" class="mb-none">
							선택된 사용자
						</a-typography-title>
					</template>
				</a-table>
			</a-col>
			<a-col flex="1rem" class="text-center">
				<a-divider type="vertical" class="full-height" />
			</a-col>
			<a-col flex="1">
				<a-table
					size="small"
					:data-source="rowData"
					:columns="[{ title: '직위', dataIndex: 'name' }]"
					row-key="id"
					:pagination="false"
					:custom-row="
						(record, idx) => {
							return {
								onClick: (event) => rowClick(record, idx as string | number),
							}
						}
					"
					:row-class-name="setClassName"
					bordered
				>
					<template #title>
						<a-typography-title :level="5" class="mb-none">
							변경할 직위를 선택하세요
						</a-typography-title>
					</template>
				</a-table>
			</a-col>
		</a-row>
	</a-modal>
</template>
