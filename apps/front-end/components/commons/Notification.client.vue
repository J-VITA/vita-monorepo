<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { useWebSocket } from "@vueuse/core"

const authStore = useAuthStore()
const { getUserId } = storeToRefs(authStore)

const types: { [key: string]: string } = {
	warning: "error",
	success: "check_circle",
	error: "cancel",
	info: "info",
} as const

interface DataItem {
	type: "warning" | "success" | "error" | "info"
	title: string
	description: string
	timestamp: number
	url?: string
}

const data = ref<DataItem[]>([
	{
		type: "warning",
		title: "회계마감",
		description: "2024년 3월 회계마감되었습니다. ",
		timestamp: 1719282806,
	},
	{
		type: "error",
		title: "결재반려",
		description: '"2023년 2월 지출결의서" 문서가 반려되었습니다.',
		timestamp: 1719279206,
	},
	{
		type: "success",
		title: "결재승인",
		description: '"2023년 1월 지출결의서" 문서가 결재 최종승인되었습니다.',
		timestamp: 1719261206,
	},
	{
		type: "info",
		title: "결재의견",
		description: "결재문서에 새로운 의견이 달렸습니다.",
		timestamp: 1719196406,
	},
])

const config = useRuntimeConfig()
const wsUrl = computed(() => {
	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
	return `${protocol}//${config.public.websocketHost || window.location.host}/_ws?userId=${getUserId.value}`
})

const {
	status,
	data: webSocketData,
	send,
	open,
	close,
} = useWebSocket(() => wsUrl.value, {
	autoReconnect: {
		retries: 3,
		delay: 1000,
	},
	onConnected: (ws: any) => {
		// console.log('WebSocket connected in Notification component', ws);
	},
	onMessage: (ws: any, event: any) => {
		try {
			const data = JSON.parse(event.data)
			if (data.type === "notification") {
				message.info(data.content)
			} else if (data.type === "broadcast") {
				message.info(data.content)
			} else if (data.type === "private_message") {
				message.success(data.content)
			}
		} catch (error) {
			console.error("Error parsing WebSocket message:", error)
		}
	},
})

// 컴포넌트가 마운트될 때 연결
onMounted(() => {
	setTimeout(() => {
		open()
	}, 1000) // 1초 지연 후 연결 시도open();
})

// 컴포넌트가 언마운트될 때 연결 종료
onUnmounted(() => {
	close()
})

// watch(status, (newStatus) => {
//   if (newStatus === 'CLOSED') {
//     message.error('WebSocket 연결이 종료되었습니다. 재연결을 시도합니다.');
//     setTimeout(() => open(), 5000);
//   }
// });
</script>
<template>
	<a-dropdown :trigger="['click']" :arrow="{ pointAtCenter: true }">
		<a-badge dot>
			<a-button
				type="text"
				:icon="materialIcons('mso', 'notifications')"
				class="ico-btn"
				@click.prevent
			/>
		</a-badge>
		<template #overlay>
			<div class="dropdown-contents">
				<a-list
					size="small"
					item-layout="vertical"
					class="notify-list"
					:data-source="data"
				>
					<template #renderItem="{ item }">
						<a-list-item>
							<a-list-item-meta>
								<template #title>
									<a :href="item.url">
										{{ item.title }}
									</a>
								</template>
								<template #avatar>
									<i
										:class="[
											'material-symbols-outlined notranslate',
											`text-${item.type}`,
										]"
									>
										{{ types[item.type] }}
									</i>
								</template>
								<template #description>
									<p>{{ item.description }}</p>
									<div>{{ item.timestamp }}</div>
								</template>
							</a-list-item-meta>
						</a-list-item>
					</template>
					<template #header>최근알림</template>
					<template #footer>
						<a-typography-link href="" target="_blank">
							지난 알림 모두보기
						</a-typography-link>
					</template>
				</a-list>
			</div>
		</template>
	</a-dropdown>
</template>
