import { classNames, truncate, formatDate } from '../helpers'
import Link from 'next/link'
import Address from './Address'
import { useRouter } from 'next/router'
import { Conversation } from '@xmtp/xmtp-js/dist/types/src/conversations'
import useConversation from '../hooks/useConversation'
import { XmtpContext } from '../contexts/xmtp'
import { Message } from '@xmtp/xmtp-js'
import useWallet from '../hooks/useWallet'
import Avatar from './Avatar'
import { useContext } from 'react'

type ConversationsListProps = {
  conversations: Conversation[],
  followings: string[]
}

type ConversationTileProps = {
  conversation: Conversation
  isSelected: boolean
  onClick?: () => void
  isConnected: boolean
}

const getLatestMessage = (messages: Message[]): Message | null =>
  messages.length ? messages[messages.length - 1] : null

const ConversationTile = ({
  conversation,
  isSelected,
  onClick,
  isConnected,
}: ConversationTileProps): JSX.Element | null => {
  const { lookupAddress } = useWallet()
  const { messages } = useConversation(conversation.peerAddress)
  const latestMessage = getLatestMessage(messages)
  const path = `/dm/${conversation.peerAddress}`
  if (!latestMessage) {
    return null
  }
  return (
    <Link href={path} key={conversation.peerAddress}>
      <a onClick={onClick}>
        <div
          className={classNames(
            'h-20',
            'py-2',
            'px-4',
            'md:max-w-sm',
            'mx-auto',
            'bg-white',
            'space-y-2',
            'py-2',
            'flex',
            'items-center',
            'space-y-0',
            'space-x-4',
            'border-b-2',
            'border-gray-100',
            'hover:bg-bt-100',
            isSelected ? 'bg-bt-200' : null
          )}
        >
          <Avatar peerAddress={conversation.peerAddress} />
          <div className="py-4 sm:text-left text w-full">
            <div className="grid-cols-2 grid">
              <Address
                address={conversation.peerAddress}
                className="text-black text-lg md:text-md font-bold place-self-start"
                lookupAddress={lookupAddress}
              />
              <span
                className={classNames(
                  'text-lg md:text-sm font-normal place-self-end',
                  isSelected ? 'text-n-500' : 'text-n-300'
                )}
              >
                {isConnected?
                  <div style={{width: '16px', height: '16px', display: 'inline-block', color: 'blue', verticalAlign: 'middle', marginRight: '4px'}}>
                    <svg viewBox="0 0 32 32" focusable="false" className="chakra-icon css-1h8cgbe" aria-label="Verified collection">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.4171 3.24982L16.0007 1.33337L12.5842 3.24982L8.66732 3.29834L6.66684 6.66623L3.29895 8.66671L3.25043 12.5836L1.33398 16L3.25043 19.4165L3.29895 23.3334L6.66684 25.3338L8.66732 28.7017L12.5842 28.7503L16.0007 30.6667L19.4171 28.7503L23.334 28.7017L25.3345 25.3338L28.7024 23.3334L28.7509 19.4165L30.6673 16L28.7509 12.5836L28.7024 8.66671L25.3345 6.66623L23.334 3.29834L19.4171 3.24982ZM9.00065 16.5L14.0007 21.5L23.0007 12.6L21.4007 11L14.0007 18.4L10.6007 15L9.00065 16.5Z" fill="currentColor"></path>
                    </svg>
                  </div>
                :
                  <></>
                }
                {formatDate(latestMessage?.sent)}
              </span>
            </div>
            <p
              className={classNames(
                'text-[13px] md:text-sm font-normal text-ellipsis mt-0',
                isSelected ? 'text-n-500' : 'text-n-300'
              )}
            >
              {latestMessage && truncate(latestMessage.content, 75)}
            </p>
          </div>
        </div>
      </a>
    </Link>
  )
}

const ConversationsList = ({
  conversations,
  followings,
}: ConversationsListProps): JSX.Element => {
  const router = useRouter()
  const { getMessages } = useContext(XmtpContext)
  const orderByLatestMessage = (
    convoA: Conversation,
    convoB: Conversation
  ): number => {
    const convoAMessages = getMessages(convoA.peerAddress)
    const convoBMessages = getMessages(convoB.peerAddress)
    const convoALastMessageDate =
      getLatestMessage(convoAMessages)?.sent || new Date()
    const convoBLastMessageDate =
      getLatestMessage(convoBMessages)?.sent || new Date()
    return convoALastMessageDate < convoBLastMessageDate ? 1 : -1
  }
  return (
    <div>
      {conversations &&
        conversations.sort(orderByLatestMessage).map((convo) => {
          const isConnected =
            followings.includes(convo.peerAddress.toLowerCase())
          const isSelected =
            router.query.recipientWalletAddr == convo.peerAddress
          return (
            <ConversationTile
              key={convo.peerAddress}
              conversation={convo}
              isSelected={isSelected}
              isConnected={isConnected}
            />
          )
        })}
    </div>
  )
}

export default ConversationsList
