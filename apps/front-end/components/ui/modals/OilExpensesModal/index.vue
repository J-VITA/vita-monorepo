<script setup lang="ts">
import MapBoxTest from "@/components/commons/MapBoxTest.vue"
import { type OilExpensesFormData } from "@/types/expenses"
import { AccountParams } from "@/types/budgets"
import type { IAddr } from "@/types"

const { show = false } = defineProps<{
	show: boolean
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

interface Place {
	place_name: string
	road_address_name?: string
	address_name: string
	phone?: string
	x: string
	y: string
}

interface Pagination {
	page?: number
	size?: number
	last?: number
	current?: number
	total?: number
}

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const appStore = useAppsStore()
const { getCompanyCode, getWorkplaceCode, getEmployeeId, getCostCenterId } =
	storeToRefs(authStore)
const { loading } = storeToRefs(appStore)
const formData = ref<OilExpensesFormData>({
	searchDate: $dayjs(),
	perdiemName: undefined,
	perdiemPath: undefined,
	department: undefined,
	stopover: [""],
	arrival: undefined,
	roundTripFlag: false,
	distance: undefined,
	fuelType: undefined,
	costStandard: undefined,
	cost: undefined,
	description: undefined,
	accountId: undefined,
	projectId: undefined,
})
const accountSearchParams = ref<AccountParams>({
	companyCode: getCompanyCode.value,
	used: true,
})

// 검색 결과를 저장할 상태 변수
const places = ref<Place[]>([])
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const isRead = ref<boolean>(false)
const files = ref<string[]>([])
const documents = ref<string[]>([])
const departmentCoordinate = ref<[number, number] | undefined>(undefined)
const arrivalCoordinate = ref<[number, number] | undefined>(undefined)
const stopoverCoordinates = ref<[number, number][]>([])
const mapData = ref<string[]>([])
// 장소 검색 객체 생성
// const ps = new window.kakao.maps.services.Places();
/**
 * 계정항목 목록 조회
 * @param accountData
 */
const {
	data: accountData,
	status: accountStatus,
	refresh: accountRefresh,
} = await useAsyncData(`oil-expenses-account-list`, () =>
	useCFetch<any>("/api/v2/master/accounts", {
		method: "GET",
		params: {
			...accountSearchParams.value,
		},
	}).then((res: any) => res.data)
)

const modalCancle = async (value: any) => {
	open.value = false
	initPlace()
}

const onSubmit = async (value: any) => {
	console.log("formData 저장 : ", formData.value)
}

const updateSlipFile = (value: any) => {
	console.log(`updateSlipFile : `, value)
}

const initPlace = () => {
	places.value = []
}

const onCoordinateData = (value: number) => {
	formData.value.distance = value
}

const onDoubleDistance = () => {
	if (!formData.value.distance) return
	formData.value.distance = formData.value.roundTripFlag
		? formData.value.distance * 2
		: formData.value.distance / 2
}

const addStopover = () => {
	if (!formData.value.stopover) return
	if (formData.value.stopover.length < 10) {
		formData.value.stopover.push("")
		stopoverCoordinates.value.push([0, 0])
	} else {
		message.warning("경유지는 최대 10개까지 추가할 수 있습니다.")
	}
}

const removeStopover = (index: number) => {
	if (!formData.value.stopover) return

	if (formData.value.stopover.length > 1) {
		formData.value.stopover = formData.value.stopover.splice(index, 1) // 경유지 삭제
		stopoverCoordinates.value = stopoverCoordinates.value.splice(index, 1) // 좌표도 삭제
	} else {
		formData.value.stopover[0] = ""
		stopoverCoordinates.value = []
	}
}

const updateStopover = (idx: number, newValue: any) => {
	if (!formData.value.stopover) return
	formData.value.stopover[idx] = newValue.target.value // 해당 인덱스의 값을 수정
	console.log("formData :", formData.value.stopover)
}

const onSearchModal = async (type: string): Promise<void> => {
	try {
		new window.daum.Postcode({
			oncomplete: async function (data: IAddr) {
				if (formData.value) {
					if (type == "D") {
						formData.value.department = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress)
						departmentCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type == "A") {
						formData.value.arrival = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress)
						arrivalCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type.startsWith("S")) {
						if (!formData.value.stopover) return
						const index = parseInt(type.slice(1)) // 경유지 인덱스
						formData.value.stopover[index] = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress)
						if (stopoverCoordinates.value[index]) {
							stopoverCoordinates.value[index] = [
								mapData.documents[0].x,
								mapData.documents[0].y,
							]
						} else {
							stopoverCoordinates.value.push([
								mapData.documents[0].x,
								mapData.documents[0].y,
							])
						}
					}
					//   data.roadAddress; 도로명
					//   data.jibunAddress; 지번
				}
			},
		}).open({ popupName: "oil-route" })
	} catch (e) {
		console.error(e)
	}
}

const onSearchCoordinate = async (param: string) => {
	const appKey = useRuntimeConfig().public.kakaoAppKey
	const url = new URL("https://dapi.kakao.com/v2/local/search/address.json")
	url.searchParams.append("query", param)
	try {
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `KakaoAK ${appKey}`, // Authorization 헤더 설정
				"Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
			},
		})
		const coordinate = await response.json()
		if (coordinate.documents.length === 0) {
			message.error("좌표 정보가 없습니다. 다른 지역을 선택해주세요.")
			formData.value.department = ""
			return []
		}
		return coordinate
	} catch (error) {
		console.error("카카오 API 요청 오류:", error)
		throw error
	}
}
</script>

