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
import { IStyle } from '../types';


interface IProps {
	isOpen: boolean;
	title?: string;
	style: IStyle
}



const props = withDefaults(defineProps<IProps>(), {
	isOpen: true,
	title: '^_^'
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
	z-index: 900;
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
	background-color: v-bind('props.style.lightBgColor');
	color: v-bind('props.style.lightTextColor');
	height: v-bind('props.style.height');
	max-width: v-bind('props.style.maxWidth');
	border-radius: 20px;
	display: flex;
	flex-direction: column;

	@include darkMode {
		background-color: v-bind('props.style.darkBgColor');
		color: v-bind('props.style.darkTextColor');
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
