<script lang="ts" setup>
import { Form } from "ant-design-vue"
import type { Rule } from "ant-design-vue/es/form"
import { type Response } from "@/types"

type PasswordType = string | number
interface PasswordBase {
	id: number
	companyCode: string
	loginId: string
	memberStatus: string
}
interface Password extends PasswordBase {
	oldPassword: PasswordType
	password: PasswordType
	newPassword: PasswordType
}
type PasswordForm = Partial<Password>

const authStore = useAuthStore()
const appStore = useAppsStore()
const { getIsTemporal } = storeToRefs(appStore)

const { getUserId, getCompanyCode, getLoginId } = storeToRefs(authStore)
const { setRedirect } = useRedirectFrom()

const route = useRoute()

const form = ref<PasswordForm>({
	id: getUserId.value,
	companyCode: getCompanyCode.value,
	loginId: getLoginId.value,
	oldPassword: "",
	password: "",
	newPassword: "",
})

/**
 * 이전 패스워드와 새 패스워드와 동일한지 체크
 * @param _rule
 * @param value
 */
const newPasswordCheck = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("비밀번호를 입력해주세요.")
	} else {
		if (value !== form.value.oldPassword) {
			return Promise.resolve()
		} else {
			return Promise.reject("이전 비밀번호와 동일할 수 없습니다.")
		}
	}
}

/**
 * 새 비밀번호 확인 용
 * @param _rule
 * @param value
 */
const samePasswordCheck = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("비밀번호를 입력해주세요.")
	} else {
		if (value === form.value.password) {
			return Promise.resolve()
		} else {
			return Promise.reject("비밀번호가 일치하지 않습니다.")
		}
	}
}

const rulesRef = ref<Record<string, Rule[]>>({
	oldPassword: [
		{
			required: true,
			trigger: ["blur", "change"],
			message: "현재 비밀번호를 입력해주세요.",
		},
	],
	password: [
		{
			validator: newPasswordCheck,
			required: true,
		},
	],
	newPassword: [
		{
			validator: samePasswordCheck,
			required: true,
			trigger: ["blur", "change"],
		},
	],
})

const useForm = Form.useForm
const { resetFields, validate, validateInfos } = useForm(form, rulesRef)

const show = ref<boolean>(getIsTemporal.value)

const onModalOkClick = (e: MouseEvent) => {
	// console.log(e);
	// show.value = false;
	validate()
		.then((res: Password) => {
			savePassword(res)
		})
		.catch((err) => {
			console.error(err)
		})
}

const savePassword = (data: Password) => {
	// console.log(data);
	const { logout } = useAuth()

	const body = Object.assign(
		{},
		{
			id: form.value.id,
			loginId: form.value.loginId,
			companyCode: form.value.companyCode,
			password: data.password,
			oldPassword: data.oldPassword,
		}
	)

	useCFetch<Response<any>>(`/api/v2/members/password/reset`, {
		method: "PATCH",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			// message.success('비밀번호를 변경하였습니다.');

			Modal.success({
				title: "재로그인",
				content: h("div", {}, [
					h("p", "비밀번호를 변경하였습니다. 다시 로그인을 해주세요."),
				]),
				onOk() {
					return new Promise((resolve, reject) => {
						logout()
							.then((data) => resolve(data))
							.catch((err) => reject(err))
							.finally(() => {
								show.value = false
								// setRedirect(route)
								navigateTo("/login")
							})
					}).catch(() => console.log("Oops errors!"))
				},
			})
		} else {
			message.error(res.message)
		}
	})
}
</script>

<template>
	<a-modal
		v-model:open="show"
		title="비밀번호 초기화"
		:cancel-button-props="{ disabled: true }"
		:keyboard="false"
		:closable="false"
		:mask-closable="false"
		@ok="onModalOkClick"
	>
		<!-- :after-close="() => open != open" -->
		<a-form
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
			:rules="rulesRef"
		>
			<a-form-item
				label="현재 비밀번호"
				name="oldPassword"
				v-bind="validateInfos.oldPassword"
				has-feedback
			>
				<a-input-password v-model:value="form.oldPassword" placeholder="현재 비밀번호" />
			</a-form-item>
			<a-form-item
				label="새 비밀번호"
				name="password"
				v-bind="validateInfos.password"
				has-feedback
			>
				<a-input-password v-model:value="form.password" placeholder="새 비밀번호" />
			</a-form-item>
			<a-form-item
				label="비밀번호 확인"
				name="newPassword"
				v-bind="validateInfos.newPassword"
				has-feedback
			>
				<a-input-password
					v-model:value="form.newPassword"
					placeholder="새 비밀번호 비밀번호 확인"
				/>
			</a-form-item>
		</a-form>
	</a-modal>
</template>
