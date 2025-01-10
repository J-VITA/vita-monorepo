<script setup lang="ts">
import { type Data } from "@/types/master/config"

const props = defineProps<{ data: Data }>()
const emit = defineEmits<{
	(e: "update:data", value: any): void
}>()

watch(props.data, (args) => {
	if (args.arTaxInvoiceManagerFlag && args.arTaxInvoiceManager === undefined) return

	emit("update:data", args)
})
</script>
<template>
	<a-row :gutter="[30, 0]">
		<a-col flex="1">
			<a-typography-title :level="5" class="mb-md">세금계산서</a-typography-title>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">
					매입세금계산서 <br />
					조회/처리 담당자
				</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-sm text-secondary">
						<a-switch size="small" v-model:checked="data.apTaxInvoiceManageFlag" />
						<span>
							전표처리 > 매입세금계산서 메뉴에서 미처리 세금계산서건들을 모두 조회할 수
							있고 전표처리할 수 있습니다. 또한 특정사용자에게 미처리 세금계산서를
							전달하여 담당자로 할당 시킬 수 있습니다.
						</span>
					</a-flex>
					<div class="box">
						<eacc-select-multi-table
							class="mb-sm"
							label="부서"
							url="/api/v2/masters/commons/departments"
							v-model:value="data.apTaxInvoiceManageDepartments"
							key-props="id"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="
								(value) => {
									console.log(value)
									data.apTaxInvoiceManageDepartments = value
								}
							"
						/>
						<eacc-select-multi-table
							label="담당자"
							url="/api/v2/masters/commons/employees"
							v-model:value="data.apTaxInvoiceManagers"
							key-props="id"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="
								(value) => {
									console.log(value)

									data.apTaxInvoiceManagers = value
								}
							"
						/>
					</div>
				</a-col>
			</a-row>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">
					매출세금계산서 <br />
					발행담당자 지정
				</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-sm text-secondary">
						<a-switch size="small" v-model:checked="data.arTaxInvoiceManagerFlag" />
						<span>
							매출세금계산서 신규작성시 대표담당자로 설정되면, 공급업체의 담당자로 자동
							입력됩니다.
						</span>
					</a-flex>
					<div class="box" v-if="data.arTaxInvoiceManagerFlag">
						<eacc-select-table
							label="대표담당자"
							url="/api/v2/masters/commons/employees"
							v-model:value="data.arTaxInvoiceManagerIds"
							key-props="id"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="(value) => (data.arTaxInvoiceManager = value[0])"
						/>
					</div>
				</a-col>
			</a-row>

			<a-typography-title :level="5" class="mb-md"> 예산 </a-typography-title>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">
					기초예산등록 <br />
					입력마감/해제 기능 사용
				</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-sm text-secondary">
						<a-switch size="small" v-model:checked="data.budgetManagerFlag" />
						<span>
							예산관리 > 기초예산등록 메뉴에서 ‘예산입력마감’ 버튼이 노출됩니다.
							입력마감시 기초예산으로 등록된 내용을 수정할 수 없고, 입력마감해제시 수정이
							가능합니다. 예산담당 최고책임자에게 적합한 권한입니다.
						</span>
					</a-flex>
					<div class="box">
						<eacc-select-multi-table
							label="버튼 사용 권한자"
							url="/api/v2/masters/commons/employees"
							v-model:value="data.budgetManagers"
							key-props="id"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="(value) => (data.budgetManagers = value)"
						/>
					</div>
				</a-col>
			</a-row>
		</a-col>
		<a-col flex="1rem">
			<a-divider type="vertical" class="full-height mx-none" dashed />
		</a-col>
		<a-col flex="1">
			<a-typography-title :level="5" class="mb-md"> 법인카드 </a-typography-title>
			<a-row :wrap="false" :gutter="10" class="pb-xl">
				<a-col flex="30%">
					법인카드 사용현황 <br />
					조회담당자
				</a-col>
				<a-col flex="1">
					<a-flex :gap="15" class="mb-sm text-secondary">
						<a-switch size="small" v-model:checked="data.cardManagerFlag" />
						<span>
							법인카드 > 법인카드사용현황 메뉴에서 모든 카드내역을 조회할 수 있습니다.
							<br />
							법인카드 관리자에게 적합한 권한입니다.
						</span>
					</a-flex>
					<div class="box" v-if="data.cardManagerFlag">
						<eacc-select-multi-table
							label="담당자"
							url="/api/v2/masters/commons/employees"
							v-model:value="data.cardManagers"
							key-props="id"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="(value) => (data.cardManagers = value)"
						/>
					</div>
				</a-col>
			</a-row>
		</a-col>
	</a-row>
</template>
