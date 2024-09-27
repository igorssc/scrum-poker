import { Cards } from './Cards';
import Image from 'next/image';
import { iconsData } from '../utils/icons';
import path from 'path';
import { Children } from 'react';

export const SampleCards = () => {
  const baseIcons = [...iconsData['nature'].icons];

  const icons = [
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
  ];

  return (
    <div className="flex flex-col gap-12 w-full h-screen justify-center items-center bg-zinc-800 overflow-hidden">
      <div className="flex gap-4 flex-wrap justify-center">
        {Children.toArray(
          icons.map((icon) => (
            <Image
              alt={'icons'}
              src={path.join('assets', 'cards', icon)}
              width={133.95}
              height={195.6}
            />
          )),
        )}
      </div>
    </div>
  );
};
