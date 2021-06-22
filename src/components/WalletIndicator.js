import React from 'react'
import WalletIcon from '../images/thenounproject_wallet_82813.svg'
import {primaryColor} from '../colors'

export default function WalletIndicator({address, reset, style}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        fontSize: 14,
        width: 180,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <WalletIcon style={{width: 20, height: 20, paddingRight: 5}} />
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
      <div
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: primaryColor,
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
          color: 'white',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'center',
        }}
        onClick={(e) => {
          e.preventDefault()
          reset()
        }}
      >
        Disconnect Wallet
      </div>
    </div>
  )
}
