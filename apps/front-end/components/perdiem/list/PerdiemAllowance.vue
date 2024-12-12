<script setup lang="ts">
import AllowanceDetailTable from "../table/AllowanceDetailTable.vue"
import AllowanceListTable from "../table/AllowanceListTable.vue"
import { PerdiemAllowanceType, PerdiemAllowanceInfo } from "@/types/master/perdiem"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const showPerdiemTypeModal = ref<boolean>(false)
const showPerdiemInfoModal = ref<boolean>(false)
const perdiemTypeParams = ref<PerdiemAllowanceType>({
	typeName: "",
	code: "",
	orderSeq: 0,
})

const perdiemInfoParams = ref<PerdiemAllowanceInfo>({
	infoName: "",
	infoCode: "",
	orderSeq: 0,
})

const perdiemData: PerdiemAllowanceType[] = [
	{
		id: 1,
		code: "101010",
		typeName: "해외",
		orderSeq: 1,
	},
	{
		id: 2,
		code: "101011",
		typeName: "국내",
		orderSeq: 2,
	},
]

const perdiemInfoData: PerdiemAllowanceInfo[] = [
	{
		id: 1,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		infoName: "서울",
		infoCode: "R01",
		updateBy: "홍경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
	{
		id: 2,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		infoName: "경기",
		infoCode: "R02",
		updateBy: "김경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
	{
		id: 3,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		infoName: "강원",
		infoCode: "R03",
		updateBy: "박경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
]

/** 출장 급지 추가/수정 */
const onOpenTypeModal = (rowData: PerdiemAllowanceType) => {
	if (!rowData.showed) return
	perdiemTypeParams.value = rowData
	showPerdiemTypeModal.value = rowData.showed
}

/** 국가/지역 추가/수정 */
const onOpenInfoModal = (rowData: PerdiemAllowanceInfo) => {
	if (!rowData.showed) return
	perdiemInfoParams.value = rowData
	showPerdiemInfoModal.value = rowData.showed
}

/** 급지 행 선택 */
const onGetRowData = (rowData: PerdiemAllowanceType) => {
	perdiemTypeParams.value = rowData
}

/** 급지 행 삭제 */
const onDeleteTypeRowData = (keys: number[]) => {
	console.log("TypeKeys : ", keys)
	message.success("삭제되었습니다.")
}

/** 국가/지역 정보 행 삭제 */
const onDeleteInfoRowData = (keys: number[]) => {
	console.log("InfoKeys : ", keys)
	message.success("삭제되었습니다.")
}

const onSubmitPerdiemType = () => {
	console.log("perdiemTypeParams", perdiemTypeParams.value)
}
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="30">
				<a-col flex="1">
					<AllowanceListTable
						:perdiemData="perdiemData"
						:loading="false"
						@addPerdiemTypeClick="onOpenTypeModal"
						@deletePerdiemType="onDeleteTypeRowData"
						@selected-row="onGetRowData"
					/>
				</a-col>
				<a-col flex="2">
					<AllowanceDetailTable
						:data="perdiemInfoData"
						:params="perdiemTypeParams"
						:loading="false"
						@addPerdiemInfoClick="onOpenInfoModal"
						@deletePerdiemInfo="onDeleteInfoRowData"
					/>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				:title="perdiemTypeParams?.id ? '급지 유형 수정' : '급지 유형 추가'"
				:field="perdiemTypeParams"
				:showed="showPerdiemTypeModal"
				:size="'small'"
				@closed="showPerdiemTypeModal = false"
				@submit="onSubmitPerdiemType"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'급지유형명'" :span="3">
								<a-input
									type="text"
									placeholder="급지명을 입력하세요"
									v-model:value="perdiemTypeParams.typeName"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'급지코드'" :span="3">
								<a-input
									type="text"
									placeholder="급지코드를 입력하세요"
									v-model:value="perdiemTypeParams.code"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="text"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemTypeParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>

			<field-modal
				:title="perdiemInfoParams?.id ? '국가/지역 수정' : '국가/지역 추가'"
				:field="perdiemInfoParams"
				:showed="showPerdiemInfoModal"
				:size="'small'"
				@closed="showPerdiemInfoModal = false"
				@submit="onSubmitPerdiemType"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'국가/지역명'" :span="3">
								<a-input
									type="text"
									placeholder="국가/지역명을 입력하세요"
									v-model:value="perdiemInfoParams.infoName"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'국가/지역코드'" :span="3">
								<a-input
									type="text"
									placeholder="국가/지역코드를 입력하세요"
									v-model:value="perdiemInfoParams.infoCode"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="text"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemInfoParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
