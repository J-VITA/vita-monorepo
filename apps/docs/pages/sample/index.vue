<script>
import { WxButton } from "ui";

export default {
  components: {WxButton},
  data() {
    return {
        title: "javascript"
    }
  },
  methods: {
    back() {
        history.back();
    }
  }
}
</script>

<template>
    <div class="flex justify-center gap-8 items-center mt-2">
      <wx-button title="BACK" @click="back()"></wx-button>
    </div>
    <div>
        {{title}} for the template
    </div>
</template>