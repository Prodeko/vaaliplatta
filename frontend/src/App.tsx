import ContentWindow from "./components/ContentWindow"
import TopHeaderBar from "./components/TopHeaderBar"
import LeftNavBar from "./components/LeftNavBar"
// import TietoaVaaleista from "./tietoaVaaleista"
import { useParams } from "react-router"
import { ElectionProvider } from "./context/ElectionContext.tsx";

function App() {
  const { electionId } = useParams();

  return (
    <ElectionProvider {...{ electionId }}>
      <div className="h-screen bg-cover bg-center background-image font-sans">
        <TopHeaderBar />
        <div className="grid-cols-12 grid bg-white p-3">
          <div className="col-span-2" >
            <LeftNavBar />
          </div>
          <div className="col-span-10">
            <ContentWindow />
          </div>
        </div>
        {/* <TietoaVaaleista /> */}
      </div>
    </ElectionProvider>
  )
}

export default App
