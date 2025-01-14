<script lang="ts" setup>
import type { Response } from "@/types"
import type { UploadChangeParam, UploadProps, FormInstance } from "ant-design-vue"
import { Form } from "ant-design-vue"
import type { Rule } from "ant-design-vue/es/form"
import dayjs, { Dayjs } from "dayjs"

type STAGE = "NEW" | "CONTINUE"

interface IFormData {
	id?: number
	loginId: string
	companyId?: number
	companyCode?: string
	workplaceId?: number
	workplaceCode?: number
	workplaceName?: string
	costCenterId?: number
	costCenterCode: string
	costCenterName?: string
	name: string | undefined
	departmentId: string | number | undefined // 부서
	positionId: string | number | undefined // 직위
	jobTitleId: string | number | undefined // 직책
	roleId: string | number | undefined // 권한
	email: string
	mobileNumber: string | undefined
	phoneNumber: string | undefined
	companyPhone: number | undefined
	joinedDate: any // 입사일
	leftDate: any // 퇴사일
	companyNumber: number | undefined //
	employeeNumber: string | undefined //사번
}

// const updateUser = defineModel('value');

// 스토어 생성
const authStore = useAuthStore()
// 반응형 객체로 변환
const {
	getCompanyId,
	getCompanyCode,
	getWorkplaceId,
	getWorkplaceCode,
	getRole,
	getCostCenterId,
} = storeToRefs(authStore)

const props = withDefaults(
	defineProps<{
		showed?: boolean
		updateUser?: any
	}>(),
	{
		showed: false,
	}
)

const { locale } = useLocale()

const costCenterColumns = ref([
	{
		title: "코스트센터",
		data: (row: any) => row.workplaceName,
	},
])

const showed = ref(false)
const formRef = ref<FormInstance>()

/**
 * 로그인ID 체크 결과 필드 UI 활성 (로그인ID 중복 조회)
 * @param _rule
 * @param value
 */
const validateLoginId = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("로그인 아이디를 입력해주세요.")
	} else {
		if (modelRef.value.id) return Promise.resolve()

		await useCFetch<Response<any>>(`/api/v2/settings/employees/loginId/check`, {
			method: "get",
			params: {
				companyCode: "1000",
				loginId: value,
			},
		})
			.then((res: Response<any>) => {
				if (res.status == 0 && res.data.available) {
					return Promise.resolve()
				} else {
					return Promise.reject(`${res.message}`)
				}
			})
			.catch((err: any) => {
				return Promise.reject(`${err}`)
			})
	}
}

/**
 * 이메일 체크 결과 필드 UI 활성 (이메일 중복 조회)
 * TODO: 이메일 중복 체크 API 작성되면 호출 경로 변경해야함.
 * @param _rule
 * @param value
 */
const validatedEmailCheck = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.resolve()
		// return Promise.reject('이메일을 입력해주세요.');
	} else {
		const emailRegex = new RegExp(
			/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
			"gm"
		)
		const isValidEmail = emailRegex.test(value)
		if (isValidEmail) {
			await useCFetch<Response<any>>(`/api/v2/settings/employees/loginId/check`, {
				method: "get",
				params: {
					companyCode: "1000",
					loginId: value,
				},
			})
				.then((res: Response<any>) => {
					if (res.status == 0 && res.data.available) {
						return Promise.resolve()
					} else {
						return Promise.reject(`${res.message}`)
					}
				})
				.catch((err: any) => {
					return Promise.reject(`${err.message}`)
				})
		} else {
			return Promise.reject(`${value} 는 올바른 이메일 형식이 아닙니다.`)
		}
	}
}

const imageFiles = ref<UploadProps["fileList"]>([])
const previewVisible = ref(false)
const previewImage = ref("")

const useForm = Form.useForm
const currentDate = dayjs(dayjs(), "YYYY-MM-DD")

const initModelRef: IFormData = {
	id: undefined,
	loginId: "",
	name: "",
	companyId: getCompanyId.value,
	companyCode: getCompanyCode.value,
	costCenterId: undefined,
	costCenterCode: "",
	workplaceId: undefined,
	departmentId: undefined, // 부서
	positionId: undefined, // 직위
	jobTitleId: undefined, // 직책
	roleId: undefined, // 권한
	email: "",
	mobileNumber: undefined,
	phoneNumber: undefined,
	companyPhone: undefined,
	joinedDate: currentDate, // 입사일
	leftDate: undefined, //퇴사일
	companyNumber: undefined, //
	employeeNumber: undefined, //사번
}

