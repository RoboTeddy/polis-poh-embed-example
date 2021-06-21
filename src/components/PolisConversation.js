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

  return <div className="polis" {...props} />
}
