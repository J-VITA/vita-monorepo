<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { SelectProps, MenuProps } from "ant-design-vue"
import type { UsersManagement } from "@/types/settings/user"
import UsersTable from "@/components/settings/user/UsersTable.vue"
import UserAddtionModal from "@/components/settings/user/UserAddtionModal.vue"
import type { Dayjs } from "dayjs"
import { type Response, pageSizeOptions, dateTimeFormat } from "@/types"

definePageMeta({
	name: "사용자관리",
})

const usersTable = useTemplateRef<{ onGridDestroyed: () => void }>("usersTable")
const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getWorkplaceId, getWorkplaceCode, getRole } =
	storeToRefs(authStore)

const route = useRoute()
const routePath = computed(() => route.path)

interface ISearchFrom {
	filterLabel:
		| "keyword"
		| "name"
		| "employeeNumber"
		| "positionName"
		| "titleName"
		| "departmentName"
	filterText: string
	state: SelectProps["value"] | undefined
}

interface IUserSearch {
	companyCode?: string //회사코드
	companyId?: number
	workplaceId?: number
	workplaceCode?: number | string
	workplaceName?: string
	keyword?: string | undefined //키워드
	page: number
	size: number
	employeeNumber?: string | undefined //사번
	name?: string | undefined //이름
	departmentName?: string | undefined //부서명
	titleName?: string | undefined //직책명
	positionName?: string | undefined //직위명
	roleCode?: string | undefined //권한코드
	roleName?: string | undefined //권한명
	memberStatusName?: string | undefined //상태코드
	memberStatusLabel?: string | undefined //상태명
	serveStatusTypeName?: string | undefined //재직상태코드
	searchDateFrom?: string | undefined //가입일 범위: 시작
	searchDateTo?: string | undefined //가입일 범위: 종료
}

const modelRef = ref<ISearchFrom>({
	filterLabel: "keyword",
	filterText: "",
	state: undefined,
})

const initSearchParams = {
	companyCode: getCompanyCode.value, //회사코드
	companyId: getCompanyId.value, //회사아이디
	workplaceId: getWorkplaceId.value, //사업장아이디
	workplaceCode: getWorkplaceCode.value, //사업장코드
	workplaceName: "없음",
	keyword: "", //키워드
	page: 1,
	size: 10,
	employeeNumber: "", //사번
	name: "", //이름
	departmentName: "", //부서명
	titleName: "", //직책명
	positionName: "", //직위명
	roleCode: "", //권한코드
	roleName: "", //권한명
	memberStatusName: "ACTIVE", //상태코드
	memberStatusLabel: "사용중", //상태명
	serveStatusTypeName: "", //재직상태
	searchDateFrom: "", //가입일 범위:시작
	searchDateTo: "", //가입일 범위:종료
} as IUserSearch

const selectedRowKeys = ref<number[] | undefined>([])
const filterDate = ref<[Dayjs, Dayjs]>()
const searchParams = ref(initSearchParams)
const isExpand = ref<boolean>(false)
const showed = ref(false)
const userData = ref<Array<UsersManagement>>([])

/**
 * 사용자 직접등록 모달 오픈
 */
