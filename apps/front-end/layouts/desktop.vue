<script setup lang="ts">

  import DeskTopHeader from '@/components/commons/DeskTopHeader.vue';

  import { ref } from 'vue';
  import { useBreakpoint } from 'vuestic-ui';
  import DeskTopFooter from '@/components/commons/DeskTopFooter.vue';

  const { applyPreset, currentPresetName, colors, getColor } = useColors();

  const darkNavbarColors = computed(() => {
    if (currentPresetName.value === "light") {
      return {
        color: "#e9e9e9",
        textColor: "#000000",
      };
    } else {
      return {
        color: "#FBCAF6",
        textColor: "#ffffff",
      };
    }
  });

  const logoutLoad = ref(false)

  const breakpoints = useBreakpoint()

  const authStore = useAuthStore()
  const { getLoginId, getCompanyCode } = storeToRefs(authStore);
  const [ lnbMenus ] = await Promise.all([
      $http().get(`/api/dashboard/${getCompanyCode.value}/${getLoginId.value}`)
  ]);

  const menus: Array<any> = lnbMenus?.menuList as Array<any>;
  console.log(">>>> ",menus)
  
  function buildTree(data: any, parentMenuNo = "0") {
    const children = data.filter((item: any) => item.upperMenuNo === parentMenuNo).map((item: any) => {
      if(!item.icon) {
        item.icon = 'folder';
      }
      if(!item.isCollapsed) {
        item.isCollapsed = false;
      }
      return item;
    });

    if (children.length === 0) {
      return null;
    }

    return children.map((child:any) => ({
      ...child,
      children: buildTree(data, child.menuNo)
    }));
  }

  const items = ref(buildTree(menus));
  console.log("mesnus " , items)

  const { logout } = useAuth();

  const locales = useLocales()

  const { locale, setLocale } = useI18n()

  const isSidebarVisible = ref(false)
  const isSidebarHover = ref(false)

  watchEffect(() => {
    isSidebarVisible.value = breakpoints.smUp
  })


  const router = useRouter();
  const activeElement = ref('1000000');

  // const items = [
  //   { title: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
  //   { title: '지출관리', icon: 'mail', children: [
  //     { title: '개인경비(카드/현금)', icon: 'send', link: '/test' },
  //     { title: '법인카드', icon: 'drafts', link: '/sample' },
  //   ] },
  //   { title: '전자결재', icon: 'folder', children: [
  //     { title: '전자결재', icon: 'article', link: '/admin' },
  //     { title: '전표내역', icon: 'note', link: '/guest' },
  //   ] },
  // ]

  async function onLogoutClick() {
    try {
      await logout().then(() => {
        logoutLoad.value = true;
      })
      .finally(() => {
        logoutLoad.value = false
      });

      await navigateTo("/");
    } catch (error) {
      console.error(error);
    } finally {
      
    }
  }

  const onLoginClick = async() => {
    console.log("onLoginClick")
    try{
      await navigateTo("/login");

    } catch(error) {
      console.error(error);
    }
  }

  const availableLocales = computed(() => {
    return locales.value
  });

  async function langsChanged (lang: string) {
    await setLocale(lang);
  }

  const switchValue = computed({
    get() { return currentPresetName.value },
    set(value) { 
      applyPreset(value);
    }
  });

  const setSidebarOpen = (isOpen: boolean) => {
    
    if(isOpen) {
      return isSidebarVisible.value = isOpen;
    } 
    if(!isSidebarVisible.value && !isOpen) {
      items.value = items.value.map((x: any, i: number) => { 
        x.isCollapsed = false;

        x.children.map((item: any, i: number) => { 
          item.isCollapsed = false;
          return item;
        })
        return x;
      }) as any;
    }

    return false

  }

  const setMenuItemCollased = (item: any) => {
    items.value = items.value.map((x: any, i: number) => { 
      if(x.menuNo !== item.menuNo) {
        x.isCollapsed = false;
      }

      x.children.map((y: any, i: number) => { 
        if(y.menuNo !== item.menuNo) {
          y.isCollapsed = false;
        }
        return y;
      })
      return x;
    }) as any;
  }
</script>

