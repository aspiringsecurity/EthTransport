import { NFTStorage } from 'nft.storage';

// Server-only secret: must NOT use the NEXT_PUBLIC_ prefix, or Next.js will
// inline the NFT.Storage API key into the client-side JS bundle.
const key = process.env.NFT_STORAGE_API_KEY || 'undefined';
// NFT.Stroage
// We can fetch storage deal IDs and pinning info from NFT.Storage
// Would be super handy for future when on mainnet for expanded use case
export const fetchNFTStoreStatus = async (ipfsCID: string) => {
  if (key !== 'undefined') {
    const NFTStorageClient = new NFTStorage({
      token: key,
    });
    //request options for cors? ratelimit?
    const nftStatus = await NFTStorageClient.status(ipfsCID);
    return nftStatus;
  }
};
