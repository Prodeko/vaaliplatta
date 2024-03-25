import ContentWindow from "./ContentWindow"
import TopHeaderBar from "./TopHeaderBar"
import LeftNavBar from "./LeftNavBar"
// import TietoaVaaleista from "./tietoaVaaleista"

function App() {
  return (
    <div className="h-screen bg-cover bg-center background-image">
      <TopHeaderBar />
      <div className="grid-cols-12 grid">
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
