/**
 * ag-grid 컬럼 위치 지정
 * @returns
 */
export const useAgGridColumn = () => {
	const columnsStore = useAgGridColumnsStore()
	const { getAgColumns } = storeToRefs(columnsStore)

	const setColumns = async (key: string, column: Array<any>) => {
		columnsStore.setAgColumns(key, column)
	}

	const getColumns = async (view: string) => {
		return getAgColumns.value[view]
	}

	return {
		/**
		 * (composable)화면에 따른 ag-grid columns 저장
		 * @param view
		 * @param column
		 */
		setColumns,
		/**
		 * (composable)화면별 ag-grid 컬럼 세팅값 가져오기
		 * @param view
		 * @returns
		 */
		getColumns,
	}
}
