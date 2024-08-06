<template>
	<div>
		<!-- <ConnectionView :id="id" token="dsfds" :network-byte="'W'.charCodeAt(0)"/> -->
		<button @click="test()">Sign</button>

		<button @click="test_transfer_tx()">Transfer</button>

		<button @click="test_invoke_tx()">Invoke</button>
	</div>
</template>

<script setup lang="ts">
import { TelegramProvider } from './provider';
import { transfer, invokeScript } from '@waves/waves-transactions'

// import { ref } from 'vue'
// import ConnectionView from './views/ConnectionView.vue'

console.log(import.meta.env)

const test = () => {
	const provider = new TelegramProvider();
	provider.login()
}

const test_transfer_tx = () => {
	const provider = new TelegramProvider();
	//@ts-ignore
	const ttx = transfer({
		amount: 1000,
		recipient: "3P5T88oGg47FEsJcpC2o43BSF34Bs5dcFpP",
		senderPublicKey: "8qiYAjmecXecrMJB9CxENdc3NgXEF71EGLxkAKenJGxL"
	})
	provider.sign([ttx]).then((d) => {
		console.log(d)
	})
}

const test_invoke_tx = () => {
	const provider = new TelegramProvider();
	const itx = invokeScript({
		"payment": [
			{
				"amount": 1000,
				"assetId": null
			},
			{
				"amount": 200000,
				"assetId": "HYogWffUjS8Uw4bYA1Dn3qrGmJerMqkf139aJcHhk8yq"
			}
		],
		"call": {
			"function": "deposit",
			"args": [
				{
					"type": "string",
					"value": "3PMYady7KzUNnRrFGzMBnq7akMDWiCQyoQz"
				},
				{
					"type": "boolean",
					"value": false
				}
			]
		},
		"fee": 500000,
		"dApp": "3P9gtaWVnxA2TgFkvFMQSHPyfyNssjLGx5A",
		"senderPublicKey": "8qiYAjmecXecrMJB9CxENdc3NgXEF71EGLxkAKenJGxL"
	})
	provider.sign([itx]).then((d) => {
		console.log(d)
	})
}

// const id = `012345678901234567890123456789012345678901234567`
</script>

<style scoped></style>
