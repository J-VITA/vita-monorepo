<script lang="ts" setup>
import { ref } from "vue"

import type { IAddr, Response } from "@/types"
import type { Rule } from "ant-design-vue/es/form"
import type { FormInstance } from "ant-design-vue"

import {
	type Workplace,
	type WorkplaceTree,
	initWorkPlaceData,
	initCompanyData,
} from "@/types/settings/workplaces"

import { materialIcons } from "@/composables/icons"

const props = withDefaults(
	defineProps<{
		companyFormData: Workplace
		workplaceFormData: Workplace
		compTreeData: WorkplaceTree
	}>(),
	{}
)

const emit = defineEmits<{
	(e: "refresh", id?: number, parentId?: number): void
}>()

const { save, update, remove } = useCompany()

/**
 * =================================================================
 * 회사/사업장 정보 폼에 대한 내용
 * =================================================================
 */
const companyForm = ref<Workplace>({ ...initCompanyData })
const workplaceForm = ref<Workplace>({ ...initWorkPlaceData })

const companyFormRef = ref<FormInstance>()
const workplaceFormRef = ref<FormInstance>()

const isValidationRegNumber = ref<boolean>(false)
const isValidationCompanyCode = ref<boolean>(false)

const appStore = useAppsStore()
const { loading } = storeToRefs(appStore)
const isEdit = ref<boolean>(false)

const onUpdate = () => {
	isEdit.value = true
	if (companyForm.value.id) {
		companyForm.value.status = "update"
		workplaceForm.value.status = "read"
	}
	if (workplaceForm.value.id) {
		companyForm.value.status = "read"
		workplaceForm.value.status = "update"
	}
}

/**
 * 회사 / 사업장 저장 및 수정
 * companyForm.value.status === 'create' //회사추가
 * companyForm.value.status === 'update' //회사수정
 * workplaceForm.value.status === 'create' //사업장추가
 * workplaceForm.value.status === 'update' //시업장수정
 */
const onSave = () => {
	if (!isEdit.value) {
		return
	}

	if (companyForm.value.status === "create" && workplaceForm.value.status === "create") {
		companyFormRef.value
			?.validate()
			.then(() => {
				workplaceFormRef.value
					?.validate()
					.then(() => {
						const companyOrderSeq = !determineTreeMaxId(props.compTreeData, "orderSeq")
							? 0
							: determineTreeMaxId(props.compTreeData, "orderSeq") + 1
						//회사추가 시작
						save(
							Object.assign({}, companyForm.value, {
								orderSeq: companyOrderSeq,
								workplaceCode: companyForm.value.code,
							})
						).then((res: Response<Workplace>) => {
							if (res.data?.id) {
								//사업장 추가 시작
								save(
									Object.assign({}, workplaceForm.value, {
										parentId: res.data?.id,
										code: res.data.code,
										orderSeq: res.data.orderSeq
											? res.data.orderSeq + 1
											: companyOrderSeq + 1,
										name: workplaceForm.value.workplaceName,
									})
								).then((res: Response<Workplace>) => {
									if (res.status === 0) {
										message.success("생성하였습니다")
										emit("refresh", res.data?.id, res.data?.parentId)
									}
								})
							}
						})
					})
					.catch((err: any) => {
						const fields = err.errorFields
						if (fields && fields.length > 0) {
							fields.forEach((field: any) => {
								console.log("field sss", field.name)
								workplaceFormRef.value?.validateFields(field.name[0])
							})
						}
					})
			})
			.catch((err: any) => {
				const fields = err.errorFields
				if (fields && fields.length > 0) {
					fields.forEach((field: any) => {
						console.log("field ", field.name)
						companyFormRef.value?.validateFields(field.name[0])
					})
				}
			})
	} else if (companyForm.value.status === "update") {
		// 회사수정
		companyFormRef.value
			?.validate()
			.then(() => {
				if (companyForm.value.id) {
					update(companyForm.value, companyForm.value.id).then(
						(res: Response<Workplace>) => {
							message.success("수정 하였습니다")
							emit("refresh", res.data?.id)
						}
					)
				}
			})
			.catch((err: any) => {
				const fields = err.errorFields
				if (fields && fields.length > 0) {
					fields.forEach((field: any) => {
						companyFormRef.value?.validateFields(field.name)
					})
				}
			})
	} else if (workplaceForm.value.status === "append") {
		//사업장 추가
		workplaceFormRef.value
			?.validate()
			.then(() => {
				const workplaceOrderSeq = determineTreeMaxId(props.compTreeData, "orderSeq") + 1

				save(
					Object.assign({}, workplaceForm.value, {
						parentId: companyForm.value.id,
						code: companyForm.value.code,
						name: workplaceForm.value.workplaceName,
						orderSeq: workplaceOrderSeq + 1,
					})
				).then((res: Response<Workplace>) => {
					if (res.status === 0) {
						message.success("생성 하였습니다")
						emit("refresh", res.data?.id, companyForm.value.id)
					}
				})
			})
			.catch((err: any) => {
				const fields = err.errorFields
				if (fields && fields.length > 0) {
					fields.forEach((field: any) => {
						workplaceFormRef.value?.validateFields(field.name)
					})
				}
			})
	} else if (workplaceForm.value.status === "update") {
		//사업장 수정
		workplaceFormRef.value
			?.validate()
			.then(() => {
				const workplaceOrderSeq = determineTreeMaxId(props.compTreeData, "orderSeq") + 1
				if (workplaceForm.value.id) {
					update(
						Object.assign({}, workplaceForm.value, {
							parentId: companyForm.value.id,
							code: companyForm.value.code,
							name: workplaceForm.value.workplaceName,
							orderSeq: workplaceOrderSeq + 1,
						}),
						workplaceForm.value.id
					).then((res: Response<Workplace>) => {
						if (res.status === 0) {
							message.success("사업장 정보가 변경되었습니다.")
							emit("refresh", res.data?.id, companyForm.value.id)
						}
					})
				} else {
					message.error("수정하실 사업장을 다시 선택해주세요.")
				}
			})
			.catch((err: any) => {
				const fields = err.errorFields
				if (fields && fields.length > 0) {
					fields.forEach((field: any) => {
						workplaceFormRef.value?.validateFields(field.name)
					})
				}
			})
	}
}

