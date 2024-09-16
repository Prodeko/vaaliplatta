import ContentWindow from "./components/ContentWindow"
import TopHeaderBar from "./components/TopHeaderBar"
import LeftNavBar from "./components/LeftNavBar"
// import TietoaVaaleista from "./tietoaVaaleista"

function App() {
  return (
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
  )
}

export default App
