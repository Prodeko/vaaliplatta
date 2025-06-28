import { useEffect } from 'react';
import { favicons } from '@prodeko/visual-assets';

type FaviconRel =
    | 'icon'
    | 'apple-touch-icon'
    | 'shortcut icon'
    | 'manifest';

type InsertFaviconParams = {
    rel: FaviconRel;
    href: string;
    type?: string;
    sizes?: string;
};

const useFavicons = (): void => {
    useEffect(() => {
        const insertFavicon = ({
            rel,
            href,
            type,
            sizes,
        }: InsertFaviconParams): void => {
            const link = document.createElement('link');
            link.rel = rel;
            link.href = href;
            if (type) link.type = type;
            if (sizes) link.sizes = sizes;
            document.head.appendChild(link);
        };

        insertFavicon({ rel: 'apple-touch-icon', href: favicons.appleTouch });
        insertFavicon({ rel: 'icon', href: favicons.favicon96, type: 'image/png', sizes: '96x96' });
        insertFavicon({ rel: 'icon', href: favicons.faviconSvg, type: 'image/svg+xml' });
        insertFavicon({ rel: 'shortcut icon', href: favicons.faviconIco });
        insertFavicon({ rel: 'manifest', href: favicons.webmanifest });
    }, []);
};

export default useFavicons;
