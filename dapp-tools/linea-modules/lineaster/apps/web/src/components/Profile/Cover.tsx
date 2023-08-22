import { COVER, STATIC_IMAGES_URL } from 'data/constants';
import imageProxy from 'lib/imageProxy';
import sanitizeDStorageUrl from 'lib/sanitizeDStorageUrl';
import type { FC } from 'react';

interface CoverProps {
  cover: string;
}

const Cover: FC<CoverProps> = ({ cover }) => {
  return (
    <div
      className="h-52 sm:h-80"
      style={{
        backgroundImage: `url(${
          cover ? imageProxy(sanitizeDStorageUrl(cover), COVER) : `${STATIC_IMAGES_URL}/patterns/2.svg`
        })`,
        backgroundColor: '#8b5cf6',
        backgroundSize: cover ? 'cover' : '30%',
        backgroundPosition: 'center center',
        backgroundRepeat: cover ? 'no-repeat' : 'repeat'
      }}
    />
  );
};

export default Cover;
