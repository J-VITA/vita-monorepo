<script setup lang="ts">
const geocoderRes = ref()

import { GeolocateControl } from "mapbox-gl"
</script>

<template>
	<div>
		<MapboxMap
			map-id="map"
			style="
				position: absolute;
				top: 0;
				bottom: 0;
				left: 250px;
				width: 500px;
				margin: 100px 0 100px 0;
			"
			:options="{
				style: 'mapbox://styles/mapbox/streets-v12', // style URL
				center: [-122.486052, 37.830348], // starting position
				zoom: 14, // starting zoom
			}"
		>
			<MapboxSource
				source-id="map"
				:source="{
					type: 'geojson',
					data: '/api/geo-test',
				}"
			/>
			<MapboxLayer
				:layer="{
					source: 'map',
					id: 'geojson-layer',
					type: 'fill',
				}"
			/>
			<!-- <MapboxGeocoder
                ref="geocoderRef"
                v-model="geocoderRes"
                position="top-left"
                @result="(result) => { console.log(result) }"
            /> -->
			<MapboxDirections ref="geocoderRef" v-model="geocoderRes" position="top-left" />
			<MapboxNavigationControl position="top-right" />
			<MapboxGeolocateControl position="top-right" />
		</MapboxMap>
	</div>
</template>
