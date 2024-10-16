import { useAppState } from "../hooks/useAppState"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"

export default function Election() {
  const { election } = useAppState()
  return (
    <div className="my-4">
      {election?.description ? <HtmlRenderer htmlContent={election?.description} /> : <Loading />}
    </div>)
}