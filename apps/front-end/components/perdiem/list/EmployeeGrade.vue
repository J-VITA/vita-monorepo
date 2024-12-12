<script setup lang="ts">
import EmployeeGradeListTable from "../table/EmployeeGradeListTable.vue"
import EmployeeGradeDetailTable from "../table/EmployeeGradeDetailTable.vue"
import { PerdiemLevel, PerdiemGrade } from "@/types/master/perdiem"

const authStore = useAuthStore()
const { getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const showPerdiemGradeModal = ref<boolean>(false)
const showPerdiemLevelModal = ref<boolean>(false)
const perdiemGradeParams = ref<PerdiemGrade>({
	gradeName: "",
	gradeCode: "",
	orderSeq: 0,
})

const perdiemLevelParams = ref<PerdiemLevel>({
	levelName: "",
	levelCode: "",
	orderSeq: 0,
})

const perdiemData: PerdiemGrade[] = [
	{
		id: 1,
		gradeCode: "101010",
		gradeName: "임원",
		orderSeq: 1,
	},
	{
		id: 2,
		gradeCode: "101011",
		gradeName: "직원",
		orderSeq: 2,
	},
	{
		id: 3,
		gradeCode: "101012",
		gradeName: "기타",
		orderSeq: 3,
	},
]

const perdiemLevelData: PerdiemLevel[] = [
	{
		id: 1,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		levelName: "서울",
		levelCode: "R01",
		updateBy: "홍경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
	{
		id: 2,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		levelName: "경기",
		levelCode: "R02",
		updateBy: "김경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
	{
		id: 3,
		companyCode: getCompanyCode.value,
		workplaceId: getWorkplaceId.value,
		levelName: "강원",
		levelCode: "R03",
		updateBy: "박경영",
		updateAt: "2024-03-12 11:32",
		used: true,
		showed: true,
	},
]

/** 출장 급지 추가/수정 */
const onOpenTypeModal = (rowData: PerdiemGrade) => {
	if (!rowData.showed) return
	perdiemGradeParams.value = rowData
	showPerdiemGradeModal.value = rowData.showed
}

/** 국가/지역 추가/수정 */
const onOpenInfoModal = (rowData: PerdiemLevel) => {
	if (!rowData.showed) return
	perdiemLevelParams.value = rowData
	showPerdiemLevelModal.value = rowData.showed
}

/** 급지 행 선택 */
const onGetRowData = (rowData: PerdiemGrade) => {
	perdiemGradeParams.value = rowData
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

const onSubmitPerdiemGrade = () => {
	console.log("perdiemGradeParams", perdiemGradeParams.value)
}

const onSubmitPerdiemLevel = () => {
	console.log("perdiemLevelParams", perdiemLevelParams.value)
}
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="30">
				<a-col flex="1">
					<EmployeeGradeListTable
						:perdiemData="perdiemData"
						:loading="false"
						@addPerdiemGradeClick="onOpenTypeModal"
						@deletePerdiemType="onDeleteTypeRowData"
						@selected-row="onGetRowData"
					/>
				</a-col>
				<a-col flex="2">
					<EmployeeGradeDetailTable
						:data="perdiemLevelData"
						:params="perdiemGradeParams"
						:loading="false"
						@addPerdiemLevelClick="onOpenInfoModal"
						@deletePerdiemInfo="onDeleteInfoRowData"
					/>
				</a-col>
			</a-row>
		</template>
		<template #modal>
			<field-modal
				:title="perdiemGradeParams?.id ? '임직원 등급수정' : '임직원 등급추가'"
				:field="perdiemGradeParams"
				:showed="showPerdiemGradeModal"
				:size="'small'"
				@closed="showPerdiemGradeModal = false"
				@submit="onSubmitPerdiemGrade"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'등급명'" :span="3">
								<a-input
									type="text"
									placeholder="등급명을 입력하세요"
									v-model:value="perdiemGradeParams.gradeName"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'코드'" :span="3">
								<a-input
									type="text"
									placeholder="코드를 입력하세요"
									v-model:value="perdiemGradeParams.gradeCode"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="text"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemGradeParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>

			<field-modal
				:title="perdiemLevelParams?.id ? '직급 수정' : '직급 추가'"
				:field="perdiemLevelParams"
				:showed="showPerdiemLevelModal"
				:size="'small'"
				@closed="showPerdiemLevelModal = false"
				@submit="onSubmitPerdiemLevel"
			>
				<template #content>
					<a-form>
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'직급'" :span="3">
								<a-input
									type="text"
									placeholder="직급을 선택하세요"
									v-model:value="perdiemLevelParams.levelName"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'순번'" :span="3">
								<a-input
									type="text"
									placeholder="순번을 입력하세요"
									v-model:value="perdiemLevelParams.orderSeq"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
