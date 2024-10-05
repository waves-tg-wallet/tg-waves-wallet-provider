# ProviderTelegram

## Overview

ProviderTelegram implements a Signature Provider for [Signer](https://github.com/wavesplatform/signer) protocol library.

## Getting Started

### Library installation

Install using npm:

```sh
npm install @waves/signer waves-provider-telegram
```

### Library initialization

Add library initialization to your app.

- For Testnet:

  ```js
  import { Signer } from '@waves/signer';
  import { ProviderTelegram } from 'waves-provider-telegram';

  const signer = new Signer({
    // Specify URL of the node on Testnet
    NODE_URL: 'https://nodes-testnet.wavesnodes.com',
  });
  const provider = new ProviderTelegram();
  signer.setProvider(provider);
  ```

- For Mainnet:

  ```js
  import { Signer } from '@waves/signer';
  import { ProviderTelegram } from 'waves-provider-telegram';

  const signer = new Signer();
  const provider = new ProviderTelegram();
  signer.setProvider(provider);
  ```

### Constructor
```js
const telegramProvider = new ProviderTelegram([config]);
```

Config parameters:
|Key|Type|Description|Default|
|-|-|-|-|
|linkDeliveryMethod|`string`|Method of link delivery. Available: `message`, `qr`, `both`|`'message'`|
|bgColor|`string`|Background color in light mode|`'#ffffff'`|
|textColor|`string`|Text color in light mode|`'#000000'`|
|buttonColor|`string`|Button color in light mode|`'#177DFF'`|
|buttonTextColor|`string`|Button text color in light mode|`'#ffffff'`|
|darkBgColor|`string`|Background color in dark mode|`'#202428'`|
|darkTextColor|`string`|Text color in dark mode|`'#ffffff'`|
|darkButtonColor|`string`|Button color in dark mode|`'#177DFF'`|
|darkButtonTextColor|`string`|Button text color in dark mode|`'#ffffff'`|
|lightDark|`boolean`|Light and dark mode|`true`|


### Basic example

Now your application is ready to work with Waves Platform. Let's test it by implementing basic functionality.

For example, we could try to authenticate user and transfer funds:

```js
const user = await signer.login();
const [transfer] = await signer
  .transfer({
    recipient: '3Myqjf1D44wR8Vko4Tr5CwSzRNo2Vg9S7u7',
    amount: 100000, // equals to 0.001 WAVES
    assetId: null, // equals to WAVES
  })
  .broadcast();
```

Or invoke some dApp:

```js
const [invoke] = await signer
  .invoke({
    dApp: '3Fb641A9hWy63K18KsBJwns64McmdEATgJd',
    fee: 1000000,
    payment: [
      {
        assetId: '73pu8pHFNpj9tmWuYjqnZ962tXzJvLGX86dxjZxGYhoK',
        amount: 7,
      },
    ],
    call: {
      function: 'foo',
      args: [
        { type: 'integer', value: 1 },
        { type: 'binary', value: 'base64:AAA=' },
        { type: 'string', value: 'foo' },
      ],
    },
  })
  .broadcast();
```

For more examples see [Signer documentation](https://github.com/wavesplatform/signer/blob/master/README.md).