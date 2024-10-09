import TopHeaderBar from "./components/TopHeaderBar"
import LeftNavBar from "./components/LeftNavBar"
import { useAppState } from "./hooks/useAppState"
import TietoaVaaleista from "./components/tietoaVaaleista"
import PositionView from "./components/Position"
import Error from "./components/Error"

export default function App() {
  const { position } = useAppState()

  const content = position
    ? <PositionView position={position} />
    : <TietoaVaaleista />

  return (
    <div className="h-screen bg-cover bg-center background-image font-sans">
      <Error />
      <TopHeaderBar />
      <div className="grid-cols-12 grid bg-white p-3 min-h-full">
        <div className="col-span-2" >
          <LeftNavBar />
        </div>
        <div className="col-span-10 bg-white p-4">
          {content}
        </div>
      </div>
    </div>
  )
}
