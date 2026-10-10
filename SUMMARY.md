# Brasaland Data Utilities

## Implemented functionality

- `src/types/models.ts`: typed business entities for prices, menu items, sales, locations, waste records, and country metrics.
- `src/utils/collections.ts`: sales and menu/location filtering, generic Map grouping and non-mutating capacity, price and multicolumn sorting.
- `src/utils/search.ts`: linear location and case-insensitive menu searches, plus binary location-capacity search.
- `src/utils/transformations.ts`: revenue, margin, waste, currency conversion, performance scores, ranking, payment counts, average tickets, top sellers, waste grouping, and country comparisons.
- `src/utils/validations.ts`: unknown-input validation for menu items, sale transactions, locations, customers, suppliers, employees, ingredients, stock, recipes and waste records, with documented numeric and date assumptions.

## Implementation notes

Financial calculations accept an explicit USD or COP selector and round calculated amounts and percentages to two decimals. Sorting creates copied arrays before ordering, including stable multicolumn sorting. Temporal calculations receive a reference date and use explicit IANA timezones. Unknown-input validators reject partial/null values and nonfinite numbers. Additional models cover customers, suppliers, employees, ingredients, stock and recipes; reports cover Florida weeks, monthly average tickets and per-location COP/USD totals. Both READMEs distinguish context needs from schema and validation assumptions.

## Validation

Run:

```bash
npm run typecheck
npm run build
npm run demo
npx http-server . -p 3000 -a 0.0.0.0
```

The demo runs 60 assertion-based cases. Open `http://localhost:3000/#operaciones` for filters, both search methods, multicolumn sorting and reports. Generated ES modules are built into `dist`; GitHub Pages runs the full build before deployment. The shared dark field/button styles and milestone checklist are documented in `docs/verificacion-contraste-hito.md`; Brasa Points JavaScript validation remains unchanged.
