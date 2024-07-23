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

interface IProps {
	id: string;
}

const props = defineProps<IProps>();

const url = computed<string>(() => `${import.meta.env.VITE_WEB_APP_URL}?startapp=${props.id}`);

const qrcode = useQRCode(url, {
	margin: 1,
	errorCorrectionLevel: 'H',
	scale: 4,
	maskPattern: 2
});

const isModalOpen = ref(true);

const emit = defineEmits<{
	(e: 'connected', value: UserData): void;
	(e: 'rejected', value: string): void;
}>();

const reject = (message: string) => {
	emit('rejected', message);
	isModalOpen.value = false;
};

let tries = 0;
let badTries = 0;
const intervalId = setInterval(async () => {
	if (tries === 30 || badTries === 3) {
		reject('timeout');
		clearInterval(intervalId);
	}
	try {
		const connection = await loadConnection();
		if (connection.status === 'rejected') {
			reject('rejected');
			clearInterval(intervalId);
		} else if (connection.status === 'approved') {
			emit('connected', {
				publicKey: connection.publicKey!,
				address: connection.address!
			});
			isModalOpen.value = false;
			clearInterval(intervalId);
		}
		tries += 1;
		console.log(tries);
	} catch {
		badTries += 1;
	}
}, 1000);
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