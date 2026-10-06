// Feature comparison data. Status: 'y' = included, 'p' = partial, 'n' = not available (for "Others").
// Cattle Force is always "Included".
export type Status = 'y' | 'p' | 'n';
export type FeatureArea = { area: string; rows: [label: string, others: Status][] };

export const FEATURES: FeatureArea[] = [
  { area: 'Herd & Lifecycle', rows: [
    ['Animal registry', 'y'],
    ['Automated animal stage tracking', 'p'],
    ['Automated, optimized weaning events', 'n'],
    ['Offspring registry and promotion to adult', 'p'],
    ['Pedigree and lineage', 'y'],
    ['Breed composition tracking', 'n'],
    ['Weight records and growth tracking (ADG)', 'y'],
  ] },
  { area: 'Operations', rows: [
    ['Task calendar and worker management', 'p'],
    ['Groups and locations', 'y'],
    ['Resource management', 'n'],
    ['File and document attachments', 'p'],
    ['Configurable farm settings (thresholds, dropdowns)', 'p'],
  ] },
  { area: 'Insight', rows: [
    ['Dashboard with live alerts', 'p'],
    ['Analytics', 'p'],
    ['Notifications', 'p'],
    ['CSV reports and data export', 'y'],
  ] },
  { area: 'Business', rows: [
    ['Financial tracking', 'p'],
    ['Inventory ledger with stock guards', 'n'],
    ['Business partners (suppliers, customers, investors)', 'p'],
  ] },
  { area: 'Production & Breeding', rows: [
    ['Reproduction tracking (AI/mating, pregnancy checks, calving)', 'y'],
    ['Milk production logging and KPIs', 'p'],
  ] },
  { area: 'Health', rows: [
    ['Veterinary and health events', 'y'],
  ] },
];
