<script lang="ts" setup>

const route = useRoute()

</script>

<template>
    <div>
        ID : {{ route.params.id }}
    </div>
</template>