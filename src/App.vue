<template>
	<div>
		<ConnectionView :id="id" />
	</div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import ConnectionView from './views/ConnectionView.vue'

console.log(import.meta.env)

const id = `012345678901234567890123456789012345678901234567`
</script>

<style scoped>

</style>
