interface TreeNode {
	id: number
	parentId: number
	name: string
	children?: TreeNode[]
	path: string
	icon?: string
	[key: string]: any // 다른 속성들을 허용하기 위한 인덱스 시그니처
}

/**
 * 계층적 트리를 구성함.
 * @param data
 * @param parentId
 * @returns
 */
const constructHierarchicalTree = (
	data: TreeNode[],
	parentId: number = 101
): TreeNode[] => {
	const children = data
		.filter((item: TreeNode) => item.parentId === parentId)
		.map((item) => ({
			...item,
			icon: item.icon || "folder",
			key: item.path,
			label: item.name,
			children: constructHierarchicalTree(data, item.id),
		}))

	return children // null을 반환하지 않고 항상 배열을 반환
}

type Json = { [key: string]: any }
/**
 * 트리를 평면 배열로 변환한다.
 * @param jsonArray
 * @param parentKey
 * @param sep
 * @returns
 */
const transformTreeToFlatArray = (
	jsonArray: Array<any>,
	parentKey: string = "",
	sep: string = "."
): any => {
	let flatArray: Json[] = []

	jsonArray.forEach((node, index) => {
		const newKeyPrefix = parentKey ? `${parentKey}${sep}${node.id}` : `${node.id}`

		// 노드의 복사본을 만들고 children을 제거
		const { children, ...nodeWithoutChildren } = node
		const flatNode: Json = {}

		// 키를 평면화
		for (const key in nodeWithoutChildren) {
			if (nodeWithoutChildren.hasOwnProperty(key)) {
				const newKey = `${key}`
				flatNode[newKey] = nodeWithoutChildren[key]
			}
		}

		flatArray.push(flatNode)

		// 재귀적으로 children을 처리
		if (children && Array.isArray(children)) {
			const childFlatArray = transformTreeToFlatArray(children, newKeyPrefix, sep)
			flatArray = flatArray.concat(childFlatArray)
		}
	})

	return flatArray
}

/**
 * Max Id 값 체크
 * @param tree
 */
const determineTreeMaxId = (tree: any, key: string = "id"): number => {
	// 초기 최대값을 매우 작은 값으로 설정
	let maxId = Number.NEGATIVE_INFINITY
	// 재귀적으로 트리를 탐색하는 함수
	const traverse = (node: any) => {
		// 현재 노드의 id 값이 현재 최대값보다 크면 갱신
		if (node[key] > maxId) {
			maxId = node[key]
		}

		// 자식 노드가 있으면 각 자식 노드에 대해 재귀 호출
		if (node.children && node.children.length > 0) {
			for (let child of node.children) {
				traverse(child)
			}
		}
	}

	if (Array.isArray(tree)) {
		// 배열의 각 요소에 대해 탐색 시작
		for (let node of tree) {
			traverse(node)
		}
	} else {
		// 트리의 루트 노드부터 탐색 시작
		traverse(tree)
	}

	return maxId
}

/**
 * 특정 키로 트리 노드를 찾는 헬퍼 함수
 * @param data
 * @param key
 * @returns
 */
const locateTreeNodeByKey = (data: any, key: string | number): any => {
	for (const node of data) {
		if (node.key === key) {
			return node
		}
		if (node.children) {
			const found = locateTreeNodeByKey(node.children, key)
			if (found) {
				return found
			}
		}
	}
	return null
}

/**
 * 완성된 한글인지 체크하는 함수
 * @param char : string
 */
function isHangulComplete(char: string) {
	const code = char.charCodeAt(0)
	// 한글 완성형 유니코드 범위 (가 ~ 힣)
	return code >= 0xac00 && code <= 0xd7a3
}

/**
 * 숫자인지 확인하는 함수
 * @param char : string
 */
function isNumeric(value: any) {
	return /^-?\d*\.?\d+$/.test(value) // 정수와 실수 모두 체크
}

/**
 * 검색 트리 필터링
 * @param data
 * @param search
 */
const filterTreeData = (data: any, search: string) => {
	if (!search) return data
	return data
		.map((item: any) => {
			if (item.name.includes(search) || item.code.includes(search)) {
				return { ...item }
			}
			if (item.children) {
				const children = filterTreeData(item.children, search)
				if (children.length) {
					return { ...item, children }
				}
			}
			return null
		})
		.filter((item: any) => item)
}

