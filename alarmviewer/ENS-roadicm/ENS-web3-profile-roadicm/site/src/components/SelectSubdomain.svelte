<script>
  export let provider = null
  export let active = true
  export let username = ''

  import { ethers } from 'ethers'
  import { ENSRegistryWithFallback } from '@ensdomains/ens-contracts'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const States = {
    IDLE: 0,
    CHECKING: 1,
    AVAILABLE: 2, 
    UNAVAILABLE: 3
  }

  const env = {
    ENS_REGISTRY_ADDRESS: process.env.ENS_REGISTRY_ADDRESS,
    ENS_NODE: process.env.ENS_NODE,
  }
  let status = States.IDLE
  const ensRegistry = new ethers.Contract(env.ENS_REGISTRY_ADDRESS, ENSRegistryWithFallback, provider)
  const usernamePlaceholder = 'click-here'
  let chosenUsername = usernamePlaceholder
  let previous = {
    status: States.IDLE,
    username: ''
  }

  $: statusText = Object.keys(States)[status].toLowerCase()

  // check the ENS registry to see if a subdomain is registered
  function checkLabel () {
    status = States.CHECKING
    console.log('chosenusername', chosenUsername)

    return ensRegistry.recordExists(ethers.utils.namehash(`${chosenUsername}.${env.ENS_NODE}`))
      .then(recordExists => {
        status = !recordExists ? States.AVAILABLE : States.UNAVAILABLE
        username = chosenUsername.toLowerCase()
      })
      .catch(err => {
        status = States.UNAVAILABLE
      })
  }

  function selectAll (ev) {
    previous = {
      status,
      username: chosenUsername
    }

    status = States.IDLE
    if (window.getSelection && document.createRange) {
      const range = document.createRange()
      range.selectNodeContents(ev.currentTarget)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    } else if (document.body.createTextRange) {
      const range = document.body.createTextRange()
      range.moveToElementText(ev.currentTarget)
      range.select()
    } else {
      // no safe way to select all because execCommand is deprecated
    }
  }

  function neverEmpty (ev) {
    if (ev.currentTarget.innerHTML === '') {
      chosenUsername = usernamePlaceholder
    }
    if (chosenUsername === previous.username) {
      status = previous.status
    }
  }
</script>

<section>
  <slot>
    <h2>Choose your username</h2>
  </slot>

  <!-- TODO when inactive, use plain text because of svelte limitation -->
  <div id="username">
    <div id="username-editor" contenteditable on:blur={neverEmpty} on:focus={selectAll} bind:innerHTML={chosenUsername}></div>.{env.ENS_NODE}
  </div>

  <button on:click={checkLabel}>Check</button>

  <p class:hidden={status === States.IDLE} style="text-transform: capitalize;">{statusText}</p>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    gap: 2rem;
    margin: 1em;
  }

  h2 {
    margin: 0;
  }

  .hidden {
    visibility: hidden;
  }

  #username-editor {
    display: inline;
    border-bottom: 3px solid #333;
    padding-bottom: 0.1rem;
    font-weight: bold;
  }

  #username-editor:focus {
    font-weight: normal;
  }
</style>