const modelRef = ref<IFormData>(initModelRef)

const rulesRef = ref<Record<string, Rule[]>>({
	employeeNumber: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
	loginId: [{ validator: validateLoginId, trigger: ["blur"], required: true }],
	name: [
		{
			required: true,
			message: "필수입력사항 입니다.",
		},
	],
	// workplaceId: [
	//   {
	//     required: true,
	//     message: '필수입력사항 입니다.',
	//     trigger: 'change',
	//   },
	// ],
	companyCode: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	departmentId: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	positionId: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	jobTitleId: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	roleId: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	costCenterCode: [
		{
			required: true,
			message: "필수입력사항 입니다.",
			trigger: "change",
		},
	],
	email: [
		{
			validator: validatedEmailCheck,
			type: "email",
			required: true,
			// 유효하지 않은 ${label} 타입니다.
			// message: emailErrorMessage.value ? emailErrorMessage.value : '필수입력사항 입니다.',
			trigger: "blur",
		},
		{
			pattern: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			message: "유효하지 않은 이메일 형식입니다.",
			trigger: "blur",
		},
	],
	mobileNumber: [
		{
			required: false,
			message: "휴대전화는 10이상 11자 이내로 입력하세요.",
			min: 10,
			max: 11,
			trigger: "blur",
		},
		{
			pattern:
				/^(01[016789]?\d{3,4}?\d{4})$|^(\+\d{1,3}?\d{1,4}?\d{4,})$|^(00\d{1,3}?\d{1,4}?\d{4,})$/,
			message: "유효하지 않은 휴대전화 형식입니다.",
			trigger: "blur",
		},
	],
	phoneNumber: [
		{
			required: false,
			message: "회사전화는 9자 이상 입력하세요.",
			min: 9,
			trigger: "blur",
		},
		{
			//국내 유선전화 정규식
			pattern: /^(0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4]))(\d{3,4})(\d{4})$/,
			message: "유효하지 않은 회사전화 형식입니다.",
			trigger: "blur",
		},
	],
})

const emit = defineEmits<{
	(e: "submit", value: any): any
	(e: "closed", value: boolean): boolean
	(e: "refresh"): void
}>()

function getBase64(file: File) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result)
		reader.onerror = (error) => reject(error)
	})
}

// file: UploadProps['fileList'][number]
const handlePreview = async (file: any) => {
	console.log(file)

	if (!file.url && !file.preview) {
		file.preview = (await getBase64(file.originFileObj)) as string
	}
	previewVisible.value = true
	previewImage.value = file.url || file.preview
}

const { resetFields, validate, validateInfos, clearValidate } = useForm(
	modelRef,
	rulesRef
)

const onFinish = (form: IFormData, stage: STAGE) => {
	const body = Object.assign({}, form, {
		joinedDate: dayjs(form.joinedDate).format("YYYY-MM-DD"),
		leftDate: form.leftDate ? dayjs(form.leftDate).format("YYYY-MM-DD") : undefined,
		employeeNumber:
			typeof form.employeeNumber == "string"
				? form.employeeNumber
				: form.employeeNumber
					? form.employeeNumber[0]
					: undefined,
	})

	useCFetch<Response<any>>(`/api/v2/settings/employees${body.id ? "/" + body.id : ""}`, {
		method: body.id ? "PUT" : "POST",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status == 0) {
				if (form.id) {
					closed("NEW")
				} else {
					closed(stage)
				}
			} else {
				console.log("실패")
			}
		})
		.catch((err: any) => {
			console.log("error ", err)
		})
}
const onSubmit = (stage: STAGE) => {
	validate()
		.then(() => {
			onFinish(toRaw(modelRef).value, stage)
		})
		.catch((err) => {
			console.log("error", err)
		})
}

const resetPassword = () => {
	useCFetch<Response<any>>(`/api/v2/members/password/forgot`, {
		method: "PATCH",
		body: {
			id: modelRef.value.id,
			loginId: modelRef.value.loginId,
		},
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success("비밀번호가 초기화되었습니다.")
		} else {
			message.error(res.message)
		}
	})
}

