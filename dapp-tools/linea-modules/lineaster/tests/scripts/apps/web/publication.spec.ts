import { expect, test } from '@playwright/test';
import { APP_NAME, IPFS_GATEWAY } from 'data/constants';
import { WEB_BASE_URL } from 'test/constants';

test.describe('Publication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${WEB_BASE_URL}/posts/0x03-0x16`);
  });

  test('should have publication title', async ({ page }) => {
    await expect(page).toHaveTitle(`Post by @alainnicolas • ${APP_NAME}`);
  });

  test('should have publication', async ({ page }) => {
    const publication = page.getByTestId('publication-0x03-0x16');
    await expect(publication).toBeVisible();
  });

  test.describe('Publication header', async () => {
    test('should have profile', async ({ page }) => {
      const publication = page.getByTestId('publication-0x03-0x16');
      await expect(publication).toContainText('Alain');
    });

    test('should have menu', async ({ page }) => {
      const publicationMenu = page.getByTestId('publication-0x03-0x16-menu');
      await publicationMenu.click();
      const localeSelectorMenuItems = page.getByTestId('publication-0x03-0x16-menu-items');
      await expect(localeSelectorMenuItems).toContainText('Report Post');
      await expect(localeSelectorMenuItems).toContainText('Embed');
      await expect(localeSelectorMenuItems).toContainText('Permalink');
    });
  });

  test.describe('Publication body', async () => {
    test('should have body', async ({ page }) => {
      const publication = page.getByTestId('publication-0x03-0x16');
      await expect(publication).toContainText('Hello world! 👋');
    });
  });

  test.describe('Publication meta', async () => {
    test('should have meta', async ({ page }) => {
      const publication = page.getByTestId('publication-0x03-0x16');
      await expect(publication).toContainText('Posted via Lineaster');
      await expect(publication).toContainText('May 10, 2023');
    });
  });

  test.describe('Publication stats', async () => {
    test('should have comment stats', async ({ page }) => {
      const publicationCommentStats = page.getByTestId('publication-0x03-0x16').getByTestId('comment-stats');
      await expect(publicationCommentStats).toContainText('Comments');
    });

    test('should have mirror stats', async ({ page }) => {
      const publicationMirrorStats = page.getByTestId('publication-0x03-0x16').getByTestId('mirror-stats');
      await expect(publicationMirrorStats).toContainText('Mirror');

      // click mirror stats and check if it opens mirror modal
      await publicationMirrorStats.click();
      const mirrorsModal = page.getByTestId('mirrors-modal');
      await expect(mirrorsModal).toBeVisible();
    });

    test('should have like stats', async ({ page }) => {
      const publicationLikeStats = page.getByTestId('publication-0x03-0x16').getByTestId('like-stats');
      await expect(publicationLikeStats).toContainText('Likes');

      // click like stats and check if it opens likes modal
      await publicationLikeStats.click();
      const likesModal = page.getByTestId('likes-modal');
      await expect(likesModal).toBeVisible();
    });

    test('should have collect stats', async ({ page }) => {
      const publicationCollectStats = page.getByTestId('publication-0x03-0x16').getByTestId('collect-stats');
      await expect(publicationCollectStats).toContainText('Collects');

      // click collect stats and check if it opens collectors modal
      await publicationCollectStats.click();
      const collectorsModal = page.getByTestId('collectors-modal');
      await expect(collectorsModal).toBeVisible();
    });

    test('should have comments feed', async ({ page }) => {
      await expect(page.getByTestId('comments-feed')).toBeVisible();
    });

    test.skip('should have none relevant feed', async ({ page }) => {
      await expect(page.getByTestId('none-relevant-feed')).toBeVisible();
    });
  });
});

