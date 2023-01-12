'use strict'

import { readable } from 'svelte/store'

// TODO not likely to have an array in the future, should be a lookup function
export const temporaryData = readable([
  {
    name: 'Tim',
    avatar: '/man1.jpeg',
    userId: 'tim',
    links: [
      {
        id: 'com.twitter',
        value: 'https://twitter.com/@tim91272',
        description: 'Check out my tweets'
      }
    ]
  },

  {
    name: 'Alice',
    avatar: '/woman1.jpeg',
    userId: 'alice',
    links: [
      {
        id: 'com.twitter',
        value: 'https://twitter.com/@alease28721',
        description: 'Check out my tweets'
      }
    ]
  },

  {
    name: 'Bob',
    avatar: '/man2.jpeg',
    userId: 'bob',
    links: [
      {
        id: 'com.twitter',
        value: 'https://twitter.com/@buildingboblul',
        description: 'Check out my tweets'
      }
    ]
  },

  {
    name: 'Janet',
    avatar: '/woman2.jpeg',
    userId: 'janet',
    links: [
      {
        id: 'com.twitter',
        value: 'https://twitter.com/@ghostridethewhip2218',
        description: 'Check out my tweets'
      }
    ]
  }
])

/***
 * TODO have a structure with a parser and converter
 *
 * 'vnd.name': { parser: val => '', convert: handle => '' }
 */
const vendorConversion = {
  'com.twitter': handle => `https://twitter.com/${handle}`,
  'com.github': username => `https://github.com/${username}`,
  'com.youtube.channel': channel => `https://youtube.com/c/${channel}`,
  'com.youtube.user': username => `https://youtube.com/user/${username}`,
  'com.instagram': username => `https://instagram.com/${username}`,
  'com.facebook': username => `https://facebook.com/${username}`, // this works for business pages, haven't tested others
}

const supportedVendors = Object.keys(vendorConversion)
