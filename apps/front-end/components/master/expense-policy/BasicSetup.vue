<script lang="ts" setup>
const forms = reactive({
	fullName: "",
	firstName: "",
	lastName: "",
	expenseApprovalDtFlag: false,
	expenseApprovalMonthly: 1,
	apprMonthly: [
		{ key: 1, value: "매달1일" },
		{ key: 2, value: "매달10일" },
		{ key: 3, value: "매달20일" },
		{ key: 4, value: "매달 말일" },
	],
})
</script>

<template>
	<a-form label-position="left" label-width="auto">
		<a-row>
			<a-col :span="6">
				<a-form-item label="경비신청 결재상신기간">
					<a-switch v-model="forms.expenseApprovalDtFlag"></a-switch>
				</a-form-item>
			</a-col>
			<a-col :span="14">
				<p>경비신청 결재 상신 기간을 지정하며, 지정 기간 외는 결재상신 불가합니다.</p>
			</a-col>
		</a-row>
		<a-row>
			<a-col :span="6"></a-col>
			<a-col :span="14">
				<a-alert type="info" :closable="false">
					<a-form-item label="결재 상신기간" :required="forms.expenseApprovalDtFlag">
						<a-select
							v-model="forms.expenseApprovalMonthly"
							placeholder="Select"
							size="large"
							style="width: 240px"
							:disabled="!forms.expenseApprovalDtFlag"
						>
							<a-option
								v-for="item in forms.apprMonthly"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							/>
						</a-select>
						<a-divider direction="vertical"></a-divider>
						<a-select
							v-model="forms.expenseApprovalMonthly"
							placeholder="Select"
							size="large"
							style="width: 240px"
							:disabled="!forms.expenseApprovalDtFlag"
						>
							<a-option
								v-for="item in forms.apprMonthly"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							/>
						</a-select>
					</a-form-item>
				</a-alert>
			</a-col>
		</a-row>
	</a-form>
</template>
