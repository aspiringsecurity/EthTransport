import { gql } from "graphql-request"

export const CYBERCONNECT_ENDPOINT = "https://api.cybertino.io/connect/"

export const GET_CONNECTIONS = gql`
  query($address: String!, $first: Int) {
    identity(address: $address) {
      followings(first: $first) {
        list {
          address
          domain
        }
      }
      followers(first: $first) {
        list {
          address
          domain
        }
      }
    }
  }
`
