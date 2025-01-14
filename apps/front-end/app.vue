<script setup lang="ts">
import { legacyLogicalPropertiesTransformer, px2remTransformer } from "ant-design-vue"
import type { ThemeConfig } from "ant-design-vue/es/config-provider/context"

const { locale } = useLocale()
const antLocale = useAntLocale(locale.value)

useHead({
	titleTemplate: (title) => {
		return title ? `${title} - E-Accounting` : "E-Accounting"
	},
})

const px2rem = px2remTransformer({ rootValue: 10 })
const themeConfig: ThemeConfig = {
	token: {
		fontFamily: "'Pretendard-Regular',-apple-system, sans-serif",
		colorPrimary: "#6146e5",
		fontSize: 13,
		borderRadius: 4,
		wireframe: false,
		colorSuccess: "#32b96f",
		colorWarning: "#ffa900",
		colorError: "#eb6365",
		colorInfo: "#267ac7",
	},
	components: {
		Layout: {
			colorBgBody: "#f6f9ff",
			colorBgHeader: "#212529",
		},
		Menu: {
			colorActiveBarBorderSize: 0,
		},
		Table: {
			borderRadius: 0,
		},
		Input: {
			fontFamily: "'Pretendard-Regular',-apple-system, sans-serif",
			colorTextDisabled: "#777",
		},
		Select: {
			colorTextDisabled: "#777",
		},
		DatePicker: {
			colorTextDisabled: "#777",
		},
		Checkbox: {
			colorTextDisabled: "#777",
		},
		Switch: {
			colorTextDisabled: "#777",
		},
		InputNumber: {},
		Dropdown: {
			colorTextDisabled: "rgba(0, 0, 0, 0.4)",
		},
		Tabs: {
			colorPrimary: "#f3a52f",
			colorPrimaryActive: "#f3a52f",
			colorPrimaryHover: "#f3a52f",
			fontSize: 14,
			fontWeightStrong: 700,
			lineHeight: 1.4,
		},
	},
	hashed: false,
}

// const modalStore = useModalStore();

const authStore = useAuthStore()
// 반응형 객체로 변환
const { getLoginId, getCompanyCode } = storeToRefs(authStore)

const { setModalVisible, getModals } = useAntModals()
const router = useRouter()
const route = useRoute()
const { menu } = useMenus()

const closeAllModals = () => {
	// console.log("closeAllModals" ,  Modal.destroyAll.apply([1]) )
	Object.keys(getModals).forEach((key) => {
		setModalVisible(key, false)
	})
}

// 라우터 변경 시 모달 닫기
router.afterEach(async () => {
	// window.location.reload();
	closeAllModals()
	// setRedirect(route.path)
})

// 컴포넌트 마운트 시 모달 닫기
onMounted(async () => {
	await menu(getLoginId.value, getCompanyCode.value)
	closeAllModals()
})

// 컴포넌트 언마운트 시 모달 닫기
onBeforeUnmount(() => {
	closeAllModals()
})
</script>

<template>
	<a-style-provider
		:transformers="[legacyLogicalPropertiesTransformer, px2rem]"
		autoClear
	>
		<a-config-provider :theme="themeConfig" prefixCls="eacc" :locale="antLocale">
			<keep-alive>
				<NuxtLayout>
					<NuxtPage />
				</NuxtLayout>
			</keep-alive>
		</a-config-provider>
	</a-style-provider>
</template>
