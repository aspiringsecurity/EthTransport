import { useRouter } from 'next/router'
import NoteCreator from '../components/NoteCreator'

export default function Home() {
  const router = useRouter()
  function onCreateNote(cid) {
    router.push(`/notes/${cid}`)
  }
  return (
    <NoteCreator onCreated={onCreateNote} />
  )
}
