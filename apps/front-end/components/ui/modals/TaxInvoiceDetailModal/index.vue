<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import { states } from "@/types/expenses"

type Props = {
	show: boolean
	taxInvoiceId?: number
	total?: number
}
const { show = false, taxInvoiceId, total } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const data = ref<any>()
const currentPage = ref<number>(1)
const totalPage = computed(() => total)

const handleDownload = () => {
	console.log("다운로드")
}

onUpdated(async () => {
	if (show && taxInvoiceId) {
		//TODO: 세금계산서 상세 내역 호출 변경해야함.
		// data.value = await useCFetch<Response<any>>(
		//   `/api/v2/slip/expenses/${taxInvoiceId}`,
		//   {
		//     method: 'GET',
		//   }
		// ).then((res: Response<any>) => res.data || []);
		// console.log(data.value);
	}
})
</script>
<template>
	<!-- TODO: 세금계산서 상세 모달 UI 변경해야함. -->
	<a-modal width="80rem" centered v-model:open="open" :destroy-on-close="true">
		<template #title>
			<a-flex justify="space-between" align="center">
				<a-typography-text>지출상세</a-typography-text>
				<a-space class="pr-xl" v-if="data">
					<span>{{ currentPage }}</span>
					<span>/</span>
					<span>{{ totalPage }}</span>
					<a-input-group compact>
						<a-button
							:icon="materialIcons('mso', 'chevron_left')"
							:disabled="currentPage === 1"
							size="small"
							@click="() => (currentPage = currentPage - 1)"
						/>
						<a-button
							:icon="materialIcons('mso', 'chevron_right')"
							:disabled="currentPage === totalPage"
							size="small"
							@click="() => (currentPage = currentPage + 1)"
						/>
					</a-input-group>
				</a-space>
			</a-flex>
		</template>
		<a-row :gutter="40">
			<a-col span="11">
				<div class="viewer mb-xl">
					<a-flex :gap="5" justify="flex-end" class="viewer-top">
						<a-button
							size="small"
							:icon="materialIcons('mso', 'download')"
							@click="handleDownload"
						/>
					</a-flex>
					<a-image :src="data?.receiptFile?.thumbnailUrl" />
				</div>
				<a-descriptions
					size="small"
					:column="1"
					bordered
					:label-style="{ width: '10rem' }"
				>
					<a-descriptions-item label="첨부파일">
						<a-flex v-for="(item, idx) in data?.files" :key="idx">
							<paper-clip-outlined />
							<a-typography-link>
								{{ item }}
							</a-typography-link>
						</a-flex>
					</a-descriptions-item>
					<a-descriptions-item label="관련문서">
						<a-flex v-for="(item, idx) in data?.documents" :key="idx">
							<paper-clip-outlined />
							<a-typography-link>
								{{ item }}
							</a-typography-link>
						</a-flex>
					</a-descriptions-item>
				</a-descriptions>
			</a-col>
			<a-col span="13">
				<a-descriptions
					size="small"
					:column="1"
					bordered
					:label-style="{ width: '10rem' }"
				>
					<a-descriptions-item label="지출유형">
						<a-tag color="blue">
							{{ data?.entityslipHeader?.slipTypeLabel }}
						</a-tag>
					</a-descriptions-item>
					<a-descriptions-item label="상태">
						<a-badge
							:color="
								states[data?.entityslipHeader?.slipStatusName]
									? states[data?.entityslipHeader?.slipStatusName].color
									: 'blue'
							"
							:text="data?.entityslipHeader?.slipStatusLabel"
						/>
					</a-descriptions-item>
					<a-descriptions-item label="사용자">
						{{ data?.entityslipHeader?.evidenceVendorName }}
					</a-descriptions-item>
					<a-descriptions-item label="사용일자">
						{{ data?.entityslipHeader?.evidenceDate }}
					</a-descriptions-item>
					<a-descriptions-item label="과세유형"> {{}} </a-descriptions-item>
					<a-descriptions-item label="금액">
						{{ data?.entityslipHeader?.totalAmount?.toLocaleString() }}
					</a-descriptions-item>
					<a-descriptions-item label="공급가액">
						{{ data?.entityslipHeader?.supplyAmount?.toLocaleString() }}
					</a-descriptions-item>
					<a-descriptions-item label="부가세">
						{{ data?.entityslipHeader?.taxAmount?.toLocaleString() }}
					</a-descriptions-item>
					<a-descriptions-item label="가맹점(거래처)"> {{}} </a-descriptions-item>
					<a-descriptions-item label="내용">
						{{ data?.entityslipHeader?.description }}
					</a-descriptions-item>
					<a-descriptions-item label="계정항목"> {{}} </a-descriptions-item>
					<a-descriptions-item label="코스트센터"> {{}} </a-descriptions-item>
					<a-descriptions-item label="사업장">
						{{ data?.entityslipHeader?.workplaceCode }}
					</a-descriptions-item>
					<a-descriptions-item label="프로젝트"> {{}} </a-descriptions-item>
					<a-descriptions-item label="지급예정일">
						{{ data?.entityslipHeader?.paymentDueDate }}
					</a-descriptions-item>
				</a-descriptions>
			</a-col>
		</a-row>
		<template #footer>
			<a-button @click="() => (open = false)">닫기</a-button>
		</template>
	</a-modal>
</template>
