<script lang="ts" setup>
import { Dayjs } from "dayjs"
import { type Response, dateTimeFormat, IAddr } from "@/types"
import { Search, RoutePostData } from "@/types/mypage/business-trip-route"
import BusinessTripRouteTable from "@/components/mypage/business-trip-route/BusinessTripRouteTable.vue"
import MapBoxRoute from "@/components/commons/MapBoxRoute.vue"

definePageMeta({
	name: "출장 경로관리",
})

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const departmentCoordinate = ref<[number, number] | undefined>(undefined)
const arrivalCoordinate = ref<[number, number] | undefined>(undefined)
const stopoverCoordinates = ref<[number, number][]>([])
const isRoundTrip = ref<boolean>(false)
const tripRouteModal = ref<boolean>(false)
const searchFilterDate = ref<[Dayjs, Dayjs]>([useMonth.from(), useMonth.to()])
const searchParams = ref<Search>({
	companyCode: getCompanyCode.value,
	startDate: $dayjs(searchFilterDate.value?.[0]).format("YYYY-MM-DD"),
	endDate: $dayjs(searchFilterDate.value?.[1]).format("YYYY-MM-DD"),
	page: 0,
	size: 10,
})
const modalField = ref<RoutePostData>()

const initModalField = () => {
	modalField.value = {
		companyCode: getCompanyCode.value,
		employeeId: getEmployeeId.value,
		name: undefined,
		departure: undefined,
		destination: undefined,
		distance: undefined,
		roundTrip: false,
		active: false,
		stopovers: [
			{
				orderSeq: 0,
				location: undefined,
			},
		],
	}
	departmentCoordinate.value = undefined
	arrivalCoordinate.value = undefined
	stopoverCoordinates.value = [[0, 0]]
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.startDate = dateString[0]
	searchParams.value.endDate = dateString[1]
}

const onChangePagination = (paginationParams: any) => {
	searchParams.value.page = paginationParams.page
	searchParams.value.size = paginationParams.size
}

const onSearch = () => {
	routeRefresh()
}

const onOpenModal = (open: boolean, rowData: RoutePostData) => {
	tripRouteModal.value = open
	if (!rowData || !rowData.id) return
	onDetailData(rowData.id)
}

const onCloseModal = () => {
	tripRouteModal.value = false
	initModalField()
}

const onCoordinateData = (value: number) => {
	if (!modalField.value) return
	modalField.value.distance = value as number
}

const setRoundTrip = () => {
	if (!modalField.value || !modalField.value.stopovers) return
	isRoundTrip.value = !modalField.value.stopovers.every((item) => !item.location) //왕복 컬럼 flag
	if (isRoundTrip.value && modalField.value.roundTrip) {
		// 왕복값 되돌리기
		modalField.value.roundTrip = false
		onDoubleDistance()
	}
}

const removeStopover = (index: number) => {
	if (!modalField.value?.stopovers) return

	if (modalField.value.stopovers.length > 1) {
		modalField.value.stopovers.splice(index, 1) // 경유지 삭제
		stopoverCoordinates.value.splice(index, 1) // 좌표 삭제
	} else {
		modalField.value.stopovers[0] = {
			orderSeq: 0,
			location: undefined,
		}
		stopoverCoordinates.value = []
	}
	setRoundTrip()
}

const updateStopover = (idx: number, newValue: any) => {
	if (!modalField.value || !modalField.value.stopovers) return
	modalField.value.stopovers[idx].location = newValue.target.value // 해당 인덱스의 값을 수정
	modalField.value.stopovers[idx].orderSeq = idx
}

const addStopover = (idx: number) => {
	if (!modalField.value || !modalField.value.stopovers) return
	if (modalField.value.stopovers.length < 10) {
		const tempList = {
			orderSeq: idx + 1,
			location: "",
		}
		const tempCoordinate: [number, number] = [0, 0]
		modalField.value.stopovers.push(tempList)
		stopoverCoordinates.value.push(tempCoordinate)
	} else {
		message.warning("경유지는 최대 10개까지 추가할 수 있습니다.")
	}
}

