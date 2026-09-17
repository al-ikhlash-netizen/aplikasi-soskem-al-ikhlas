# SOSKEM reference integration

`index_5.html` is treated as the behavioral reference. The repository's existing PWA remains the primary UI and state model; `soskem-reference-enhancements.js` is an additive compatibility layer.

The module provides:

- canonical storage keys: `soskem_master_kk`, `soskem_log_iuran`, and `soskem_log_klaim`;
- automatic RW-based book-code helpers and quarterly status calculation;
- 15-row pagination and case-insensitive live-search helpers;
- dashboard totals and Chart.js rendering;
- Rupiah formatting, SweetAlert2-compatible notifications, JSON backup export, and print helpers;
- migration from the current application's `state.residents` and `state.payments` data when those datasets are present.

To activate the layer in the existing page, load it after the current application script:

```html
<script src="./soskem-reference-enhancements.js"></script>
```

The module is deliberately non-destructive: it does not replace the existing `state`, routes, DOM IDs, or event handlers.
