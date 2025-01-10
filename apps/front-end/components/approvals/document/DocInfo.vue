<script setup lang="ts">
type Props = {
	type: "write" | "read" | "preview" | "print"
	data?: any
}
const { type } = defineProps<Props>()

const formData = defineModel<any>("formData", { required: true })

const descriptionsColumn = computed(() => {
	if (type === "preview" || type === "print") {
		return 4
	}
	return 1
})

const showHistory = ref<boolean>(false)
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none"> 문서정보 </a-typography-title>
	</a-flex>
	<a-descriptions
		size="small"
		bordered
		:label-style="{ width: '12rem' }"
		:column="descriptionsColumn"
	>
		<a-descriptions-item
			label="문서번호"
			class="text-right"
			v-if="formData.approvalNumber"
		>
			{{ formData.approvalNumber }}
		</a-descriptions-item>
		<a-descriptions-item label="작성일자" class="text-right">
			{{ formData.createdAt }}
		</a-descriptions-item>
		<a-descriptions-item label="작성부서" class="text-right">
			{{ formData.draftEmployeeDepartmentName }}
		</a-descriptions-item>
		<a-descriptions-item label="작성자" class="text-right">
			{{ formData.draftEmployeeName }}
		</a-descriptions-item>
		<a-descriptions-item label="변경이력" class="text-right" v-if="type !== 'write'">
			<a-typography-link @click="showHistory = true"> 1건 </a-typography-link>
		</a-descriptions-item>
		<a-descriptions-item label="결재선" class="text-left" v-if="type !== 'write'">
			<approval-lines
				:data="formData.approvalDetails.sort((a: any, b: any) => a.stage - b.stage)"
				:type="formData.agreementOptionTypeName"
				:status="true"
				:next-stage="formData.nextApprovalStage"
			/>
		</a-descriptions-item>
	</a-descriptions>

	<approval-line-change-history-modal
		:show="showHistory"
		:id="formData.id"
		@update:show="(value: boolean) => (showHistory = value)"
	/>
</template>
