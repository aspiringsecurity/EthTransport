import { useRouter } from 'next/router'
import useSWR from 'swr'

import { ReadOnlyEditor } from '../../components/plate/Editor'
import Loading from '../../components/Loading'
import { fetchCID } from '../../utils/fetchers'

const NotePage = () => {
  const { query } = useRouter()
  const cid = query.cid
  const { data } = useSWR(cid, fetchCID)

  if (data) {
    return (<ReadOnlyEditor initialValue={data} />)
  } else {
    return (
      <div className="w-full flex flex-row justify-center mt-16 text-blue">
        <Loading />
      </div>
    )
  }
}

export default NotePage
