import { PhotographIcon } from '@heroicons/react/outline';
import uploadToIPFS from '@lib/uploadToIPFS';
import clsx from 'clsx';
import { ATTACHMENT } from 'data/constants';
import Errors from 'data/errors';
import imageProxy from 'lib/imageProxy';
import sanitizeDStorageUrl from 'lib/sanitizeDStorageUrl';
import type { ChangeEvent, FC, Ref } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Image, Spinner } from 'ui';

interface CoverImageProps {
  isNew: boolean;
  cover: string;
  setCover: (url: string, mimeType: string) => void;
  imageRef: Ref<HTMLImageElement>;
  expandCover: (url: string) => void;
}

const CoverImage: FC<CoverImageProps> = ({ isNew = false, cover, setCover, imageRef, expandCover }) => {
  const [loading, setLoading] = useState(false);

  const onError = (error: any) => {
    toast.error(error?.data?.message ?? error?.message ?? Errors.SomethingWentWrong);
    setLoading(false);
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        setLoading(true);
        const attachment = await uploadToIPFS(e.target.files);
        setCover(attachment[0].item, attachment[0].type);
      } catch (error) {
        onError(error);
      }
    }
  };

  return (
    <div className="group relative flex-none overflow-hidden">
      <button
        type="button"
        className="flex focus:outline-none"
        onClick={() => expandCover(cover ? sanitizeDStorageUrl(cover) : cover)}
      >
        <Image
          onError={({ currentTarget }) => {
            currentTarget.src = cover ? sanitizeDStorageUrl(cover) : cover;
          }}
          src={cover ? imageProxy(sanitizeDStorageUrl(cover), ATTACHMENT) : cover}
          className="h-24 w-24 rounded-xl object-cover md:h-40 md:w-40 md:rounded-none"
          draggable={false}
          alt={`attachment-audio-cover-${cover}`}
          data-testid={`attachment-audio-cover-${cover}`}
          ref={imageRef}
        />
      </button>
      {isNew && (
        <label
          className={clsx(
            { visible: loading && !cover, invisible: cover },
            'absolute top-0 grid h-24 w-24 cursor-pointer place-items-center bg-gray-100 backdrop-blur-lg group-hover:visible dark:bg-gray-900 md:h-40 md:w-40'
          )}
        >
          {loading && !cover ? (
            <Spinner size="sm" />
          ) : (
            <div className="flex flex-col items-center text-sm text-black opacity-60 dark:text-white">
              <PhotographIcon className="h-5 w-5" />
              <span>Add cover</span>
            </div>
          )}
          <input type="file" accept=".png, .jpg, .jpeg, .svg" className="hidden w-full" onChange={onChange} />
        </label>
      )}
    </div>
  );
};

export default CoverImage;
