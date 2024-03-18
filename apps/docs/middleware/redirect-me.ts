export default defineNuxtRouteMiddleware((to) => {
    const { $config } = useNuxtApp()
    if ($config) {
      console.log('미들웨어 내에서 런타임 구성에 액세스함.')
    }
    console.log('이동경로는', to.path, '페이지 입니다.')
    return '/sample'
  })
  