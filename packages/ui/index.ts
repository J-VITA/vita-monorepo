import "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
// 모든 타입 재export
export * from "ag-grid-community";

import { LicenseManager } from "ag-grid-enterprise";

import Card from "./src/card.vue";
import Gradient from "./src/gradient.vue";
import Page from "./src/page.vue";
import iwxGrid from "./src/iwx-grid.vue";
// import iwxTreeGrid from "./src/iwx-tree-grid.vue";

// LicenseManager.setLicenseKey(
// ""
// )

export { Card, Gradient, Page, iwxGrid };
