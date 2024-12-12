<script setup lang="ts">
import type { Data } from "@/types/master/config"

const props = defineProps<{ data: Data }>()
const emit = defineEmits<{
	(e: "update:data", value: any): void
}>()

watch(props.data, (args) => {
	emit("update:data", args)
})
</script>
<template>
	<a-row :gutter="[30, 0]">
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">프로젝트관리</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.projectFlag" />
						<span>
							기준정보관리 > 프로젝트관리 메뉴가 활성화됩니다. <br />
							프로젝트별로 지출을 관리하고 사용현황을 추적할 수 있습니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">ERP코드매핑관리</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.erpCodeMappingFlag" />
						<span>
							시스템설정 > ERP코드매핑관리 메뉴가 활성화 됩니다. <br />
							회사에서 사용중이거나 필요한 ERP종류를 선택하여 연동 할 수 있습니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
	</a-row>
	<a-row :gutter="[30, 0]">
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">유류단가관리</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.oilFlag" />
						<span>
							기준정보관리 > 유류단가관리 메뉴가 활성화됩니다. <br />
							거리에 따라 리터당 금액을 자동산출 할 수 있습니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">출장기준관리</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.businessTripFlag" />
						<span>
							기준정보관리 > 출장기준관리 메뉴가 활성화 됩니다. <br />
							출장비용정산과 관련된 기준정보를 설정할 수 있습니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
		<!-- <a-col flex="1" class="pb-xl">
      <a-row :wrap="false" :gutter="10">
        <a-col flex="30%">일비관리</a-col>
        <a-col flex="1">
          <a-flex :gap="15">
            <a-switch size="small" v-model:checked="data.dailyExpensesFlag" />
            <span>
              기준정보관리 > 일비 관리 메뉴가 활성화 됩니다. <br />
              출장관련 교통비, 일비, 숙박비 기준을 직급별로 설정 할 수 있습니다.
            </span>
          </a-flex>
        </a-col>
      </a-row>
    </a-col> -->
	</a-row>
	<a-row :gutter="[30, 0]">
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">경조금기준관리</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.familyEventFlag" />
						<span>
							기준정보관리 > 경조금기준관리 메뉴가 활성화 됩니다.<br />
							사내 경조금 지급 기준을 설정할 수 있습니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1" class="pb-xl"> </a-col>
	</a-row>
</template>
