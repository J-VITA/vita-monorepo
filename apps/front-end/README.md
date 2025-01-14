# Nuxt 프로젝트

## 프로젝트 시작

개발환경 실행

```bash
pnpm dev:local
```

브라우저에서 해당 포트(3000)을 열어 결과 확인하기. [http://localhost:3000](http://localhost:3000)

## Learn More

Next.js에 대해 더 자세히 알아보려면 다음 리소스를 참고하세요:

- [NuxtJs Official documentation](https://nuxt.com/docs/getting-started/introduction) - 프로덕션급 풀스택 웹 앱과 웹사이트를 만들기 위한 Nuxt의 기능과 API에 대해 알아보세요.

## Vercel 배포하기

Vercel 플랫폼을 사용하여 Nuxt 프로젝트를 쉽게 배포할 수 있습니다. [Vercel Platform](https://vercel.com/new?utm_source=github.com&utm_medium=referral&utm_campaign=turborepo-readme).

자세한 내용 확인 [Nuxt deployment documentation](https://vercel.com/docs/frameworks/nuxt)

# Nuxt.js Configuration Guide
## 기본 설정
```typescript
export default defineNuxtConfig({
  devtools: { enabled: false },
  telemetry: false,
  ssr: true
})
```

## 주요 기능 설정
```typescript
experimental: {
  asyncContext: true,    // 중첩된 컴포저블에서 비동기 컨텍스트 사용
  asyncEntry: true,      // Vue 번들의 비동기 진입점 생성
  externalVue: true,     // Vue 관련 패키지 외부화
  renderJsonPayloads: true,
  noVueServer: true,
  crossOriginPrefetch: true
}

```

## Nitro 설정
```typescript
nitro: {
  prerender: {
    crawlLinks: true,
    ignore: ["/api"]
  },
  routeRules: {
    "/**": {
      ssr: process.env.NODE_ENV === "production" ? true : false,
      prerender: process.env.NODE_ENV === "production" ? false : true
    }
  }
}
```

## 라우터 설정
```typescript
router: {
  options: {
    scrollBehaviorType: "smooth",
    hashMode: process.env.NODE_ENV ? false : true
  }
}
```

# 모듈 및 플러그인
## 설치된 모듈
  - @pinia/nuxt
  - @pinia-plugin-persistedstate/nuxt
  - nuxt-mapbox
  - @nuxtjs/i18n
  - nuxt-lodash
  - dayjs-nuxt
  - @ant-design-vue/nuxt

## 빌드 설정
```typescript
build: {
  transpile: [
    "ag-grid-vue",
    "pinia-plugin-persistedstate",
    "@ant-design/icons-vue",
    "lodash"
  ]
}
```

## 환경 변수 설정
```typescript
runtimeConfig: {
		apiKey: process.env.API_KEY,
		cookieName: "__session",
		cookieSecret: "secret",
		cookieExpires: ONE_DAY.toString(),
		cookieRememberMeExpires: ONE_WEEK.toString(),
		public: {
			apiBase: `${process.env.NUXT_PUBLIC_API_BASE}/api`,
			wsEndpoint: `${process.env.NUXT_PUBLIC_WEBSOCKET_HOST}`,
			environment: "",
			openRouteServiceApiKey: "코드 참고",
			kakaoAppKey: "코드 참고",
		},
	},
```

## 페이지 트랜지션
```typescript
app: {
  pageTransition: {
    name: "slide-left",
    mode: "out-in"
  },
  layoutTransition: {
    name: "fade",
    mode: "out-in"
  }
}
```

## TypeScript 설정
```typescript
typescript: {
  strict: true
}
```

* 위 설정들은 운영/개발 환경에서 각각 다르게 동작하고, SSR과 CSR 환경에 따라 적적히 전활 할 수 있도록 설정되어있음.