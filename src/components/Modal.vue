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
import { computed } from 'vue';
import { IProviderTelegramConfig } from '../types';


interface IProps {
	isOpen: boolean;
	title: string;
	config: IProviderTelegramConfig
}

const props = withDefaults(defineProps<IProps>(), {
	isOpen: true
});

const darkBgColor = computed(() => props.config.lightDark ? props.config.darkBgColor : props.config.bgColor);
const darkTextColor = computed(() => props.config.lightDark ? props.config.darkTextColor : props.config.textColor);

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
	background-color: v-bind('props.config.bgColor');
	color: v-bind('props.config.textColor');
	height: 400px;
	max-width: 300px;
	border-radius: 20px;
	display: flex;
	flex-direction: column;

	@include darkMode {
		background-color: v-bind('darkBgColor');
		color: v-bind('darkTextColor');
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