/**
 * 삭제 API 호출
 * @param data
 */
const deleteCompanies = async (data: WorkplaceTree) => {
	remove(data.id).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success("삭제되었습니다.")
			emit("refresh")
		}
	})
}

/**
 * 사업자번호 체크
 * @param value
 */
const registrationNumberCheck = async (value: string) => {
	return useCFetch<Response<any>>(`/api/v2/settings/companies/registrationNumber/check`, {
		method: "GET",
		params: {
			registrationNumber: value,
		},
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				isValidationRegNumber.value = true
			} else {
				isValidationRegNumber.value = false
			}
		})
		.catch((err: any) => {
			isValidationRegNumber.value = false
		})
		.finally(() => {
			// formRef.value?.validateFields('registrationNumber')
		})
}

/**
 * 사업자 번호 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateRegistrationNumber = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("사업자 번호를 입력해주세요.")
	} else {
		return Promise.resolve()
		// await registrationNumberCheck(value);

		// if (isValidationRegNumber.value) {
		//   return Promise.resolve();
		// } else {
		//   return Promise.reject('유효하지 않은 사업자 번호입니다.');
		// }
	}
}

/**
 * 회사코드 체크
 * @param value
 */
const companyCodeCheck = async (code: string) => {
	return useCFetch<Response<any>>(`/api/v2/settings/companies/code/check`, {
		method: "GET",
		params: {
			code,
		},
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				isValidationCompanyCode.value = true
			} else {
				isValidationCompanyCode.value = false
			}
		})
		.catch((err: any) => {
			isValidationCompanyCode.value = false
		})
		.finally(() => {
			// formRef.value?.validateFields('companyCode')
		})
}

/**
 * 회사코드 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateCompanyCode = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("회사코드를 입력해주세요.")
	} else {
		await companyCodeCheck(value)

		if (isValidationCompanyCode.value) {
			return Promise.resolve()
		} else {
			return Promise.reject(
				"이미 사용 중인 회사코드 입니다. 동일 회사코드에 주사업장은 하나만 존재할 수 있습니다."
			)
		}
	}
}

/**
 * 사업장코드 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateWorkplaceCode = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("사업장코드를 입력해주세요.")
	} else {
		await companyCodeCheck(value)

		if (isValidationCompanyCode.value) {
			return Promise.resolve()
		} else {
			return Promise.reject("이미 사용 중인 사업장코드 입니다.")
		}
	}
}

/**
 * 회사명 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateCompanyName = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("회사명을 입력해주세요.")
	} else {
		return Promise.resolve()
	}
}

/**
 * 회사정보 폼 rules
 */
const companyRules: Record<string, Rule[]> = {
	// registrationNumber: [
	//   {
	//     validator: validateRegistrationNumber,
	//     trigger: ['blur'],
	//     required: true,
	//   },
	// ],
	code: [{ validator: validateCompanyCode, trigger: ["blur"], required: true }],
	name: [{ required: true, validator: validateCompanyName }],
}

/**
 * 회사정보 폼 rules
 */
const workPlaceRules: Record<string, Rule[]> = {
	registrationNumber: [
		{
			validator: validateRegistrationNumber,
			trigger: ["blur"],
			required: true,
		},
	],
	workplaceCode: [
		{ validator: validateWorkplaceCode, trigger: ["blur"], required: true },
	],
	workplaceName: [{ required: true, message: "빈값을 채워주세요" }],
}

