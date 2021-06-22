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

import ProofOfHumanityLogo from './images/poh.svg'

// TODO: remember their wallet? https://docs.blocknative.com/onboard#caching-wallet-selection
//"wss://mainnet.infura.io/ws/v3/ec39a81039c945bd9063af6003109bf2"

let ethersProvider = null

export default function App() {
  const [isDisconnected, setIsDisconnected] = useState(true)
  const [isSelectingWallet, setIsSelectingWallet] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(null)
  const [address, setAddress] = useState(null)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isRegistered, setIsRegistered] = useState(null)
  const [isSigning, setIsSigning] = useState(false)
  const [signature, setSignature] = useState(null)

  const onboardRef = useRef(null)
  const ethersProviderRef = useRef(null)
  const addressRef = useRef(null)
  const isSelectingWalletRef = useRef(false)

  // TODO: handle state in a single object that gets updated all at once
  // in order to avoid partially-handled state changes?
  async function handleOnboardStateChange() {
    // avoid handling the intermediary states that ocurr during wallet selection
    // because those states are weird: e.g. if `address` were `undefined`,
    // we wouldn't know if it were because there are no addresses in the wallet
    // or if it wer because the address just hadn't loaded yet.
    if (isSelectingWalletRef.current) return

    const newState = onboardRef.current.getState()

    const isDisconnected =
      !newState.wallet.provider || !newState.network || !newState.address
    setIsDisconnected(isDisconnected)
    if (isDisconnected) return

    const isWrongNetwork = newState.network !== NETWORK_ID
    setIsWrongNetwork(isWrongNetwork)
    if (isWrongNetwork) return

    setAddress(newState.address)
    addressRef.current = newState.address
    ethersProviderRef.current = new ethers.providers.Web3Provider(
      newState.wallet.provider
    )

    setIsCheckingRegistration(true)
    setIsRegistered(null)
    const isRegistered = await getIsRegisteredInProofOfHumanity(
      ethersProviderRef.current,
      newState.address
    )

    // handleOnboardChange could be called multiple times, e.g. if address
    // was quickly changing. we only want to take into account a result for
    // the latest address. (avoid race condition)
    if (addressRef.current === newState.address) {
      setIsRegistered(isRegistered)
      setIsCheckingRegistration(false)
    }
  }

  useEffect(() => {
    onboardRef.current = createBlocknativeOnboard({
      wallet: handleOnboardStateChange,
      address: handleOnboardStateChange,
      network: handleOnboardStateChange,
    })
  }, [])

  async function selectWallet() {
    isSelectingWalletRef.current = true
    setIsSelectingWallet(true)
    try {
      const selectedWallet = await onboardRef.current.walletSelect()
      if (selectedWallet) {
        await onboardRef.current.walletCheck()
      }
    } catch (error) {
      console.log('caught error selecting wallet', error)
    }
    isSelectingWalletRef.current = false
    setIsSelectingWallet(false)

    handleOnboardStateChange()
  }

  async function signIn() {
    const signer = ethersProviderRef.current.getSigner()
    try {
      setIsSigning(true)
      const signature = await signer.signMessage(SIGN_IN_MESSAGE)
      setSignature(signature)
    } catch (error) {
      if (error.code === 4001) {
        // user denied signature
      } else {
        throw error
      }
    }
    setIsSigning(false)
  }

  function reset() {
    onboardRef.current.walletReset()
    setSignature(null)
    handleOnboardStateChange()
  }

  return (
    <Content>
      {isDisconnected || isCheckingRegistration ? (
        <ConnectWalletStep
          selectWallet={selectWallet}
          isSelectingWallet={isSelectingWallet}
        />
      ) : isWrongNetwork ? (
        <WrongNetworkStep />
      ) : isRegistered === false ? (
        <NotRegisteredStep reset={reset} />
      ) : !signature ? (
        <SignInStep signIn={signIn} isSigning={isSigning} />
      ) : (
        <PolisConversation
          data-conversation_id={POLIS_CONVERSATION_ID}
          xid={signature}
          data-ucw="false"
        />
      )}
      {!isDisconnected && address && (
        <WalletIndicator
          address={address}
          reset={reset}
          style={{position: 'fixed', top: '30px', right: '30px'}}
        />
      )}
    </Content>
  )
}

function ConnectWalletStep({selectWallet, isSelectingWallet}) {
  return (
    <Step
      title="Connect Wallet"
      subtitle="So you can sign in with Proof of Humanity"
      image={<ProofOfHumanityLogo />}
      button={
        <Button
          label="Connect Wallet"
          onClick={selectWallet}
          isBusy={isSelectingWallet}
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
      button={<Button label="Restart" onClick={reset} />}
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
      button={<Button label="Sign In" onClick={signIn} isBusy={isSigning} />}
    />
  )
}
