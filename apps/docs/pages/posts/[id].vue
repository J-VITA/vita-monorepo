<script setup lang="ts">

const route = useRoute()

console.log(route.params.id)

const back = () => {
    history.back();
}

import { WxButton } from "ui";

</script>

<template>
    <div>
        <div class="flex justify-center gap-8 items-center mt-2">
            <wx-button title="BACK" @click="back()"></wx-button>
        </div>
        <div>
            ID : {{ route.params.id }}
        </div>
    </div>
</template>