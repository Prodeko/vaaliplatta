import { useAppState } from "../hooks/useAppState"

function TietoaVaaleista() {
  const { election } = useAppState()
  return (
    <div>
      {election?.description ?? "loading..."}
    </div>)
}
export default TietoaVaaleista