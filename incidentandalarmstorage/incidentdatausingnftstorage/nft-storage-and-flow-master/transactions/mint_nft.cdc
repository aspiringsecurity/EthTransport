import NonFungibleToken from 0x01
import ExampleNFT from 0x02

transaction(recipient: Address,name: String,ipfsLink: String) {
    let minter: &ExampleNFT.NFTMinter

    prepare(signer: AuthAccount) {
        self.minter = signer.borrow<&ExampleNFT.NFTMinter>(from: ExampleNFT.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
    }

    execute {
        let recipient = getAccount(recipient)

        let receiver = recipient
            .getCapability(ExampleNFT.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        self.minter.mintNFT(recipient: receiver, name: name,ipfsLink:ipfsLink)
    }
}