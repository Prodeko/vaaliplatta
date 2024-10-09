import TopHeaderBar from "./components/TopHeaderBar"
import LeftNavBar from "./components/LeftNavBar"
import { useAppState } from "./hooks/useAppState"
import Election from "./components/Election"
import PositionView from "./components/Position"
import Error from "./components/Error"

export default function App() {
  const { position } = useAppState();

  const content = position
    ? <PositionView position={position} />
    : <Election />;

  return (
    <div className="h-screen bg-cover bg-center background-image font-sans">
      <Error />
      <TopHeaderBar />
      <div className="grid sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-12 gap-3 p-3 min-h-full bg-white">
        <div className="col-span-2 lg:col-span-3 xl:col-span-3">
          <LeftNavBar />
        </div>
        <div className="col-span-6 md:col-span-8 lg:col-span-9 xl:col-span-9 px-4">
          {content}
        </div>
      </div>
    </div>
  );
}

