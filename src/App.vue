<template>
	<div>
		<ConnectionView :url="url" />
	</div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import ConnectionView from './views/ConnectionView.vue'

console.log(import.meta.env)

const url = `${import.meta.env.VITE_WEB_APP_URL}?startapp=012345678901234567890123456789012345678901234567`
</script>

<style scoped>

</style>
