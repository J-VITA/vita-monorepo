<script setup lang="ts">
import {
	Tax,
	Receipt,
	Budget,
	HandCard,
	Family,
	File,
	Card,
	Business,
	Erp,
} from "@/components/ui/svg"
import { type Response, SlipFormType } from "~/types"

type Data = {
	code: string
	label: string
	name: string
	slip: boolean
	used: boolean
}
type SlipFormTypeKeys = keyof typeof SlipFormType

const SlipFormIcon = {
	DISBURSEMENT_FORM: File,
	PERSONAL_EXPENSE_FORM: Receipt,
	CARD_FORM: Card,
	TAX_INVOICE: Tax,
	BUSINESS_TRIP: Business,
	BUDGET: Budget,
	FAMILY_EVENT: Family,
	CARD_ISSUE: HandCard,
	ERP_SLIP: Erp,
}

const move = async (item: Data) => {
	const formName = item.code as SlipFormTypeKeys
	await navigateTo(`/approvals/write-${compCase(SlipFormType[formName])}`)
}

const { data } = await useAsyncData(
	`approval-form-types`,
	async () =>
		useCFetch<Response<Array<any>>>(
			"/api/v2/master/approvalForms/types/approvalFormTypes",
			{
				method: "GET",
			}
		),
	{
		transform: (response: Response<Array<Data>>) => response.data || [],
	}
)
</script>
<template>
	<a-card title="결재양식">
		<a-flex :gap="30" align="flex-start" wrap="wrap">
			<template v-for="item in data">
				<a-button class="approval-btn" type="text" @click="move(item)" v-if="item.used">
					<template #icon>
						<div class="icons mb-xs">
							<component :is="SlipFormIcon[item.code as SlipFormTypeKeys]" :size="42" />
						</div>
					</template>
					{{ item.label }}
				</a-button>
			</template>
		</a-flex>
	</a-card>
</template>
