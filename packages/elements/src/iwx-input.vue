<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    // id: { type: String, required: false, default: '' };
    // label: { type: String, required: false, default: '' };
    // type: { type: String, required: false, default: 'text' };
    // size: { type: String, required: false, default: 'sm' }; //sm, default, lg
    id?: string;
    label?: string;
    type?: string;
    size?: string;
    formatter?: string;
  }>(),
  {
    type: "text",
    size: "default",
    formatter: "string",
  },
);

const sizeSpectator = (value: string) => {
  if (["large", "lg"].includes(value)) {
    return "lg";
  }
  if (["small", "sm"].includes(value)) {
    return "sm";
  }
  if (["default", "df"].includes(value)) {
    return "default";
  }

  return value;
};

const onInput = (value: string) => {
  // console.log(value.toLocaleUpperCase())
  return value.toLocaleUpperCase();
};
</script>

<template>
  <div
    v-if="props.id && props.label"
    :class="`input-group input-group-${sizeSpectator(props.size)}`"
  >
    <span class="input-group-text" :id="`${props.id}`"
      ><slot>{{ props.label }}</slot></span
    >
    <input
      class="form-control"
      :type="`${props.type}`"
      :aria-describedby="`${props.id}`"
    />
  </div>
  <div v-else :class="`input-group input-group-${sizeSpectator(props.size)}`">
    <input
      class="form-control"
      :type="`${props.type}`"
      :aria-describedby="`${props.id}`"
      @input="(e: Event) => onInput((e.target as HTMLInputElement).value)"
    />
  </div>
</template>
