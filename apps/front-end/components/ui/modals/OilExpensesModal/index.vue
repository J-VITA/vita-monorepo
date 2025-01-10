<script setup lang="ts">
import MapBoxRoute from "@/components/commons/MapBoxRoute.vue"
import RelatedDocumentFileModal from "@/components/ui/modals/RelatedDocumentFileModal/index.vue"
import {
	type OilExpensesFormData,
	type Place,
	dateFormat,
	SlipOilType,
} from "@/types/expenses"
import { AccountParams } from "@/types/budgets"
import { WriterInfo, monthFormat } from "@/types/expenses"
import { addMonthAndDate } from "~/utils/addDays"
import { AccountPeriodStatus, IRequest, type AccountPeriod } from "@/types/master/period"
import { type FormInstance } from "ant-design-vue"
import {
	OsType,
	SlipType,
	type Response,
	type IAddr,
	AccountInputMethodTypes,
} from "@/types"
import { Dayjs } from "dayjs"
import { deduplicateTreeNodes } from "@/utils"

const { show = false, oilFormData } = defineProps<{
	show: boolean
	oilFormData: any
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
	(e: "refresh"): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const { checkAccountInputMethod, checkPaymentDate } = useExpenseRules()
const { getRules } = useExpenseRules()
const { getCompanyCode, getWorkplaceCode, getEmployeeId, getCostCenterId } =
	storeToRefs(authStore)
const accruedAccountInputDisabled = ref(false)
const disabledPaymentDueDate = ref(true)
const isRoundTrip = ref<boolean>(false)
const saveOilModal = ref<boolean>(false)
const accountTreeData = ref<any[]>([])
const oilSlipData = ref<any>()
const formR = useTemplateRef<FormInstance>("formR")
const formRef = useTemplateRef<FormInstance>("formRef")
const formData = ref<OilExpensesFormData>({
	accountingDate: $dayjs(),
	evidenceDate: $dayjs(),
	paymentDueDate: undefined,
	writer: [getEmployeeId.value],
	accruedAccountCode: undefined,
	perdiemPath: undefined,
	departure: undefined,
	stopover: [{ orderSeq: 0, location: "" }],
	destination: undefined,
	roundTripFlag: false,
	distance: undefined,
	fuelType: undefined,
	costStandard: undefined,
	cost: undefined,
	description: undefined,
	accountId: undefined,
	projectId: undefined,
	companyCode: getCompanyCode.value,
	employeeId: getEmployeeId.value,
	workplaceCode: getWorkplaceCode.value,
	costCenterId: getCostCenterId.value,
	slipFileIds: [],
	relatedDocumentIds: [],
	oilPrice: undefined,
	oilMileage: undefined,
	personalPathName: undefined,
})
const accountSearchParams = ref<AccountParams>({
	companyCode: getCompanyCode.value,
	used: true,
	personalExpenseFlag: true,
})

const fuelTypeOptions = [
	{ value: SlipOilType.GASOLINE, label: "가솔린(휘발유)" },
	{ value: SlipOilType.DIESEL, label: "디젤(경유)" },
	{ value: SlipOilType.LPG, label: SlipOilType.LPG },
	{ value: SlipOilType.Electric, label: "전기" },
]

// 검색 결과를 저장할 상태 변수
const places = ref<Place[]>([])
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const isRead = ref<boolean>(false)
const documents = ref<string[]>([])
const departmentCoordinate = ref<[number, number] | undefined>(undefined)
const arrivalCoordinate = ref<[number, number] | undefined>(undefined)
const stopoverCoordinates = ref<[number, number][]>([])

/**
 * 계정항목 목록 조회
 * @param accountData
 */
const {
	data: accountData,
	status: accountStatus,
	refresh: accountRefresh,
} = await useAsyncData(`oil-expenses-account-list`, () =>
	useCFetch<any>("/api/v2/slips/commons/employee-account", {
		method: "GET",
		params: {
			...accountSearchParams.value,
		},
	}).then((res: any) => res.data)
)

/** 모달 데이터 초기화 */
const initFormData = () => {
	formData.value = {
		id: undefined,
		accountingDate: $dayjs(),
		evidenceDate: $dayjs(),
		paymentDueDate: formData.value.paymentDueDate || undefined,
		writer: [getEmployeeId.value],
		accruedAccountCode: formData.value.accruedAccountCode || undefined,
		perdiemPath: undefined,
		departure: undefined,
		stopover: [{ orderSeq: 0, location: "" }],
		destination: undefined,
		roundTripFlag: false,
		distance: undefined,
		fuelType: undefined,
		costStandard: undefined,
		cost: undefined,
		description: undefined,
		accountId: undefined,
		projectId: undefined,
		companyCode: getCompanyCode.value,
		employeeId: getEmployeeId.value,
		workplaceCode: getWorkplaceCode.value,
		costCenterId: getCostCenterId.value,
		slipFileIds: [],
		oilPrice: undefined,
		oilMileage: undefined,
	}
	departmentCoordinate.value = undefined
	arrivalCoordinate.value = undefined
	stopoverCoordinates.value = []
	oilSlipData.value = {}
}

/** 데이터 세팅 */
const setFormData = (data: any) => {
	oilSlipData.value = data
	formData.value = {
		id: data.slipHeader.id,
		accountingDate: $dayjs(data.slipHeader.accountingDate),
		evidenceDate: $dayjs(data.slipHeader.evidenceDate),
		paymentDueDate: $dayjs(data.slipHeader.paymentDueDate),
		writer: [data.slipHeader.writerId],
		accruedAccountCode: data.slipHeader.accruedAccountCode,
		perdiemPath: undefined,
		departure: data.slipFuelHeaderDto.departure,
		stopover: data.slipFuelHeaderDto.fuelSlipStopovers,
		destination: data.slipFuelHeaderDto.destination,
		roundTripFlag: data.slipFuelHeaderDto.roundTrip,
		distance: data.slipFuelHeaderDto.distance,
		fuelType: data.slipFuelHeaderDto.oilType.code,
		costStandard: `${data.slipFuelHeaderDto.amount}원[1ℓ당] / 연비${data.slipFuelHeaderDto.mileage}km`,
		cost: data.slipFuelHeaderDto.amount,
		description: data.slipFuelHeaderDto.description,
		accountId: data.slipDetails[0].accountId,
		projectId: data.slipDetails[0].projectId,
		companyCode: data.slipHeader.companyCode,
		employeeId: data.slipHeader.employeeId,
		workplaceCode: data.slipHeader.workplaceCode,
		costCenterId: data.slipDetails[0].costCenterId,
		slipFileIds: [],
		oilPrice: data.slipFuelHeaderDto.unitPrice,
		oilMileage: data.slipFuelHeaderDto.mileage,
	}
	const params = {
		departure: data.slipFuelHeaderDto.departure,
		stopovers: data.slipFuelHeaderDto.fuelSlipStopovers,
		destination: data.slipFuelHeaderDto.destination,
	}
	onSetPath(params)
}

/** 작성자 세팅 */
const writerUpdate = (values: WriterInfo[]): void => {
	const [firstValue] = values
	if (!firstValue) return

	const { id: employeeId, companyCode, workplaceCode } = firstValue
	formData.value.writer = values.map((v) => v.id)
	formData.value.employeeId = employeeId
	formData.value.companyCode = companyCode
	formData.value.workplaceCode = workplaceCode
}

/** 작성자 삭제 */
const writerRemove = (value: Array<any>) => {
	nextTick(() => {
		if (value && value.length > 0) {
			Modal.info({
				content: "사용자는 삭제할 수 없습니다. 이전 사용자로 재설정 됩니다.",
				onOk() {
					writerUpdate(value)
				},
			})
		}
	})
}

/** 모달 닫기 */
const modalCancle = async (value: any) => {
	open.value = false
	initPlace()
}

/** 개인출장경로모달 닫기 */
const oilModalCancle = () => {
	saveOilModal.value = false
}

/** 모달 데이터 저장 */
const onSubmit = async (slipData?: any) => {
	const params = {
		slipHeaderRequest: {
			id: formData.value.id ? formData.value.id : undefined,
			companyCode: formData.value.companyCode,
			slipType: "PERSONAL_EXPENSE",
			slipStatus: formData.value.id ? slipData.slipHeader.slipStatusName : "UNPROCESSED",
			slipNumber: formData.value.id ? slipData.slipHeader.slipNumber : undefined,
			accountingDate: formData.value.accountingDate,
			evidenceDate: formData.value.evidenceDate,
			slipEvidenceType: "OIL", //formData.value.fuelType,
			slipRequestType: "ADVANCE",
			slipCalculationType: "NOT",
			deductionType: "DEDUCTION",
			divisionSlipFlag: false,
			taxCode: "A",
			actualPayeeFlag: false,
			workplaceCode: formData.value.workplaceCode,
			totalAmount: formData.value.cost,
			supplyAmount: formData.value.cost,
			taxAmount: 0,
			krwTotalAmount: formData.value.cost,
			krwSupplyAmount: formData.value.cost,
			krwTaxAmount: 0,
			currencyType: "KRW",
			countryType: "KOR",
			foreignCurrencyAmount: 0,
			osType: OsType.WEB,
			paymentDueDate: formData.value.paymentDueDate,
			accruedAccountCode: formData.value.accruedAccountCode,
			fixedAssetFlag: false,
			approvalOrderSeq: 1,
			description: formData.value.description,
			reference: {},
			writerId: formData.value.employeeId,
			employeeId: formData.value.employeeId,
			handTaxInvoiceFlag: false,
		},
		slipDetailRequests: [
			{
				id: formData.value.id ? slipData.slipDetails[0].id : undefined,
				slipNumber: formData.value.id ? slipData.slipDetails[0].slipNumber : undefined,
				divisionSeq: 1,
				seq: 1,
				companyCode: formData.value.companyCode,
				slipLineType: "ITEM",
				debitCreditType: "DEBIT",
				taxCode: "A",
				totalAmount: formData.value.cost,
				supplyAmount: formData.value.cost,
				taxAmount: 0,
				krwTotalAmount: formData.value.cost,
				krwSupplyAmount: formData.value.cost,
				krwTaxAmount: 0,
				description: formData.value.description,
				reference: {},
				slipHeaderId: 1,
				employeeId: formData.value.employeeId,
				accountId: formData.value.accountId,
				costCenterId: formData.value.costCenterId,
				projectId: formData.value.projectId,
			},
		],
		slipFuelHeaderRequest: {
			departure: formData.value.departure,
			destination: formData.value.destination,
			roundTrip: formData.value.roundTripFlag,
			distance: formData.value.distance,
			oilType: formData.value.fuelType,
			mileage: formData.value.oilMileage,
			unitPrice: formData.value.oilPrice,
			amount: formData.value.cost,
			description: formData.value.description,
		},
		slipFuelStopoverRequests: formData.value.stopover,
		receiptFileId: 48,
	}
	if (!formData.value.stopover) return
	params.slipFuelStopoverRequests = formData.value.stopover?.map((item) => {
		return {
			orderSeq: item.orderSeq,
			location: item.location,
		}
	})
	formRef.value?.validate().then(async (res: any) => {
		await postOilExpenseData(params)
	})
}

/** 첨부파일 */
const updateSlipFile = (value: any) => {
	console.log(`updateSlipFile : `, value)
}

/** 경유지 좌표 초기화 */
const initPlace = () => {
	places.value = []
}

/** 저장된 경로 선택 및 세팅 */
const onSetPath = async (pathData: any) => {
	formData.value.departure = pathData.departure
	const mapDataD = await onSearchCoordinate(pathData.departure, "D")
	departmentCoordinate.value = [mapDataD.documents[0].x, mapDataD.documents[0].y]
	formData.value.destination = pathData.destination
	const mapDataA = await onSearchCoordinate(pathData.destination, "A")
	arrivalCoordinate.value = [mapDataA.documents[0].x, mapDataA.documents[0].y]

	if (pathData.stopovers.length == 1 && !pathData.stopovers[0].location) return
	pathData.stopovers.forEach(async (item: any, index: number) => {
		if (!formData.value.stopover) return
		formData.value.stopover[index].location = item.location
		formData.value.stopover[index].orderSeq = item.orderSeq
		const mapData = await onSearchCoordinate(item.location, "S")
		if (stopoverCoordinates.value[index]) {
			stopoverCoordinates.value[index] = [mapData.documents[0].x, mapData.documents[0].y]
		} else {
			stopoverCoordinates.value.push([mapData.documents[0].x, mapData.documents[0].y])
		}
	})
	formData.value.roundTripFlag = pathData.roundTrip
}

/** 주행거리 세팅 */
const onCoordinateData = (value: number) => {
	formData.value.distance = value
	calPriceDistance()
}

/** 금액 계산 */
const calPriceDistance = () => {
	if (formData.value.oilPrice && formData.value.distance)
		formData.value.cost = formData.value.oilPrice * formData.value.distance
}

/** 유효성검사 한글 메시지를 위한 함수 */
const tripParamsToKorean = (key: string) => {
	const paramsKorean = [
		{ label: "회사코드", value: "companyCode" },
		{ label: "출발지", value: "departure" },
		{ label: "도착지", value: "destination" },
		{ label: "주행거리", value: "distance" },
		{ label: "경유지", value: "stopovers" },
		{ label: "사용자코드", value: "employeeId" },
	]
	return paramsKorean.filter((item) => {
		return item.value === key
	})[0].label
}

/** 개인출장경로등록 유효성검사 */
const tripDataValidation = (params: any) => {
	for (const [key, value] of Object.entries(params)) {
		if (key !== "stopovers" && value === undefined) {
			message.error(`${tripParamsToKorean(key)} 값이 없습니다.`)
			return false
		}
	}
	return true
}

/** 개인출장경로등록 저장 */
const onSaveBusinessTripPath = async () => {
	let params = {
		companyCode: formData.value.companyCode,
		name: formData.value.personalPathName,
		departure: formData.value.departure,
		destination: formData.value.destination,
		distance: formData.value.distance,
		roundTrip: formData.value.roundTripFlag,
		active: true,
		stopovers: formData.value.stopover?.map((item) => {
			return { orderSeq: item.orderSeq, location: item.location }
		}),
		employeeId: formData.value.employeeId,
	}
	formR.value?.validate().then(async (res: any) => {
		if (!tripDataValidation(params)) return
		await postBusinessTrip(params)
	})
}

/** 지급기준, 주행거리 초기화 */
const onResetCost = () => {
	formData.value.costStandard = undefined
	formData.value.fuelType = undefined
	formData.value.cost = undefined
}

/** 왕복 세팅 */
const setRoundTrip = () => {
	if (!formData.value || !formData.value.stopover) return
	isRoundTrip.value = !formData.value.stopover.every((item) => !item.location) //왕복 컬럼 flag
	if (isRoundTrip.value && formData.value.roundTripFlag) {
		// 왕복값 되돌리기
		formData.value.roundTripFlag = false
		onDoubleDistance()
	}
}

/** 왕복 거리 계산 */
const onDoubleDistance = () => {
	if (!formData.value.distance) return
	formData.value.distance = formData.value.roundTripFlag
		? formData.value.distance * 2
		: formData.value.distance / 2
}

/** 경유지 추가 */
const addStopover = () => {
	if (!formData.value.stopover) return
	if (!formData.value.stopover[0].location) return

	if (formData.value.stopover.length < 10) {
		formData.value.stopover.push({ orderSeq: 0, location: "" })
		stopoverCoordinates.value.push([0, 0])
	} else {
		message.warning("경유지는 최대 10개까지 추가할 수 있습니다.")
	}
}

/** 경유지 삭제 */
const removeStopover = (index: number) => {
	if (!formData.value.stopover) return

	if (formData.value.stopover.length > 1) {
		formData.value.stopover.splice(index, 1) // 경유지 삭제
		stopoverCoordinates.value.splice(index, 1) // 좌표도 삭제
	} else {
		formData.value.stopover[0] = { orderSeq: 0, location: "" }
		stopoverCoordinates.value = []
	}
	setRoundTrip()
}

/** 경유지 수정 */
const updateStopover = (idx: number, newValue: any) => {
	if (!formData.value.stopover) return
	formData.value.stopover[idx] = newValue.target.value // 해당 인덱스의 값을 수정
}

/** 개인출장경로등록 모달 오픈 */
const onSaveBusinessTrip = () => {
	saveOilModal.value = true
}

/** 지급기준 조회 */
const onSetCostStandard = (value: any) => {
	useCFetch<any>(
		`/api/v2/masters/oils/${getCompanyCode.value}/${$dayjs(formData.value.evidenceDate).format("YYYY-MM")}`,
		{
			method: "GET",
			params: {
				oilType: value,
			},
		}
	).then((res) => {
		if (!res.status) {
			formData.value.costStandard = `${res.price}원[1ℓ당] / 연비${res.mileage}km`
			formData.value.oilPrice = res.price
			formData.value.oilMileage = res.mileage
			calPriceDistance()
		} else {
			message.error(res.message)
		}
	})
}

/** 사용일자 선택불가 날짜 세팅 */
const disabledDate = (current: Dayjs) => {
	const formattedDate = current.format(monthFormat)
	return !accountPeriodsDays.value.includes(formattedDate)
}

/** 회계기간 조회 */
const { data: accountPeriodsDays, refresh: accountPeriodsDayssRefresh } =
	await useAsyncData(`slip-expenses-account-periods`, async () =>
		useCFetch<Response<Array<AccountPeriod>>>("/api/v2/slips/commons/accountPeriods", {
			method: "GET",
			// lazy: true,
			params: {
				companyCode: getCompanyCode.value,
				accountPeriodStatus: AccountPeriodStatus.OPEN,
				workplaceCode: getWorkplaceCode.value,
				searchYearMonthFrom: $dayjs().subtract(1, "year").format("YYYY-MM-DD"),
				searchYearMonthTo: $dayjs().add(1, "year").format("YYYY-MM-DD"),
				page: 0,
				size: 9999,
			},
		}).then(
			(res: Response<any>) =>
				res.data
					.map((x: IRequest) => x.standardYearMonth)
					.sort((a: IRequest, b: IRequest) => a.standardYearMonth)
					.reverse() || []
		)
	)

/** 주소검색 및 좌표값 세팅 */
const onSearchModal = async (type: string): Promise<void> => {
	try {
		new window.daum.Postcode({
			oncomplete: async function (data: IAddr) {
				if (formData.value) {
					if (type == "D") {
						formData.value.departure = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress, type)
						departmentCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type == "A") {
						formData.value.destination = data.jibunAddress
						const mapData = await onSearchCoordinate(data.jibunAddress, type)
						arrivalCoordinate.value = [mapData.documents[0].x, mapData.documents[0].y]
					}
					if (type.startsWith("S")) {
						if (!formData.value.stopover) return
						const index = parseInt(type.slice(1)) // 경유지 인덱스
						formData.value.stopover[index].location = data.jibunAddress
						formData.value.stopover[index].orderSeq = index
						const mapData = await onSearchCoordinate(data.jibunAddress, type)
						if (stopoverCoordinates.value[index]) {
							stopoverCoordinates.value[index] = [
								mapData.documents[0].x,
								mapData.documents[0].y,
							]
						} else {
							stopoverCoordinates.value.push([
								mapData.documents[0].x,
								mapData.documents[0].y,
							])
						}
						setRoundTrip()
					}
					//   data.roadAddress; 도로명
					//   data.jibunAddress; 지번
				}
			},
		}).open({ popupName: "oil-route" })
	} catch (e) {
		console.error(e)
	}
}

