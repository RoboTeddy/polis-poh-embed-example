import React from 'react'
import Loader from 'react-loader-spinner'
import {primaryColor, disabledTextColor} from '../colors'

const style = {
  height: 48,
  paddingLeft: 50,
  paddingRight: 50,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  backgroundColor: primaryColor,
  position: 'relative', // let spinner be positioned absolutely
}

export default function Button({label, onClick, isBusy = false}) {
  return (
    <div
      style={{
        ...style,
        ...{
          cursor: isBusy ? 'default' : 'pointer',
          color: isBusy ? disabledTextColor : 'white',
        },
      }}
      onClick={isBusy ? () => {} : onClick}
    >
      {label}
      <Loader
        type="TailSpin"
        color={disabledTextColor}
        height={18}
        width={18}
        style={{position: 'absolute', right: '20px'}}
        visible={isBusy}
      />
    </div>
  )
}
