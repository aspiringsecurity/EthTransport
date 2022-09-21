import NonFungibleToken from  0x01
import ExampleNFT from 0x02


pub fun main(address:Address) : [ExampleNFT.NftData] {
    let account = getAccount(address)
    let nft = ExampleNFT.getNft(address: address)
    return nft
}