/** 좌표값 변환 */
const onSearchCoordinate = async (param: string, type: string) => {
	const appKey = useRuntimeConfig().public.kakaoAppKey
	const url = new URL("https://dapi.kakao.com/v2/local/search/address.json")
	url.searchParams.append("query", param)
	try {
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `KakaoAK ${appKey}`, // Authorization 헤더 설정
				"Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
			},
		})
		const coordinate = await response.json()
		if (coordinate.documents.length === 0) {
			message.error("좌표 정보가 없습니다. 다른 지역을 선택해주세요.")
			if (type === "D") formData.value.departure = ""
			if (type === "A") formData.value.destination = ""
			if (type === "S") formData.value.stopover = [{ orderSeq: 0, location: "" }]
			return []
		}
		return coordinate
	} catch (error) {
		console.error("카카오 API 요청 오류:", error)
		throw error
	}
}

/** 유류대 저장/수정 */
const postOilExpenseData = async (params: any) => {
	const id = params.slipHeaderRequest.id || 0
	await useCFetch<Response<any>>(
		!id ? "/api/v2/slips/expenses/fuel" : `/api/v2/slips/expenses/fuel/${id}`,
		{
			method: !id ? "POST" : "PATCH",
			body: params,
		}
	).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success("저장하였습니다.")
			open.value = false
			emit("refresh")
		} else {
			message.error(res.message)
		}
	})
}

