<script setup lang="ts">
import type { Response, RequestParams } from "@/types"

type Data = {
	id: number
	name: string
	description: string
	used: boolean
}
const showModal = ref<boolean>(false)

// const data = ref<Data[]>([
//   {
//     id: 1,
//     name: '지출결의서',
//     description:
//       '개인경비, 법인카드,세금계산서 항목을 모아 통합된 지출결의서로 상용합니다.',
//     used: true,
//   },
//   {
//     id: 2,
//     name: '개인경비 신청서',
//     description: '개인경비 지출에 대한 결재문서로 사용합니다.',
//     used: false,
//   },
// ]);

const {
	data: apprFormData,
	pending: apprFormDataPending,
	refresh: apprFormDataRefresh,
} = await useAsyncData(`approval-form`, () =>
	useCFetch<Response<any>>("/api/v2/masters/approvalForms", {
		method: "GET",
	}).then((res: Response<any>) => {
		return res.data
	})
)

const onShowModal = (id: number) => {
	console.log(id, "결재양식 모달")
	showModal.value = true
}
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md" wrap="wrap">
		<a-typography-title :level="4" class="page-title"> 결재양식 목록 </a-typography-title>
	</a-flex>
	<a-table
		size="small"
		:row-key="(record) => record.id"
		:loading="false"
		:columns="[
			{ title: '결재양식명', dataIndex: 'name' },
			{ title: '설명', dataIndex: 'description' },
			{ title: '사용여부', dataIndex: 'used' },
		]"
		:data-source="apprFormData"
		:pagination="false"
	>
		<template #bodyCell="{ column, record }">
			<template v-if="column.dataIndex === 'name'">
				<a-typography-link @click="onShowModal(record.id)">
					{{ record.name }}
				</a-typography-link>
			</template>
			<template v-if="column.dataIndex === 'used'">
				<a-switch size="small" v-model:checked="record.used" />
			</template>
		</template>
	</a-table>
	<FormViewModal :show="showModal" @update:show="(value) => (showModal = value)" />
</template>
