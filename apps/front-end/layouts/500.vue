<template>
	<a-layout class="error-layout">
		<a-result
			title="서버에 문제가 발생했습니다."
			sub-title="서버 오류가 발생했습니다. 잠시 후 다시 시도해 주시기 바랍니다."
		>
			<template #extra>
				<slot />
			</template>
			<template #icon>
				<img src="assets/img/500.svg" alt="500" />
			</template>
		</a-result>
	</a-layout>
</template>