/** 개인출장경로등록 저장 */
const postBusinessTrip = async (params: any) => {
	await useCFetch<Response<any>>("/api/v2/persons/my-business-trip-routes", {
		method: "POST",
		body: params,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success("저장하였습니다.")
			saveOilModal.value = false
		} else {
			message.error(res.message)
		}
	})
}

/** 지급예정일 세팅 */
watch(open, async () => {
	if (!open) {
		accruedAccountInputDisabled.value = await checkAccountInputMethod()
			.then((res: any) => !res.key)
			.catch((error: any) => {
				message.error(`${error.message}`)
				return false
			})

		if (formData) {
			formData.value.paymentDueDate = await checkPaymentDate(SlipType.PERSONAL_EXPENSE)
				.then((res: any) => {
					disabledPaymentDueDate.value = !res.flag
					return $dayjs($dayjs().month(res.month).date(res.day).format(dateFormat))
				})
				.catch((error: any) => {
					disabledPaymentDueDate.value = true
					message.error(`${error.message}`)
					return undefined
				})
		}
	}
})

/** 계정항목 disabled 세팅 */
const addDisabledColumn = (treeData: any, isSubAccount: boolean) => {
	return treeData.map((node: any) => {
		const isDisabled = isSubAccount
			? node.accountLevelName === "GROUP" || node.accountLevelName === "SUB_ACCOUNT"
			: node.accountLevelName === "GROUP"
		// 자식 노드가 있으면 재귀 호출
		if (node.children && node.children.length) {
			return {
				...node,
				children: addDisabledColumn(node.children, isSubAccount), // 자식 트리도 처리
				disabled: isDisabled, // 기본적으로 부모 노드는 disabled 처리
			}
		} else {
			// 자식이 없으면 최하위 노드로 간주하여 선택 가능
			return {
				...node,
				disabled: isDisabled,
			}
		}
	})
}

