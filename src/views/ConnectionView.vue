<template>
	<Modal :isOpen="isModalOpen" title="Connect your wallet">
		<div id="qr">
			<img :src="qrcode" style="width:80%" />
		</div>
		<div id="link">
			<a :href="props.url">OPEN VIA TELEGRAM</a>
		</div>
		<div style="flex: 1; display: flex; justify-content: center; align-items: center">
			<div class="loader"></div>
		</div>
		<button @click="reject('rejected')">Reject</button>
	</Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Modal from '../components/Modal.vue';
//@ts-ignore
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { loadConnection } from '../utils/connection';

interface IProps {
	url: string;
}

interface IResult {
	publicKey: string,
	address: string
}

const props = defineProps<IProps>();

const qrcode = useQRCode(props.url, {
	margin: 1,
	errorCorrectionLevel: 'H',
	scale: 4,
	maskPattern: 2
});

const isModalOpen = ref(true);

const emit = defineEmits<{
	(e: 'connected', value: IResult): void;
	(e: 'rejected', value: string): void;
}>();

const reject = (message: string) => {
	emit('rejected', message);
	isModalOpen.value = false;
};

let tries = 0;
let badTries = 0;
const timeoutId = setTimeout(async () => {
	if (tries === 30 || badTries === 3) {
		reject('timeout');
		clearTimeout(timeoutId);
	}
	try {
		const connection = await loadConnection();
		if (connection.status === 'rejected') {
			reject('rejected');
			clearTimeout(timeoutId);
		} else if (connection.status === 'approved') {
			emit('connected', {
				publicKey: connection.publicKey!,
				address: connection.address!
			});
			isModalOpen.value = false;
			clearTimeout(timeoutId);
		}
		tries += 1;
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

	a,
	a:hover {
		text-decoration: none;
		color: var(--link-color);
		font-size: 1rem;
	}
}
</style>