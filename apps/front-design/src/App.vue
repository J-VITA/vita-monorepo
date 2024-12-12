<template>
	<header>
		<img alt="Vue logo" class="logo" src="./assets/logo-white.png" />
	</header>

	<main>
		<h3>일진 전자전표 고도화 솔루션 2.0 디자인 퍼블 화면</h3>
		<div>
			<a href="/public/html/main/dashboard.html">대시보드 이동</a>
		</div>
	</main>
</template>

<style scoped>
header {
	line-height: 1.5;
}

.logo {
	display: block;
	margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
	header {
		display: flex;
		place-items: center;
		padding-right: calc(var(--section-gap) / 2);
	}

	.logo {
		margin: 0 2rem 0 0;
	}

	header .wrapper {
		display: flex;
		place-items: flex-start;
		flex-wrap: wrap;
	}
}
</style>
