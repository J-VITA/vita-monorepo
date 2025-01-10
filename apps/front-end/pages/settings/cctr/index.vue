<script lang="ts" setup>
import type { Response } from "@/types"
import type { CostItem } from "@/types/master/cctr"
import EmployeeTable from "@/components/settings/cctr/EmployeeTable.vue"
import OtherEmployeeTable from "@/components/settings/cctr/OtherEmployeeTable.vue"
import CostCenterTree from "@/components/settings/cctr/CostCenterTree.vue"

definePageMeta({
	name: "코스트센터관리",
})

const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)

const selectedNode = ref<CostItem>()
const employees = ref<number>(0)
const otherEmployees = ref<number>(0)

const {
	data: treeData,
	status,
	refresh,
} = await useAsyncData(`cost-centers-tree`, () =>
	useCFetch<Response<any>>("/api/v2/settings/costCenters", {
		method: "GET",
		params: {
			companyCode: getRole.value === "ROOT" ? "" : getCompanyCode.value,
		},
	}).then((res: Response<any>) => res.data)
)

const onSelected = async (id: number) => {
	selectedNode.value = await useCFetch<Response<any>>(
		`/api/v2/settings/costCenters/${id}`,
		{
			method: "GET",
		}
	).then((res: Response<any>) => res.data)
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				지출내역 작성과 예산편성을 위한 코스트센터를 등록/관리 할 수 있습니다. 코스트센터
				단위로 사용자를 연결 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[15, 15]" :wrap="false">
				<a-col flex="45rem">
					<cost-center-tree
						:tree="treeData"
						:node="selectedNode"
						:pending="status === 'pending'"
						:employees="employees + otherEmployees"
						@selected="onSelected"
						@refresh="() => refresh()"
					/>
				</a-col>
				<a-col flex="5rem" style="text-align: center">
					<a-divider type="vertical" class="full-height mx-none" />
				</a-col>
				<a-col flex="auto">
					<a-row :gutter="[15, 15]" class="column">
						<a-col span="24">
							<employee-table
								:info="selectedNode"
								:tree="treeData"
								@update:employee="(num) => (employees = num)"
							/>
						</a-col>
						<a-col span="24">
							<other-employee-table
								:info="selectedNode"
								@update:employee="(num) => (otherEmployees = num)"
							/>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</template>
	</page-layout>
</template>
