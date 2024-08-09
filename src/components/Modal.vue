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
$darkMode: true;

@mixin darkMode {
	@if($darkMode) {
		@media(prefers-color-scheme: dark) {
			@content;
		}
	}
}

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
	background-color: rgba(94, 94, 94, 0.5);
	position: fixed;
}

.modal {
	position: relative;
	background-color: inherit;
	padding: 20px;
	width: 80%;
	background-color: hsl(0, 0%, 100%);
	color: black;
	height: v-bind('props.height');
	max-width: v-bind('props.maxWidth');
	border-radius: 20px;
	display: flex;
	flex-direction: column;

	@include darkMode {
		background-color: #13171f;
		color: white;
	}

	.title {
		display: flex;
		justify-content: center;
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
