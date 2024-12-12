<script setup lang="ts">
import { useApprovalRules } from "~/composables/useApprovalRules"

// type Data = {
//   id: number;
//   companyCode: string;
//   approvalNumber: string;
//   stage: number;
//   approvalStatusName: string;
//   approvalStatusLabel: string;
//   approvalTypeName: string;
//   approvalTypeLabel: string;
//   approvalEmployeeId: number;
//   approvalEmployeeName: string;
//   approvalEmployeePositionCode: string;
//   approvalEmployeePositionName: string;
//   actualEmployeeId: number;
//   actualEmployeeName: string;
//   actualEmployeePositionCode: string;
//   actualEmployeePositionName: string;
//   approvalDate: string;
// };

const data = defineModel<any[]>("data", { required: true })
const type = defineModel<string>("type", { required: true })
const { label = false, status = true } = defineProps<{
	label?: boolean
	status?: boolean
	nextStage?: number
}>()
</script>
<template>
	<a-space :size="5" align="center" :wrap="true">
		<template v-for="(item, idx) in data">
			<span
				:class="{
					'text-primary bold': status && item.stage === nextStage,
				}"
			>
				{{ item.approvalEmployeeName
				}}<template v-if="label">({{ item.approvalTypeLabel }})</template>
			</span>
			<template v-if="idx !== data.length - 1">
				<template v-if="type === 'PARALLEL'">
					<span
						v-if="
							item.approvalTypeName === 'AGREEMENT' &&
							data[idx + 1].approvalTypeName === 'AGREEMENT'
						"
						>,</span
					>
					<i class="ico-approval-arrow" v-else />
				</template>
				<template v-else>
					<i class="ico-approval-arrow" />
				</template>
			</template>
		</template>
	</a-space>
</template>