const userPopOpen = () => {
	showed.value = true
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const theme = ref("alpine")
const filterOptions = ref<SelectProps["options"]>([
	{ label: "전체", value: "keyword" },
	{ label: "부서", value: "departmentName" },
	{ label: "이름", value: "name" },
	{ label: "사번", value: "employeeNumber" },
	{ label: "직위", value: "positionName" },
	{ label: "직책", value: "titleName" },
])

/**
 * 폼 검색
 */
const onSearch = async (form: ISearchFrom) => {
	users.value = []
	selectedRowKeys.value = []

	await nextTick(() => {
		searchParams.value.keyword = undefined
		searchParams.value.departmentName = undefined
		searchParams.value.name = undefined
		searchParams.value.employeeNumber = undefined
		searchParams.value.positionName = undefined
		searchParams.value.titleName = undefined

		if (form.filterLabel) {
			if (form.filterLabel === "name") {
				searchParams.value[form.filterLabel] = form.filterText
			} else if (form.filterLabel === "keyword") {
				searchParams.value[form.filterLabel] = form.filterText
			} else if (form.filterLabel === "departmentName") {
				searchParams.value[form.filterLabel] = form.filterText
			} else if (form.filterLabel === "employeeNumber") {
				searchParams.value[form.filterLabel] = form.filterText
			} else if (form.filterLabel === "positionName") {
				searchParams.value[form.filterLabel] = form.filterText
			} else if (form.filterLabel === "titleName") {
				searchParams.value[form.filterLabel] = form.filterText
			}
		}
	})
}

const companyCodeUpdate = (value: any) => {
	searchParams.value.companyCode = value.code
	searchParams.value.companyId = value.id
}

const workplaceCodeUpdate = (value: any) => {
	searchParams.value.workplaceId = value.id
	searchParams.value.workplaceCode = value.workplaceCode
	searchParams.value.workplaceName = value.workplaceName
}

onMounted(() => {
	filterDate.value = [useMonth.lastFrom(), useMonth.to()]
})

/**
 * 선택 유저 타입 지정
 */
type selectUsers = (data: Array<UsersManagement> | undefined | []) => void
/**
 * 선택 유저 상태 관리
 */
const users = ref<Array<UsersManagement> | undefined | []>()
/**
 * 그리드내에서 선택 했을 때의 해당 유저 셋업 이벤트
 * @param data
 */
const setUsers: selectUsers = (data?: Array<UsersManagement>) => {
	users.value = data
	selectedRowKeys.value = data?.map((element) => {
		return element.id
	})
}

/**
 * 임직원 정보 수정 상태 타입
 */
type PutTypes =
	| "PENDING" /** 승인대기 */
	| "ACTIVE" /** 활성 */
	| "INACTIVE" /** 비활성 */
	| "SUSPENDED" /** 일시정지 */
	| "LEFT" /** 탈퇴 */
type PutUsers = (data: Array<UsersManagement> | undefined | [], type: PutTypes) => void

const stopUserStauts = async (ids: (string | number)[]) => {
	const idArr = new Set(ids)
	for (const id of idArr) {
		await useCFetch<Response<any>>(`/api/v2/settings/employees/members/disable`, {
			method: "PATCH",
			body: {
				id,
			},
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				onSearch(modelRef.value)
			}
		})
	}
}

const reuseUserStauts = async (ids: (string | number)[]) => {
	const idArr = new Set(ids)
	for (const id of idArr) {
		await useCFetch<Response<any>>(`/api/v2/settings/employees/members/enable`, {
			method: "PATCH",
			body: {
				id,
			},
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				onSearch(modelRef.value)
			}
		})
	}
}

/**
 * 변경할 사용자 상태관리
 */
const updateUser = ref(undefined)

/**
 * 사용자 추가 모달 수정할 데이터가 존재하면 params 세팅
 * @param params
 */
const showUserModal = (params?: any) => {
	console.log("params ; ", params)
	if (params) {
		updateUser.value = params
		showed.value = true
	} else {
		updateUser.value = undefined
	}
	return showed.value
}
const closeUserAddtionModal = (closed: boolean) => {
	// <!-- (showed = closed) -->
	showed.value = closed
	if (!closed) {
		updateUser.value = undefined
	}
}

const userRegisterSubmitted = (form: any) => {
	console.log("Register", form)
}

// onActivated(() => {
//   usersTable.value?.onGridDestroyed();
// });

