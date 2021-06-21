import Onboard from 'bnc-onboard'

import {
  BLOCKNATIVE_DAPP_ID,
  NETWORK_ID,
  RPC_URL,
  APP_URL,
  CONTACT_EMAIL,
  APP_NAME,
  INFURA_KEY,
} from './constants'

export default function createBlocknativeOnboard(subscriptions) {
  return Onboard({
    dappId: BLOCKNATIVE_DAPP_ID,
    networkId: NETWORK_ID,
    subscriptions,
    walletSelect: {
      heading: 'Select Wallet',
      description:
        'Choose the wallet and address that you used to register on Proof of Humanity:',
      wallets: [
        {walletName: 'coinbase', preferred: true},
        {walletName: 'trust', preferred: true, rpcUrl: RPC_URL},
        {walletName: 'metamask', preferred: true},
        {walletName: 'authereum'},
        {
          walletName: 'trezor',
          appUrl: APP_URL,
          email: CONTACT_EMAIL,
          rpcUrl: RPC_URL,
          preferred: true,
        },
        {
          walletName: 'ledger',
          rpcUrl: RPC_URL,
          preferred: true,
        },
        {
          walletName: 'lattice',
          rpcUrl: RPC_URL,
          appName: APP_NAME,
        },
        {
          walletName: 'keepkey',
          rpcUrl: RPC_URL,
        },
        {
          walletName: 'cobovault',
          rpcUrl: RPC_URL,
          appName: APP_NAME,
        },
        /*{
        walletName: "fortmatic",
        apiKey: FORTMATIC_KEY,
        preferred: true,
        },*/
        /*{
          walletName: "portis",
          apiKey: PORTIS_KEY,
          preferred: true,
          label: "Login with Email",
        },*/
        {
          walletName: 'walletConnect',
          infuraKey: INFURA_KEY,
          preferred: true,
        },
        {walletName: 'opera'},
        {walletName: 'operaTouch'},
        {walletName: 'torus'},
        {walletName: 'status'},
        {walletName: 'walletLink', rpcUrl: RPC_URL, appName: APP_NAME},
        {walletName: 'imToken', rpcUrl: RPC_URL},
        {walletName: 'meetone'},
        {walletName: 'mykey', rpcUrl: RPC_URL},
        {walletName: 'huobiwallet', rpcUrl: RPC_URL},
        {walletName: 'hyperpay'},
        {walletName: 'wallet.io', rpcUrl: RPC_URL},
        {walletName: 'atoken'},
        {walletName: 'frame'},
        {walletName: 'ownbit'},
        {walletName: 'alphawallet'},
        {walletName: 'gnosis'},
        {walletName: 'xdefi'},
        {walletName: 'bitpie'},
      ],
    },
    walletCheck: [{checkName: 'connect'}, {checkName: 'accounts'}],
  })
}
