<template>
	<Modal :isOpen="isModalOpen" title="Connect your wallet">
		<div id="qr">
			<img :src="qrcode" style="width:80%" />
		</div>
		<div id="link">
			<a :href="url">OPEN VIA TELEGRAM</a>
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
import { loadConnection } from '../utils/connection';
import { UserData } from '@waves/signer';
import Cookies from 'js-cookie'
import { onMounted } from 'vue';

interface IProps {
	id: string;
	token: string
}

const props = defineProps<IProps>();

const title = document.title;
const hostname = document.location.hostname;
const queryString = window.btoa(JSON.stringify({
	method: 'connect',
	id: props.id,
	appName: title,
	appUrl: hostname
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

if (!import.meta.env.DEV) {
	let tries = 0;
	let badTries = 0;
	intervalId = setInterval(async () => {
		if (tries === 30 || badTries === 3) {
			reject('timeout');
			clearInterval(intervalId);
		}
		try {
			const connection = await loadConnection(props.token);
			if (connection.status === 'rejected') {
				reject('rejected');
				clearInterval(intervalId);
			} else if (connection.status === 'approved' && connection.publicKey) {
				Cookies.set('token', props.token);
				emit('connected', {
					publicKey: connection.publicKey,
					address: connection.address!
				});
				isModalOpen.value = false;
				clearInterval(intervalId);
			}
			tries += 1;
		} catch {
			badTries += 1;
		}
	}, 1000);
}

onMounted(() => {
	if (window.Telegram && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
		window.Telegram.WebApp.openTelegramLink(url.value);
	}
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