const onDoubleDistance = () => {
	if (!modalField.value?.distance) return
	modalField.value.distance = modalField.value.roundTrip
		? modalField.value.distance * 2
		: modalField.value.distance / 2
}

const onSearchModal = async (type: string): Promise<void> => {
	try {
		new window.daum.Postcode({
			oncomplete: async function (data: IAddr) {
				if (modalField.value) {
					if (type == "D") {
						modalField.value.departure = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress, "D")
						departmentCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type == "A") {
						modalField.value.destination = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress, "A")
						arrivalCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type.startsWith("S")) {
						if (!modalField.value.stopovers) return
						const index = parseInt(type.slice(1)) // 경유지 인덱스
						modalField.value.stopovers[index].location = data.jibunAddress
						modalField.value.stopovers[index].orderSeq = index
						const mapData = await onSearchCoordinate(data.jibunAddress, "S", index)
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
						setRoundTrip()
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

const onSearchCoordinate = async (param: string, type: string, idx?: number) => {
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
			if (modalField.value && type == "D") modalField.value.departure = undefined
			if (modalField.value && type == "A") modalField.value.destination = undefined
			if (modalField.value && modalField.value.stopovers && type == "S" && idx)
				modalField.value.stopovers[idx] = { orderSeq: idx, location: undefined }
			return []
		}
		return coordinate
	} catch (error) {
		console.error("카카오 API 요청 오류:", error)
		throw error
	}
}

const onSubmit = () => {
	if (!modalField.value) return
	if (
		modalField.value.stopovers &&
		modalField.value.stopovers.every((item) => !item.location)
	)
		modalField.value.stopovers = [{ orderSeq: 0, location: "" }]

	const patchPostData = [
		{
			type: "PATCH",
			url: `/api/v2/persons/my-business-trip-routes/${modalField.value.id}`,
		},
		{
			type: "POST",
			url: "/api/v2/persons/my-business-trip-routes",
		},
	]
	let switchText =
		modalField.value && modalField.value.id ? patchPostData[0] : patchPostData[1]
	useIFetch<Response<any>>(switchText.url, {
		method: switchText.type as "POST" | "PATCH",
		body: modalField.value,
	})
		.then((res: any) => res.data)
		.then((res: Response<any>) => {
			console.log("result", res)
			if (res.status === 0) {
				onCloseModal()
				routeRefresh()
				message.success("저장하였습니다.")
			} else {
				message.error(res.message)
			}
		})
}

const onDetailData = async (id: number) => {
	useIFetch<Response<RoutePostData>>(`/api/v2/persons/my-business-trip-routes/${id}`, {
		method: "GET",
		params: { id: id },
	})
		.then((res: any) => res.data.value)
		.then(async (res: Response<RoutePostData>) => {
			if (res.status === 0) {
				if (!res.data) return
				modalField.value = res.data
				const departureMapData = await onSearchCoordinate(res.data.departure || "", "D")
				departmentCoordinate.value = [
					departureMapData.documents[0].x,
					departureMapData.documents[0].y,
				]
				const destinationMapData = await onSearchCoordinate(
					res.data.destination || "",
					"A"
				)
				arrivalCoordinate.value = [
					destinationMapData.documents[0].x,
					destinationMapData.documents[0].y,
				]
				if (!res.data.stopovers) return
				res.data.stopovers.forEach(async (item, index) => {
					if (!item.location) return
					const stopOverMapData = await onSearchCoordinate(item.location, "S", index)
					if (stopoverCoordinates.value[index]) {
						stopoverCoordinates.value[index] = [
							stopOverMapData.documents[0].x,
							stopOverMapData.documents[0].y,
						]
					} else {
						stopoverCoordinates.value.push([
							stopOverMapData.documents[0].x,
							stopOverMapData.documents[0].y,
						])
					}
				})
			} else {
				message.error(res.message)
			}
		})
}

const {
	data: routeData,
	status: routeStatus,
	refresh: routeRefresh,
} = await useAsyncData("my-business-trip-routes-list", () =>
	useIFetch<Response<Array<any>>>("/api/v2/persons/my-business-trip-routes", {
		method: "GET",
		params: searchParams.value,
	})
		.then((res: any) => res.data.value)
		.then((res: Response<Array<any>>) => res)
)

onMounted(() => {
	initModalField()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				나만의 자주가는 출장경로를 등록할 수 있습니다. 출장 유류대 추가시 출장경로를
				불러올 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="기간설정">
							<a-range-picker
								v-model:value="searchFilterDate"
								:value-format="dateTimeFormat"
								picker="date"
								@change="onChangeRangePicker"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<eacc-button
								component-is="search"
								size="middle"
								:modal-open="false"
								:data="searchParams"
								@click="onSearch"
							/>
						</a-space>
					</a-col>
				</a-row>
				<a-divider />
				<BusinessTripRouteTable
					:dataSource="routeData"
					:pending="routeStatus"
					:searchParams="searchParams"
					@refresh="routeRefresh"
					@openModal="onOpenModal"
					@pagination="onChangePagination"
				/>
			</a-form>
		</template>
		<template #modal>
			<a-modal
				:width="'80rem'"
				v-model:open="tripRouteModal"
				:destroy-on-close="false"
				:mask-closable="false"
				title="경로 검색"
				:keyboard="false"
				@cancel="onCloseModal"
				@ok="onSubmit"
			>
				<a-row :gutter="40">
					<a-col :span="11">
						<div :style="{ overflow: 'hidden' }">
							<map-box-route
								:department-coordinate="departmentCoordinate"
								:arrival-coordinate="arrivalCoordinate"
								:stopover-coordinates="stopoverCoordinates"
								@update:value="onCoordinateData"
							/>
						</div>
					</a-col>

					<a-col :span="13">
						<a-form
							label-align="left"
							:label-col="{ span: 6 }"
							:wrapper-col="{ span: 18 }"
						>
							<a-form-item label="출장경로명" :rules="[{ required: true }]">
								<a-input :value="modalField?.name" />
							</a-form-item>
							<a-form-item label="출발지" :rules="[{ required: true }]">
								<a-input
									:value="modalField?.departure"
									readOnly
									@click="onSearchModal('D')"
								/>
							</a-form-item>
							<a-form-item
								:label="`경유지${idx + 1}`"
								v-for="(item, idx) in modalField?.stopovers"
								:key="'turn' + idx"
							>
								<a-input
									:value="item.location"
									@input="updateStopover(idx, $event)"
									readOnly
									@click="onSearchModal(`S${idx}`)"
									:style="{ width: '70%', display: 'inline-block' }"
								/>
								<a-button
									@click="removeStopover(idx)"
									danger
									:icon="materialIcons('mso', 'do_not_disturb_on')"
									:style="{ margin: '0 10px', display: 'inline-block !important' }"
								/>
								<a-button
									@click="addStopover(idx)"
									:icon="materialIcons('mso', 'add_box')"
								/>
							</a-form-item>
							<a-form-item label="도착지" :rules="[{ required: true }]">
								<a-input
									:value="modalField?.destination"
									readOnly
									@click="onSearchModal('A')"
								/>
							</a-form-item>
							<a-form-item label="왕복여부" v-if="!isRoundTrip">
								<a-switch :checked="modalField?.roundTrip" @click="onDoubleDistance" />
							</a-form-item>
							<a-form-item label="주행거리" :wrapper-col="{ span: 13 }">
								<a-flex>
									<a-input :value="modalField?.distance" :disabled="true" /> km
								</a-flex>
							</a-form-item>
							<a-form-item label="사용여부">
								<a-switch v-if="modalField" v-model:checked="modalField.active" />
							</a-form-item>
						</a-form>
					</a-col>
				</a-row>
			</a-modal>
		</template>
	</page-layout>
</template>
