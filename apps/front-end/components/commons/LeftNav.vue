<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { MenuProps } from "ant-design-vue"
import { Response } from "@/types"
import type { Data } from "@/types/master/config"

const menusStore = useMenusStore()
const { getMenus } = storeToRefs(menusStore)
const router = useRouter()
const route = useRoute()
const isAdmin = useAdmin()
const isRoot = useRoot()

const props = withDefaults(
	defineProps<{
		theme: MenuProps["theme"]
	}>(),
	{}
)

const { getRules } = useExpenseRules()
const { $bus } = useNuxtApp()

const projectFlag = ref<boolean>(false)
const oilFlag = ref<boolean>(false)
const familyEventFlag = ref<boolean>(false)
const businessTripFlag = ref<boolean>(false)
const erpCodeMappingFlag = ref<boolean>(false)

const selectedKeys = ref<(number | string)[]>(["/"])
const opendKeys = ref<(number | string)[]>([])

const handleClick: MenuProps["onClick"] = (e) => {
	if (e.key.toString().indexOf("/") > -1) {
		// router.push(e.key.toString());
		handleNavigation(e.key.toString())
	}
}

/**
 * 사이드바 메뉴 openKeys Change
 * @param keys
 */
const openChange = (keys: any) => {
	opendKeys.value = [keys.at(-1)]
}

const currentIdx = computed(() => {
	return router.currentRoute.value.fullPath.indexOf("/settings") > -1 ? 1 : 0
})

/**
 * 현재 경로에서 페이지가 세그먼트로 작성되어져있는지 체크해서 세그먼트는 제거해주고 경로를 반환
 */
const currentPathWithoutDynamicSegment = computed(() => {
	const matchedRoute =
		router.currentRoute.value.matched[router.currentRoute.value.matched.length - 1]
	const routePath = matchedRoute.path
	const currentPath = router.currentRoute.value.path

	// 동적 세그먼트가 있는지 확인
	if (routePath.includes(":") || routePath.includes("*")) {
		// params 객체에서 동적 세그먼트에 해당하는 값이 있는지 확인
		const dynamicSegmentKey = Object.keys(router.currentRoute.value.params)[0]
		const dynamicSegmentValue = router.currentRoute.value.params[dynamicSegmentKey]
		// 동적 세그먼트 값이 있을 때만 마지막 세그먼트 제거
		if (dynamicSegmentValue) {
			const dynamicCurrentSegmentValue = currentPath.split("/").slice(0, -1).join("/")
			if (dynamicCurrentSegmentValue === "/approvals") {
				return "/approvals/home"
			}
			return dynamicCurrentSegmentValue
		}
	}
	return currentPath
})

/**
 * 메뉴 키 관련 셋업
 */
const setMenuExpand = () => {
	// 현재 페이지의 메뉴 키 초기 설정
	selectedKeys.value = [currentPathWithoutDynamicSegment.value]

	const loop = (data: any, key: string = "id", id: string | number, callback: any) => {
		data.forEach((item: any, index: number) => {
			if (item[key] === id) {
				return callback(item, index, data)
			}
			if (item.children) {
				return loop(item.children, key, id, callback)
			}
		})
	}
	// 메뉴 펼치는 오픈키 설정 시작
	let parentId = 0
	loop(
		getMenus.value.menus,
		"path",
		currentPathWithoutDynamicSegment.value,
		(item: any, index: number, arr: Array<any>) => {
			parentId = item.parentId
		}
	)

	if (parentId) {
		loop(
			getMenus.value.menus,
			"id",
			parentId,
			(item: any, index: number, arr: Array<any>) => {
				opendKeys.value = [index]
			}
		)
	}
}

const setMasterSubMenusOpend = async () => {
	const rules = await getRules().then((res: Response<Data>) => res.data)
	projectFlag.value = rules?.projectFlag || false
	oilFlag.value = rules?.oilFlag || false
	familyEventFlag.value = rules?.familyEventFlag || false
	businessTripFlag.value = rules?.businessTripFlag || false
	erpCodeMappingFlag.value = rules?.erpCodeMappingFlag || false
}

const masterMenuDisabled = (path: string) => {
	return (
		(path == "/master/project" && !projectFlag.value) ||
		(path == "/master/fuels" && !oilFlag.value) ||
		(path == "/master/family-events" && !familyEventFlag.value) ||
		(path == "/master/perdiem" && !businessTripFlag.value)
	)
}

// 라우터 변경 시
router.afterEach(async () => {
	setMenuExpand()
})

onBeforeMount(async () => {
	setMenuExpand()
	setMasterSubMenusOpend()
})

const handleNavigation = async (path: string) => {
	try {
		await navigateTo(path)
	} catch (error) {
		console.error("Navigation error:", error)
	}
}

onMounted(() => {
	$bus.on("setMasterSubMenusOpend", setMasterSubMenusOpend)
})

onUnmounted(() => {
	$bus.off("setMasterSubMenusOpend")
})
</script>
<template>
	<a-layout v-if="getMenus.menus[currentIdx] && route.path !== '/dashboard'">
		<div>
			<template v-for="(item, idx) in getMenus.menus[currentIdx].children" :key="idx">
				<a-menu
					v-if="item.path !== '/dashboard'"
					v-model:selectedKeys="selectedKeys"
					v-model:openKeys="opendKeys"
					:theme="props.theme"
					mode="inline"
					@click="handleClick"
					@openChange="openChange"
				>
					<a-sub-menu v-if="item.children && item.children.length > 0" :key="idx">
						<template #icon>
							<span class="material-symbols-outlined notranslate">{{
								item.relateImageName ? item.relateImageName : ""
							}}</span>
						</template>
						<template #title>
							<span>{{ item.name }}</span>
						</template>
						<template #default>
							<div v-for="(sub, sIdx) in item.children" :key="sIdx">
								<a-menu-item :key="sub.path" :disabled="masterMenuDisabled(sub.path)">
									<component
										:is="
											materialIcons('mso', sub.relateImageName ? sub.relateImageName : '')
										"
									></component>
									{{ sub.name }}
								</a-menu-item>
							</div>
						</template>
					</a-sub-menu>
					<a-menu-item v-else :key="item.path">
						<template #icon>
							<component
								:is="
									materialIcons('mso', item.relateImageName ? item.relateImageName : '')
								"
							></component>
						</template>
						{{ item.name }}
					</a-menu-item>
				</a-menu>
			</template>
			<template v-if="isRoot && currentIdx === 1">
				<a-menu
					v-model:selectedKeys="selectedKeys"
					@click="handleClick"
					:theme="props.theme"
					mode="inline"
					@openChange="openChange"
				>
					<a-menu-item key="/settings/menu">
						<template #icon>
							<component :is="materialIcons('mso', 'list')" />
						</template>
						메뉴관리
					</a-menu-item>
					<a-menu-item key="/settings/excel-form">
						<template #icon>
							<component :is="materialIcons('mso', 'table_convert')" />
						</template>
						엑셀양식관리
					</a-menu-item>
				</a-menu>
			</template>
		</div>

		<a-layout-footer v-if="isAdmin && getMenus.menus[currentIdx == 0 ? 1 : 0]?.path">
			<a-button
				class="full-width"
				:type="theme === 'light' ? 'primary' : undefined"
				ghost
				@click="handleNavigation(getMenus.menus[currentIdx == 0 ? 1 : 0].path)"
				>{{ getMenus.menus[currentIdx == 0 ? 1 : 0].name }}</a-button
			>
		</a-layout-footer>
	</a-layout>
</template>
