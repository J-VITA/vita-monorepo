<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Response } from "@/types"

const props = withDefaults(defineProps<{ info: any; dataList: any; load: boolean }>(), {})

const showModal = ref<boolean>(false)
const showExcelUploadModal = ref<boolean>(false)
const data = ref<any>([])
const account = ref<any>(undefined)

const columns = ref<ColumnsType<any>>([
	{
		title: "은행명",
		dataIndex: "bankTypeLabel",
		resizable: true,
		width: 200,
	},
	{
		title: "계좌번호",
		dataIndex: "accountNumber",
		resizable: true,
		width: -1,
	},
])

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const onShowModal = async (id?: number) => {
	if (id) {
		// // id값을 받으면 디테일 정보 통신후 데이터 넘기기
		// account.value = {
		//   name: '우리은행',
		//   accountNumber: '1002-544-333324',
		//   description: '',
		//   mainAccountFlag: true,
		// };
		//거래처 계좌 상세 조회 API 호출
		await useCFetch<Response<any>>(`/api/v2/master/vendorBankAccounts/${id}`, {
			method: "GET",
			params: { id },
		}).then((res: Response<any>) => {
			if (res.data) {
				account.value = res.data
				showModal.value = true
			} else {
				account.value = undefined
				showModal.value = false
			}
		})
	} else {
		account.value = undefined
		showModal.value = true
	}
	showModal.value = true
}

const emit = defineEmits<{
	(e: "refresh"): void
}>()

watch(props, ({ info, dataList }) => {
	if (dataList) {
		data.value = dataList
	}
})

watch(showModal, (value) => {
	if (!value) {
		emit("refresh")
		account.value = undefined
	}
})
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-sm" wrap="wrap">
		<a-typography-title :level="4" class="page-title">
			<span
				>{{ props.info?.vendorTypeLabel }} 거래처 계좌정보
				{{ props.info?.name ? "[" + props.info?.name + "]" : "" }}
			</span>
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
				>계좌정보 등록</a-button
			>
		</a-space>
	</a-flex>
	<a-table
		size="small"
		:loading="load"
		:columns="columns"
		:data-source="data"
		:row-key="(record: any) => record.id"
		:pagination="false"
		:show-sorter-tooltip="false"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'bankTypeLabel'">
				<a-typography-link @click="onShowModal(record.id)">
					{{ text }}
				</a-typography-link>
				<a-tag v-if="record.mainAccountFlag" color="green" class="ml-sm"> 주계좌 </a-tag>
			</template>
		</template>
	</a-table>
	<bank-account-modal
		:show="showModal"
		:vendor="props.info"
		:account="account"
		@update:show="(value: any) => (showModal = value)"
	/>
	<excel-upload-modal
		:show="showExcelUploadModal"
		@update:show="(value: any) => (showExcelUploadModal = value)"
	/>
</template>
