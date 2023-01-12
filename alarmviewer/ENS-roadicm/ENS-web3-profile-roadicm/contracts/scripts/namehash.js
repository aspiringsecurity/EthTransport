const { namehash } = require('@ensdomains/ensjs')

const [label] = process.argv.slice(2)

console.log('hash', namehash(label))
