import useToimarivisaView from "../hooks/useToimarivisaView"

// Link to the toimarivisa shown above the election description
export default function ToimarivisaCard() {
    const { openToimarivisa } = useToimarivisaView()

    return (
        <section aria-labelledby="toimarivisa-otsikko" className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-md bg-blue-50 p-6">
            <div className="flex flex-[1_1_320px] items-start gap-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-blue-600">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2" />
                    <path d="M12 17h.01" />
                </svg>
                <div>
                    <h2 id="toimarivisa-otsikko" className="mb-1.5 text-xl font-extrabold leading-snug">Mikä toimarirooli sopisi sinulle?</h2>
                    <p className="leading-relaxed text-gray-700">Vastaa 10 kysymykseen, niin ehdotamme sinulle pestiä tämän vuoden vaaleista.</p>
                </div>
            </div>
            <button
                onClick={openToimarivisa}
                className="inline-flex min-h-12 items-center rounded-md bg-blue-600 px-7 py-3.5 text-lg font-extrabold text-white hover:bg-blue-700"
            >
                Tee toimarivisa
            </button>
        </section>
    )
}
