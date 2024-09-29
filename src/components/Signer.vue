<template>
	<Modal :isOpen="isModalOpen" title="Connect your wallet" :config="props.config">
		<div id="qr">
			<img :src="qrcode" style="width:80%" />
		</div>
		<div id="link">
			<a :href="url" target="_blank">OPEN VIA TELEGRAM</a>
		</div>
		<div style="flex: 1; display: flex; justify-content: center; align-items: center">
			<div class="loader"></div>
		</div>
		<button @click="reject('rejected')">Reject</button>
	</Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Modal from '../components/Modal.vue';
//@ts-ignore
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { onMounted } from 'vue';
import { IProviderTelegramConfig } from '../types';

interface IProps {
	id: string;
	config: IProviderTelegramConfig,
	signerData?: any,
	title?: string
}

const props = withDefaults(defineProps<IProps>(), {
	signerData: {},
	title: "Signer"
});

const queryString = window.btoa(JSON.stringify(props.signerData));
const pathname = `?startapp=${queryString}`;
const url = computed<string>(() => `https://t.me/${props.config.botName}${pathname}`);

const qrcode = useQRCode(url, {
	margin: 1,
	errorCorrectionLevel: 'H',
	scale: 4,
	maskPattern: 2
});

const isModalOpen = ref(true);

let intervalId: any;

const emit = defineEmits<{
	(e: 'connected', value: any): void;
	(e: 'rejected', value: string): void;
}>();

const reject = (message: string) => {
	clearInterval(intervalId);
	emit('rejected', message);
	isModalOpen.value = false;
};

onMounted(() => {
	const url = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${props.id}`;
	const webSocket = new WebSocket(url);

	webSocket.onmessage = function (event) {
		try {
			const data = JSON.parse(event.data) as ({ status: string });
			if (webSocket.OPEN) {
				webSocket.close();
			}
			if (data.status) {
				emit('connected', data);
			} else {
				reject('invalid response')
			}
		} catch {
			reject('something went wrong');
		}
	};

	webSocket.onclose = function (_event) {
		reject('timeout');
	};

	webSocket.onerror = function (error) {
		console.log(error);
		reject('something went wrong');
	};
});

const darkButtonColor = computed(() => props.config.buttonColor);
const darkButtonTextColor = computed(() => props.config.lightDark ? props.config.darkButtonTextColor : props.config.buttonTextColor);

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

#qr {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

#link {
	margin-top: 20px;
	width: 100%;
	display: flex;
	justify-content: center;


	a,
	a:hover {
		text-decoration: none;
		color: v-bind('props.config.buttonColor');
		font-size: 1rem;

		@include darkMode {
			color: v-bind('darkButtonColor');
		}
	}

}

button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	position: relative;

	font-size: 0.75em;
	padding: 17px 28px;
	gap: 10px;
	border: none;
	font-weight: 500;
	border-radius: 16px;
	text-transform: uppercase;
	background-color: v-bind('props.config.buttonColor');
	color: v-bind('props.config.buttonTextColor');

	@include darkMode {
		background-color: v-bind('darkButtonColor');
		color: v-bind('darkButtonTextColor');
	}
}

button:focus,
button:focus-visible {
	outline: 4px auto -webkit-focus-ring-color;
}
</style>