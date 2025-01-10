<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { createVNode } from "vue"
import type { MenuProps } from "ant-design-vue"

const authStore = useAuthStore()
const { getName, getLoginId, getPositionName, getDepartmentName } = storeToRefs(authStore)

const { setRedirect } = useRedirectFrom()

const { logout } = useAuth()
const router = useRouter()
const route = useRoute()

const signOut = (): void => {
	Modal.confirm({
		title: "로그아웃",
		icon: createVNode(ExclamationCircleOutlined),
		content: "로그아웃 하시겠습니까?",
		okText: "확인",
		cancelText: "취소",
		onOk: () => {
			return new Promise((resolve, reject) => {
				logout()
					.then((data) => resolve(data))
					.catch((err) => reject(err))
					.finally(() => {
						console.log("로그인")
						// setRedirect(route)
						navigateTo("/login")
					})
			}).catch((err) => console.log("Oops errors!", err))
		},
	})
}

const handleMenuClick: MenuProps["onClick"] = async (e) => {
	if (e.key === "sign") {
		if (getLoginId.value) {
			signOut()
		} else {
			await navigateTo("/login")
		}
	}
}

const employeeIsModal = ref<boolean>(false)
</script>
<template>
	<a-dropdown
		placement="bottomRight"
		:trigger="['click']"
		:arrow="{ pointAtCenter: true }"
	>
		<a-button type="text" @click.prevent class="user-dropdown-link">
			<a-avatar :size="26">
				<template #icon>
					<UserOutlined />
				</template>
			</a-avatar>
			<span class="name">
				{{ getName }}
			</span>
		</a-button>
		<template #overlay>
			<div class="dropdown-contents">
				<div class="user-info">
					<div class="user-name">{{ getName }} {{ getPositionName }}</div>
					<div class="user-team">{{ getDepartmentName }}</div>
				</div>
				<a-menu @click="handleMenuClick">
					<a-menu-item key="1" :icon="materialIcons('mso', 'apps')">
						<a href="/mypage/myinfo">내정보</a>
					</a-menu-item>
					<a-menu-item key="2" :icon="materialIcons('mso', 'settings')">
						<a href="/mypage/expenses">개인설정</a>
					</a-menu-item>
					<a-menu-item key="3" :icon="materialIcons('mso', 'lan')">
						<a href="#" @click="employeeIsModal = !employeeIsModal">조직도</a>
					</a-menu-item>
					<a-menu-item
						key="sign"
						:icon="materialIcons('mso', getLoginId ? 'logout' : 'login')"
					>
						{{ getLoginId ? "로그아웃" : "로그인" }}
					</a-menu-item>
				</a-menu>
			</div>
		</template>
	</a-dropdown>

	<employee-tree-modal v-model:open="employeeIsModal" title="조직도">
	</employee-tree-modal>
</template>
