<template>
	<Modal :isOpen="isModalOpen" title="Connect your wallet" :style="props.style">
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
import { UserData } from '@waves/signer';
import Cookies from 'js-cookie'
import { onMounted } from 'vue';
import { IStyle } from '../types';

interface IProps {
	id: string;
	token: string;
	networkByte: number;
	style: IStyle
}

const props = defineProps<IProps>();

const title = document.title;
const hostname = document.location.hostname;
const queryString = window.btoa(JSON.stringify({
	method: 'connect_rpc',
	id: props.id,
	appName: title.substring(0, 16),
	appUrl: hostname,
	networkByte: props.networkByte
}));
const pathname = `?startapp=${queryString}`;
const url = computed<string>(() => `${import.meta.env.VITE_WEB_APP_URL}${pathname}`);

const qrcode = useQRCode(url, {
	margin: 1,
	errorCorrectionLevel: 'H',
	scale: 4,
	maskPattern: 2
});

const isModalOpen = ref(true);

let intervalId: any;

const emit = defineEmits<{
	(e: 'connected', value: UserData): void;
	(e: 'rejected', value: string): void;
}>();

const reject = (message: string) => {
	clearInterval(intervalId);
	emit('rejected', message);
	isModalOpen.value = false;
};

onMounted(() => {
	//if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
	//	window.Telegram.WebApp.openTelegramLink(url.value);
	//}
	console.log(props)
	const url = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${props.id}`;
	const webSocket = new WebSocket(url);

	webSocket.onmessage = function (event) {
		try {
			const data = JSON.parse(event.data) as UserData & ({ status: 'approved' | 'rejected' });
			if (webSocket.OPEN) {
				webSocket.close();
			}
			if (data.status === 'approved') {
				Cookies.set('token', props.token);
				emit('connected', {
					publicKey: data.publicKey,
					address: data.address
				});
			} else {
				reject(data.status)
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
		color: v-bind('props.style.lightButtonColor');
		font-size: 1rem;

		@include darkMode {
			color: v-bind('props.style.lightButtonColor');
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
	padding: 0.78em 1.5em 0.78em;
	border: none;
	font-weight: 500;
	border-radius: 0.5em;
	text-transform: uppercase;
	background-color: v-bind('props.style.lightButtonColor');
	color: v-bind('props.style.lightButtonTextColor');

	@include darkMode {
		background-color: v-bind('props.style.lightButtonColor');
		color: v-bind('props.style.darkButtonTextColor');
	}
}

button:focus,
button:focus-visible {
	outline: 4px auto -webkit-focus-ring-color;
}
</style>