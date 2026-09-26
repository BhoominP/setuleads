/**
 * Controlled Query Expansion & Search Planner
 * Converts a single user category prompt (e.g. "startup") into a controlled set
 * of 2-4 high-recall search queries for discovery.
 */

const CONTROLLED_EXPANSIONS: Record<string, string[]> = {
  startup: ['startup', 'tech startup', 'software company', 'IT company'],
  tech: ['technology company', 'software company', 'IT company', 'digital agency'],
  software: ['software company', 'IT services', 'software studio', 'tech startup'],
  bakery: ['bakery', 'cake shop', 'pastry shop', 'confectionery'],
  medical: ['clinic', 'doctors clinic', 'hospital', 'medical center'],
  doctor: ['doctors clinic', 'physician clinic', 'specialist clinic', 'medical center'],
  clinic: ['medical clinic', 'health clinic', 'doctors clinic', 'wellness center'],
  cafe: ['cafe', 'coffee shop', 'espresso bar', 'bistro'],
  restaurant: ['restaurant', 'dining', 'eatery', 'bistro'],
  furniture: ['furniture store', 'interior decor', 'furnishings', 'woodwork store'],
  clothing: ['clothing store', 'boutique', 'fashion store', 'garment shop'],
  auto: ['auto repair', 'garage', 'car service center', 'mechanic workshop'],
  hardware: ['hardware store', 'building supplies', 'tools shop', 'plumbing supplies'],
  industrial: ['factory', 'industrial manufacturer', 'manufacturing plant', 'engineering works'],
};

export interface SearchPlan {
  originalCategory: string;
  expandedQueries: string[];
}

export function planSearchQueries(userCategory: string): SearchPlan {
  const cleaned = userCategory.toLowerCase().trim();
  if (!cleaned) {
    return { originalCategory: '', expandedQueries: ['business'] };
  }

  // Check controlled dictionary
  for (const [key, expansions] of Object.entries(CONTROLLED_EXPANSIONS)) {
    if (cleaned === key || cleaned.includes(key)) {
      return {
        originalCategory: userCategory,
        expandedQueries: expansions,
      };
    }
  }

  // Generic Query Expansion Fallback for unmatched categories:
  // Generate: <query>, <query> shop, <query> store, <query> services, <query> company
  const expansions = [cleaned];
  if (!cleaned.includes('shop')) expansions.push(`${cleaned} shop`);
  if (!cleaned.includes('store')) expansions.push(`${cleaned} store`);
  if (!cleaned.includes('service')) expansions.push(`${cleaned} services`);
  if (!cleaned.includes('company')) expansions.push(`${cleaned} company`);

  return {
    originalCategory: userCategory,
    expandedQueries: expansions,
  };
}
