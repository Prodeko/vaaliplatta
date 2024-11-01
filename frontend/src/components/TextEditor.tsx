import Image from '@tiptap/extension-image'
import { Slice } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import { EditorContent, useEditor } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import React, { useImperativeHandle, useRef } from 'react';
import { useAppState } from '../hooks/useAppState'
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests'
import useConfig from '../hooks/useConfig'

interface ImageUploaderProps {
    onFile: (file: File) => void;
    highlight: boolean;
    children?: React.ReactNode
}

export const ImageUploader = ({ onFile, highlight, children }: ImageUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return

        const file = event.target.files[0];
        if (file) onFile(file)
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleButtonClick}
                className={`size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent ${highlight ? 'bg-blue-100 hover:bg-blue-200' : ''} hover:bg-blue-100`}
            >
                {children || "img"}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                accept=".png, .jpg, .jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
};

// Extended button element with highlight property
function EditorButton({
    children, onClick, highlight, tooltip, ...rest
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & { highlight: boolean, tooltip: string }) {
    return (
        <div className="relative inline-block">
            <button
                onClick={onClick}
                className={`size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent ${highlight ? 'bg-gray-100' : ''} hover:bg-gray-100`}
                type="button"
                {...rest}
            >
                {children}
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden w-max text-xs text-white bg-gray-700 rounded-lg py-1 px-2 whitespace-nowrap hover:block">
                {tooltip}
            </span>
        </div>
    );
}

export type EditorRef = {
    getHTML: () => string;
}

type EditorProps = {
    simplified?: boolean
    default_text?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Editor = React.forwardRef<EditorRef, EditorProps>(({ simplified, default_text }, ref) => {
    const { ownApplication } = useAppState();
    const { BLOB_URL } = useConfig();
    const { upload } = useAuthenticatedRequests();

    // const [imgLoading, setImgLoading] = useState<boolean>(false);

    const handleDropImage = (view: EditorView, event: DragEvent, _slice: Slice, moved: boolean): boolean => {
        // if not dropping external files
        if (moved || !event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files[0]) return false

        const file = event.dataTransfer.files[0];

        // File is not an image
        if (!(["image/png", "image/gif", "image/jpeg"].includes(file.type))) {
            window.alert("Images need to be in jpg, png or gif format!")
            return false
        }
        // File is too big
        if (file.size > 10_000_000) {
            window.alert("Images have to be less than 10 mb!")
            return false
        }

        // ! Not going to display immediately as this might cause issues with saving image if using undo.
        // ! User might click undo, which undoes the transaction that changes local objecturl to azure url, 
        // ! which, if saved to database doesn't render correctly later.
        // Display image in the editor immediately
        // const _URL = window.URL || window.webkitURL;
        // const url = _URL.createObjectURL(file)
        const { schema } = view.state
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
        const node = schema.nodes.image.create({ src: BLOB_URL + '/spinner.gif' })
        const transaction = view.state.tr.insert(coordinates?.pos || 0, node)
        view.dispatch(transaction)

        // setImgLoading(true)
        // Upload the image to Azure through backend upload API
        const placeholderPosition = coordinates?.pos || 0;
        upload(file).then(response => {
            // If the image upload was successful
            // Update the image in the editor to use azure url

            // response.data should be an array of filenames
            const newUrl = BLOB_URL + '/' + (response.data instanceof Array ? response.data[0] : response.data.toString());
            const newNode = schema.nodes.image.create({ src: newUrl });
            const newTransaction = view.state.tr.replaceWith(placeholderPosition, placeholderPosition + 1, newNode);
            view.dispatch(newTransaction);
        }).catch(error => {

            // If the upload fails, remove the image and show an error
            // const transaction = view.state.tr.delete(placeholderPosition, placeholderPosition + 1);
            // view.dispatch(transaction);
            window.alert("Image upload failed, please try again!\n" + error.toString());
        })

        return true;
    }

    const editor = useEditor({
        extensions: [
            Image,
            StarterKit,
            Underline,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-base m-5 focus:outline-none',
            },
            handleDrop: handleDropImage
        },
        // Check if user already has applied to this position
        content: default_text ?? (ownApplication?.content || `
        <p><em>Kirjoita hakemuksesi tähän</em></p>
        <p><em>Voit lisätä hakemustekstiin kuvia vetämällä ne tähän ikkunaan</em></p>
        `),
    })

    // Expose the getHTML method via ref to parent component
    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || ''
    }))

    if (!editor) return null
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex align-middle gap-x-0.5 border-b border-gray-200 p-2">
                <EditorButton // bold
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    highlight={editor.isActive('bold')}
                    tooltip="bold"
                >
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 12a4 4 0 0 0 0-8H6v8"></path>
                        <path d="M15 20a4 4 0 0 0 0-8H6v8Z"></path>
                    </svg>
                </EditorButton>
                <EditorButton // italic
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    highlight={editor.isActive('italic')}
                    tooltip="italic"
                >
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" x2="10" y1="4" y2="4"></line>
                        <line x1="14" x2="5" y1="20" y2="20"></line>
                        <line x1="15" x2="9" y1="4" y2="20"></line>
                    </svg>
                </EditorButton>
                <EditorButton // strike
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    highlight={editor.isActive('strike')}
                    tooltip="strike"
                >
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4H9a3 3 0 0 0-2.83 4"></path>
                        <path d="M14 12a4 4 0 0 1 0 8H6"></path>
                        <line x1="4" x2="20" y1="12" y2="12"></line>
                    </svg>
                </EditorButton>
                <EditorButton // underline
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    highlight={editor.isActive('underline')}
                    tooltip="underline"
                >
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 4v6a6 6 0 0 0 12 0V4"></path>
                        <line x1="4" x2="20" y1="20" y2="20"></line>
                    </svg>
                </EditorButton>
                <EditorButton // H1
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    highlight={editor.isActive('heading', { level: 1 })}
                    tooltip="H1"
                >
                    H1
                </EditorButton>
                <EditorButton // H2
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    highlight={editor.isActive('heading', { level: 2 })}
                    tooltip="H2"
                >
                    H2
                </EditorButton>
                <EditorButton // H3
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    highlight={editor.isActive('heading', { level: 3 })}
                    tooltip="H3"
                >
                    H3
                </EditorButton>
                <EditorButton // H4
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    highlight={editor.isActive('heading', { level: 4 })}
                    tooltip="H4"
                >
                    H4
                </EditorButton>
                <EditorButton // H5
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    highlight={editor.isActive('heading', { level: 5 })}
                    tooltip="H5"
                >
                    H5
                </EditorButton>
                <EditorButton // H6
                    onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                    highlight={editor.isActive('heading', { level: 6 })}
                    tooltip="H6"
                >
                    H6
                </EditorButton>
                {!simplified && <><EditorButton // bullet list
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    highlight={editor.isActive('bulletList')}
                    tooltip="bullet list"
                >
                    ul
                </EditorButton>
                    <EditorButton // ordered list
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        highlight={editor.isActive('orderedList')}
                        tooltip="ordered list"
                    >
                        ol
                    </EditorButton>
                    <EditorButton // quotation
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        highlight={editor.isActive('blockquote')}
                        tooltip="quote"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 310" fill="#000000">
                            <path d="M230 164.01c8.54 0 16.65-1.86 23.95-5.18-7.65 40.13-26.5 58.08-59.47 77.2l15.05 25.95c21.35-12.38 45.17-28.77 59.95-56.4C282.29 181.63 288 150.92 288 106c0-32.03-25.97-58-58-58s-58 25.97-58 58c0 32.04 25.97 58.01 58 58.01zm-150 0c8.54 0 16.65-1.86 23.95-5.18-7.65 40.13-26.5 58.08-59.47 77.2l15.05 25.95c21.35-12.38 45.17-28.77 59.95-56.4C132.29 181.63 138 150.92 138 106c0-32.03-25.97-58-58-58s-58 25.97-58 58c0 32.04 25.97 58.01 58 58.01z"
                                transform="scale(0.5) translate(155, 155)"></path>
                        </svg>
                    </EditorButton>
                    <EditorButton // horizontal rule
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        highlight={false}
                        tooltip="insert horizontal rule"
                    >
                        ---
                    </EditorButton>
                    <ImageUploader highlight={false} onFile={
                        (file: File) => {
                            const { schema } = editor.state;
                            const node = schema.nodes.image.create({ src: BLOB_URL + '/spinner.gif' })
                            const transaction = editor.view.state.tr.insert(0, node)
                            editor.view.dispatch(transaction)
                            // Upload the image to Azure through backend upload API
                            upload(file).then(response => {
                                // If the image upload was successful
                                // Update the image in the editor to use azure url

                                // response.data should be an array of filenames
                                const newUrl = BLOB_URL + '/' + (response.data instanceof Array ? response.data[0] : response.data.toString());
                                const newNode = schema.nodes.image.create({ src: newUrl });
                                const newTransaction = editor.state.tr.replaceWith(0, 1, newNode);
                                editor.view.dispatch(newTransaction);
                            }).catch(error => {
                                window.alert("Image upload failed, please try again!\n" + error.toString());
                            })
                        }} />
                </>}
                <EditorButton // undo
                    onClick={() => editor.chain().focus().undo().run()}
                    highlight={false}
                    tooltip="undo"
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .undo()
                            .run()
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12v-4l4 4-4 4v-4Z"></path>
                        <path d="M3 12a9 9 0 1 1 9 9"></path>
                    </svg>
                </EditorButton>
                <EditorButton // redo
                    onClick={() => editor.chain().focus().redo().run()}
                    highlight={false}
                    tooltip="redo"
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .redo()
                            .run()
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12v-4l-4 4 4 4v-4Z"></path>
                        <path d="M21 12a9 9 0 1 0-9 9"></path>
                    </svg>
                </EditorButton>
            </div>
            <EditorContent editor={editor} className="p-2 border rounded bg-gray-50" />
        </div>
    )
})

export default Editor;