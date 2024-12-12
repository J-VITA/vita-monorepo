<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Response } from "@/types"

const props = withDefaults(defineProps<{ info: any; dataList: any; load: boolean }>(), {})

const showModal = ref<boolean>(false)
const showExcelUploadModal = ref<boolean>(false)
const data = ref<any>()
const manager = ref<any>(undefined)

const columns = ref<ColumnsType<any>>([
	{
		title: "담당자명",
		dataIndex: "managerName",
		resizable: true,
		sorter: false,
		width: -1,
	},
	{
		title: "이메일",
		dataIndex: "email",
		resizable: true,
		width: -1,
	},
	{
		title: "휴대전화",
		dataIndex: "cellPhoneNumber",
		resizable: true,
		width: -1,
	},
	{
		title: "회사전화",
		dataIndex: "telNumber",
		resizable: true,
		width: -1,
	},
])

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const onShowModal = async (id?: number) => {
	if (id) {
		// id값을 받으면 디테일 정보 통신후 데이터 넘기기
		// manager.value = {
		//   name: '김회계',
		//   email: 'gg23@naver.com',
		//   phone: '010-2433-4344',
		//   tel: '02-4444-3332',
		//   description: '',
		//   representative: true,
		// };
		//거래처 담당자 상세 조회 API 호출
		await useCFetch<Response<any>>(`/api/v2/master/vendorManagers/${id}`, {
			method: "GET",
			params: { id },
		}).then((res: Response<any>) => {
			if (res.data) {
				manager.value = res.data
				showModal.value = true
			} else {
				manager.value = undefined
				showModal.value = false
			}
		})
	} else {
		manager.value = undefined
		showModal.value = true
	}
}

const emit = defineEmits<{
	(e: "refresh"): void
}>()

watch(props, ({ info, dataList }) => {
	if (dataList !== undefined) {
		data.value = dataList
	}
})
watch(showModal, (value) => {
	if (!value) {
		emit("refresh")
		manager.value = undefined
	}
})
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-sm" wrap="wrap">
		<a-typography-title :level="4" class="page-title">
			거래처 담당자 정보
			{{ props.info?.name ? "[" + props.info?.name + "]" : "" }}
		</a-typography-title>
		<a-space :size="5">
			<a-button
				type="primary"
				ghost
				:disabled="props.info === undefined"
				:icon="materialIcons('mso', 'file_upload')"
				@click="() => (showExcelUploadModal = true)"
			>
				엑셀일괄등록
			</a-button>
			<a-button
				type="primary"
				:disabled="props.info === undefined"
				:icon="materialIcons('mso', 'add_circle')"
				@click="onShowModal()"
				>담당자 등록</a-button
			>
		</a-space>
	</a-flex>
	<a-table
		size="small"
		:loading="load"
		:columns="columns"
		:data-source="data"
		:row-key="(record) => record.id"
		:pagination="false"
		:show-sorter-tooltip="false"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'managerName'">
				<a-typography-link @click="onShowModal(record.id)">
					{{ text }}
				</a-typography-link>
				<a-tag v-if="record.mainManagerFlag" color="green" class="ml-sm">
					대표담당자
				</a-tag>
			</template>
		</template>
	</a-table>
	<vendor-manager-modal
		:show="showModal"
		:vendor="props.info"
		:manager="manager"
		@update:show="(value) => (showModal = value)"
	/>
	<excel-upload-modal
		:show="showExcelUploadModal"
		@update:show="(value) => (showExcelUploadModal = value)"
	/>
</template>
