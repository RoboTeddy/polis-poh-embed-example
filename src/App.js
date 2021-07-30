import React, {useEffect, useState, useRef} from 'react'
import {ethers} from 'ethers' // TODO: import more specific thing?

import {NETWORK_ID, POLIS_CONVERSATION_ID, SIGN_IN_MESSAGE} from './constants'
import createBlocknativeOnboard from './createBlocknativeOnboard'
import getIsRegisteredInProofOfHumanity from './getIsRegisteredInProofOfHumanity'
import Content from './components/Content'
import Button from './components/Button'
import WalletIndicator from './components/WalletIndicator'
import Step from './components/Step'
import PolisConversation from './components/PolisConversation'

const initialState = Object.freeze({
  isDisconnected: true,
  isSelectingWallet: false,
  isWrongNetwork: null,
  address: null,
  ethersProvider: null,
  isCheckingRegistration: false,
  isRegistered: false,
  isSigning: false,
  signature: null,
})

function useStateVersion() {
  const [stateVersion, setStateVersion] = useState(0)
  function bumpStateVersion() {
    setStateVersion((v) => v + 1)
  }
  return [stateVersion, bumpStateVersion]
}

export default function App() {
  const onboardRef = useRef(null)
  const stateRef = useRef({...initialState})
  const [stateVersion, bumpStateVersion] = useStateVersion()
  const polisConversationId = window.location.pathname.slice(1)

  // TODO: handle state in a single object that gets updated all at once
  // in order to avoid partially-handled state changes?
  async function handleOnboardStateChange() {
    const state = stateRef.current
    // avoid handling the intermediary states that ocurr during wallet selection
    // because those states are weird: e.g. if `address` were `undefined`,
    // we wouldn't know if it were because there are no addresses in the wallet
    // or if it wer because the address just hadn't loaded yet.
    if (state.isSelectingWallet) return

    const onboardState = onboardRef.current.getState()

    state.isDisconnected =
      !onboardState.wallet.provider ||
      !onboardState.network ||
      !onboardState.address

    state.ethersProvider =
      onboardState.wallet.provider &&
      new ethers.providers.Web3Provider(onboardState.wallet.provider)

    state.isWrongNetwork = onboardState.network !== NETWORK_ID

    // address changed; let's check to see if it's registered.
    if (
      !state.isDisconnected &&
      !state.isWrongNetwork &&
      onboardState.address &&
      state.address !== onboardState.address
    ) {
      state.address = onboardState.address
      state.isCheckingRegistration = true
      state.isRegistered = null
      bumpStateVersion()

      const isRegistered = await getIsRegisteredInProofOfHumanity(
        state.ethersProvider,
        state.address
      )

      // handleOnboardChange could be called multiple times, e.g. if address
      // was quickly changing. we only want to take into account a result for
      // the latest address. (avoid race condition)
      if (state.address === onboardState.address) {
        state.isRegistered = isRegistered
        state.isCheckingRegistration = false
        state.signature = null
      }
    }

    bumpStateVersion()
  }

  useEffect(() => {
    onboardRef.current = createBlocknativeOnboard({
      wallet: handleOnboardStateChange,
      address: handleOnboardStateChange,
      network: handleOnboardStateChange,
    })
  }, [])

  async function selectWallet() {
    state.isSelectingWallet = true
    bumpStateVersion()
    try {
      const selectedWallet = await onboardRef.current.walletSelect()
      if (selectedWallet) await onboardRef.current.walletCheck()
    } catch (error) {
      console.log('caught error selecting wallet', error)
    }
    state.isSelectingWallet = false
    bumpStateVersion()

    await handleOnboardStateChange()

    if (state.isRegistered) signIn()
  }

  async function signIn() {
    const signer = state.ethersProvider.getSigner()
    try {
      state.isSigning = true
      bumpStateVersion()
      const signature = await signer.signMessage(SIGN_IN_MESSAGE)
      state.signature = signature
    } catch (error) {
      if (error.code === 4001) {
        // user denied signature
      } else {
        throw error
      }
    }
    state.isSigning = false
    bumpStateVersion()
  }

  function reset() {
    onboardRef.current.walletReset()
    stateRef.current = {...initialState}
    handleOnboardStateChange()
  }

  const state = stateRef.current
  return (
    <Content>
      {!polisConversationId ? (
        <MissingPolisConversationIdStep />
      ) : state.isDisconnected || state.isCheckingRegistration ? (
        <ConnectWalletStep
          selectWallet={selectWallet}
          isBusy={state.isSelectingWallet || state.isCheckingRegistration}
        />
      ) : state.isWrongNetwork ? (
        <WrongNetworkStep />
      ) : state.isRegistered === false ? (
        <NotRegisteredStep reset={reset} />
      ) : !state.signature ? (
        <SignInStep signIn={signIn} isSigning={state.isSigning} />
      ) : (
        <PolisConversation
          data-conversation_id={polisConversationId}
          xid={state.signature}
          data-ucw="false"
        />
      )}
      {!state.isDisconnected && state.address && (
        <WalletIndicator
          address={state.address}
          reset={reset}
          style={{position: 'fixed', top: '30px', right: '30px'}}
        />
      )}
    </Content>
  )
}

function MissingPolisConversationIdStep() {
  return (
    <Step
      title="Missing Polis Conversation Id"
      subtitle={`Please include it in the url, like this: ${document.location.href}<polis conversation id here>`}
    />
  )
}

function ConnectWalletStep({selectWallet, isBusy}) {
  return (
    <Step
      title="Sign In"
      subtitle="So you can join the Pol.is conversation"
      image={
        <img
          style={{width: 120}}
          src="https://cdn-images-1.medium.com/max/1200/1*vAUO1O51vT2Mt_W_qy1qBQ.png"
        />
      }
      button={
        <Button
          label="Sign In with Proof of Humanity"
          onClick={selectWallet}
          isBusy={isBusy}
        />
      }
    />
  )
}

function WrongNetworkStep() {
  return (
    <Step
      title="Change Network"
      subtitle="To continue, please configure your wallet to use the ethereum mainnet"
    />
  )
}

function NotRegisteredStep({reset}) {
  return (
    <Step
      title="Address Not Registered"
      subtitle={
        <>
          <p>
            Please select the wallet/address that you registered on Proof of
            Humanity.
          </p>

          <p>
            If you haven't registered yet, you can do so here:{' '}
            <a
              href="https://proofofhumanity.id/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://proofofhumanity.id
            </a>
          </p>
        </>
      }
    />
  )
}

function SignInStep({signIn, isSigning}) {
  return (
    <Step
      title="Sign In"
      subtitle="So you can join the Pol.is conversation"
      image={
        <img
          style={{width: 120}}
          src="https://cdn-images-1.medium.com/max/1200/1*vAUO1O51vT2Mt_W_qy1qBQ.png"
        />
      }
      button={
        <Button
          label="Sign In with Proof of Humanity"
          onClick={signIn}
          isBusy={isSigning}
        />
      }
    />
  )
}
