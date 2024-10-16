import DOMPurify from 'dompurify';

interface HtmlRendererProps {
    htmlContent: string | null | undefined;
}

export default function HtmlRenderer({ htmlContent }: HtmlRendererProps) {
    if (!htmlContent) return null;

    const sanitizedHtml = DOMPurify.sanitize(htmlContent);

    return (
        <div
            className="prose prose-base m-5"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}