/**
 * 임직원 검색 후 사용자정보 자동 입력
 */
const setUserInfo = async (user: any) => {
	if (user && user.length > 0) {
		console.log("user[0] ", user[0])
		modelRef.value.companyCode = user[0].companyCode
		modelRef.value.workplaceId = user[0].workplaceId
		modelRef.value.loginId = user[0].employeeNumber
		modelRef.value.employeeNumber = user[0].employeeNumber
		modelRef.value.name = user[0].name
		modelRef.value.departmentId = user[0].departmentId
		modelRef.value.positionId = user[0].positionId
		modelRef.value.jobTitleId = user[0].jobTitleId
	}
}

/**
 * 사용자정보 초기화
 */
const clearUserInfo = () => {
	modelRef.value.employeeNumber = undefined
	modelRef.value.name = undefined
}

const closed = async (stage: STAGE) => {
	nextTick(() => {
		setTimeout(() => {
			resetFields()

			if (stage === "NEW") {
				emit("closed", false)
			} else {
				emit("closed", true)
			}
			emit("refresh")
		}, 100)
	})
}

/**
 * 회사 변경 이벤트 (object returned from)
 * @param value
 */
const companyCodeUpdate = (value: any) => {
	modelRef.value.companyCode = value.code
	modelRef.value.companyId = value.id
}

/**
 * 사업장 변경 이벤트 (object returned from)
 * @param value
 */
const workplaceCodeUpdate = (value: any) => {
	console.log("workplaceCodeUpdate ", value)
	modelRef.value.workplaceId = value.id
	modelRef.value.workplaceCode = value.workplaceCode
	modelRef.value.workplaceName = value.workplaceName
}
/**
 * cost center 변경 이벤트 (object returned from)
 * @param value
 */
const costCenterUpdate = (value: any) => {
	if (value && value.length > 0) {
		modelRef.value.costCenterId = value[0].id
		modelRef.value.costCenterCode = value[0].code
	}
}

const retireStauts = async (item: any) => {
	await useCFetch<Response<any>>(`/api/v2/settings/employees/members/${item.id}/retire`, {
		method: "DELETE",
		body: {
			id: item.id,
			leftDate: item.leftDate,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			showed.value = false
			modelRef.value.leftDate = ""
			emit("refresh")
		}
	})
}

const deleteStauts = async (item: any) => {
	await useCFetch<Response<any>>(`/api/v2/settings/employees/members/${item.id}`, {
		method: "DELETE",
		body: {
			id: item.id,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			showed.value = false
			emit("refresh")
		}
	})
}

watch(
	() => props.showed,
	(data) => {
		showed.value = data
		clearValidate()
	}
)

watch(
	() => props.updateUser,
	(data) => {
		if (data) {
			// console.log("watch ", data)
			// formRef.value?.resetFields();
			modelRef.value.id = data.id
			modelRef.value.companyCode = data.companyCode
			modelRef.value.workplaceId = data.employee.workplaceId
			modelRef.value.loginId = data.loginId
			modelRef.value.name = data.name
			modelRef.value.employeeNumber = data.employee.employeeNumber
			modelRef.value.email = data.employee.email
			modelRef.value.positionId = data.employee.positionId
			modelRef.value.jobTitleId = data.employee.jobTitleId
			modelRef.value.departmentId = data.employee.departmentId
			modelRef.value.costCenterId = data.employee.costCenterId
			modelRef.value.costCenterCode = data.employee.costCenterCode
			modelRef.value.roleId = data.roleId
			modelRef.value.joinedDate = dayjs(data.employee.joinedDate, "YYYY-MM-DD")
			modelRef.value.mobileNumber = data.employee.mobileNumber
			modelRef.value.phoneNumber = data.employee.phoneNumber
		}
	}
)
</script>

