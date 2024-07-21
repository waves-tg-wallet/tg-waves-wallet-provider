<template>
	<div v-if="props.isOpen" class="modal--overlay">
		<div class="modal">
			<span class="title">{{ props.title }}</span>
			<div class="content">
				<slot></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">

interface IProps {
	isOpen: boolean;
	title?: string;
}

const props = withDefaults(defineProps<IProps>(), {
	isOpen: true,
	title: '^_^'
});
</script>

<style scoped>
.modal--overlay {
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgba(255, 255, 255, 0.2);
	position: fixed;
}

.modal {
	position: relative;
	background-color: inherit;
	padding: 20px;
	border: 1px solid #888;
	width: 80%;
	color: black;
	min-height: 400px;
	max-width: 300px;
	border-radius: 20px;

	.title {
		font-size: 1.5rem;
	}

	.content {
		box-sizing: border-box;
		padding: 20px;
		display: flex;
		flex-direction: column;
		width: 100%;
		flex: 1
	}
}
</style>
<!-- 

<template>
	<div v-if="isOpen" class="modal">
	  <div class="modal-content">
		
		
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  
  
  const emit = defineEmits(['close']);
  
  const close = () => {
	emit('close');
  };
  
  watch(() => props.isOpen, (newValue) => {
	if (!newValue) {
	  close();
	}
  });
  </script>
  
  
  
 -->
