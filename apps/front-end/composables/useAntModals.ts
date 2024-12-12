/**
 * ag-grid 컬럼 위치 지정
 * @returns
 */
export const useAntModals = () => {
	const store = useModalStore()
	const { getVisible } = storeToRefs(store)

	const setModalVisible = async (view: string, column: boolean) => {
		if (getVisible.value[view] && getVisible.value[view].length > 0) {
			throw new Error(`Modal is already visible`)
		}
		store.setVisible(view, column)
	}

	const getModalVisible = (view: string) => {
		return getVisible.value[view] as boolean
	}

	const getModals = getVisible.value

	const clear = () => {
		store.clear()
	}

	return {
		/**
		 * (composable) 키 값에 따른 모달 상태 값 저장
		 * @param view
		 * @param visibled
		 */
		setModalVisible,
		/**
		 * (composable) 키 값에 따른 모달 상태 값 가져오기
		 * @param view
		 * @returns boolean
		 */
		getModalVisible,
		getModals,
		clear,
	}
}
