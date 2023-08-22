import type { ProfileInterest } from 'src/types';

/**
 * Sanitizes an array of profile interests by grouping them into categories and subcategories.
 *
 * @param profileInterests Array of profile interests to sanitize
 * @returns Array of sanitized profile interests
 */
const sanitizeProfileInterests = (profileInterests: string[]) => {
  if (!profileInterests) {
    return [];
  }

  const interests: ProfileInterest[] = [];
  const categories = profileInterests.filter((interest) => !interest.includes('__'));
  for (const category of categories) {
    let subCategories = profileInterests
      .filter((interest) => interest.includes(category) && interest.includes('__'))
      .map((item) => {
        return { label: item.toLowerCase().split('__')[1].replaceAll('_', ' '), id: item };
      });
    interests.push({
      category: { label: category.replaceAll('_', ' & ').toLowerCase(), id: category },
      subCategories
    });
  }
  return interests;
};

export default sanitizeProfileInterests;
