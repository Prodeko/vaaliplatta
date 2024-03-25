export default function TopHeaderBar() {
    return (
        <>
            <header className="bg-white p-5">
                <nav className="flex justify-between items-center w-[92%]  mx-auto text-xl">
                    <div>
                        <img className="w-16 cursor-pointer" src="./public/prodeko-logo-pieni.png" alt="..." />
                    </div>
                    <div
                        className="nav-links duration-500 md:static absolute bg-white md:min-h-fit min-h-[60vh] left-0 top-[-100%] md:w-auto  w-full flex items-center px-5">
                        <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8">
                            <li>
                                <a className="hover:text-gray-500" href="#">Etusivu</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Kilta</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Abeille</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Fukseille</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Opinnot</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Palvelut</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">ESTIEM</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Yrityksille</a>
                            </li>
                            <li>
                                <a className="hover:text-gray-500" href="#">Alumni</a>
                            </li>
                        </ul>
                        <a href="/fi/profile/" className="profile-icon mr-4" data-trigger="hover" data-content="Profiili" data-original-title="" title="">
                            <i className="fas fa-user-circle"></i>
                        </a>
                    </div>
                    <div className="lang-picker d-flex flex-row justify-content-center">
                        <a href="/fi/palvelut/vaalit/" className="lang mr-1">FI</a>
                        <span>/</span>
                        <a href="/en/" className=" ml-1">EN</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="bg-[#a6c1ee] text-white px-5 py-2 rounded-full hover:bg-[#87acec]">Kirjaudu</button>
                    </div>
                </nav>
            </header>
            <h1 className="text-8xl p-16">Vaalit 2023</h1>
        </>
    )
}