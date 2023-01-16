
export async function fetchCID(cid: string) {
  const response = await fetch(`https://${cid}.ipfs.w3s.link`)
  return await response.json()
}