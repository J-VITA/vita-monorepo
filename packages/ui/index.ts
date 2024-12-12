import "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css" // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css" // Optional Theme applied to the grid
import "ag-grid-community/styles/ag-theme-balham.css"
import "ag-grid-community/styles/ag-theme-material.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import "ag-grid-enterprise"
// 모든 타입 재export
export * from "ag-grid-community"

import { LicenseManager } from "ag-grid-enterprise"

import Card from "./src/card.vue"
import Gradient from "./src/gradient.vue"
import Page from "./src/page.vue"
import iwxGrid from "./src/iwx-grid.vue"
// import iwxTreeGrid from "./src/iwx-tree-grid.vue";

LicenseManager.setLicenseKey(
	"Using_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-061574}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{ILJIN_CNS}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{ILJIN_EAS}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{ILJIN_EAS}_need_to_be_licensed___{ILJIN_EAS}_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Charts_and_AG_Grid}_Enterprise_versions_released_before_{12_June_2025}____[v3]_[0102]_MTc0OTY4MjgwMDAwMA==e0a66d8c76be6efea503e1939588184e"
)

export { Card, Gradient, Page, iwxGrid }