/** 트리데이터 > 배열로 변환 */
const processData = (treeData: any, isSubAccount: boolean) => {
	return treeData.map((parentNode: any) => {
		parentNode = addDisabledColumn(parentNode, isSubAccount)
		return parentNode
	})
}

/** 계정항목 조회 */
const fetchAccountData = async (params: {
	costCenterId?: number
	employeeId?: number
}) => {
	return await useCFetch<Response<any>>("/api/v2/slips/commons/employee-account", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			used: true,
			personalExpenseFlag: true,
			cardFlag: false,
			...(isRead ? {} : params),
		},
	}).then((res: Response<any>) => {
		const data = res.data || []
		return deduplicateTreeNodes(data)
	})
}

const prevValues = ref<{ costCenterId?: number | null; employeeId?: number | null }>()

/** 모달 데이터 초기화 */
watch(
	() => open.value,
	(value) => {
		if (!value) initFormData()
	}
)

/** 유류데이터 세팅 */
watch(
	() => oilFormData,
	(value) => {
		if (!!value?.slipHeader) setFormData(value)
	}
)

/** 계정항목 세팅 */
watch(
	() => formData.value,
	(newList) => {
		if (newList) {
			if (newList.description) return
			const fetchData = async () => {
				let newAccountTreeData = [...accountTreeData.value]

				const item = newList
				const prevValue = prevValues.value || {}
				if (
					item.costCenterId !== prevValue.costCenterId ||
					item.employeeId !== prevValue.employeeId
				) {
					const params: { costCenterId?: number; employeeId?: number } = {}
					if (item.costCenterId) params.costCenterId = item.costCenterId
					if (item.employeeId) params.employeeId = item.employeeId

					if (Object.keys(params).length > 0) {
						newAccountTreeData = await fetchAccountData(params)
					} else {
						newAccountTreeData = []
					}

					prevValues.value = { ...item }
				}
				getRules().then((res) => {
					if (!res.data) return
					newAccountTreeData = processData(
						[newAccountTreeData],
						res.data.accountInputMethodTypeName === AccountInputMethodTypes.SUB_ACCOUNT
					)
					accountTreeData.value = newAccountTreeData
				})
			}
			fetchData()
		}
	},
	{ deep: true }
)