<template>
  <VaLayout 
  :left="{ fixed: true, absolute: breakpoints.smDown, order: 2, overlay: breakpoints.smDown}"
  :top="{ fixed: true, order: 3 }"
  :bottom="{ fixed: true, order: 4 }">
    <template #top>
      <VaNavbar shadowed color="primary">
        <template #left>
          <VaButton :icon="isSidebarVisible ? 'menu' : 'menu_open'" @click="setSidebarOpen(isSidebarVisible = !isSidebarVisible)" />
          <VaNavbarItem class="font-bold text-lg">
            J-VITA
          </VaNavbarItem>
        </template>
        <template #center>
        </template>
        <template #right>
          <VaNavbarItem>
            <VaSwitch v-model="switchValue" true-value="dark" false-value="light" size="small"
              color="#6B29B5"
              off-color="#ffd300"
              style="--va-switch-checker-background-color: #252723;">
              <template #innerLabel>
                <div class="va-text-center">
                  <VaIcon :name="switchValue === 'dark' ? 'dark_mode' : 'light_mode'"/>
                </div>
              </template>
            </VaSwitch>
          </VaNavbarItem>
          <VaNavbarItem style="width: 20%;">
            <VaSelect
              v-model="locale"
              :options="availableLocales"
              @change="() => langsChanged(locale)"
              :color="switchValue === 'dark' ? '#ffffff' : '#000000'"
              label="언어선택"
              inner-label>
            </VaSelect>
          </VaNavbarItem>
          <VaNavbarItem>
            <VaButton
              :color="darkNavbarColors.textColor"
              round
              icon="settings">
                User
            </VaButton>
          </VaNavbarItem>
          <VaNavbarItem>
            <VaIcon
              :color="darkNavbarColors.textColor"
              name="settings"
            />
          </VaNavbarItem>
        </template>
      </VaNavbar>
    </template>

    <template #left>
      <div style="display: flex; height: 100%;">
        <VaHover 
          v-model="isSidebarHover"
          @update:model-value="setSidebarOpen(isSidebarHover)">
          <VaSidebar 
            width="18rem"
            :minimized="!isSidebarVisible"
            minimized-width="58px">
            <!-- v-model="isSidebarVisible" -->
            <!-- :hoverable="isIcons = isMinimized ? false : true" -->
            <!-- :minimized="isMinimized = !isSidebarVisible" -->
            <VaAccordion
            style="overflow-x: hidden;">
              <template v-for="item in items">
                <VaCollapse
                  v-model="item.isCollapsed"
                  v-if="item.children"
                  :key="item.menuNo + 'collapse'"
                  body-color="#ffffffff"
                  :color="switchValue === 'dark' ? '#000000ff' : '#B97BFF'"
                  @update:model-value="setMenuItemCollased(item)"
                >
                  <template #header="{ value: isCollapsed }">
                    <VaSidebarItem :active="item.children.some((child: any) => child.menuNo == activeElement)">
                      <VaSidebarItemContent>
                        <VaIcon :name="item.icon" />
                        <VaSidebarItemTitle>{{ item.menuNm }}</VaSidebarItemTitle>
                        <VaSpacer />
                        <VaIcon :name="isCollapsed ? 'va-arrow-up' : 'va-arrow-down'" />
                      </VaSidebarItemContent>
                    </VaSidebarItem>
                  </template>
  
                  <template #body>
                    <VaSidebarItem
                      v-for="child in item.children"
                      :key="child.menuNo"
                      :active="child.menuNo == activeElement">
                      <VaSidebarItemContent 
                        :style="isSidebarVisible ? {'padding-left': '30px'} : {}"
                        @click="() => {
                          activeElement = child.menuNo
                          router.push({path: child.programFileNm})
                        }">
                        <VaIcon :name="child.icon" />
                        <VaSidebarItemTitle>{{ child.menuNm }}</VaSidebarItemTitle>
                      </VaSidebarItemContent>
                    </VaSidebarItem>
                    <!-- <VaSidebarItem
                      v-for="child in item.children"
                      :key="child.title"
                      :active="!(child.link == activeElement)">
                      <NuxtLink custom :to="child.link">
                        <template #default="{ href, navigate }">
                          <VaSidebarItemContent 
                          :style="isSidebarVisible ? {'padding-left': '30px'} : {}"
                          @click="() => {
                            activeElement = child.link
                            navigate()
                          }">
                            <VaIcon :name="child.icon" />
                            <VaSidebarItemTitle>{{ child.title }}</VaSidebarItemTitle>
                          </VaSidebarItemContent>
                        </template>
                      </NuxtLink>
                    </VaSidebarItem> -->
                  </template>
                </VaCollapse>
  
                <VaSidebarItem
                  v-else
                  :key="item.menuNo + 'item'"
                  :active="item.menuNo == activeElement"
                  @click="activeElement = item.menuNo"
                >
                <NuxtLink custom :to="item.programFileNm">
                  <template #default="{ href, navigate }">
                    <VaSidebarItemContent @click="() => {
                      activeElement = item.menuNo
                      navigate()
                    }">
                      <VaIcon :name="item.icon" />
                      <VaSidebarItemTitle>{{ item }}</VaSidebarItemTitle>
                    </VaSidebarItemContent>
                  </template>
                </NuxtLink>
                </VaSidebarItem>
              </template>
            </VaAccordion>
  
            <VaSpacer />
            <VaDivider />
            <!-- <VaButton :loading="logoutLoad" color="#f34f34" @click="onLogoutClick" :hidden="getLoginId == ''">Logout</VaButton> -->
            
            <VaSidebarItem @click="getLoginId === '' ? onLoginClick() : onLogoutClick()">
              <VaSidebarItemContent>
                <VaIcon :name="getLoginId === '' ? 'login': 'logout'" />
                <VaSidebarItemTitle>{{ getLoginId === '' ? '로그인': '로그아웃' }}</VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
            <!-- <VaSidebarItem
              :active="'/Settings' == activeElement"
              @click="activeElement = '/Settings'">
              <VaSidebarItemContent>
                <VaIcon name="settings" />
                <VaSidebarItemTitle>시스템설정</VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem> -->
          </VaSidebar>
        </VaHover>
      </div>
    </template>

    <template #content>
      <main>
        <article>
          <slot />
        </article>
      </main>
    </template>
    <!-- <template #bottom>
      <DeskTopFooter/>
    </template> -->
  </VaLayout>
</template>