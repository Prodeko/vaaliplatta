import { useState } from "react";
import { Answer, Question, useAppState } from "../hooks/useAppState"
import Loading from "./Loading"
import HtmlRenderer from "./HtmlRenderer";
import Divider from "./Divider";

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
                <p className="text-gray-500 italic m-4">{question.nickname} kysyy</p>
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

export default function QuestionAnswerSection() {
    const { position } = useAppState()

    if (!position) return null
    if (position === "loading") return <Loading />
    if (!position.questions) return <Loading />
    return (
        <div className="w-full">
            <Divider />
            <h2 className="text-black font-extrabold text-2xl m-4">Kysymykset hakijoille</h2>
            {position.questions.map(q => <div key={q.id}><QuestionElement question={q} /><Divider /> </div>)}
        </div>
    )
}