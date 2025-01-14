<script setup lang="ts">
import { ref } from "vue"
import { GeolocateControl, NavigationControl } from "mapbox-gl" // 필요한 MapboxGL 기능 불러오기
import mapboxgl from "mapbox-gl" // 예시로 MapboxMap을 직접 사용, 라이브러리에 따라 다를 수 있음

const { departmentCoordinate, arrivalCoordinate, stopoverCoordinates } = defineProps<{
	departmentCoordinate?: [number, number]
	arrivalCoordinate?: [number, number]
	stopoverCoordinates?: [number, number][]
}>()

const emit = defineEmits<{
	(e: "update:value", value: number): void
}>()

// const map = ref<mapboxgl.Map | null>(null);
const accessToken = useRuntimeConfig().public.mapboxKey
// const { accessToken, mapboaxUrl } = useRuntimeConfig();
const origin: [number, number] = [126.946373235502, 37.5404734621902]
const routeCoordinates = ref<[number, number][]>()
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<mapboxgl.Map | null>(null) // 지도 객체를 ref로 저장
const departmentMarker = ref<mapboxgl.Marker | null>(null)
const arrivalMarker = ref<mapboxgl.Marker | null>(null)
let routeLayerId = "route"

const initMap = async () => {
	removeMarkers()
	removeStopoverMarkers()
	mapboxgl.accessToken = accessToken
	if (!departmentCoordinate || !arrivalCoordinate) {
		if (map.value) {
			map.value.remove()
			map.value = null
		}
	}

	// 지도 객체가 없다면 초기화
	if (!map.value) {
		map.value = new mapboxgl.Map({
			container: mapContainer.value!,
			style: "mapbox://styles/mapbox/streets-v11",
			center: origin,
			zoom: 14,
		})
	}

	if (!!departmentCoordinate && !arrivalCoordinate) {
		map.value.flyTo({ center: departmentCoordinate, zoom: 14 }) // 해당 좌표로 이동
		if (!mapContainer.value) return
		departmentMarker.value = new mapboxgl.Marker({
			anchor: "bottom",
			offset: [175, -170],
		}) // 마커 추가
			.setLngLat(departmentCoordinate)
			.addTo(map.value!)
	}
	if (!departmentCoordinate && !!arrivalCoordinate) {
		map.value.flyTo({ center: arrivalCoordinate, zoom: 14 }) // 해당 좌표로 이동
		arrivalMarker.value = new mapboxgl.Marker({
			anchor: "bottom",
			offset: [175, -190],
		}) // 마커 추가
			.setLngLat(arrivalCoordinate)
			.addTo(map.value!)
	}

	if (!departmentCoordinate || !arrivalCoordinate) return

	// 경로 요청
	routeCoordinates.value = await getRoute(
		departmentCoordinate || origin,
		arrivalCoordinate || origin,
		stopoverCoordinates
			? stopoverCoordinates.filter((coord) => coord[0] !== 0 || coord[1] !== 0)
			: undefined
	)

	if (routeCoordinates.value.length > 0) {
		if (map.value! !== null) {
			// 경로 레이어가 이미 있으면 제거
			if (map.value.getLayer(routeLayerId)) {
				map.value.removeLayer(routeLayerId)
				map.value.removeSource(routeLayerId)
			}

			if (map.value.loaded()) drawMap()
			else drawMap()
		}
	}
}

/** 경로 시각화 */
const drawMap = () => {
	if (!routeCoordinates.value || !map.value) return
	map.value?.addLayer({
		id: routeLayerId,
		type: "line",
		source: {
			type: "geojson",
			data: {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: routeCoordinates.value,
				},
				properties: {},
			},
		},
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#3887be",
			"line-width": 5,
		},
	})

	const bounds = new mapboxgl.LngLatBounds()
	routeCoordinates.value.forEach((coord: any) => bounds.extend(coord))
	map.value.fitBounds(bounds, { padding: 20 })
	addStopoverMarkers()
}

/** 경유지 마커추가 */
const addStopoverMarkers = () => {
	if (!stopoverCoordinates || !map.value) return

	// 경유지 마커 추가
	stopoverCoordinates.forEach((coordinate: any) => {
		new mapboxgl.Marker({ anchor: "bottom", offset: [175, -190] })
			.setLngLat(coordinate)
			.addTo(map.value!)
	})
}

/** 출발지, 도착지 마커 제거 */
const removeMarkers = () => {
	if (departmentMarker.value) {
		departmentMarker.value.remove() // departmentMarker 삭제
		departmentMarker.value = null // 마커 객체 null로 설정
	}
	if (arrivalMarker.value) {
		arrivalMarker.value.remove() // arrivalMarker 삭제
		arrivalMarker.value = null // 마커 객체 null로 설정
	}
}

/** 경유지 마커 제거 */
const removeStopoverMarkers = () => {
	if (stopoverCoordinates) {
		stopoverCoordinates.forEach(() => {
			// 경유지 마커가 있으면 삭제
			new mapboxgl.Marker().remove()
		})
	}
}

/** 경로 요청 */
const getRoute = async (
	origin: [number, number],
	destination: [number, number],
	stopovers: [number, number][] = []
) => {
	const waypoints =
		stopovers.length === 0
			? ""
			: stopovers.map((coord) => coord.join(",")).join(";") + ";"
	const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.join(",")};${waypoints}${destination.join(",")}?access_token=${accessToken}`

	try {
		const response = await fetch(url)
		const data = await response.json()

		const polylineString = data.routes[0]?.geometry
		emit("update:value", Number((data.routes[0].distance / 1000).toFixed(1)))
		if (polylineString) {
			// 직접 디코딩
			const decodedCoordinates = decodePolyline(polylineString)
			return decodedCoordinates
		}
		return []
	} catch (error) {
		console.error("경로 요청 실패: ", error)
		return []
	}
}

/** 디코딩 */
const decodePolyline = (encoded: string): [number, number][] => {
	let index = 0
	const length = encoded.length
	const coordinates: [number, number][] = []
	let latitude = 0
	let longitude = 0

	while (index < length) {
		let byte,
			result = 0,
			shift = 0

		// Decode latitude
		do {
			byte = encoded.charCodeAt(index++) - 63
			result |= (byte & 0x1f) << shift
			shift += 5
		} while (byte >= 0x20)
		latitude += (result & 1) === 1 ? ~(result >> 1) : result >> 1

		// Decode longitude
		result = 0
		shift = 0
		do {
			byte = encoded.charCodeAt(index++) - 63
			result |= (byte & 0x1f) << shift
			shift += 5
		} while (byte >= 0x20)
		longitude += (result & 1) === 1 ? ~(result >> 1) : result >> 1

		coordinates.push([longitude / 1e5, latitude / 1e5])
	}

	return coordinates
}

// 페이지가 마운트되면 지도 초기화
onMounted(() => {
	if (mapContainer.value) {
		initMap()
	}
})

watch(
	() => departmentCoordinate,
	() => initMap()
)

watch(
	() => arrivalCoordinate,
	() => initMap()
)

watch(
	() => stopoverCoordinates,
	() => {
		initMap()
	},
	{ deep: true }
)
</script>

<template>
	<div
		id="map"
		ref="mapContainer"
		class="map-container"
		:style="{ height: '400px' }"
	></div>
</template>
