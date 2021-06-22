import React, {useEffect} from 'react'

export default function PolisConversation(props) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://pol.is/embed.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // polis' iframe height is hardcoded to 569px
  // set overflow to 'hidden' because while polis is loading its iframe
  // gets temporarily huge.
  return (
    <div style={{width: 800, height: 569, borderRadius: 8}}>
      <div className="polis" {...props} />
    </div>
  )
}
