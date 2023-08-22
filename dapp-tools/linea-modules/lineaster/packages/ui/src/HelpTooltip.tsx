import 'tippy.js/dist/tippy.css';

import { InformationCircleIcon } from '@heroicons/react/outline';
import Tippy from '@tippyjs/react';
import type { FC, ReactNode } from 'react';

interface HelpTooltipProps {
  content: ReactNode;
}

const HelpTooltip: FC<HelpTooltipProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <Tippy
      placement="top"
      duration={0}
      className="!rounded-xl p-2.5 !leading-5 tracking-wide shadow-lg"
      content={<span>{content}</span>}
    >
      <InformationCircleIcon className="lt-text-gray-500 h-[15px] w-[15px]" />
    </Tippy>
  );
};

export default HelpTooltip;
