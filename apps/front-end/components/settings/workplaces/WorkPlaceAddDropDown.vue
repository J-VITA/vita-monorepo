<script setup lang="ts">
import type { MenuProps } from "ant-design-vue"

const emit = defineEmits<{
	(e: "appendWorkplace"): void
	(e: "appendSubWorkplace"): void
}>()

/**
 * 추가 (회사 / 사업장) Menu Item Click 이벤트
 * @param e : onClick Menu Properties
 */
const handleMenuClick: MenuProps["onClick"] = (e) => {
	if (e.key === "1") emit("appendWorkplace")
	else if (e.key === "2") emit("appendSubWorkplace")
}
</script>

<template>
	<a-dropdown>
		<template #overlay>
			<a-menu @click="handleMenuClick">
				<!-- <a-menu-item key="1" class="dropdown-item">
          <UserOutlined />
          회사추가
        </a-menu-item> -->
				<a-menu-item key="2" class="dropdown-item">
					<UserOutlined />
					사업장추가
				</a-menu-item>
			</a-menu>
		</template>
		<a-button>
			추가
			<DownOutlined />
		</a-button>
	</a-dropdown>
</template>
