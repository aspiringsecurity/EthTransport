<script>
  import { ethers } from 'ethers'

  import PageForm from '../components/PageForm.svelte'
  import SelectSubdomain from '../components/SelectSubdomain.svelte'
  import Confirmation from '../components/Confirmation.svelte'
  import { Steps, Step } from '../components/steps'

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  let username = ''
  let links
  let avatarCid = ''

  $: userProfile = { username, links, avatarCid }
</script>

<main>
  <Steps>
    <Step title="Select username" let:slotStep>
      <SelectSubdomain bind:username={username} {provider} />
    </Step>

    <Step title="Fill in social">
      <PageForm bind:avatarCid={avatarCid} bind:profile={links} />
    </Step>

    <Step title="Confirmation">
      <Confirmation profile={userProfile} {provider} />
    </Step>
  </Steps>
</main>

<style>
  main {
    padding: 0;
  }

  @media (min-width:801px) { /* tablet, landscape iPad, lo-res laptops ands desktops */
  }
</style>
