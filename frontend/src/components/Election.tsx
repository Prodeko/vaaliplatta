import { useAppState } from "../hooks/useAppState"
import useConfig from "../hooks/useConfig"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"

export default function Election() {
  const { election } = useAppState()
  const { BLOB_URL } = useConfig()
  return (
    <div className="my-4">
      {election?.description ? <HtmlRenderer htmlContent={election?.description} /> : <Loading />}
      <img src={`${BLOB_URL}/logate.jpg`} alt="Logate logo" className="max-w-xs m-4 mt-12"></img>
    </div>)
}