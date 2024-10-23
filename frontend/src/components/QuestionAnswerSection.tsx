import { FormEvent, useRef, useState } from "react";
import { Answer, Question, useAppState } from "../hooks/useAppState"
import Loading from "./Loading"
import HtmlRenderer from "./HtmlRenderer";
import Divider from "./Divider";
import Editor, { EditorRef } from "./TextEditor";
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests";

type AnswerProps = {
    answer: Answer
}

function AnswerElement({ answer }: AnswerProps) {
    const { BLOB_URL } = useAppState()
    return (
        <div className="border-l-2 border-blue-100 pl-4 my-2">
            <div className="flex">
                <img
                    className="w-12 h-12 my-4 aspect-square object-cover rounded-full"
                    src={answer?.profile_picture ?? BLOB_URL + "/PRODEKO.png"} />
                <div>

                    <p className="font-extrabold m-4">{answer.applicant_name} vastaa</p>
                    <HtmlRenderer htmlContent={answer.content} reduceHeadingSize />
                </div>
            </div>
        </div>
    );
}

type QuestionProps = {
    question: Question
}

function QuestionElement({ question }: QuestionProps) {
    const [isOpen, setIsOpen] = useState(false); // Toggle state for answers

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div>
            <button
                onClick={toggleOpen}
                className="text-left w-full hover:bg-blue-50 rounded-md"
            >
                <div className="flex justify-between">
                    <p className="text-gray-500 italic m-4">{question.nickname} kysyy</p>
                    <p className="text-gray-500 text-sm italic m-4">{isOpen ? "Piilota" : "Näytä"} {question.answers.length} vastausta</p>
                </div>
                <HtmlRenderer htmlContent={question.content} reduceHeadingSize />
            </button>

            {isOpen && (
                <div className="mt-2">
                    {question.answers.map(answer => (
                        <AnswerElement key={answer.answer_id} answer={answer} />
                    ))}
                </div>
            )}
        </div>
    );
}

function QuestionEditor() {
    const editorRef = useRef<EditorRef>(null);
    const { post } = useAuthenticatedRequests()
    const { position } = useAppState()
    const [name, setName] = useState('');

    if (!position) return null
    if (position === "loading") return <Loading />

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const editorHTML = editorRef.current?.getHTML();

        post("/question", {
            content: editorHTML,
            position_id: position.id.toString(),
            nickname: name
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-black font-extrabold text-2xl m-4 inline-flex justify-between">Kysy kysymys</h2>
            <div className="flex gap-4 my-4">
                <label htmlFor="name" className="block m-2 text-sm font-medium text-gray-700">Nimi</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="m-2 block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>
            <Editor ref={editorRef} simplified default_text={`<strong></strong>`} />
            <button className="w-full p-4 mb-2 text-black font-extrabold rounded-md bg-blue-50 hover:bg-blue-100 flex sitems-start animate-bg-fade "
                onClick={() => { }}
            >
                Lähetä
            </button>
        </form>
    )
}

export default function QuestionAnswerSection() {
    const { position } = useAppState()

    if (!position) return null
    if (position === "loading") return <Loading />
    if (!position.questions) return <Loading />
    return (
        <div className="w-full">
            <Divider />
            <h2 className="text-black font-extrabold text-2xl mx-4 mb-4 inline-flex justify-between">Kysymykset hakijoille</h2>
            <div className="p-4 bg-gray-50 rounded-md">
                {position.questions.map(q => <div key={q.id}><QuestionElement question={q} /><Divider /> </div>)}
            </div>
            <QuestionEditor />
        </div>
    )
}