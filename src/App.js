import 'regenerator-runtime/runtime'
import React, {useEffect, useState, useRef} from 'react'
import {ethers} from 'ethers' // TODO: import more specific thing?

import {NETWORK_ID, POLIS_CONVERSATION_ID, SIGN_IN_MESSAGE} from './constants'
import createBlocknativeOnboard from './createBlocknativeOnboard'
import getIsRegisteredInProofOfHumanity from './getIsRegisteredInProofOfHumanity'
import Content from './components/Content'
import SignInStep from './components/SignInStep'
import PolisConversation from './components/PolisConversation'

// TODO: remember their wallet? https://docs.blocknative.com/onboard#caching-wallet-selection
//"wss://mainnet.infura.io/ws/v3/ec39a81039c945bd9063af6003109bf2"

let ethersProvider = null

export default function App() {
  const [isDisconnected, setIsDisconnected] = useState(true)
  const [isSelectingWallet, setIsSelectingWallet] = useState(false)
  //const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(null)
  const [isMissingAddress, setIsMissingAddress] = useState(null)
  const [address, setAddress] = useState(null)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isRegistered, setIsRegistered] = useState(null)
  const [isSigning, setIsSigning] = useState(false)
  const [signature, setSignature] = useState(null)

  const onboardRef = useRef(null)
  const ethersProviderRef = useRef(null)
  const addressRef = useRef(null)
  const isSelectingWalletRef = useRef(false)

  async function handleOnboardStateChange() {
    // avoid handling the intermediary states that ocurr during wallet selection
    // because those states are weird: e.g. if `address` were `undefined`,
    // we wouldn't know if it were because there are no addresses in the wallet
    // or if it wer because the address just hadn't loaded yet.
    if (isSelectingWalletRef.current) return

    const newState = onboardRef.current.getState()
    console.log('newState', newState)

    const isDisconnected = !newState.wallet.provider
    setIsDisconnected(isDisconnected)
    if (isDisconnected) return

    const isWrongNetwork = newState.network !== NETWORK_ID
    setIsWrongNetwork(isWrongNetwork)
    if (isWrongNetwork) return

    const isMissingAddress = !newState.address
    setIsMissingAddress(isMissingAddress)
    if (isMissingAddress) return

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

    console.log('handling state change cuz finished selecting/checking')
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

  function signOut() {
    onboardRef.current.walletReset()
    setSignature(null)
    handleOnboardStateChange()
  }

  if (isDisconnected || isMissingAddress === true || isCheckingRegistration) {
    return (
      <Content>
        <SignInStep
          title="Connect Wallet"
          subtitle="For signing in to Pol.is using Proof of Humanity"
          button={
            <button onClick={selectWallet} disabled={isSelectingWallet}>
              Connect Wallet
            </button>
          }
        />
      </Content>
    )
  }

  if (isWrongNetwork) {
    return (
      <Content>
        <SignInStep
          title="Change Network"
          subtitle="To continue, please configure your wallet to use the ethereum mainnet"
        />
      </Content>
    )
  }

  if (isRegistered === false) {
    return (
      <Content>
        <SignInStep
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
          button={
            <button onClick={() => onboardRef.current.walletReset()}>
              Restart
            </button>
          }
        />
      </Content>
    )
  }

  return isRegistered === true && !signature ? (
    <Content>
      <SignInStep
        title="Sign In"
        subtitle="Sign in to participate in the conversation on Pol.is"
        button={
          <button onClick={signIn} disabled={isSigning}>
            Sign In with Proof of Humanity
          </button>
        }
      />
    </Content>
  ) : (
    <Content>
      <PolisConversation
        data-conversation_id={POLIS_CONVERSATION_ID}
        xid={signature}
        data-ucw="false"
        style={{width: '80vw', maxHeight: '80vh'}}
      />
    </Content>
  )

  return (
    <div>
      {address && (
        <div style={{position: 'absolute', right: 10, top: 10}}>
          {address}{' '}
          <a href="#" onClick={signOut}>
            Disconnect Wallet
          </a>
        </div>
      )}
    </div>
  )
}
