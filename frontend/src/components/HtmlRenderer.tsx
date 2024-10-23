import DOMPurify from 'dompurify';

interface HtmlRendererProps {
    htmlContent: string | null | undefined;
    reduceHeadingSize?: boolean
}

export default function HtmlRenderer({ htmlContent, reduceHeadingSize }: HtmlRendererProps) {
    if (!htmlContent) return null;

    const sanitizedHtml = DOMPurify.sanitize(htmlContent);

    return (
        <div
            className={`prose prose-base m-4
            ${reduceHeadingSize && "prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base"}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}