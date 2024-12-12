<!-- eslint-disable import/no-extraneous-dependencies -->
<script lang="ts" setup>
import { iwxButton } from "elements"

const props = withDefaults(
	defineProps<{
		class?: string
		title: string
		target?: string
		field: any
		buttonTitle?: string
	}>(),
	{
		target: "_blank",
		buttonTitle: "저장",
	}
)

defineEmits<{
	(e: "submit", value: any): any
}>()
</script>

<template>
	<div class="col-md-9">
		<div class="d-sm-flex justify-content-between align-items-center mb-2">
			<h6 class="bold">{{ props.title }}</h6>

			<div class="d-flex flex-wrap">
				<iwx-button
					type="button"
					class="btn btn-sm btn-primary ms-2"
					@click="$emit('submit', props.field)"
				>
					<span class="material-symbols-outlined">save</span>
					{{ props.buttonTitle }}
				</iwx-button>
			</div>
		</div>
		<div class="div-contents-border-padding">
			<form>
				<slot name="content" :field="props.field"></slot>
			</form>
		</div>
	</div>
</template>
