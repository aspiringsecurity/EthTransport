import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import clsx from 'clsx';
import { STATIC_ASSETS_URL } from 'data/constants';
import type { TextNode } from 'lexical';
import { $createTextNode, $getSelection, $isRangeSelection } from 'lexical';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';
import type { Emoji } from 'src/types';

class EmojiOption extends TypeaheadOption {
  title: string;
  emoji: string;
  keywords: string[];

  constructor(
    title: string,
    emoji: string,
    options: {
      keywords?: string[];
    }
  ) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords || [];
  }
}

interface EmojiMenuItemProps {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}

const EmojiMenuItem: FC<EmojiMenuItemProps> = ({ index, isSelected, onClick, onMouseEnter, option }) => {
  const { key, title, emoji, setRefElement } = option;

  return (
    <li
      key={key}
      tabIndex={-1}
      className={clsx({ 'dropdown-active': isSelected }, 'm-2 cursor-pointer rounded-lg p-2 outline-none')}
      ref={setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <span className="text-base">{emoji}</span>
        <span className="text-sm capitalize">{title.split('_').join(' ')}</span>
      </div>
    </li>
  );
};

const MAX_EMOJI_SUGGESTION_COUNT = 5;

const EmojiPickerPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const fetchEmojis = async () => {
    const res = await fetch(`${STATIC_ASSETS_URL}/emoji.json`);
    const data = await res.json();
    setEmojis(data);
  };

  useEffect(() => {
    fetchEmojis();
  }, []);

  const emojiOptions = useMemo(
    () =>
      emojis !== null
        ? emojis.map(
            ({ emoji, aliases, tags }) =>
              new EmojiOption(aliases[0], emoji, {
                keywords: [...aliases, ...tags]
              })
          )
        : [],
    [emojis]
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', {
    minLength: 0
  });

  const options: EmojiOption[] = useMemo(() => {
    return emojiOptions
      .filter((option: EmojiOption) => {
        return queryString !== null
          ? new RegExp(queryString, 'gi').exec(option.title) || option.keywords !== null
            ? option.keywords.some((keyword: string) => new RegExp(queryString, 'gi').exec(keyword))
            : false
          : emojiOptions;
      })
      .slice(0, MAX_EMOJI_SUGGESTION_COUNT);
  }, [emojiOptions, queryString]);

  const onSelectOption = useCallback(
    (selectedOption: EmojiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selectedOption === null) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertNodes([$createTextNode(selectedOption.emoji)]);

        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (anchorElementRef.current === null || options.length === 0) {
          return null;
        }

        return anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <ul className="mt-7 w-52 rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                {options.map((option: EmojiOption, index) => (
                  <div key={option.key}>
                    <EmojiMenuItem
                      index={index}
                      isSelected={selectedIndex === index}
                      onClick={() => {
                        setHighlightedIndex(index);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(index);
                      }}
                      option={option}
                    />
                  </div>
                ))}
              </ul>,
              anchorElementRef.current
            )
          : null;
      }}
    />
  );
};

export default EmojiPickerPlugin;
