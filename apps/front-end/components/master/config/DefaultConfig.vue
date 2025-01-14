<script setup lang="ts">
import { type Data } from "@/types/master/config"
import type { UploadChangeParam, UploadProps } from "ant-design-vue"

const props = defineProps<{ data: Data }>()

const emit = defineEmits<{
	(e: "update:data", value: any): void
}>()

const fileList = ref<UploadProps["fileList"]>([])
const handleChange = (info: UploadChangeParam) => {
	let resFileList = [...info.fileList]

	// 1. Limit the number of uploaded files
	//    Only to show two recent uploaded files, and old ones will be replaced by the new
	resFileList = resFileList.slice(-2)

	// 2. read from response and show file link
	resFileList = resFileList.map((file) => {
		if (file.response) {
			// Component will show file.url as link
			file.url = file.response.url
		}
		return file
	})

	fileList.value = resFileList
}

watch(props.data, (args) => {
	emit("update:data", args)
})
</script>
<template>
	<a-row :gutter="[30, 0]">
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">전자결재 상신기간 설정</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.approvalLimitFlag" />
						<span>
							사용자의 지출결의서 결재 상신을 기간에 따라 통제할 수 있습니다.
							<br />
							지출등록은 언제든지 가능하지만 지정 기간 외에는 결재상신이 불가합니다.
						</span>
					</a-flex>
					<template v-if="data.approvalLimitFlag">
						<a-flex class="box" :gap="10">
							<eacc-select
								class="response-select full-width"
								url="/api/v2/masters/expenseRules/types/dayTypes"
								v-model:value="data.approvalLimitStartDay"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
								label="시작일"
								@update:value="(key) => (data.approvalLimitStartDay = key)"
							/>
							<eacc-select
								class="response-select full-width"
								url="/api/v2/masters/expenseRules/types/dayTypes"
								v-model:value="data.approvalLimitEndDay"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
								label="종료일"
								@update:value="(key) => (data.approvalLimitEndDay = key)"
							/>
						</a-flex>
					</template>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">회계기간 마감 알림</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.closeNotificationFlag" />
						<span>
							해당월에 경비처리가 마감되면 소속된 사업장 전체사용자에게 알림이 발생합니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
	</a-row>
	<a-row :gutter="[30, 0]">
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">계정/비용항목 입력방식</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.accountInputMethodFlag" />
						<span> 지출내역 작성시, 계정/비용항목 입력방식을 선택할 수 있습니다. </span>
					</a-flex>
					<template v-if="data.accountInputMethodFlag">
						<div class="box">
							<eacc-select
								class="response-select full-width"
								url="/api/v2/masters/expenseRules/types/accountInputMethodTypes"
								v-model:value="data.accountInputMethodType"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
								label="입력방식"
								@update:value="(key) => (data.accountInputMethodType = key)"
							/>
						</div>
					</template>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1" class="pb-xl">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">사내 규정집 등록</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.manualFlag" />
						<span>
							사내 규정집을 업로드 하면, 메인화면 우측 상단의 도움말에서 규정집을
							다운로드할 수 있습니다.
						</span>
					</a-flex>
					<div class="box" v-if="data.manualFlag">
						<a-upload
							action=""
							:multiple="true"
							:file-list="fileList"
							@change="handleChange"
						>
							<a-button disabled>
								<upload-outlined></upload-outlined>
								업로드
							</a-button>
						</a-upload>
					</div>
				</a-col>
			</a-row>
		</a-col>
	</a-row>
	<a-row :gutter="[30, 0]">
		<a-col flex="1">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">전표 자동확정 설정</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="text-secondary">
						<a-switch size="small" v-model:checked="data.slipAutoConfirmationFlag" />
						<span>
							내부 결재문서가 완료되는 시점에 전표내역이 자동확정 처리됩니다. 회계담당자의
							검인/확정 단계가 생략되며, 확정내역은 전표확정현황에서 확인 가능합니다.
						</span>
					</a-flex>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="0 1 1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1">
			<a-row :wrap="false" :gutter="10">
				<a-col flex="30%">법인카드 사용내역 불공제 대상 업종 지정</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-md text-secondary">
						<a-switch size="small" v-model:checked="data.nonDeductionBusinessTypeFlag" />
						<span>
							법인카드 사용내역중 아래 해당하는 업종을 불공제 대상으로 지정합니다.
						</span>
					</a-flex>
					<template v-if="data.nonDeductionBusinessTypeFlag">
						<div class="box">
							<a-flex :gap="15">
								<label style="flex-shrink: 0">업종</label>
								<a-textarea
									placeholder="ex) 농산물,축산물,수산물,농축수산물"
									v-model:value="data.nonDeductionBusinessType"
									class="fixed"
									hint="*업종입력시 쉼표구분, 띄어쓰기 금지"
								/>
							</a-flex>
						</div>
					</template>
				</a-col>
			</a-row>
		</a-col>
	</a-row>
</template>