/**
 * 회사 추가 액션
 */
const appendWorkplace = () => {
	isEdit.value = true
	companyFormRef.value?.resetFields()
	workplaceFormRef.value?.resetFields()
	nextTick(() => {
		companyForm.value.status = "create"
		workplaceForm.value.status = "create"
	})
}

/**
 * 사업장 추가 액션
 */
const appendSubWorkplace = () => {
	isEdit.value = true
	companyForm.value.status = "read"
	workplaceForm.value.status = "append"
	workplaceFormRef.value?.resetFields([
		"representativeName",
		"bizType",
		"bizItem",
		["address", "roadAddr"],
		["address", "detailAddr"],
		"workplaceName",
		"workplaceCode",
	] as any)
}

const cancle = async () => {
	const id = workplaceForm.value.id
	const parentId = companyForm.value.id
	if (parentId && id) {
		emit("refresh", id, parentId)
	}
	if (!id && parentId) {
		emit("refresh", parentId)
	} else {
		emit("refresh")
	}
}
/**
 * 다음 주소 모달 호출 부분
 */
const openDaumAddrModal = (): void => {
	try {
		new window.daum.Postcode({
			oncomplete: function (data: IAddr) {
				if (workplaceForm.value) {
					workplaceForm.value.address.roadAddr = data.roadAddress
					workplaceForm.value.address.engAddr1 = data.roadAddressEnglish
					workplaceForm.value.address.engAddr2 = data.roadnameEnglish
					workplaceForm.value.address.jibunAddr = data.jibunAddress
					workplaceForm.value.address.zonecode = data.zonecode
				}
			},
		}).open()
	} catch (e) {
		console.error(e)
	}
}

const { companyFormData, workplaceFormData } = toRefs(props)
watch([companyFormData, workplaceFormData], (data) => {
	isEdit.value = false
	if (data[0]) {
		companyForm.value = data[0]
	}
	if (data[1]) {
		workplaceForm.value = data[1]
	}
	if (data[1].id === undefined) {
		workplaceFormData.value.address["roadAddr"] = ""
		workplaceFormData.value.address["detailAddr"] = ""
		workplaceFormData.value.address["zonecode"] = ""
	}
})
</script>

