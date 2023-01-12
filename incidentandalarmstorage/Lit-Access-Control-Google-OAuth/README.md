# Lit Protocol Oauth to Enable faster login for 5 different personas

The 5 different personas: Citizen, Police officer, dispatcher, admin, government roles can easily be authenticated and logged in so that they can use their Ethereum address.

We are extending the example on how to use the Lit Protocol Oauth service to authenticate users and then use their Ethereum address.

This project specifically:

1. Uses Google Oauth to auth the user
2. Mints a PKP token for the user, with their Google account as a valid auth method
3. Uses the PKP token to get an Ethereum address for the user
4. Generates a local session key for the user and stores it in LocalStorage
5. Uses the Lit Protocol's PKP Session Signing service to sign that session key with their PKP
6. Uses the local session key to sign a request to encrypt and decrypt a string that only the user can decrypt.

## How to run

First, run `yarn install`. Then run `yarn start` to run this project. You'll need a Metamask wallet set to the Mumbai network with some testnet MATIC in it.

Sign in with Google and wait until it says "PKP Minted". Then, click the "Encrypt then Decrypt with Lit" button. If you see the word "Success!" at the top, then it worked! Open the dev console to see how it works.
