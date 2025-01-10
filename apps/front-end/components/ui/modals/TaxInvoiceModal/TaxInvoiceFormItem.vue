<script setup lang="ts">
import type { TaxInvoiceFormState } from "./type"

const formState = defineModel<TaxInvoiceFormState>("formState", { required: true })

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
</script>
<template>
	<a-form-item
		label="회계일자"
		has-feedback
		name="accountingDate"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-date-picker
			class="full-width"
			picker="date"
			v-model:value="formState.accountingDate"
			value-format="YYYY-MM-DD"
		/>
	</a-form-item>
	<a-form-item
		label="작성자"
		has-feedback
		name="employeeId"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<eacc-select-table
			url="/api/v2/slips/commons/employees"
			v-model:value="formState.employeeIds"
			key-props="id"
			label-prop="name"
			:columns="[
				{ title: '이름', data: (row: any) => row.name },
				{ title: '직위', data: (row: any) => row.gradeName },
				{
					title: '코스트센터',
					data: (row: any) => row.costCenterName,
				},
				{ title: '회사', data: (row: any) => row.companyName },
				{ title: '사업장', data: (row: any) => row.workplaceName },
			]"
			:disabled="false"
			@update:value="(value: any) => (formState.employeeId = value[0])"
		/>
	</a-form-item>

	<a-form-item
		label="증빙일자"
		has-feedback
		name="proofDate"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-date-picker
			class="full-width"
			picker="date"
			v-model:value="formState.proofDate"
			value-format="YYYY-MM-DD"
		/>
	</a-form-item>

	<a-form-item
		label="증빙유형"
		has-feedback
		name="proofType"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-select
			v-model:value="formState.proofType"
			:options="[
				{ label: '수기-세금계산서', value: '수기-세금계산서' },
				{ label: '수기-계산서', value: '수기-계산서' },
				{ label: '수기-명세율', value: '수기-명세율' },
			]"
		/>
	</a-form-item>

	<a-form-item
		label="세금코드"
		has-feedback
		name="taxCode"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-select
			v-model:value="formState.taxCode"
			:options="[
				{ label: '일반세금계산서', value: '일반세금계산서' },
				{ label: '불공제세금계산서', value: '불공제세금계산서' },
				{ label: '세액만처리', value: '세액만처리' },
			]"
		/>
	</a-form-item>

	<a-form-item label="금액" name="amount" :rules="[{ required: true }]" class="mb-none">
		<a-flex :gap="5">
			<a-form-item
				class="full-width"
				name="formState.amount.totalAmount"
				:rules="[
					{ required: true, message: '필수입력값입니다.' },
					{ type: 'number', min: 0, message: '총 금액은 0 이상이어야 합니다.' },
				]"
			>
				<eacc-amount-input v-model:value="formState.amount.totalAmount" disabled />
			</a-form-item>
			<a-form-item>
				<a-select
					disabled
					v-model:value="formState.amount.currency"
					:options="[{ label: 'KRW', value: 'KRW' }]"
				/>
			</a-form-item>
		</a-flex>
	</a-form-item>

	<a-form-item
		label="공급가액"
		name="taxableAmount"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<eacc-amount-input v-model:value="formState.taxableAmount" disabled />
	</a-form-item>

	<a-form-item label="부가세" class="mb-none">
		<a-flex :gap="5" justify="space-between">
			<a-form-item
				class="full-width"
				name="tax"
				:rules="[
					{
						required: true,
						message: '필수 입력값 입니다.',
					},
				]"
			>
				<eacc-amount-input
					v-model:value="formState.tax"
					:disabled="!formState.taxDirectInput"
				/>
			</a-form-item>
			<a-form-item style="width: 8rem">
				<a-checkbox v-model:checked="formState.taxDirectInput"> 직접수정 </a-checkbox>
			</a-form-item>
		</a-flex>
	</a-form-item>

	<a-form-item
		label="정산구분"
		name="settlementType"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-radio-group
			v-model:value="formState.settlementType"
			:options="[
				{ label: '미정산', value: 'UNSETTLEMENT' },
				{ label: '선급금정산', value: 'SETTLEMENT' },
			]"
		/>
	</a-form-item>

	<a-form-item
		v-if="formState.settlementType === 'SETTLEMENT'"
		label="정산금액"
		name="settlementAmount"
	>
		<eacc-amount-input
			v-model:value="formState.settlementAmount"
			:disabled="formState.settlementType !== 'SETTLEMENT'"
		/>
	</a-form-item>

	<a-form-item
		label="거래처명"
		name="customerName"
		:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
	>
		<a-select v-model:value="formState.customerName" :options="[]" />
	</a-form-item>

	<a-form-item name="realPayment" label="실지급처구분">
		<template #label>
			<a-space :size="5" align="center">
				<span>실지급처구분</span>
				<a-switch v-model:checked="formState.realPayment.flag" size="small" />
			</a-space>
		</template>
		<a-select
			v-model:value="formState.realPayment.customerName"
			:options="[]"
			:disabled="!formState.realPayment.flag"
		/>
	</a-form-item>

	<a-form-item label="내용" name="content">
		<a-input v-model:value="formState.content" />
	</a-form-item>

	<a-form-item label="지급조건" name="paymentCondition">
		<a-select v-model:value="formState.paymentCondition" :options="[]" />
	</a-form-item>

	<a-form-item label="지급계좌" name="paymentAccount">
		<a-select v-model:value="formState.paymentAccount" />
	</a-form-item>

	<a-form-item label="지급예정일" name="paymentExpectedDate">
		<a-date-picker
			class="full-width"
			v-model:value="formState.paymentExpectedDate"
			picker="date"
			value-format="YYYY-MM-DD"
		/>
	</a-form-item>

	<a-form-item label="코스트센터" name="costCenter">
		<eacc-select
			v-model:value="formState.costCenter"
			:url="`/api/v2/slips/commons/employee-costCenter?employeeId=${formState.employeeId}`"
			:params="{
				companyCode: getCompanyCode,
				employeeId: formState.employeeId,
				used: true,
			}"
			placeholder="코스트센터를 선택해주세요."
			:refresh="formState.employeeId ? true : false"
			:field-names="{ label: 'name', value: 'id' }"
			:on-all-field="false"
		/>
	</a-form-item>
	<a-form-item label="대변계정" name="debit" class="mb-none">
		<a-flex :gap="5">
			<a-form-item class="full-width">
				<a-select
					v-model:value="formState.debit.account"
					:options="[{ label: '미지급금', value: '1' }]"
				/>
			</a-form-item>
			<a-form-item class="full-width">
				<a-select
					v-model:value="formState.debit.subAccount"
					:options="[{ label: '미지급금_일반경비', value: '1-1' }]"
				/>
			</a-form-item>
		</a-flex>
	</a-form-item>

	<a-form-item label="사업장">
		<eacc-select
			:url="`/api/v2/slips/commons/companies`"
			:params="{
				code: getCompanyCode,
				placeType: 'WORKPLACE',
				page: 0,
				size: 1000,
			}"
			:on-all-field="false"
			v-model:value="formState.workplaceCode"
			refresh
			:field-names="{ label: 'name', value: 'workplaceCode' }"
			placeholder="사업장을 선택해주세요"
		>
		</eacc-select>
	</a-form-item>
</template>
