import { useRef, FormEvent } from 'react';
import Editor, { EditorRef } from './TextEditor'; // Assuming the RTEditor component is in the same directory



const ParentForm = () => {
    const editorRef = useRef<EditorRef>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const editorHTML = editorRef.current?.getHTML();
        console.log('Editor HTML:', editorHTML);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Editor ref={editorRef} />
            <button type="submit">Submit</button>
        </form>
    );
};

export default ParentForm;