/**
 * 계정 트리 데이터의 중복 값을 제거하기 위해 재귀 호출 함수 사용................................ㅠㅠ
 * @param data
 */
const deduplicateTreeNodes = (data: TreeNode[]): TreeNode[] => {
	const seen = new Set<string | number>()

	const processNode = (node: TreeNode): TreeNode | null => {
		if (seen.has(node.id)) {
			return null // 이미 처리된 id는 null 반환
		}

		seen.add(node.id)

		const processedNode: TreeNode = { ...node }

		if (node.children) {
			processedNode.children = node.children
				.map(processNode)
				.filter((child): child is TreeNode => child !== null)
		}

		return processedNode
	}

	return data.map(processNode).filter((node): node is TreeNode => node !== null)
}

/**
 * 안정성 정렬 방식
 * @param array
 * @param compareFn
 * @returns
 */
const stableSort = <T>(array: T[], compareFn: (a: T, b: T) => number): T[] => {
	return array
		.map((item, index) => ({ item, index }))
		.sort((a, b) => compareFn(a.item, b.item) || a.index - b.index)
		.map(({ item }) => item)
}

/**
 * 중복 제거 및 재가공 함수
 * @param list
 * @param key
 * @returns
 */
const removeDuplicatesByKey = <T>(list: T[], key: keyof T): T[] => {
	const uniqueItems: { [key: string]: T } = {}
	for (const item of list) {
		const itemKey = String(item[key])
		if (itemKey) {
			uniqueItems[itemKey] = item
		}
	}
	return Object.values(uniqueItems)
}

/**
 * 선택된 항목들의 특정 키에 해당하는 값을 전체 데이터에서 합산합니다.
 * @param selectedItems 선택된 항목들의 배열
 * @param allData 전체 데이터 배열
 * @param identifierKey 항목을 식별하는 키 (기본값: 'id')
 * @param sumKey 합산할 값을 가진 키 (기본값: 'amount')
 * @returns 합산된 총액
 */
const calculateSumForSelectedItems = (
	selectedItems: any[],
	allData: any[],
	identifierKey: string = "id",
	sumKey: string = "amount"
): number => {
	const selectedIdentifiers = new Set(selectedItems.map((item) => item[identifierKey]))

	return allData.reduce((total, item) => {
		if (selectedIdentifiers.has(item[identifierKey])) {
			return total + (Number(item[sumKey]) || 0)
		}
		return total
	}, 0)
}

const formatCardNumber: (cardNumber: string) => string = (cardNumber) => {
	// 모든 공백과 하이픈 제거
	const cleanedNumber: string = cardNumber.replace(/[\s-]/g, "")

	// 숫자만 추출
	const numericOnly: string = cleanedNumber.replace(/\D/g, "")

	// 카드 번호 길이에 따라 포맷 결정
	const formattedNumber: string = (() => {
		switch (numericOnly.length) {
			case 14: // Diners Club
				return numericOnly
					.replace(/(\d{4})(\d{6})(\d{4})/, "$1-$2-$3")
					.replace(/-\d{6}-/, "-xxxxxx-")
			case 15: // American Express
				return numericOnly
					.replace(/(\d{4})(\d{6})(\d{5})/, "$1-$2-$3")
					.replace(/-\d{6}-/, "-xxxxxx-")
			case 16: // Most common (Visa, Mastercard, etc.)
				return numericOnly.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-xxxx-$4")
			case 19: // Some international cards
				return numericOnly.replace(
					/(\d{4})(\d{4})(\d{4})(\d{4})(\d{3})/,
					"$1-$2-xxxx-$4-$5"
				)
			default:
				// 기본적으로 4자리씩 그룹화하고 3번째 그룹을 마스킹
				const groups = numericOnly.match(/.{1,4}/g) || []
				return groups.map((group, index) => (index === 2 ? "xxxx" : group)).join("-")
		}
	})()

	return formattedNumber
}

export {
	formatNumber,
	constructHierarchicalTree,
	transformTreeToFlatArray,
	determineTreeMaxId,
	locateTreeNodeByKey,
	filterTreeData,
	deduplicateTreeNodes,
	stableSort,
	removeDuplicatesByKey,
	calculateSumForSelectedItems,
	formatCardNumber,
	isHangulComplete,
	isNumeric,
}
