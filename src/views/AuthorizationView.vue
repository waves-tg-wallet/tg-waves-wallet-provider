<template>
	<Modal :isOpen="isModalOpen" title="Enter Seed Phrase" @close="handleClose">
		<div>
			<label>Click to login:</label>
		</div>
		<button @click="handleSubmit">Submit</button>
	</Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Modal from '../components/Modal.vue';


const isModalOpen = ref(true);

// const emit = defineEmits(['submit']);

const emit = defineEmits<{
	(e: 'authorized', value: string): void;
	(e: 'rejected', value: string): void;
}>();

const handleSubmit = () => {
	emit('authorized', 'authorized');
	isModalOpen.value = false;
};

const handleClose = () => {
	emit('rejected', 'rejected');
	isModalOpen.value = false;
};
</script>

<style scoped>
/* Добавьте стили для вашего компонента */
</style>