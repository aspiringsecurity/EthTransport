import { ethers } from "ethers";
import { SiweMessage } from "siwe";

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
const signer = provider.getSigner();
const chainId = 1;
const uri = "https://localhost/login";
const version = "1";

export async function generateAuthSig() {
  const siweMessage = new SiweMessage({
    domain: "localhost",
    address: await signer.getAddress(),
    statement: "hello! Sign for the weather response API project",
    uri,
    version,
    chainId,
  });
  const messageToSign = siweMessage.prepareMessage();
  const sig = await signer.signMessage(messageToSign);
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: await signer.getAddress(),
  };
}
