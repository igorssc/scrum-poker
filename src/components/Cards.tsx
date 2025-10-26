import Image from 'next/image';
import { iconsData } from '../utils/icons';
import path from 'path';
import { Children } from 'react';

export const Cards = () => {
  return (
    <>
      <div className="grid grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4 md:gap-x-4 md:gap-y-5 justify-items-center w-full">
        {Children.toArray(
          iconsData['nature'].icons.map((icon) => (
            <Image
              alt={'icons'}
              src={path.join('assets', 'cards', icon)}
              width={167}
              height={249}
              className="w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24 lg:w-20 lg:h-30 xl:w-24 xl:h-36"
            />
          )),
        )}
      </div>
    </>
  );
};
