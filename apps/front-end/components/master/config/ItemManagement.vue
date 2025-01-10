<script setup lang="ts">
import { type Data, spendTypeOptions } from "@/types/master/config"

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
		<a-col flex="1">
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">개인경비 영수증 필수 등록</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.personalExpenseReceiptFlag" />
						<span> 개인경비 지출 작성시 영수증 파일을 필수로 등록해야 됩니다. </span>
					</a-flex>
				</a-col>
			</a-row>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">개인경비 가맹점(거래처) 필수 입력</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.personalExpenseVendorFlag" />
						<span> 개인경비 지출 작성시 가맹점(거래처)을 필수로 입력해야합니다. </span>
					</a-flex>
				</a-col>
			</a-row>
			<!-- <a-row :wrap="false" :gutter="10" class="pb-xl">
        <a-col flex="30%">출장명 입력 사용</a-col>
        <a-col flex="1">
          <a-flex :gap="15">
            <a-switch
              size="small"
              v-model:checked="data.businessTripNameInputFlag"
            />
            <span> 개인경비 지출 작성 시 '출장명'을 입력할 수 있습니다. </span>
          </a-flex>
        </a-col>
      </a-row> -->
			<!-- <a-row :wrap="false" :gutter="10" class="pb-xl">
        <a-col flex="30%">참석자 입력사용</a-col>
        <a-col flex="1">
          <a-flex :gap="15">
            <a-switch size="small" v-model:checked="data.attendanceInputFlag" />
            <span>
              지출 작성시 참석자를 입력할 수 있습니다. 참석자는 내부직원
              참석자와 외부 참석자로 두 종류로 나뉘어 입력이 가능합니다.등록된
              참석자 목록 및 통계는 기준정보관리 > 참석자관리에서 조회 할 수
              있습니다.
            </span>
          </a-flex>
        </a-col>
      </a-row> -->
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">전표작성 첨부파일 업로드 사용 </a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.expenseFileFlag" />
						<span>전표작성시 첨부파일을 추가 할 수 있습니다.</span>
					</a-flex>
					<template v-if="data.expenseFileFlag">
						<a-flex class="box" :gap="20">
							<label>지출유형</label>
							<a-checkbox-group
								v-model:value="data.expenseFileList"
								:options="spendTypeOptions"
							/>
						</a-flex>
					</template>
				</a-col>
			</a-row>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">전표작성 관련문서 업로드 사용</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.expenseDocFlag" />
						<span>전표작성시 결재문서를 첨부 할 수 있습니다.</span>
					</a-flex>
					<template v-if="data.expenseDocFlag">
						<a-flex class="box" :gap="20">
							<label>지출유형</label>
							<a-checkbox-group
								v-model:value="data.expenseDocList"
								:options="spendTypeOptions"
							/>
						</a-flex>
					</template>
				</a-col>
			</a-row>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<!-- 백엔드 개발 안되어 있음 UI 만 있음 -->
				<a-col flex="30%">외화금액 소수점 자리수 설정</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<span
							>외화금액인 경우 소수점까지 금액을 표기할 수 있습니다. <br />
							기본값은 2자리 입니다. 예시: $12.34 (2자리 설정시)</span
						>
					</a-flex>
					<eacc-select
						url="/api/v2/masters/expenseRules/types/decimalPlaces"
						v-model:value="data.foreignCurrencyDecimalPlaceName"
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="false"
						@update:value="(key) => (data.foreignCurrencyDecimalPlaceName = key)"
					/>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1">
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">지급 예정일 표시 여부</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<!-- <a-switch size="small" v-model:checked="data.paymentDateFlag" /> -->
						<span>
							지출 작성시 비용이 지급될 날짜를 사용자가 미리 확인할 수 있습니다.
							지급예정일을 사용자가 직접 작성하도록 허용할 수도 있습니다.
						</span>
					</a-flex>
					<a-row :wrap="true" :gutter="[0, 30]" class="box">
						<a-col :span="24">
							<a-flex gap="small" vertical>
								<a-flex :gap="15">
									<a-switch
										size="small"
										v-model:checked="data.personalExpensePaymentDateFlag"
									/>
									<span class="mock-block">개인경비</span>
								</a-flex>
								<a-flex :gap="20">
									<a-space :size="6" :wrap="true">
										<eacc-select
											:disabled="!data.personalExpensePaymentDateFlag"
											url="/api/v2/masters/expenseRules/types/paymentTypes"
											v-model:value="data.personalExpensePaymentType"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											@update:value="(key) => (data.personalExpensePaymentType = key)"
										/>
										<eacc-select
											:disabled="!data.personalExpensePaymentDateFlag"
											url="/api/v2/masters/expenseRules/types/dayTypes"
											v-model:value="data.personalExpensePaymentDay"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											@update:value="(key) => (data.personalExpensePaymentDay = key)"
										/>
										<a-checkbox
											v-model:checked="data.personalExpenseWriteFlag"
											:disabled="!data.personalExpensePaymentDateFlag"
											>사용자가 직접 작성 허용</a-checkbox
										>
									</a-space>
								</a-flex>
							</a-flex>
						</a-col>

						<a-col :span="24">
							<a-flex gap="small" vertical>
								<a-flex :gap="15">
									<a-switch
										size="small"
										v-model:checked="data.corporateCreditCardPaymentDateFlag"
									/>
									<span class="mock-block">법인카드</span>
								</a-flex>
								<a-flex :gap="20">
									<a-space :size="6" :wrap="true">
										<eacc-select
											:disabled="!data.corporateCreditCardPaymentDateFlag"
											url="/api/v2/masters/expenseRules/types/paymentTypes"
											v-model:value="data.corporateCreditCardPaymentType"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											@update:value="(key) => (data.corporateCreditCardPaymentType = key)"
										/>
										<eacc-select
											:disabled="!data.corporateCreditCardPaymentDateFlag"
											url="/api/v2/masters/expenseRules/types/dayTypes"
											v-model:value="data.corporateCreditCardPaymentDay"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											@update:value="(key) => (data.corporateCreditCardPaymentDay = key)"
										/>
										<!-- <a-checkbox
                      v-model:checked="data.corporateCreditCardPaymentWriteFlag"
                      :disabled="!data.corporateCreditCardPaymentDateFlag"
                      >사용자가 직접 작성 허용</a-checkbox
                    > -->
									</a-space>
								</a-flex>
							</a-flex>
						</a-col>

						<a-col :span="24">
							<a-flex gap="small" vertical>
								<a-flex :gap="15">
									<a-switch
										size="small"
										v-model:checked="data.billInvoicePaymentDateFlag"
									/>
									<span class="mock-block">세금계산서</span>
								</a-flex>
								<a-flex :gap="20" class="mb-sm">
									<a-space :size="6" :wrap="true">
										<span>거래처에 등록된 지급예정일이 출력됩니다.</span>
										<!-- <eacc-select
                      :disabled="!data.billInvoicePaymentDateFlag"
                      url="/api/v2/masters/expenseRules/types/paymentTypes"
                      v-model:value="data.billInvoicePaymentType"
                      :field-names="{ label: 'label', value: 'code' }"
                      :on-all-field="false"
                      @update:value="
                        (key) => (data.billInvoicePaymentType = key)
                      "
                    />
                    <eacc-select
                      :disabled="!data.billInvoicePaymentDateFlag"
                      url="/api/v2/masters/expenseRules/types/dayTypes"
                      v-model:value="data.billInvoicePaymentDay"
                      :field-names="{ label: 'label', value: 'code' }"
                      :on-all-field="false"
                      @update:value="
                        (key) => (data.billInvoicePaymentDay = key)
                      "
                    /> -->
										<a-checkbox
											v-model:checked="data.billInvoiceWriteFlag"
											:disabled="!data.billInvoicePaymentDateFlag"
											>사용자가 직접 작성 허용</a-checkbox
										>
									</a-space>
								</a-flex>
							</a-flex>
						</a-col>
						<!-- 백엔드 개발 안되어 있음 UI 만 있음 -->
						<a-col :span="24">
							<a-flex gap="small" vertical>
								<a-flex :gap="15">
									<a-switch size="small" v-model:checked="data.familyEventFlag" />
									<span class="mock-block">경조금</span>
								</a-flex>
								<a-flex :gap="20" class="mb-sm">
									<a-space :size="6" :wrap="true">
										<eacc-select
											url="/api/v2/masters/expenseRules/types/paymentTypes"
											v-model:value="data.familyEventPaymentType"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											:disabled="!data.familyEventFlag"
											@update:value="(key) => (data.familyEventPaymentType = key)"
										/>
										<eacc-select
											url="/api/v2/masters/expenseRules/types/dayTypes"
											v-model:value="data.familyEventPaymentDay"
											:field-names="{ label: 'label', value: 'code' }"
											:on-all-field="false"
											:disabled="!data.familyEventFlag"
											@update:value="(key) => (data.familyEventPaymentDay = key)"
										/>
									</a-space>
								</a-flex>
							</a-flex>
						</a-col>
					</a-row>
				</a-col>
			</a-row>

			<!-- <a-row :wrap="false" :gutter="10">
        <a-col flex="30%">지출 분할입력 사용</a-col>
        <a-col flex="1">
          <a-flex :gap="15" class="mb-md text-secondary">
            <a-switch size="small" v-model:checked="data.slipDivisionFlag" />
            <span>
              지출 작성시 하나의 지출을 분할하여 작성할 수 있습니다. <br />
              지출작성 팝업창 좌측하단에 '분할작성' 버튼이 활성화 됩니다.
            </span>
          </a-flex>
          <template v-if="data.slipDivisionFlag">
            <div class="box">
              <eacc-select
                class="response-select full-width"
                url="/api/v2/masters/expenseRules/types/slipDivisionRoleTypes"
                v-model:value="data.slipDivisionRoleTypeName"
                :field-names="{ label: 'label', value: 'code' }"
                :on-all-field="false"
                label="수정권한"
                @update:value="(key) => (data.slipDivisionRoleTypeName = key)"
              />
            </div>
          </template>
        </a-col>
      </a-row> -->
		</a-col>
	</a-row>
</template>
