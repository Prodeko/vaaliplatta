import React, { useEffect, useState } from "react";
import { useBlobClient } from "../hooks/useBlob";

interface BlobImageLoaderProps {
    imagePath: string;
    altText?: string;
}

const BlobImageLoader: React.FC<BlobImageLoaderProps> = ({ imagePath, altText }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState();
    const { getBlob } = useBlobClient()

    useEffect(() => {
        const fetchImage = async () => {
            const localUrl = await getBlob(imagePath)
            setImageUrl(localUrl);
        };

        fetchImage();
    }, [getBlob, imagePath, setError]);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {imageUrl ? (
                <img src={imageUrl} alt={altText || "Image"} style={{ maxWidth: "100%", height: "auto" }} />
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
};

export default BlobImageLoader;
