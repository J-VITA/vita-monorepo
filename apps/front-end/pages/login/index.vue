<script lang="ts" setup>
import type { Response, User } from "@/types"

// import { storeToRefs }  from 'pinia';
// import { useAuthStore } from '@/stores/auth';
definePageMeta({
	name: "로그인",
})

// const { $websocket } = useNuxtApp()

// 스토어 생성
const authStore = useAuthStore()
// 반응형 객체로 변환
// const { getCompanyCode } = storeToRefs(authStore);

const { login } = useAuth()

const { menu } = useMenus()

const { path } = useRedirectFrom()

const route = useRoute()

const form = reactive({
	data: {
		loginId: "", //test
		password: "", //password
		rememberMe: false,
	},
	error: "",
	pending: false,
})

const isAdmin = useAdmin()

const loading = ref<boolean>(false)
const formState = ref<any>({
	loginId: "", //test
	password: "", //password
	rememberMe: false,
})

const onFinish = async (values: any) => {
	// console.log('Success:', values);
	try {
		loading.value = true
		await login(
			formState.value.loginId,
			formState.value.password,
			formState.value.rememberMe
		)
			.then(async (data) => {
				if (data) {
					await menu(formState.value.loginId, data.companyCode)

					const redirect = path() ? path() : "/"
					// if (data.companyCode) {
					// 	if ($websocket.status.value === "OPEN") {
					// 		console.log("websocket.status OPEN")
					// 		$websocket.send(
					// 			JSON.stringify({
					// 				type: "private_message",
					// 				content: `${data.name} 님이 로그인 하였습니다.`,
					// 				// userId: data.userId,
					// 				targetUserId: "2", //abc root 관리자 계정
					// 			})
					// 		)
					// 	} else {
					// 		console.log("WebSocket not connected. Attempting to connect...")
					// 		$websocket.open()
					// 		$websocket.send(
					// 			JSON.stringify({
					// 				type: "broadcast",
					// 				// userId: data.userId,
					// 				content: `${data.name} 님이 로그인 하였습니다.`,
					// 			})
					// 		)
					// 	}
					// }

					await navigateTo(isAdmin.value ? "/settings/workplaces" : redirect, {
						external: true,
					})
				} else {
					console.log("data ", data)
					_reject(`${data.message}`)
				}
			})
			.catch((error: Response<any>) => {
				message.error(` ${error.message} `)
			})
	} catch (error: any) {
		if (error.data.message) form.error = error.data.message
	} finally {
		loading.value = false
		// console.log('login finally data : ', getUser.value);
	}
}

const onFinishFailed = (errorInfo: any) => {
	console.log("Failed:", errorInfo)
	message.error(`${errorInfo.message}`)
}
</script>

<template>
	<a-card class="login-box">
		<div class="mb-lg">
			<a-flex justify="center">
				<div class="logo">wiseXpense</div>
			</a-flex>

			<!-- <a-typography-title :level="3">로그인</a-typography-title> -->
			<!-- <a-typography-text type="secondary"
        >똑똑한 경비지출 와이즈 엑스펜스에 오신걸 환영합니다.</a-typography-text
      > -->
		</div>

		<a-form
			layout="vertical"
			:model="formState"
			:colon="false"
			name="login"
			@finish="onFinish"
			@finishFailed="onFinishFailed"
		>
			<a-form-item
				label="아이디"
				name="loginId"
				:rules="[{ required: true, message: '아이디를 입력해주세요!' }]"
			>
				<a-input v-model:value="formState.loginId" />
			</a-form-item>

			<a-form-item
				label="비밀번호"
				name="password"
				:rules="[{ required: true, message: '비밀번호를 입력해주세요!' }]"
			>
				<a-input-password v-model:value="formState.password" />
			</a-form-item>

			<a-form-item>
				<a-flex justify="space-between">
					<a-form-item name="remember" no-style>
						<a-checkbox v-model:checked="formState.rememberMe">기억하기</a-checkbox>
					</a-form-item>
					<a-typography-link class="login-form-forgot" href=""
						>아이디/비밀번호 찾기</a-typography-link
					>
				</a-flex>
			</a-form-item>

			<a-form-item class="mb-none">
				<a-button type="primary" html-type="submit" class="full-width" :loading="loading">
					로그인
				</a-button>
			</a-form-item>
		</a-form>
	</a-card>
</template>
