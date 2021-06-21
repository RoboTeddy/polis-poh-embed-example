import React from 'react'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 320,
  padding: 30,
  height: 320,
  justifyContent: 'space-between',
}

const topStyle = {
  textAlign: 'center',
}

const bottomStyle = {
  height: 40,
}

const titleStyle = {
  fontSize: 28,
  fontWeight: 500,
  textAlign: 'center',
}

const subtitleStyle = {
  color: '#999',
  textAlign: 'center',
}

export default function SignInStep({title, subtitle, image, button}) {
  return (
    <div style={style}>
      <div style={topStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <span style={subtitleStyle}>{subtitle}</span>
      </div>
      <div style={bottomStyle}>{button}</div>
    </div>
  )
}
