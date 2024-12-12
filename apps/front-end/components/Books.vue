<script lang="ts">
import { defineComponent } from "vue"
import type { PropType } from "vue"

interface Book {
	title: string
	author: string
	year: number
}

export default defineComponent({
	props: {
		book: {
			// `Object`에 대한 자세한 타입을 제공합니다
			type: Object as PropType<Book>,
			required: true,
		},
		// functions도 어노테이팅 가능합니다
		callback: Function as PropType<(id: number) => void>,
	},
	name: "test",
	data() {
		return {
			count: 0,
		}
	},
	mounted() {
		console.log("get props books", this.book)
		// this.book.title // string
		// this.book.year // number

		// TS Error: argument of type 'string' is not
		// assignable to parameter of type 'number'
		this.callback?.(123)
	},
})
</script>

<template>
	<div>
		Component: Books title : {{ book.title }} // Books year : {{ book.year }}
		<br />
		Books Author : {{ book.author }}
	</div>
</template>

<style scoped></style>
