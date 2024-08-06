<template>
	<Modal :isOpen="isModalOpen" title="Connect your wallet">
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

interface IProps {
	id: string;
	token: string;
	networkByte: number;
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
	const url = `${import.meta.env.VITE_WEB_APP_URL}/?token=${props.id}`;
	const webSocket = new WebSocket(url);

	webSocket.onmessage = function (event) {
		try {
			const data = JSON.parse(event.data) as UserData;
			if (webSocket.OPEN) {
				webSocket.close();
			}
			Cookies.set('token', props.token);
			emit('connected', {
				publicKey: data.publicKey,
				address: data.address
			});
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

<style scoped>
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
		color: var(--link-color);
		font-size: 1rem;
	}
}
</style>