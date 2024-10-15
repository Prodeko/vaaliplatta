import Image from '@tiptap/extension-image'
import { Slice } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'

export default function Editor() {
    const URL = 'http://localhost:8000/api'
    const BLOB_URL = 'https://vaaliplatta.blob.core.windows.net/dev'

    const handleDropImage = (view: EditorView, event: DragEvent, _slice: Slice, moved: boolean): boolean => {
        // if not dropping external files
        if (moved || !event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files[0]) return false

        const file = event.dataTransfer.files[0];

        // File is not an image
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            window.alert("Images need to be in jpg or png format!")
            return false
        }
        // File is too big
        if (file.size > 10_000_000) {
            window.alert("Images have to be less than 10 mb!")
            return false
        }

        // Display image in the editor immediately
        const _URL = window.URL || window.webkitURL;
        const url = _URL.createObjectURL(file)
        const { schema } = view.state
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
        const node = schema.nodes.image.create({ src: url })
        const transaction = view.state.tr.insert(coordinates?.pos || 0, node)
        view.dispatch(transaction)

        // Upload the image to Azure through backend upload API
        const placeholderPosition = coordinates?.pos || 0;
        const formData = new FormData();
        formData.append("file", file);
        axios.post(URL + "/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            // If the image upload was successful
            // Update the image in the editor to use azure url

            // response.data should be an array of filenames
            const newUrl = BLOB_URL + '/' + (response.data instanceof Array ? response.data[0] : response.data.toString());
            const newNode = schema.nodes.image.create({ src: newUrl });
            const newTransaction = view.state.tr.replaceWith(placeholderPosition, placeholderPosition + 1, newNode);
            view.dispatch(newTransaction);
        }).catch(error => {

            // If the upload fails, remove the image and show an error
            const transaction = view.state.tr.delete(placeholderPosition, placeholderPosition + 1);
            view.dispatch(transaction);
            window.alert("Image upload failed, please try again!\n" + error.toString());
        })

        return true;
    }

    const editor = useEditor({
        extensions: [
            Image,
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
            handleDrop: handleDropImage
        },
        content: `
      <h1>This is a basic example of implementing images. Drag to re-order.</h1>
      <img src="https://placehold.co/600x400" />
      <img src="https://placehold.co/800x400" />
    `,
    })

    if (!editor) return null
    else return (
        <EditorContent editor={editor} />
    )

}