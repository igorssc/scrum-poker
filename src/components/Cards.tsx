import Image from 'next/image';
import { iconsData } from '../utils/icons';
import path from 'path';
import { Children } from 'react';

export const Cards = () => {
  return (
    <>
      <div className="flex gap-4 flex-wrap justify-center w-full">
        {Children.toArray(
          iconsData['nature'].icons.map((icon) => (
            <Image
              alt={'icons'}
              src={path.join('assets', 'cards', icon)}
              width={178.6}
              height={260.8}
            />
          )),
        )}
      </div>
    </>
  );
};
