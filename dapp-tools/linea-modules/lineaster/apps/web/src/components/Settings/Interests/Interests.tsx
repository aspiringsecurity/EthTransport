import { PlusCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import sanitizeProfileInterests from '@lib/sanitizeProfileInterests';
import {
  useAddProfileInterestMutation,
  useProfileInterestsQuery,
  useRemoveProfileInterestMutation
} from 'lens';
import { useApolloClient } from 'lens/apollo';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';
import { SETTINGS } from 'src/tracking';
import { Button } from 'ui';

import Loader from '../../Shared/Loader';

const MAX_TOPICS_ALLOWED = 12;

const Interests: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const { cache } = useApolloClient();

  const updateCache = (interests: string[]) => {
    cache.modify({
      id: `Profile:${currentProfile?.id}`,
      fields: { interests: () => interests }
    });
  };

  const { data, loading } = useProfileInterestsQuery();
  const [addProfileInterests] = useAddProfileInterestMutation({
    onCompleted: () => Mixpanel.track(SETTINGS.INTERESTS.ADD),
    onError
  });
  const [removeProfileInterests] = useRemoveProfileInterestMutation({
    onCompleted: () => Mixpanel.track(SETTINGS.INTERESTS.REMOVE),
    onError
  });

  const interestsData = data?.profileInterests ?? [];
  const selectedTopics = currentProfile?.interests ?? [];

  const onSelectTopic = (topic: string) => {
    const variables = { request: { profileId: currentProfile?.id, interests: [topic] } };
    if (!selectedTopics.includes(topic)) {
      const interests = [...selectedTopics, topic];
      updateCache(interests);
      return addProfileInterests({ variables });
    }
    const topics = [...selectedTopics];
    topics.splice(topics.indexOf(topic), 1);
    updateCache(topics);
    return removeProfileInterests({ variables });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      {sanitizeProfileInterests(interestsData)?.map(({ category, subCategories }) => (
        <div className="space-y-2" key={category.id}>
          <h2 className="text-sm font-medium capitalize">{category.label}</h2>
          <div className="flex flex-wrap items-center gap-3">
            {subCategories?.map((subCategory) => (
              <Button
                key={subCategory.id}
                variant={selectedTopics.includes(subCategory.id) ? 'primary' : 'secondary'}
                size="sm"
                className="font-medium capitalize"
                disabled={
                  !selectedTopics.includes(subCategory.id) && selectedTopics.length === MAX_TOPICS_ALLOWED
                }
                icon={
                  selectedTopics.includes(subCategory.id) ? (
                    <CheckCircleIcon className="text-brand h-4 w-4" />
                  ) : (
                    <PlusCircleIcon className="h-4 w-4" />
                  )
                }
                onClick={() => onSelectTopic(subCategory.id)}
                outline
              >
                <div>{subCategory.label}</div>
              </Button>
            ))}
            {!subCategories.length && (
              <Button
                key={category.id}
                variant={selectedTopics.includes(category.id) ? 'primary' : 'secondary'}
                size="sm"
                className="font-medium capitalize"
                disabled={
                  !selectedTopics.includes(category.id) && selectedTopics.length === MAX_TOPICS_ALLOWED
                }
                icon={
                  selectedTopics.includes(category.id) ? (
                    <CheckCircleIcon className="text-brand h-4 w-4" />
                  ) : (
                    <PlusCircleIcon className="h-4 w-4" />
                  )
                }
                onClick={() => onSelectTopic(category.id)}
                outline
              >
                <div>{category.label}</div>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Interests;
