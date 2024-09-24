<!--<template>
	<Modal :isOpen="isModalOpen" title="Sign tx in your wallet" height="200px">
		<div style="flex: 1; display: flex; justify-content: center; align-items: center">
			<div class="loader"></div>
		</div>
		<button @click="reject" class="">Reject</button>
	</Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Modal from '../components/Modal.vue';

const isModalOpen = ref(true);

// const emit = defineEmits(['submit']);

const emit = defineEmits<{
	(e: 'signed', value: string): void;
	(e: 'rejected', value: string): void;
}>();

const reject = () => {
	emit('rejected', 'rejected');
	isModalOpen.value = false;
};
</script>

<style scoped>
#qr {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

#link {
	margin-top: 20px;

	a,
	a:hover {
		text-decoration: none;
		color: var(--link-color);
		font-size: 1rem;
	}
}
</style>-->