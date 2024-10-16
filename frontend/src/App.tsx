import TopHeaderBar from "./components/TopHeaderBar"
import LeftNavBar from "./components/LeftNavBar"
import { useAppState } from "./hooks/useAppState"
import Election from "./components/Election"
import PositionView from "./components/Position"
import Error from "./components/Error"
import { ApplicationModal, ApplicationForm } from "./components/ApplicationModal"

export default function App() {
  const { position } = useAppState();

  const content = position
    ? <PositionView position={position} />
    : <div className="
        md:col-span-6
        lg:col-span-8
        xl:col-span-10
        2xl:col-span-10">
      <Election />
    </div>

  return (
    <div className="h-screen bg-cover bg-center background-image font-sans">
      <Error />
      <TopHeaderBar />
      <ApplicationModal />
      <ApplicationForm />
      <div className="p-3 min-h-full bg-white 
        sm:block 
        md:grid md:grid-cols-8 
        lg:grid-cols-10 
        xl:grid-cols-12 
        2xl:grid-cols-12 gap-3">
        <div className="col-span-2">
          <LeftNavBar />
        </div>
        {content}
      </div>
    </div>
  );
}

