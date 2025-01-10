<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
interface DataItem {
	title: string
	url: string
	icon: string
}

const data = ref<DataItem[]>([
	{ title: "도움말 가이드", url: "", icon: "info" },
	{ title: "사내규정집 다운로드", url: "", icon: "developer_guide" },
	{ title: "자주묻는질문", url: "", icon: "quiz" },
	{ title: "고객센터", url: "", icon: "support_agent" },
])
</script>
<template>
	<a-dropdown :trigger="['click']" placement="bottom" :arrow="{ pointAtCenter: true }">
		<a-button
			type="text"
			:icon="materialIcons('mso', 'help')"
			class="ico-btn"
			@click.prevent
		/>
		<template #overlay>
			<div class="dropdown-contents">
				<a-list size="small" item-layout="vertical" :data-source="data">
					<template #renderItem="{ item }">
						<a-list-item class="dropdown-menu">
							<a :href="item.url" class="dropdown-menu-link">
								<i class="material-symbols-outlined notranslate">
									{{ item.icon }}
								</i>
								<span>{{ item.title }}</span>
							</a>
						</a-list-item>
					</template>
					<template #header>도움말</template>
				</a-list>
			</div>
		</template>
	</a-dropdown>
</template>
