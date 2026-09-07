# Brasaland Data Utilities

## Implemented functionality

- `src/types/models.ts`: typed business entities for prices, menu items, sales, locations, waste records, and country metrics.
- `src/utils/collections.ts`: sales and menu/location filtering plus non-mutating capacity and price sorting.
- `src/utils/search.ts`: linear location and case-insensitive menu searches, plus binary location-capacity search.
- `src/utils/transformations.ts`: revenue, margin, waste, currency conversion, performance scores, ranking, payment counts, average tickets, top sellers, waste grouping, and country comparisons.
- `src/utils/validations.ts`: business-rule validation for menu items, sale transactions, and locations.

## Implementation notes

Financial calculations accept an explicit USD or COP selector and round calculated amounts and percentages to two decimals. Sorting creates copied arrays before ordering. Location performance protects against zero revenue and uses at least one operating day for valid scoring of recently opened locations.

## Validation

Run:

```bash
npm run typecheck
```