<template>
	<a-form
		ref="companyFormRef"
		autocomplete="off"
		label-align="left"
		:model="companyForm"
		:colon="false"
		:rules="
			['create', 'update'].includes(companyForm.status) &&
			['create', 'read'].includes(workplaceForm.status) &&
			isEdit
				? companyRules
				: undefined
		"
	>
		<!-- 회사정보 start -->
		<a-descriptions
			bordered
			title="회사정보"
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<template #extra>
				<a-space :size="5">
					<eacc-button
						v-if="(companyForm.id && !isEdit) || (workplaceForm.id && !isEdit)"
						componentIs="delete"
						type="primary"
						:data="workplaceForm.id ? workplaceForm : companyForm"
						:modal-open="true"
						:loading="loading"
						@click="deleteCompanies"
					/>
					<a-button
						v-if="companyForm.id && !workplaceForm.id && !isEdit"
						:icon="materialIcons('mso', 'add_circle')"
						@click="appendSubWorkplace"
					>
						사업장추가
					</a-button>
					<a-button
						v-if="(companyForm.id && !isEdit) || (workplaceForm.id && !isEdit)"
						type="primary"
						:icon="materialIcons('mso', 'edit')"
						@click="onUpdate"
					>
						수정
					</a-button>
					<a-button v-if="isEdit" @click="cancle"> 취소 </a-button>
					<a-button
						v-if="isEdit"
						type="primary"
						:icon="materialIcons('mso', 'save')"
						@click.prevent="onSave"
					>
						저장
					</a-button>
					<a-button
						v-if="!companyForm.id && !workplaceForm.id && !isEdit"
						:icon="materialIcons('mso', 'add_circle')"
						@click="appendWorkplace"
					>
						회사추가
					</a-button>
				</a-space>
			</template>

			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'update'].includes(companyForm.status) &&
								['create', 'read'].includes(workplaceForm.status) &&
								isEdit,
						}"
						>회사명</span
					>
				</template>
				<a-form-item
					v-if="
						['create', 'update'].includes(companyForm.status) &&
						['create', 'read'].includes(workplaceForm.status) &&
						isEdit
					"
					name="name"
					:rules="[{ required: true, message: '회사명를 입력하세요.' }]"
					has-feedback
				>
					<a-input v-model:value="companyForm.name"></a-input>
				</a-form-item>
				<span v-else>{{ companyForm.name }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span>사업자등록번호</span>
				</template>
				<a-form-item
					v-if="
						['create', 'update'].includes(companyForm.status) &&
						['create', 'read'].includes(workplaceForm.status) &&
						isEdit
					"
					name="registrationNumber"
					has-feedback
				>
					<a-input v-model:value="companyForm.registrationNumber" :maxlength="10" />
				</a-form-item>
				<span v-else>{{ companyForm.registrationNumber }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create'].includes(companyForm.status) &&
								['create', 'read'].includes(workplaceForm.status) &&
								isEdit,
						}"
						:rules="[{ required: true, message: '회사코드를 입력하세요.' }]"
						>회사코드</span
					>
				</template>
				<a-form-item
					v-if="
						['create'].includes(companyForm.status) &&
						['create', 'read'].includes(workplaceForm.status) &&
						isEdit
					"
					name="code"
					has-feedback
				>
					<a-input v-model:value="companyForm.code" :maxlength="10"></a-input>
				</a-form-item>
				<span v-else>{{ companyForm.code }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span>대표자</span>
				</template>
				<a-form-item
					v-if="
						['create', 'update'].includes(companyForm.status) &&
						['create', 'read'].includes(workplaceForm.status) &&
						isEdit
					"
					name="representativeName"
				>
					<a-input v-model:value="companyForm.representativeName" />
				</a-form-item>
				<span v-else>{{ companyForm.representativeName }}</span>
			</a-descriptions-item>
		</a-descriptions>
		<!-- 회사정보 end -->
	</a-form>
	<a-form
		ref="workplaceFormRef"
		autocomplete="off"
		label-align="left"
		:model="workplaceForm"
		:colon="false"
		:rules="
			['create', 'append', 'update'].includes(workplaceForm.status) && isEdit
				? workPlaceRules
				: undefined
		"
	>
		<!-- 사업장정보 start -->
		<a-descriptions
			class="mt-xl"
			bordered
			title="사업장정보"
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>사업장명</span
					>
				</template>
				<a-form-item
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					name="workplaceName"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.workplaceName"></a-input>
				</a-form-item>
				<span v-else>{{ workplaceForm.workplaceName }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>사업자등록번호</span
					>
				</template>
				<a-form-item
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					name="registrationNumber"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.registrationNumber" :maxlength="10" />
				</a-form-item>
				<span v-else>{{ workplaceForm.registrationNumber }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>사업장코드</span
					>
				</template>
				<a-form-item
					v-if="['create', 'append'].includes(workplaceForm.status) && isEdit"
					name="workplaceCode"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.workplaceCode" :maxlength="4"></a-input>
				</a-form-item>
				<span v-else>{{ workplaceForm.workplaceCode }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span>대표자</span>
				</template>
				<a-form-item
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					name="representativeName"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.representativeName" />
				</a-form-item>
				<span v-else>{{ workplaceForm.representativeName }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>업종</span
					>
				</template>
				<a-form-item
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					name="bizItem"
					:rules="[
						{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
							message: '업종을 입력해주세요.',
						},
					]"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.bizItem" />
				</a-form-item>
				<span v-else>{{ workplaceForm.bizItem }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>업태</span
					>
				</template>
				<a-form-item
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					name="bizType"
					:rules="[
						{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
							message: '업태를 입력해주세요.',
						},
					]"
					has-feedback
				>
					<a-input v-model:value="workplaceForm.bizType" />
				</a-form-item>
				<span v-else>{{ workplaceForm.bizType }}</span>
			</a-descriptions-item>
			<a-descriptions-item :span="2">
				<template #label>
					<span
						:class="{
							required:
								['create', 'append', 'update'].includes(workplaceForm.status) && isEdit,
						}"
						>주소</span
					>
				</template>
				<a-form-item
					class="mb-sm"
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
					:name="['address', 'roadAddr']"
					:rules="[{ required: true, message: '주소를 입력해주세요.' }]"
				>
					<a-input-group compact class="address">
						<a-input v-model:value="workplaceForm.address.roadAddr" :disabled="true" />
						<a-button @click="openDaumAddrModal"> 주소검색 </a-button>
					</a-input-group>
				</a-form-item>

				<a-form-item
					:name="['address', 'detailAddr']"
					v-if="['create', 'append', 'update'].includes(workplaceForm.status) && isEdit"
				>
					<a-input v-model:value="workplaceForm.address.detailAddr" />
				</a-form-item>
				<a-space :size="4" v-else>
					<span v-if="workplaceForm.address.zonecode">
						({{ workplaceForm.address.zonecode }})
					</span>
					<span>{{ workplaceForm.address.roadAddr }}</span>
					<span> {{ workplaceForm.address.detailAddr }}</span>
				</a-space>
			</a-descriptions-item>
		</a-descriptions>
		<!-- 사업장정보 end -->
	</a-form>
</template>
