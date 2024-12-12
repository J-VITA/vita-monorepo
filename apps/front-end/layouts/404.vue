<template>
	<a-layout class="error-layout">
		<a-result
			status="error"
			title="페이지를 찾을 수 없습니다."
			sub-title="존재하지 않는 주소를 입력하셨거나, 요청하신 페이지를 찾을 수 없습니다."
		>
			<template #extra>
				<slot />
			</template>
			<template #icon>
				<img src="assets/img/404.svg" alt="404" />
			</template>
		</a-result>
	</a-layout>
</template>
