import 'plyr-react/plyr.css';

import type { APITypes } from 'plyr-react';
import Plyr from 'plyr-react';
import type { FC, Ref } from 'react';
import { memo } from 'react';

interface PlayerProps {
  src: string;
  playerRef: Ref<APITypes>;
}

const Player: FC<PlayerProps> = ({ playerRef, src }) => {
  return (
    <Plyr
      ref={playerRef}
      source={{
        type: 'audio',
        sources: [{ src }]
      }}
      options={{
        controls: ['progress', 'current-time', 'mute', 'volume']
      }}
    />
  );
};

export default memo(Player);
