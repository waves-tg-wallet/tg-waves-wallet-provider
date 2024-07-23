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
	maxWidth?: string,
	height?: string
}

const props = withDefaults(defineProps<IProps>(), {
	isOpen: true,
	title: '^_^',
	height: '400px',
	maxWidth: '300px'
});
</script>

<style lang="scss" scoped>
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
	width: 80%;
	background-color: var(--background-color);
	color: var(--text-color);
	height: v-bind('props.height');
	max-width: v-bind('props.maxWidth');
	border-radius: 20px;
	display: flex;
	flex-direction: column;

	.title {
		font-size: 1.2rem;
	}

	.content {
		box-sizing: border-box;
		padding: 20px;
		display: flex;
		flex-direction: column;
		width: 100%;
		flex-grow: 1;
	}
}
</style>
