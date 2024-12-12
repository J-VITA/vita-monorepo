<script lang="ts" setup>
import ApprovalFlowTable from "@/components/mypage/approval-flow/ApprovalFlowTable.vue"
import DelegateApprovalSetting from "@/components/mypage/approval-flow/DelegateApprovalSetting.vue"
import DelegateCheckSetting from "@/components/mypage/approval-flow/DelegateCheckSetting.vue"
import type { Response } from "@/types"

definePageMeta({
	name: "개인결재선설정",
})

// const authStore = useAuthStore();
// const { getCompanyCode, getWorkplaceId, getEmployeeId } =
//   storeToRefs(authStore);

// const treeData = ref();
// const treeDataCopy = ref();
//
// const selectedNode = ref<any>(undefined);

// const approvalId = ref<string | number>();
// const showModal = ref<boolean>(false);
//
// const onShowModal = async (id?: number) => {
//   if (id) {
//     //결재선 상세 조회 id 값 세팅
//     approvalId.value = id;
//   }
//   showModal.value = true;
// };
//
// const approvalRefresh = async (id?: string | number) => {
//   if (id) {
//     ApprLineRefresh();
//   }
// };

//
// onMounted(async () => {
//   const orgz = await Promise.resolve(useOrgzTree());
//   treeData.value = orgz;
// });
</script>

<template>
	<page-layout class="empty">
		<template #content>
			<a-card class="mb-lg">
				<approval-flow-table />
			</a-card>
			<a-card>
				<a-row :gutter="[15, 15]" style="min-height: 16rem">
					<a-col flex="1">
						<!-- 대결자 설정 -->
						<delegate-approval-setting />
					</a-col>
					<a-col flex="3rem" class="text-center">
						<a-divider type="vertical" dashed class="full-height" />
					</a-col>
					<a-col flex="1">
						<!-- 대체 검인자 설정 -->
						<delegate-check-setting />
					</a-col>
				</a-row>
			</a-card>
		</template>
		<template #modal> </template>
	</page-layout>
</template>
