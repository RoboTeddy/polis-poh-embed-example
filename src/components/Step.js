import React from 'react'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 320,
  padding: 30,
  minHeight: 320,
  justifyContent: 'space-between',
}

const topStyle = {
  textAlign: 'center',
}

const bottomStyle = {
  height: 48,
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

export default function Step({title, subtitle, image, button}) {
  return (
    <div style={style}>
      <div style={topStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <span style={subtitleStyle}>{subtitle}</span>
      </div>
      {image}
      <div style={bottomStyle}>{button}</div>
    </div>
  )
}
