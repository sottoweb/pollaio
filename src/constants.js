export const EXPENSE_CATEGORIES = [
    'MANGIME',
    'VETERINARIO',
    'MANUTENZIONE',
    'PULIZIA',
    'ATTREZZATURA',
    'ALTRO'
];

// Categories available for products (usually exclusion of 'ALTRO' might be desired, but strict matching is requested)
// We will use the same list but handle exclusions in the UI if needed.
export const PRODUCT_CATEGORIES = EXPENSE_CATEGORIES.filter(c => c !== 'ALTRO');
