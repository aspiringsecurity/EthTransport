<script>
  import { ethers } from 'ethers'
  import { ENSRegistryWithFallback, Resolver } from '@ensdomains/ens-contracts'
  import contentHash from '@ensdomains/content-hash/dist/index.js'

  export let profile;
  export let provider;
  let signer = null
  let creatingProfile = ''

  console.log('userprofile', profile)
  const env = {
    ENS_REGISTRY_ADDRESS: process.env.ENS_REGISTRY_ADDRESS,
    ENS_NODE: process.env.ENS_NODE,
    RESOLVER_ADDRESS: process.env.RESOLVER_ADDRESS,
    DEPLOY_IPFS_ROUTE: process.env.DEPLOY_IPFS_ROUTE,
    SITE_MANAGER_ADDRESS: process.env.SITE_MANAGER_ADDRESS,
  }

  const ensRegistry = new ethers.Contract(env.ENS_REGISTRY_ADDRESS, ENSRegistryWithFallback, provider)

  const subdomain = label => `${label}.${env.ENS_NODE}`
  const hasher = node => ethers.utils.namehash(node)

  async function deployPage (label) {
    const response  = await fetch(env.DEPLOY_IPFS_ROUTE, {
      method: 'POST',
      body: JSON.stringify({ subdomain: subdomain(label) })
    })

    const { hash } = await response.json()

    return { ipfsHash: hash, label }
  }

  async function saveProfile ({ ipfsHash, label }) {
    if (!signer) {
      await provider.send("eth_requestAccounts", [])
      signer = provider.getSigner()
    }

    console.log('ipfshash', ipfsHash)
    console.log('hashed', contentHash.fromIpfs(ipfsHash))

    const node = hasher(subdomain(label))
    const resolverAddr = await ensRegistry.resolver(node)
    const resolver = new ethers.Contract(resolverAddr, Resolver, signer)

    // set contenthash
    const hashSet = resolver.interface.encodeFunctionData(
      'setContenthash',
      [node, `0x${contentHash.fromIpfs(ipfsHash)}`]
    )

    // set all the text fields
    const textSetters = profile.links.map(link => {
      let key = ''
      if (link.description.toLowerCase().includes('twitter')) key = 'com.twitter'
      else if (link.description.toLowerCase().includes('instagram')) key = 'com.instagram'
      else if (link.description.toLowerCase().includes('facebook')) key = 'com.facebook'
      else return null

      return resolver.interface.encodeFunctionData('setText', [node, key, link.value])
    }).filter(link => link !== null)

    let avatarSet = null
    if (profile.avatarCid) {
      console.log('there is an avatar')
      avatarSet = resolver.interface.encodeFunctionData('setText', [node, 'avatar', profile.avatarCid])
    }

    const siteManager = new ethers.Contract(env.SITE_MANAGER_ADDRESS, ['function subdomainRegister(bytes32 label, bytes[] calldata data) external returns (bytes[] memory)'], signer)

    const encodedFunctions = [hashSet, ...textSetters, avatarSet].filter(f => f)

    console.log('multicalldata', encodedFunctions)
    console.log('label', label, ethers.utils.id(label))
    const multiTx = await siteManager.subdomainRegister(ethers.utils.id(label), encodedFunctions, { gasLimit: 500000 })
    const txResult = await multiTx.wait()

    console.log('txresult', txResult)

    return ipfsHash
  }

  let pageLink = ''
  const toGateway = cid => `https://dweb.link/ipfs/${cid}`

  function createPage (profile) {
    return function (ev) {
      creatingProfile = 'triggered'
      return deployPage(profile.username)
        .then(saveProfile)
        .then(ipfsHash => {
          pageLink = toGateway(ipfsHash)
          creatingProfile = 'complete'
        })
        .catch(err => {
          creatingProfile = 'failed'
          console.log('error saving page', err)
        })
    }
  }
</script>

<section id="confirmation">
  <h2>Confirmation</h2>
  <p>Below are the values we will use to create your LinkENS site and store in ENS</p>
  <ul>
    <li><em>{profile.username}</em>.ethonline2021char.eth</li>
    {#each profile.links as link}
      <li><em>{link.description}</em>: {link.value}</li>
    {/each}
  </ul>
  <button on:click={createPage(profile)}>Save</button>
</section>

<section id="status">
  {#if creatingProfile === 'complete'}
    <p style="color: green">Page saved!</p>
    <p>View at <a href={pageLink}>{subdomain(profile.username)}</a></p>
  {:else if creatingProfile === 'triggered'}
    <p>Saving</p>
    <p>Please approve in wallet and wait for transaction to finalize</p>
  {:else if creatingProfile === 'failed'}
    <p style="color: red">Saving to ENS failed</p>
  {:else}
  {/if}
</section>

<style>
  section {
    padding: 1em;
  }

  #confirmation em {
    font-weight: bold;
    font-style: normal;
  }

  #confirmation button {
    display: block;
    margin: 0 auto;
  }

  #status {
    text-align: center;
  }
</style>
