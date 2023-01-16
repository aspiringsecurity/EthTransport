/*
* Adapted from https://github.com/web3-storage/w3console/blob/main/components/Authenticator.js
*/
import React, { useState } from 'react'
import { useAuth, AuthStatus } from '@w3ui/react-keyring'

export default function Authenticator({ children }) {
    const { identity, authStatus, registerAndStoreIdentity, cancelRegisterAndStoreIdentity } = useAuth()
    const [email, setEmail] = useState('')

    if (authStatus === AuthStatus.SignedIn) {
        return children
    }

    if (authStatus === AuthStatus.EmailVerification) {
        return (
            <div className='w-full h-screen flex justify-center items-center'>
                <div className='mb-8'>
                    <div>
                        <h1 className='text-xl'>Verify your email address!</h1>
                        <p className='pt-2 pb-4'>Click the link in the email we sent to {identity && identity.email} to sign in.</p>
                        <form onSubmit={e => { e.preventDefault(); cancelRegisterAndStoreIdentity() }}>
                            <button type='submit' className='flex items-center gap-2 rounded px-2 py-1 mr3 bg-gray-400 dark:bg-gray-900'>Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const handleRegisterSubmit = async e => {
        e.preventDefault()
        try {
            await registerAndStoreIdentity(email)
        } catch (err) {
            throw new Error('failed to register', { cause: err })
        }
    }

    return (
        <form onSubmit={handleRegisterSubmit}>
            <div className='w-full h-screen flex justify-center items-center'>
                <div className='mb-8'>
                    <label htmlFor='email' className='block mb-2'>Email address:</label>
                    <input id='email' className='rounded block p-2 w-72 bg-gray-300 dark:bg-gray-900' type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder="email@someplace.com" required />
                    <button type='submit' className='rounded px-2 py-1 bg-orange-300 text-black mt-4 w-full'>Register</button>
                </div>
            </div>
        </form>
    )
}

/**
 * Wrapping a component with this HoC ensures an identity exists.
 */
export function withIdentity(Component) {
    const c = props => (
        <Authenticator>
            <Component {...props} />
        </Authenticator>
    )
    c.displayName = `${Component.displayName} with Identity`
    return c
}
