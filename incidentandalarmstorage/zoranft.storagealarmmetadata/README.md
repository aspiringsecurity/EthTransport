We are using NFT.Storage  for storing a variety of offchain data like incident snapshots, alarm metadata and object types at the time of incident. Please find the video at https://drive.google.com/drive/folders/1lxeHbPzLoF0DzDZkh9N7Z_5aTKjmdEza (screencapturewithoutsound.mov file). We are storing Alarm metadata using NFT.Storage. Also, Saving/deleting alarm metadata and image to/from IPFS using NFT.Storage. We are also storing the hash returned from IPFS to Ethereum test network using  NFT.Storage.
 Further we are using NFT.Storage for: Video analytics configuration using NFT.Storage; Camera Management: Add/edit/delete cameras with integration with Livepeer, NFT.Storage; Live streaming with Object Detection Video Analytics using Livepeer for streaming, and NFT.Storage for snapshots.


# Client Libraries

The JS client library is the official and supported client to nft.storage. Other libraries listed have been generated from the [OpenAPI schema](https://nft.storage/schema.yml) and are experimental, unsupported and may not work at all!

- [JavaScript](https://github.com/nftstorage/nft.storage/tree/main/packages/client)
- [Go](https://github.com/nftstorage/go-client) (Generated from OpenAPI schema)
- [Java](https://github.com/nftstorage/java-client) (Generated from OpenAPI schema)
- [PHP](https://github.com/nftstorage/php-client) (Generated from OpenAPI schema)
- [Python](https://github.com/nftstorage/python-client) (Generated from OpenAPI schema)
- [Ruby](https://github.com/nftstorage/ruby-client) (Generated from OpenAPI schema)
- [Rust](https://github.com/nftstorage/rust-client) (Generated from OpenAPI schema)
- [Unity (C#)](https://github.com/filipepolizel/unity-nft-storage)

# HTTP API

Check out the [HTTP API documentation](https://nft.storage/api-docs).

# Examples

See the [`examples`](./examples) directory in this repository for some example projects you can use to get started.

The [`examples/client`](./examples/client/) directory contains projects using the JS client library in the browser and node.js.

In [`examples/ucan-node`] you can find an example of using [`ucan.storage`](https://github.com/nftstorage/ucan.storage) for delegated authorization using [User Controlled Authorization Networks (UCAN)](https://ucan.xyz/).

# Developer Tools

We've created some scripts to help developers with bulk imports, status checks, file listings and more:

https://github.com/nftstorage/nft.storage-tools

# Development

Instructions for setting up a development environment can be found in [DEVELOPMENT.md](./DEVELOPMENT.md). Please [let us know](https://github.com/nftstorage/nft.storage/issues) if anything is missing.

# Contributing

Feel free to join in. All welcome. [Open an issue](https://github.com/nftstorage/nft.storage/issues)!

If you're opening a pull request, please see the [guidelines in DEVELOPMENT.md](./DEVELOPMENT.md#how-should-i-write-my-commits) on structuring your commit messages so that your PR will be compatible with our [release process](./DEVELOPMENT.md#release).

# License

Dual-licensed under [MIT + Apache 2.0](https://github.com/nftstorage/nft.storage/blob/main/LICENSE.md)
