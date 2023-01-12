'use strict'

const { File, Web3Storage } = require('web3.storage')

const { ALCHEMY_API_KEY, WEB3_STORAGE_API_KEY } = process.env

const userPage = (subdomain, alchemy) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subdomain}</title> <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js" type="application/javascript"></script> <style>/** global.css **/ html, body{position: relative; width: 100%; height: 100%; box-sizing: border-box;}*, *:before, *:after{box-sizing: inherit;}body{color: #333; margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;}a{color: rgb(0,100,200); text-decoration: none;}a:hover{text-decoration: underline;}a:visited{color: rgb(0,80,160);}</style> <style>#content{display: none;}#loading{display: flex; flex-direction: column; justify-content: center; margin: 0; padding: 0; width: 100vw; height: 100vh; font-size: 3em; text-align: center;}#avatar{display: block; width: 15ch; height: 15ch; margin: 0 auto; border-radius: 50%; border: 3px solid #000; background: #f5f5f5; overflow: hidden;}img{width: 100%;}#banner{padding: 1em 0; text-align: center; background: #464646; color: #f5f5f5;}ul{list-style-type: none; padding: 0; margin: 1em 0; display: flex; flex-direction: column; justify-content: space-evenly;}a{display: block; margin: 0.5em; padding: 1em; text-align: center; background: #f5f5f5; border: 3px solid #464646; color: #464646;}#error-msg{display:none;color:#ffffff;background:#ff5656;padding:2em;text-align:center;font-size:1.5em;}</style> </head> <body> <div id="loading"><p>Loading</p></div><div id="content"> <section id="banner"> <div id="avatar"> </div></section> <section id="body"> <ul id="profile-links"> </ul> </section> </div><div id="error-msg"><p>Unable to find this subdomain</p></div><script>var ENS_SUBDOMAIN='${subdomain}'; var node=ethers.utils.namehash(ENS_SUBDOMAIN); var provider=new ethers.providers.AlchemyProvider('ropsten', '${alchemy}'); const registryAbi = new ethers.utils.Interface(['function recordExists(bytes32 node) external virtual view returns (bool)','function resolver(bytes32 node) external virtual view returns (address)']);const registry = new ethers.Contract('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', registryAbi, provider);var textTranslate={'com.instagram':{handler: h=> \`https://instagram.com/\${h}\`, pretty: 'Instagram'}, 'com.twitter':{handler: h=> \`https://twitter.com/\${h.startsWith('@') ? h : '@'+h}\`, pretty: 'Twitter'}, 'com.facebook':{handler: h=> \`https://facebook.com/\${h}\`, pretty: 'Facebook'}}; var toGateway=cid=> \`https://ipfs.io/ipfs/\${cid}\`; async function loadProfile (){const resolverAddr = await registry.resolver(node);const resolverAbi = new ethers.utils.Interface(['function text(bytes32 node, string calldata key) external view returns (string memory)']);const resolver = new ethers.Contract(resolverAddr, resolverAbi, provider);const subdomainExists = await registry.recordExists(node);if (!subdomainExists) {throw new Error('Subdomain does not exist');}var socialsRequests=['com.twitter', 'com.facebook', 'com.instagram'].map(async k=>{return{type: k, value: await resolver.text(node, k)}}); var links=await Promise.all(socialsRequests); var avatar=await resolver.text(node, 'avatar'); return{name: ENS_SUBDOMAIN.split('.')[0], avatar: avatar ? toGateway(avatar) : '', links};}function buildBanner (profile){if (profile.avatar){var img=document.createElement('img'); img.src=profile.avatar; var avatarContainer=document.getElementById('avatar'); avatarContainer.appendChild(img);}var heading=document.createElement('h1'); heading.appendChild(document.createTextNode(profile.name)); var banner=document.getElementById('banner'); banner.appendChild(heading);}function buildLinks (links){var listEl=links.map(({type, value})=>{var listItem=document.createElement('li'); var anchor=document.createElement('a'); anchor.href=textTranslate[type].handler(value); var linkText=document.createTextNode(\`\${value} on \${textTranslate[type].pretty}\`); anchor.appendChild(linkText); listItem.appendChild(anchor); return listItem;}); var profileLinks=document.getElementById('profile-links'); listEl.forEach(item=> profileLinks.appendChild(item));}var loadingEl=document.getElementById('loading');var contentEl=document.getElementById('content');loadProfile() .then(profile=>{buildBanner(profile); buildLinks(profile.links);}) .then(()=>{ loadingEl.style.display='none'; contentEl.style.display='block';}) .catch(err=> {loadingEl.style.display='none';contentEl.style.display='none';var errorEl=document.getElementById('error-msg');errorEl.style.display='block';console.log('the error', err);}); </script> </body></html>
`

const ipfsClient = new Web3Storage({ token: WEB3_STORAGE_API_KEY })

const cors = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  },
  statusCode: 200,
  body: 'preflight'
}

const handler = async (event) => {
  const { httpMethod, body, isBase64Encoded } = event

  if (httpMethod === 'OPTIONS') return cors

  if (httpMethod !== 'POST') return { statusCode: 404, body: 'Route not found' }

  const { subdomain } = JSON.parse(isBase64Encoded ? Buffer.from(body, 'base64').toString() : body)

  const siteBuffer = Buffer.from(userPage(subdomain, ALCHEMY_API_KEY))
  const files = [new File([siteBuffer], 'index.html')]

  try {
    const cid = await ipfsClient.put(files)
    console.log(`Saved ${subdomain} as ${cid}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ hash: cid }),
      isBase64Encoded: false,
      headers: cors.headers
    }
  } catch (error) {
    console.error('the error', error)
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
