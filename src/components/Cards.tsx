import Image from 'next/image';
import { iconsData } from '../utils/icons';
import path from 'path';
import { Children } from 'react';

export const Cards = () => {
  return (
    <>
      <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center w-full">
        {Children.toArray(
          iconsData['nature'].icons.map((icon) => (
            <Image
              alt={'icons'}
              src={path.join('assets', 'cards', icon)}
              width={167}
              height={249}
              className="w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 lg:w-32 lg:h-48 xl:w-40 xl:h-60"
            />
          )),
        )}
      </div>
    </>
  );
};
