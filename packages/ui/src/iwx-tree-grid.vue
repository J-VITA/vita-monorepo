<script setup>
import { createApp, onBeforeMount, ref } from "vue";
import { AgGridVue } from "ag-grid-vue3"; // AG Grid Component

import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

// const props = withDefaults(defineProps<{
//   rowData?: any,
//   colDefs?: any,
//   options?: any,
//   styles?: any,
//   class?: string,
//   defaultColDef?: any
//   paginationAutoPageSize?: boolean,
//   pagination?: boolean,
//   frameworkComponents?: any,
//   suppressMenuHide: boolean,
//   stopEditingWhenCellsLoseFocus: boolean,
//   enableRangeSelection: boolean,
// }>(),
// {
//   rowData: {},
//   colDefs: {},
//   options: {},
//   defaultColDef: {},
//   paginationAutoPageSize: false,
//   pagination: false,
//   suppressMenuHide: false,
//   stopEditingWhenCellsLoseFocus: false,
//   enableRangeSelection: false,
// }
// );

// defineEmits<{
//   (e: 'bodyScroll', value: any): void,
//   (e: 'rowDataChanged', value: any): void
// }>();

class FileCellRenderer {
  init(params) {
    let tempDiv = document.createElement("div");
    let value = params.value;
    let icon = this.getFileIcon(params.value);
    tempDiv.innerHTML = icon
      ? '<i class="' + icon + '"/>' + "<span>" + value + "</span>"
      : value;
    this.eGui = tempDiv.firstChild;
  }
  getGui() {
    return this.eGui;
  }

  getFileIcon(filename) {
    return filename.endsWith(".mp3") || filename.endsWith(".wav")
      ? "bi bi-optical-audio"
      : filename.endsWith(".xls")
        ? "bi bi-file-emark-excel"
        : filename.endsWith(".txt")
          ? "bi bi-file-text-fill"
          : filename.endsWith(".pdf")
            ? "bi bi-file-pdf-fill"
            : "bi bi-folder2";
  }
}

let cellClassRules = {
  "hover-over": (params) => {
    return params.node === potentialParent;
  },
};

let valueFormatter = function (params) {
  return params.value ? params.value + " MB" : "";
};

const columnDefs = ref([
  { field: "dateModified", cellClassRules: cellClassRules },
  {
    field: "size",
    valueFormatter: valueFormatter,
    cellClassRules: cellClassRules,
  },
]);
const gridApi = ref();
const defaultColDef = ref({
  flex: 1,
});
const rowData = ref(null);
const groupDefaultExpanded = ref(null);
const getDataPath = ref(null);
const getRowId = ref(null);
const autoGroupColumnDef = ref(null);

function getData() {
  return [
    { id: 1, filePath: ["Documents"], type: "folder" },
    { id: 2, filePath: ["Documents", "txt"], type: "folder" },
    {
      id: 3,
      filePath: ["Documents", "txt", "notes.txt"],
      type: "file",
      dateModified: "May 21 2017 01:50:00 PM",
      size: 14.7,
    },
    { id: 4, filePath: ["Documents", "pdf"], type: "folder" },
    {
      id: 5,
      filePath: ["Documents", "pdf", "book.pdf"],
      type: "file",
      dateModified: "May 20 2017 01:50:00 PM",
      size: 2.1,
    },
    {
      id: 6,
      filePath: ["Documents", "pdf", "cv.pdf"],
      type: "file",
      dateModified: "May 20 2016 11:50:00 PM",
      size: 2.4,
    },
    { id: 7, filePath: ["Documents", "xls"], type: "folder" },
    {
      id: 8,
      filePath: ["Documents", "xls", "accounts.xls"],
      type: "file",
      dateModified: "Aug 12 2016 10:50:00 AM",
      size: 4.3,
    },
    { id: 9, filePath: ["Documents", "stuff"], type: "folder" },
    {
      id: 10,
      filePath: ["Documents", "stuff", "xyz.txt"],
      type: "file",
      dateModified: "Jan 17 2016 08:03:00 PM",
      size: 1.1,
    },
    { id: 11, filePath: ["Music"], type: "folder" },
    { id: 12, filePath: ["Music", "mp3"], type: "folder" },
    {
      id: 13,
      filePath: ["Music", "mp3", "theme.mp3"],
      type: "file",
      dateModified: "Sep 11 2016 08:03:00 PM",
      size: 14.3,
    },
    { id: 14, filePath: ["Misc"], type: "folder" },
    {
      id: 15,
      filePath: ["Misc", "temp.txt"],
      type: "file",
      dateModified: "Aug 12 2016 10:50:00 PM",
      size: 101,
    },
  ];
}
onBeforeMount(() => {
  rowData.value = getData();
  groupDefaultExpanded.value = -1;
  getDataPath.value = (data) => {
    return data.filePath;
  };
  getRowId.value = (params) => {
    return params.data.id;
  };
  autoGroupColumnDef.value = {
    rowDrag: true,
    headerName: "Files",
    minWidth: 300,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: FileCellRenderer,
    },
    cellClassRules: {
      "hover-over": (params) => {
        return params.node === potentialParent;
      },
    },
  };
});