<template>
	<a-modal
		centered
		v-model:open="showed"
		:title="modelRef.id ? '사용자 수정' : '사용자 추가'"
		:maskClosable="false"
		@cancel="closed('NEW')"
	>
		<template #footer>
			<div :style="{ position: 'absolute', left: '10px' }">
				<eacc-button
					component-is="retire"
					:modal-open="true"
					:disabled="!modelRef.id"
					:data="modelRef"
					@click="retireStauts"
				/>
				<eacc-button
					component-is="delete"
					:modal-open="true"
					:disabled="!modelRef.id"
					modalHeaderText="삭제"
					content="사용자의 아이디가 삭제됩니다."
					:data="modelRef"
					@click="deleteStauts"
				/>
			</div>
			<a-button @click="closed('NEW')">취소</a-button>
			<a-button
				type="primary"
				ghost
				:style="modelRef.id ? { display: 'none' } : {}"
				@click="onSubmit('CONTINUE')"
				>저장후 추가</a-button
			>
			<a-button type="primary" @click="onSubmit('NEW')">저장</a-button>
		</template>

		<a-form
			ref="formRef"
			:model="modelRef"
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
			:rules="rulesRef"
			name="사용자추가"
		>
			<a-form-item
				name="employeeNumber"
				v-bind="validateInfos.employeeNumber"
				has-feedback
				label="사번"
			>
				<a-input
					v-model:value="modelRef.employeeNumber"
					placeholder="사번을 입력하세요."
					:disabled="modelRef.id ? true : false"
				/>
			</a-form-item>
			<a-form-item
				label="아이디"
				name="loginId"
				v-bind="validateInfos.loginId"
				has-feedback
			>
				<a-input
					v-model:value="modelRef.loginId"
					:disabled="modelRef.id ? true : false"
				></a-input>
			</a-form-item>
			<a-form-item label="이름" v-bind="validateInfos.name">
				<a-input v-model:value="modelRef.name" :readonly="modelRef.id ? true : false" />
			</a-form-item>
			<!-- <a-form-item label="사진등록" help="권장사이즈: 240px x 240px">
        <a-space>
          <a-upload
            action=""
            v-model:file-list="imageFiles"
            list-type="picture-card"
            :max-count="1"
            @preview="handlePreview"
          >
            <div v-if="imageFiles?.length === 0">
              <plus-outlined />
              <div style="margin-top: 8px">사진등록</div>
            </div>
          </a-upload>
          <a-image
            :width="200"
            :style="{ display: 'none' }"
            :preview="{
              visible: previewVisible,
              onVisibleChange: (value: boolean) => (previewVisible = value),
            }"
            :src="previewImage"
          />
        </a-space>
      </a-form-item> -->
			<a-form-item label="비밀번호" v-if="modelRef.id">
				<a-button @click="resetPassword">비밀번호 초기화</a-button>
			</a-form-item>
			<a-form-item
				label="회사"
				name="companyCode"
				v-bind="validateInfos.companyCode"
				has-feedback
			>
				<eacc-select
					:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
					:on-all-field="false"
					v-model:value="modelRef.companyCode"
					:field-names="{ label: 'name', value: 'code' }"
					value-type="any"
					@update:any-value="companyCodeUpdate"
					:disabled="getRole !== 'ROOT'"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item label="사업장" name="workplaceCode">
				<!-- {{modelRef.workplaceName}} // {{modelRef.workplaceCode}} // {{modelRef.workplaceId}} -->
				<eacc-select
					:url="`/api/v2/settings/companies?parentId=${modelRef.companyId}`"
					:on-all-field="false"
					:refresh="true"
					v-model:value="modelRef.workplaceCode"
					:field-names="{ label: 'name', value: 'workplaceCode' }"
					value-type="any"
					@update:any-value="workplaceCodeUpdate"
					:disabled="!modelRef.companyId"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item
				label="부서"
				name="departmentId"
				v-bind="validateInfos.departmentId"
				has-feedback
			>
				<eacc-select
					:url="`/api/v2/settings/commons/departments${getRole === 'ROOT' ? '?companyCode=' + modelRef.companyCode : '?companyCode=' + getCompanyCode}`"
					:on-all-field="false"
					:refresh="true"
					v-model:value="modelRef.departmentId"
					:field-names="{ label: 'name', value: 'id' }"
					@update:value="(value) => (modelRef.departmentId = value)"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item
				label="직위"
				name="positionId"
				v-bind="validateInfos.positionId"
				has-feedback
			>
				<eacc-select
					url="/api/v2/settings/commons/positions"
					:on-all-field="false"
					v-model:value="modelRef.positionId"
					:field-names="{ label: 'name', value: 'id' }"
					@update:value="(value) => (modelRef.positionId = value)"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item
				label="직책"
				name="jobTitleId"
				v-bind="validateInfos.jobTitleId"
				has-feedback
			>
				<eacc-select
					url="/api/v2/settings/commons/jobTitles"
					:on-all-field="false"
					v-model:value="modelRef.jobTitleId"
					:field-names="{ label: 'name', value: 'id' }"
					returnType="any"
					@update:value="(value) => (modelRef.jobTitleId = value)"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item label="권한" v-bind="validateInfos.roleId" name="roleId">
				<eacc-select
					:url="`/api/v2/settings/roles${getRole === 'ROOT' ? '?companyCode=' + modelRef.companyCode : '?companyCode=' + getCompanyCode}`"
					:on-all-field="false"
					refresh
					v-model:value="modelRef.roleId"
					:field-names="{ label: 'name', value: 'id' }"
					@update:value="(value) => (modelRef.roleId = value)"
				>
				</eacc-select>
			</a-form-item>
			<a-form-item
				label="코스트센터"
				v-bind="validateInfos.costCenterCode"
				name="costCenterId"
				has-feedback
			>
				<eacc-select
					:url="`/api/v2/settings/commons/costCenters${getRole === 'ROOT' ? '?companyCode=' + modelRef.companyCode : '?companyCode=' + getCompanyCode}`"
					:on-all-field="false"
					refresh
					v-model:value="modelRef.costCenterCode"
					:field-names="{ label: 'workplaceName', value: 'code' }"
					return-type="any"
					@update:any-value="costCenterUpdate"
				>
				</eacc-select>

				<!-- <eacc-select-table
          key-props="code"
          label-prop="workplaceName"
          :url="`/api/v2/masters/commons/costCenters${getRole === 'ROOT' ? '?companyCode=' + modelRef.companyCode : '?companyCode=' + getCompanyCode}`"
          v-model:value="modelRef.costCenterCode"
          :columns="costCenterColumns"
          @remove="(value: any) => (modelRef.costCenterCode = new Array())"
          @update:value="(value) => modelRef.costCenterCode = value"
          /> -->
				<!-- @selection-change="costCenterUpdate" -->
			</a-form-item>
			<a-form-item label="이메일" name="email" v-bind="validateInfos.email">
				<a-input v-model:value="modelRef.email"></a-input>
				<!-- <a-input-group compact class="compact">
          <a-input type="email" v-model:value="modelRef.email">
            <template #suffix v-if="modelRef.validatedEmail">
              <check-circle-outlined class="text-success" />
            </template>
          </a-input>
          <a-button @click="() => (modelRef.validatedEmail = true)"
            >중복확인</a-button
          >
        </a-input-group> -->
			</a-form-item>
			<a-form-item label="휴대전화" name="mobileNumber">
				<a-input
					v-model:value="modelRef.mobileNumber"
					:min-length="10"
					placeholder="휴대폰번호를 입력해주세요."
					class="full-width"
				/>
			</a-form-item>
			<a-form-item label="회사전화" name="phoneNumber">
				<a-input
					v-model:value="modelRef.phoneNumber"
					:min-length="9"
					placeholder="회사전화번호를 입력해주세요."
					class="full-width"
				/>
			</a-form-item>
			<a-form-item label="입사일" name="joinedDate">
				<a-date-picker
					v-model:value="modelRef.joinedDate"
					class="full-width"
					placeholder="입사입을 선택해주세요."
				/>
			</a-form-item>
			<a-form-item label="퇴사일" name="leftDate" v-if="modelRef.id ? true : false">
				<a-date-picker
					v-model:value="modelRef.leftDate"
					class="full-width"
					placeholder="퇴사일을 선택해주세요."
				/>
			</a-form-item>
		</a-form>
	</a-modal>
	<!-- <a-modal
    :open="previewVisible"
    :title="previewTitle"
    :footer="null"
    @cancel="handleCancel"
  >
    <img alt="example" :src="previewImage" class="full-width" />
  </a-modal> -->
</template>