test.describe('Publication attachments', () => {
  test.skip('should have publication image', async ({ page }) => {
    const publicationId = '0x0d-0x037d';
    await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

    const imageURL = `${IPFS_GATEWAY}bafybeihztcpkzhzc3fddsc66r22hzsztja6blflygurlft7lmc4l44pnre`;
    const publicationImage = page
      .getByTestId(`publication-${publicationId}`)
      .getByTestId(`attachment-image-${imageURL}`);
    await expect(publicationImage).toBeVisible();

    // click image and check if it opens image lightbox and original image
    await publicationImage.click();
    const lightboxOpenOriginal = page.getByTestId('lightbox-open-original');
    await lightboxOpenOriginal.click();
    const newPage = await page.waitForEvent('popup');
    await expect(newPage.url()).toBe(imageURL + '/');
  });

  test.skip('should have publication video', async ({ page }) => {
    const publicationId = '0x01-0x01';
    await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

    const videoURL = 'https://lens.infura-ipfs.io/ipfs/QmSPijepBo81hDLZ54qg3bKC2DpV9VFdaDJ81Y2viPHCRZ';
    const publicationVideo = page
      .getByTestId(`publication-${publicationId}`)
      .getByTestId(`attachment-video-${videoURL}`);
    await expect(publicationVideo).toBeVisible();
  });

  test.skip('should have publication audio', async ({ page }) => {
    const publicationId = '0x03-0x16ec';
    await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

    const audioURL = `${IPFS_GATEWAY}bafybeihabco35vpefrlgzx3rvxccfx4th6ti5ktidw2tf5vjmnmjwx5ki4`;
    const coverURL = `${IPFS_GATEWAY}bafkreibljzow3cbr4kirujjc5ldxbcykgahjuwuc5zmfledisq4sizwhyq`;
    const publicationAudio = page.getByTestId(`attachment-audio-${audioURL}`);
    await expect(publicationAudio).toBeVisible();

    // check if audio cover image is visible
    const publicationAudioCover = page
      .getByTestId(`publication-${publicationId}`)
      .getByTestId(`attachment-audio-cover-${coverURL}`);
    await expect(publicationAudioCover).toHaveAttribute('src', `${coverURL}`);
  });

  test.describe('Publication oembed', () => {
    test.skip('should have normal oembed', async ({ page }) => {
      const publicationId = '0x03-0x19';
      await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

      const publicationOembed = page
        .getByTestId(`publication-${publicationId}`)
        .getByTestId('normal-oembed-https://testflight.apple.com/join/U9YkOlOy');
      await expect(publicationOembed).toBeVisible();
    });

    test.skip('should have rich oembed', async ({ page }) => {
      const publicationId = '0x03-0x1a';
      await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

      const publicationOembed = page
        .getByTestId(`publication-${publicationId}`)
        .getByTestId('rich-oembed-https://lenstube.xyz/watch/0x24-0xe8');
      await expect(publicationOembed).toBeVisible();
    });
  });

  test.describe('Publication snapshot widget', () => {
    test('should have snapshot oembed', async ({ page }) => {
      const publicationId = '0x03-0x1c';
      await page.goto(`${WEB_BASE_URL}/posts/${publicationId}`);

      const snapshotWidget = page
        .getByTestId(`publication-${publicationId}`)
        .getByTestId('snapshot-0x9287c40edcd68c362c7c4139fe3489bbaaa27cf4de68be5c218a82d0f252e718');
      await expect(snapshotWidget).toContainText('Do you like the Snapshot integration with Lenster?');
      await expect(snapshotWidget).toContainText('Yes ser 🙌');
    });
  });
});

test.describe('Publication sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${WEB_BASE_URL}/posts/0x03-0x1e`);
  });

  test('should have og poster profile', async ({ page }) => {
    const posterProfile = page.getByTestId('poster-profile');
    await expect(posterProfile).toContainText('Alain');
  });

  test('should have relevant profiles', async ({ page }) => {
    const relevantProfiles = page.getByTestId('relevant-profiles');
    await expect(relevantProfiles).toContainText('@igorms');
    await expect(relevantProfiles).toContainText('@matt17');
    await expect(relevantProfiles).toContainText('@sebhandle2');
  });

  test('should have on chain meta', async ({ page }) => {
    const onChainMeta = page.getByTestId('onchain-meta');
    // Arweave transaction
    await expect(onChainMeta).toContainText('c77oPfsGAgNh4AXDejJWFqqngjNJdCqlc5SHeVibaNw');
    // NFT address
    await expect(onChainMeta).toContainText('0x8Ee6D711A0e9dD531235674F495D36eE2f9Dc611');
  });
});