onMounted(() => {
	usersTable.value?.onGridDestroyed()
})
</script>
<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				사용자 신규등록/사용중지/탈퇴등의 관리를 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false" :model="searchParams">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="회사">
							<eacc-select
								:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
								:on-all-field="false"
								v-model:value="searchParams.companyCode"
								:field-names="{ label: 'name', value: 'code' }"
								:disabled="getRole !== 'ROOT'"
								value-type="any"
								@update:any-value="companyCodeUpdate"
							>
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="사업장">
							<eacc-select
								:url="`/api/v2/settings/companies?parentId=${searchParams.companyId}`"
								:on-all-field="false"
								:refresh="true"
								v-model:value="searchParams.workplaceCode"
								:first="true"
								:field-names="{
									label: 'workplaceName',
									value: 'workplaceCode',
								}"
								value-type="any"
								@update:any-value="workplaceCodeUpdate"
							>
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="가입일">
							<a-range-picker
								v-model:value="filterDate"
								:value-format="dateTimeFormat"
								@change="
									(_, dateString) => {
										searchParams.searchDateFrom = dateString[0]
										searchParams.searchDateTo = dateString[1]
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="사용상태">
							<eacc-select
								url="/api/v2/settings/employees/types/memberStatus"
								v-model:value="searchParams.memberStatusName"
								:field-names="{ label: 'label', value: 'code' }"
								@update:value="(value) => (searchParams.memberStatusName = value)"
								style="width: 100px"
							>
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="재직상태">
							<eacc-select
								url="/api/v2/settings/employees/types/serveStatusType"
								v-model:value="searchParams.serveStatusTypeName"
								:field-names="{ label: 'label', value: 'code' }"
								@update:value="(value) => (searchParams.serveStatusTypeName = value)"
								style="width: 100px"
							>
							</eacc-select>
						</a-form-item>
					</a-col>
					<a-col>
						<a-form-item label="검색">
							<a-input-group compact class="filter">
								<a-select
									v-model:value="modelRef.filterLabel"
									:options="filterOptions"
									@change="onSearch(modelRef)"
									placeholder="선택"
								/>
								<a-input
									v-model:value="modelRef.filterText"
									@press-enter="onSearch(modelRef)"
									placeholder="검색"
								/>
							</a-input-group>
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<eacc-button
								component-is="search"
								:modal-open="false"
								:data="modelRef"
								@click="onSearch"
							/>
						</a-space>
					</a-col>
				</a-row>
			</a-form>
			<a-divider class="my-md" />
			<div :class="['grid-area', { expand: isExpand }]">
				<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
					<a-col>
						<a-space :size="5">
							<a-button
								:icon="materialIcons('mso', isExpand ? 'zoom_in_map' : 'zoom_out_map')"
								@click="onExpand"
							>
								{{ isExpand ? "축소" : "확대" }}
							</a-button>

							<eacc-button
								component-is="reuse"
								:data="selectedRowKeys"
								:modal-open="true"
								:disabled="selectedRowKeys?.length === 0"
								@click="reuseUserStauts"
							/>
							<eacc-button
								component-is="stopUse"
								:data="selectedRowKeys"
								:modal-open="true"
								:disabled="selectedRowKeys?.length === 0"
								@click="stopUserStauts"
							/>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<eacc-excel-button
								req-type="download"
								label="엑셀다운로드"
								file-name="사용자관리"
								:data="userData"
								:disabled="!userData || userData.length === 0"
							/>
							<eacc-excel-button
								ghost
								type="primary"
								url="/api/v2/settings/employees/validate"
								req-type="upload"
								label="일괄등록"
								:sample-file-key="routePath"
								@submit="() => usersTable?.onGridDestroyed()"
							/>
							<a-button
								type="primary"
								:icon="materialIcons('mso', 'person_add')"
								@click="userPopOpen"
							>
								사용자 등록
							</a-button>

							<a-select
								v-model:value="searchParams.size"
								:options="pageSizeOptions"
								@change="
									(params) => {
										searchParams.page = 1
									}
								"
								value-field="key"
								text-field="label"
							/>
						</a-space>
					</a-col>
				</a-row>
				<users-table
					ref="usersTable"
					:is-expand="isExpand"
					:search-params="searchParams"
					:sizeOption="pageSizeOptions"
					:theme="theme"
					@open-modal="(params: any) => showUserModal(params)"
					@row-selected="setUsers"
					@on-grid-destroyed=""
					@user-data="(value: any) => (userData = value)"
				>
				</users-table>
			</div>
		</template>
		<template #modal>
			<user-addtion-modal
				class="modal"
				:update-user="updateUser"
				:showed="showUserModal()"
				@closed="(closed: any) => closeUserAddtionModal(closed)"
				@submit="(form: any) => userRegisterSubmitted(form)"
				@refresh="onSearch(modelRef)"
			></user-addtion-modal>
		</template>
	</page-layout>
</template>