onMounted(async () => {
	// 코스트센터 변경시 계정과목 세팅
	if (formData.value) {
		let newAccountTreeData = [...accountTreeData.value]
		const params: { costCenterId?: number; employeeId?: number } = {}
		if (formData.value.costCenterId) params.costCenterId = formData.value.costCenterId
		if (formData.value.employeeId) params.employeeId = formData.value.employeeId
		newAccountTreeData = await fetchAccountData(params)
		getRules().then((res) => {
			if (!res.data) return
			newAccountTreeData = processData(
				[newAccountTreeData],
				res.data.accountInputMethodTypeName === AccountInputMethodTypes.SUB_ACCOUNT
			)
			accountTreeData.value = newAccountTreeData
		})
	}
	//지급예정일 세팅

	if (!formData.value) return
	await checkPaymentDate(SlipType.PERSONAL_EXPENSE).then((res) => {
		if (res) {
			disabledPaymentDueDate.value = res?.flag
			formData.value.paymentDueDate = $dayjs(addMonthAndDate(res.month, res.day))
		}
	})
})
</script>

<template>
	<a-modal
		:width="'80rem'"
		v-model:open="open"
		:destroy-on-close="false"
		:mask-closable="false"
		:title="!formData.id ? '유류대 추가' : '유류대 수정'"
		:keyboard="false"
		@cancel="modalCancle"
	>
		<a-row :gutter="40">
			<a-col :span="11">
				<!-- MapBox 거리 지도 -->
				<div class="mt-xl" :style="{ overflow: 'hidden' }">
					<map-box-route
						:department-coordinate="departmentCoordinate"
						:arrival-coordinate="arrivalCoordinate"
						:stopover-coordinates="stopoverCoordinates"
						@update:value="onCoordinateData"
					/>
				</div>
				<!-- 첨부파일 -->
				<attachment-file-upload
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="formData.slipFileIds"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						documentedNumber: '0',
					}"
					@update:file-list="updateSlipFile"
				></attachment-file-upload>
				<!-- 관련문서 -->
				<documents-file-upload
					:result-type="'SLIP'"
					@update:document-ids="
						(idList: number[]) => (formData.relatedDocumentIds = idList)
					"
				></documents-file-upload>
			</a-col>
			<a-col :span="13">
				<a-form
					ref="formRef"
					label-align="left"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
					:model="formData"
				>
					<a-form-item label="사용자" name="writer" :rules="[{ required: true }]">
						<eacc-select-table
							v-model:value="formData.writer"
							:disabled="isRead"
							key-props="id"
							label-prop="name"
							url="/api/v2/slips/commons/employees"
							:columns="[
								{ title: '회사', data: (row: any) => row.companyName },
								{ title: 'id', data: (row: any) => row.id },
								{ title: '사업장', data: (row: any) => row.workplaceName },
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
								{ title: '직위', data: (row: any) => row.gradeName },
								{ title: '이름', data: (row: any) => row.name },
							]"
							@selection-change="(value: any) => writerUpdate(value)"
							@remove="(value: Array<any>) => writerRemove(value)"
						/>
					</a-form-item>
					<a-form-item
						label="회계일자"
						name="accountingDate"
						:rules="[{ required: true }]"
					>
						<a-date-picker
							class="full-width"
							v-model:value="formData.accountingDate"
							:format="'YYYY-MM-DD'"
						/>
					</a-form-item>
					<a-form-item label="사용일자" name="evidenceDate" :rules="[{ required: true }]">
						<a-date-picker
							class="full-width"
							:disabled-date="disabledDate"
							v-model:value="formData.evidenceDate"
							@change="onResetCost"
						/>
					</a-form-item>
					<a-form-item
						label="부채계정"
						name="accruedAccountCode"
						:rules="[{ required: true }]"
					>
						<eacc-select
							v-if="getCompanyCode"
							:url="`/api/v2/slips/commons/credit`"
							:params="{
								companyCode: getCompanyCode,
								personalExpenseFlag: true,
								cardFlag: false,
							}"
							:on-all-field="false"
							v-model:value="formData.accruedAccountCode"
							refresh
							first
							:field-names="{ label: 'name', value: 'code' }"
							value-type="any"
							:disabled="isRead || accruedAccountInputDisabled"
						/>
					</a-form-item>
					<a-form-item
						label="지급예정일"
						name="paymentDueDate"
						:rules="[{ required: true }]"
					>
						<a-date-picker
							class="full-width"
							v-model:value="formData.paymentDueDate"
							:disabled="isRead || !disabledPaymentDueDate"
						/>
					</a-form-item>
					<a-form-item label="경로선택">
						<eacc-select
							v-model:value="formData.perdiemPath"
							:url="`/api/v2/persons/my-business-trip-routes/my`"
							placeholder="경로를 선택해주세요."
							:field-names="{ label: 'name', value: 'id' }"
							:on-all-field="false"
							value-type="any"
							@update:any-value="onSetPath"
						/>
					</a-form-item>
					<a-form-item label="출발지" name="departure" :rules="[{ required: true }]">
						<a-input
							v-model:value="formData.departure"
							readOnly
							@click="onSearchModal('D')"
						/>
					</a-form-item>
					<a-form-item
						label="경유지"
						v-for="(item, idx) in formData.stopover"
						:key="'turn' + idx"
					>
						<a-input
							:value="item.location"
							@input="updateStopover(idx, $event)"
							readOnly
							@click="onSearchModal(`S${idx}`)"
							:style="{ width: '70%', display: 'inline-block' }"
						/>
						<a-button
							@click="removeStopover(idx)"
							danger
							:icon="materialIcons('mso', 'do_not_disturb_on')"
							:style="{ margin: '0 10px', display: 'inline-block !important' }"
						/>
						<a-button @click="addStopover" :icon="materialIcons('mso', 'add_box')" />
					</a-form-item>
					<a-form-item label="도착지" name="destination" :rules="[{ required: true }]">
						<a-input
							v-model:value="formData.destination"
							readOnly
							@click="onSearchModal('A')"
						/>
					</a-form-item>
					<a-form-item v-if="!isRoundTrip" label="왕복여부">
						<a-switch
							v-model:checked="formData.roundTripFlag"
							@click="onDoubleDistance"
						/>
					</a-form-item>
					<a-form-item label="주행거리">
						<a-flex>
							<a-input type="text" v-model:value="formData.distance" disabled />km
						</a-flex>
					</a-form-item>
					<a-form-item label="지급기준" name="fuelType" :rules="[{ required: true }]">
						<a-flex :gap="10">
							<a-input type="text" v-model:value="formData.costStandard" disabled />
							<a-select
								v-model:value="formData.fuelType"
								:options="fuelTypeOptions"
								:field-names="{ label: 'label', value: 'value' }"
								:placeholder="'선택해주세요'"
								@change="onSetCostStandard"
							></a-select>
						</a-flex>
					</a-form-item>
					<a-form-item label="금액" name="cost" :rules="[{ required: true }]">
						<eacc-amount-input v-model:value="formData.cost" disabled />
					</a-form-item>
					<a-form-item label="내용" name="description" :rules="[{ required: true }]">
						<a-input type="text" v-model:value="formData.description" />
					</a-form-item>
					<a-form-item
						label="코스트센터"
						name="costCenterId"
						:rules="[
							{
								required: true,
							},
						]"
					>
						<eacc-select
							v-model:value="formData.costCenterId"
							:url="`/api/v2/slips/commons/employee-costCenter?employeeId=${formData.employeeId}`"
							:params="{
								companyCode: getCompanyCode,
								employeeId: formData.employeeId,
								used: true,
							}"
							placeholder="코스트센터를 선택해주세요."
							:refresh="formData.employeeId ? true : false"
							:field-names="{ label: 'name', value: 'id' }"
							:on-all-field="false"
							:disabled="isRead"
						/>
					</a-form-item>
					<a-form-item
						label="계정과목"
						name="accountId"
						:rules="[
							{
								required: true,
							},
						]"
					>
						<a-tree-select
							v-model:value="formData.accountId"
							show-search
							:tree-line="true"
							:dropdown-style="dropdownStyle"
							placeholder="계정항목을 선택해주세요."
							allow-clear
							show-checked-strategy="SHOW_ALL"
							tree-default-expand-all
							:field-names="{
								children: 'children',
								label: 'name',
								value: 'id',
							}"
							:tree-data="accountData"
							tree-node-filter-prop="name"
							:max-tag-count="2"
						/>
					</a-form-item>
					<a-form-item label="프로젝트">
						<eacc-select
							placeholder="프로젝트를 선택해주세요 (선택)"
							url="/api/v2/slips/commons/projects"
							:params="{
								companyCode: getCompanyCode,
								employeeId: formData.employeeId,
								used: true,
								page: 0,
								size: 1000,
							}"
							refresh
							v-model:value="formData.projectId"
							:field-names="{ label: 'name', value: 'id' }"
							:on-all-field="false"
							:disabled="isRead"
							@update:value="(value: any) => (formData.projectId = value)"
						/>
					</a-form-item>
					<a-form-item label="사업장">
						<eacc-select
							v-if="getCompanyCode"
							:url="`/api/v2/slips/commons/companies`"
							:params="{
								code: getCompanyCode,
								placeType: 'WORKPLACE',
								page: 0,
								size: 1000,
							}"
							:on-all-field="false"
							v-model:value="formData.workplaceCode"
							refresh
							:field-names="{ label: 'name', value: 'workplaceCode' }"
							value-type="any"
							placeholder="사업장을 선택해주세요 (선택)"
							@update:any-value="
								(value: any) => {
									formData.workplaceCode = value.workplaceCode
								}
							"
							:disabled="isRead"
						>
						</eacc-select>
					</a-form-item>
				</a-form>
			</a-col>
		</a-row>
		<template #footer>
			<a-flex>
				<a-col :span="5">
					<a-button @click="onSaveBusinessTrip">
						{{ "개인 출장경로등록" }}
					</a-button>
				</a-col>
				<a-col :span="19">
					<a-button @click="modalCancle">
						{{ "닫기" }}
					</a-button>
					<a-button :ghost="false" :type="'primary'" @click="onSubmit(oilSlipData)">
						{{ "저장" }}
					</a-button>
				</a-col>
			</a-flex>
		</template>
	</a-modal>

	<a-modal
		title="개인 출장경로등록"
		:width="'60rem'"
		v-model:open="saveOilModal"
		ok-text="저장"
		centered
		@cancel="oilModalCancle"
		@ok="onSaveBusinessTripPath"
	>
		<a-row>
			<a-form class="full-width" :model="formData" ref="formR">
				<a-form-item
					label="출장 경로명"
					name="personalPathName"
					:rules="{ required: true }"
				>
					<a-input v-model:value="formData.personalPathName"></a-input>
				</a-form-item>
			</a-form>
		</a-row>
	</a-modal>
</template>