<template>
	<a-modal
		:width="'80rem'"
		v-model:open="open"
		:destroy-on-close="false"
		:mask-closable="false"
		:title="'유류대 추가'"
		:keyboard="false"
		@cancel="modalCancle"
	>
		<a-row :gutter="40">
			<a-col :span="11">
				<!-- MapBox 거리 지도 -->
				<div class="mt-xl" :style="{ overflow: 'hidden' }">
					<map-box-test
						:department-coordinate="departmentCoordinate"
						:arrival-coordinate="arrivalCoordinate"
						:stopover-coordinates="stopoverCoordinates"
						@update:value="onCoordinateData"
					/>
				</div>
				<!-- 첨부파일 -->
				<!-- :style="{marginTop: '450px !important'}" -->
				<attachment-file-upload
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="files"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						documentedNumber: '0',
					}"
					@update:file-list="updateSlipFile"
				></attachment-file-upload>
				<!-- 관련문서 -->
				<documents-file-upload
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="documents"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						documentedNumber: '0',
					}"
					@update:file-list="updateSlipFile"
				></documents-file-upload>
			</a-col>
			<a-col :span="13">
				<a-form label-align="left" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
					<a-form-item label="날짜" :rules="[{ required: true }]">
						<a-date-picker v-model:value="formData.searchDate" :format="'YYYY-MM-DD'" />
					</a-form-item>
					<a-form-item label="출장명" :rules="[{ required: true }]">
						<a-select
							:options="[{ label: '선택하세요', value: 1 }]"
							:v-model:value="formData.perdiemName"
						></a-select>
					</a-form-item>
					<a-form-item label="경로선택" :rules="[{ required: true }]">
						<a-select
							:options="[{ label: '선택하세요', value: 1 }]"
							:v-model:value="formData.perdiemPath"
						></a-select>
					</a-form-item>
					<a-form-item label="출발지" :rules="[{ required: true }]">
						<a-input
							v-model:value="formData.department"
							readOnly
							@click="onSearchModal('D')"
						/>
					</a-form-item>
					<a-form-item
						label="경유지"
						v-for="(item, idx) in formData.stopover"
						:key="'turn' + idx"
					>
						<a-input
							:value="item"
							@input="updateStopover(idx, $event)"
							readOnly
							@click="onSearchModal(`S${idx}`)"
						/>
						<a-button @click="addStopover">경유지 추가</a-button>
						<a-button @click="removeStopover(idx)" type="link">삭제</a-button>
					</a-form-item>
					<a-form-item label="도착지" :rules="[{ required: true }]">
						<a-input
							v-model:value="formData.arrival"
							readOnly
							@click="onSearchModal('A')"
						/>
					</a-form-item>
					<a-form-item
						v-if="formData.stopover && formData.stopover[0] == ''"
						label="왕복여부"
					>
						<a-switch
							v-model:checked="formData.roundTripFlag"
							@click="onDoubleDistance"
						/>
					</a-form-item>
					<a-form-item label="주행거리">
						<a-flex>
							<a-input
								type="text"
								v-model:value="formData.distance"
								:disabled="!!formData.perdiemPath"
							/>km
						</a-flex>
					</a-form-item>
					<a-form-item label="지급기준" :rules="[{ required: true }]">
						<a-flex :gap="10">
							<a-input
								type="text"
								v-model:value="formData.costStandard"
								:disabled="!!formData.perdiemPath"
							/>
							<a-select
								:options="[{ label: '선택하세요', value: 1 }]"
								:v-model:value="formData.fuelType"
							></a-select>
						</a-flex>
					</a-form-item>
					<a-form-item label="금액" :rules="[{ required: true }]">
						<a-input
							type="text"
							v-model:value="formData.cost"
							:disabled="!!formData.perdiemPath"
						/>
					</a-form-item>
					<a-form-item label="내용">
						<a-input type="text" v-model:value="formData.description" />
					</a-form-item>
					<a-form-item label="계정과목">
						<a-tree-select
							v-model:value="formData.accountId"
							show-search
							:tree-line="true"
							:dropdown-style="dropdownStyle"
							placeholder="계정항목을 선택해주세요."
							allow-clear
							show-checked-strategy="SHOW_ALL"
							tree-default-expand-all
							:field-names="{
								children: 'children',
								label: 'name',
								value: 'id',
							}"
							:tree-data="accountData"
							tree-node-filter-prop="name"
							:max-tag-count="2"
						/>
					</a-form-item>
					<a-form-item label="프로젝트">
						<a-select
							:options="[{ label: '선택하세요', value: 1 }]"
							:v-model:value="formData.projectId"
						></a-select>
					</a-form-item>
				</a-form>
			</a-col>
		</a-row>
		<template #footer>
			<a-flex>
				<a-col :span="5">
					<a-button>
						{{ "개인 출장경로등록" }}
					</a-button>
				</a-col>
				<a-col :span="19">
					<a-button @click="modalCancle">
						{{ "닫기" }}
					</a-button>
					<a-button :ghost="false" :type="'primary'" @click="onSubmit">
						{{ "저장" }}
					</a-button>
				</a-col>
			</a-flex>
		</template>
	</a-modal>
</template>
