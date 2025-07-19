interface HtmlRendererProps {
    htmlContent: string | null | undefined;
    reduceHeadingSize?: boolean
}

export default function UnsafeServerSideHtmlRenderer({ htmlContent, reduceHeadingSize }: HtmlRendererProps) {
    if (!htmlContent) return null;

    return (
        // TODO proper tailwind typography color & heading customization
        <div
            className={`prose prose-neutral dark:prose-invert m-4
            ${reduceHeadingSize && "prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base"}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}