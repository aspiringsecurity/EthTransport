import React, { useState } from 'react'
import { useKeyring } from '@w3ui/react-keyring'

export default function Authenticator ({ children }) {
  const [{ space }, { createSpace, registerSpace, cancelRegisterSpace }] = useKeyring()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (space?.registered()) {
    return children
  }

  if (submitted) {
    return (
      <div>
        <h1 className='near-white'>Verify your email address!</h1>
        <p>Click the link in the email we sent to {email} to sign in.</p>
        <form onSubmit={e => { e.preventDefault(); cancelRegisterSpace() }}>
          <button type='submit' className='ph3 pv2'>Cancel</button>
        </form>
      </div>
    )
  }

  const handleRegisterSubmit = async e => {
    e.preventDefault()
    setSubmitted(true)
    try {
      await createSpace()
      await registerSpace(email)
    } catch (err) {
      throw new Error('failed to register', { cause: err })
    } finally {
      setSubmitted(false)
    }
  }

  return (
    <form onSubmit={handleRegisterSubmit}>
      <div className='mb3'>
        <label htmlFor='email' className='db mb2'>Email address:</label>
        <input id='email' className='db pa2 w-100' type='email' value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button type='submit' className='ph3 pv2' disabled={submitted}>Register</button>
    </form>
  )
}

/**
 * Wrapping a component with this HoC ensures an identity exists.
 */
export function withIdentity (Component) {
  return props => (
    <Authenticator>
      <Component {...props} />
    </Authenticator>
  )
}
