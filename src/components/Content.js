import React from 'react'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
}

const contentStyle = {
  backgroundColor: 'white',
  borderRadius: 8,
  overflow: 'hidden',
}

export default function Content({children}) {
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>{children}</div>
    </div>
  )
}