const onRowDragMove = (event) => {
  setPotentialParentForNode(event.api, event.overNode);
};
const onRowDragLeave = (event) => {
  // clear node to highlight
  setPotentialParentForNode(event.api, null);
};
const onRowDragEnd = (event) => {
  if (!potentialParent) {
    return;
  }
  let movingData = event.node.data;
  // take new parent path from parent, if data is missing, means it's the root node,
  // which has no data.
  let newParentPath = potentialParent.data ? potentialParent.data.filePath : [];
  let needToChangeParent = !arePathsEqual(newParentPath, movingData.filePath);
  // check we are not moving a folder into a child folder
  let invalidMode = isSelectionParentOfTarget(event.node, potentialParent);
  if (invalidMode) {
    console.log("invalid move");
  }
  if (needToChangeParent && !invalidMode) {
    let updatedRows = [];
    moveToPath(newParentPath, event.node, updatedRows);
    gridApi.value.applyTransaction({
      update: updatedRows,
    });
    gridApi.value.clearFocusedCell();
  }
  // clear node to highlight
  setPotentialParentForNode(event.api, null);
};
const onGridReady = (params) => {
  gridApi.value = params.api;
};

let potentialParent = null;

window.moveToPath = function moveToPath(newParentPath, node, allUpdatedNodes) {
  // last part of the file path is the file name
  let oldPath = node.data.filePath;
  let fileName = oldPath[oldPath.length - 1];
  let newChildPath = newParentPath.slice();
  newChildPath.push(fileName);
  node.data.filePath = newChildPath;
  allUpdatedNodes.push(node.data);
  if (node.childrenAfterGroup) {
    node.childrenAfterGroup.forEach((childNode) => {
      moveToPath(newChildPath, childNode, allUpdatedNodes);
    });
  }
};

window.isSelectionParentOfTarget = function isSelectionParentOfTarget(
  selectedNode,
  targetNode,
) {
  let children = selectedNode.childrenAfterGroup || [];
  for (let i = 0; i < children.length; i++) {
    if (targetNode && children[i].key === targetNode.key) return true;
    isSelectionParentOfTarget(children[i], targetNode);
  }
  return false;
};

window.arePathsEqual = function arePathsEqual(path1, path2) {
  if (path1.length !== path2.length) {
    return false;
  }
  let equal = true;
  path1.forEach((item, index) => {
    if (path2[index] !== item) {
      equal = false;
    }
  });
  return equal;
};

window.setPotentialParentForNode = function setPotentialParentForNode(
  api,
  overNode,
) {
  let newPotentialParent;
  if (overNode) {
    newPotentialParent =
      overNode.data.type === "folder"
        ? // if over a folder, we take the immediate row
          overNode
        : // if over a file, we take the parent row (which will be a folder)
          overNode.parent;
  } else {
    newPotentialParent = null;
  }
  let alreadySelected = potentialParent === newPotentialParent;
  if (alreadySelected) {
    return;
  }
  // we refresh the previous selection (if it exists) to clear
  // the highlighted and then the new selection.
  let rowsToRefresh = [];
  if (potentialParent) {
    rowsToRefresh.push(potentialParent);
  }
  if (newPotentialParent) {
    rowsToRefresh.push(newPotentialParent);
  }
  potentialParent = newPotentialParent;
  refreshRows(api, rowsToRefresh);
};

window.refreshRows = function refreshRows(api, rowsToRefresh) {
  let params = {
    // refresh these rows only.
    rowNodes: rowsToRefresh,
    // because the grid does change detection, the refresh
    // will not happen because the underlying value has not
    // changed. to get around this, we force the refresh,
    // which skips change detection.
    force: true,
  };
  api.refreshCells(params);
};
</script>

<template>
  <ag-grid-vue
    style="width: 100%; height: 500px"
    :class="themeClass"
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    :defaultColDef="defaultColDef"
    :rowData="rowData"
    :treeData="true"
    :groupDefaultExpanded="groupDefaultExpanded"
    :getDataPath="getDataPath"
    :getRowId="getRowId"
    :autoGroupColumnDef="autoGroupColumnDef"
    @row-drag-move="onRowDragMove"
    @row-drag-leave="onRowDragLeave"
    @row-drag-end="onRowDragEnd"
  >
  </ag-grid-vue>
</template>
