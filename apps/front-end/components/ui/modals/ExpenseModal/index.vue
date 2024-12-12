<script setup lang="ts">
import { materialIcons } from "@/composables/icons"

import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { AccountPeriodStatus, IRequest, type AccountPeriod } from "@/types/master/period"
import { OsType, SlipType, type Response } from "@/types"
import type { FormInstance, UploadFile } from "ant-design-vue"
import {
	type ExpenseList,
	type SlipDetails,
	FormType,
	dateFormat,
	ExpenseBuilder,
	SlipField,
	SlipStateType,
	Slip,
	EntityslipHeader,
	WriterInfo,
	monthFormat,
	SlipTaxType,
	SlipDivisionType,
} from "@/types/expenses"
import { createVNode, onWatcherCleanup, useTemplateRef } from "vue"
import type { Data } from "@/types/master/config"
import { CommonProject } from "@/types/expenses/commons/project"

const authStore = useAuthStore()
const appStore = useAppsStore()

const { loading } = storeToRefs(appStore)

const {
	getCompanyId,
	getCompanyCode,
	getWorkplaceCode,
	getWorkplaceId,
	// getUserId,
	getEmployeeId,
	getCostCenterId,
} = storeToRefs(authStore)

const {
	show = false,
	slipData,
	currentPageDataList,
	formSlipType,
} = defineProps<{
	show: boolean
	slipData?: any
	currentPageDataList?: Array<ExpenseList>
	formSlipType: SlipType
}>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

const isWatching = ref<boolean>(true)
const isLoading = ref(true)
const isRepeat = ref<boolean>(false)
const isRead = ref<boolean>(false)

// const formRef = ref<FormInstance>();
const formRef = useTemplateRef<FormInstance>("formRef")

const initFormState = async () => {
	// const ctr = new AbortController();
	// const { status: projectStatus, data: projectData } = await getDefaultProjectList(getEmployeeId.value, ctr.signal).finally(() => (ctr.abort()));

	const { status: projectStatus, data: projectData } = await Promise.resolve(
		useCFetch<Response<Array<CommonProject>>>("/api/v2/slips/commons/projects", {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				employeeId: getEmployeeId.value,
				used: true,
				page: 0,
				size: 10,
			},
		}).then((res: Response<Array<CommonProject>>) => res)
	)

	return new ExpenseBuilder()
		.setWriter(getEmployeeId.value)
		.setSlipType(formSlipType)
		.setCurrencyType("KRW")
		.setCompanyCode(getCompanyCode.value)
		.setWorkplace(getWorkplaceCode.value)
		.setAccountingYearMonth(dayjs().format("YYYY-MM"))
		.setAccountingDate(dayjs().format("YYYY-MM-DD"))
		.setReceiptFile([])
		.setFiles([])
		.setDivisionSlipFlag(false)
		.setSlipDetails([
			{
				seq: 1,
				employee: [getEmployeeId.value],
				employeeId: getEmployeeId.value,
				taxCode: "A",
				krwTotalAmount: 0,
				taxAmount: 0,
				slipLineType: "ITEM",
				debitCreditType: "DEBIT",
				slipHeaderId: undefined,
				companyCode: getCompanyCode.value,
				workplaceCode: getWorkplaceCode.value,
				costCenterId: getCostCenterId.value,
				projectId:
					projectStatus === 0 && projectData && projectData.length === 1
						? projectData[0].id
						: undefined,
			},
		])
		.build()
}
const formState = ref<Slip>(await initFormState())
const initialState = ref<Slip>(await initFormState())
const hasChanged = ref(false)

// 컴포넌트 마운트 및 데이터 로드 완료 후 초기 상태 저장
const initializeState = async () => {
	await nextTick()
	initialState.value = _cloneDeep(formState.value)
}
// const formState = ref<Slip>(new ExpenseBuilder().build());

const currentPage = ref<number>(1)
const modalWidth = computed(() => {
	return formState.value.entityslipHeader?.divisionSlipFlag ? "140rem" : "80rem"
})
const {
	checkAccountInputMethod,
	checkExpenseFile,
	checkPersonalExpenseReceipt,
	checkPersonalExpenseVendor,
	checkPaymentDate,
	checkExpenseDoc,
} = useExpenseRules()

//계정항목 ? 부채계정 (일단 보류) 에 대한 기준정보 셋업 관련
const accruedAccountInputDisabled = ref(false)
const accruedAccountInputMethod = ref(null)
// 지급예정일 셋업 정보
const disabledPaymentDueDate = ref(true)
// 영수증필수여부 셋업 정보
const disabledPersonalExpenseReceiptFlag = ref(true)
// 첨부파일 사용 유무 셋업 정보
const disabledExpenseFile = ref(true)
// 관련문서 사용 유무 셋업 정보
const disabledDocumentsFile = ref(true)
// 가맹점 필수여부 셋업 정보
const disabledPersonalExpenseVendorFlag = ref(true)

const onSave = async () => {
	console.log("통신시작", formSlipType)
	const body = {
		...formState.value,
		slipHeaderRequest: {
			...formState.value.entityslipHeader,
			slipType: formSlipType,
			slipEvidenceType: formSlipType,
			deductionType:
				formState.value.entityslipHeader.taxCode === "A"
					? SlipTaxType.NON_DEDUCTION
					: SlipTaxType.DEDUCTION,
		} as any,
		receiptFileId: undefined as string | number | undefined,
		slipFileIds: [] as any,
		relatedDocumentIds: [] as any,
		slipDetailRequests: formState.value.slipDetails,
	}

	if (formState.value.entityslipHeader) {
		body.slipHeaderRequest.accountingYearMonth = dayjs(
			formState.value.entityslipHeader.accountingYearMonth
		).format(monthFormat)
		// body.slipHeaderRequest.accountingDate = dayjs(
		//   formState.value.entityslipHeader.accountingDate
		// ).format(dateFormat);
		body.slipHeaderRequest.paymentDueDate = dayjs(
			formState.value.entityslipHeader.paymentDueDate
		).format(dateFormat)

		body.slipHeaderRequest.employeeId = getEmployeeId.value
		body.slipHeaderRequest.slipStatus = "COMPLETE"
		body.slipHeaderRequest.slipRequestType = "ADVANCE"

		body.slipHeaderRequest.exchangeRate = 1
		body.slipHeaderRequest.countryType = "KOR"
		body.slipHeaderRequest.osType = OsType.WEB
		body.slipHeaderRequest.exchangeRateDate = dayjs(
			formState.value.entityslipHeader.accountingDate
		).format(dateFormat)
		body.slipHeaderRequest.description = formState.value.entityslipHeader.description
		body.slipHeaderRequest.evidenceDate = dayjs(
			formState.value.entityslipHeader.accountingDate
		).format(dateFormat)
		body.slipHeaderRequest.fixedAssetFlag = false

		// TEST CASH INPUT
		body.slipHeaderRequest.cashReceiptNumber = ""
		body.slipHeaderRequest.cashReceiptRegistrationNumber = ""
		body.slipHeaderRequest.cashReceiptCompanyName = ""

		// TEST CARD INPUT (formSlipType === SlipType.CARD)
		if (formSlipType === SlipType.CARD) {
			const {
				companyCode = "",
				cardNumber = "",
				cardApprovalNumber = "",
				cardUsageNumber = "",
				cardMerchantRegistrationNumber = "",
				cardMerchantName = "",
				cardDeductionType = "DEDUCTION",
				cardBusinessTypeCode = "",
				cardBusinessTypeName = "",
				cardWorkplaceAddress = "",
				cardMerchantRepresentativeName = "",
				cardMerchantTelNumber = "",
			} = formState.value.slipCard
			body.slipHeaderRequest.cardCompanyCode = companyCode
			body.slipHeaderRequest.cardNumber = cardNumber
			body.slipHeaderRequest.cardApprovalNumber = cardApprovalNumber
			body.slipHeaderRequest.cardUsageNumber = cardUsageNumber
			body.slipHeaderRequest.cardMerchantRegistrationNumber =
				cardMerchantRegistrationNumber
			body.slipHeaderRequest.cardMerchantName = cardMerchantName
			body.slipHeaderRequest.cardDeductionType = cardDeductionType
			body.slipHeaderRequest.cardBusinessTypeCode = cardBusinessTypeCode
			body.slipHeaderRequest.cardBusinessTypeName = cardBusinessTypeName
			body.slipHeaderRequest.cardWorkplaceAddress = cardWorkplaceAddress
			body.slipHeaderRequest.cardMerchantRepresentativeName =
				cardMerchantRepresentativeName
			body.slipHeaderRequest.cardMerchantTelNumber = cardMerchantTelNumber
		}

		body.slipHeaderRequest.slipCalculationType = "NOT"
	}
	if (disabledPersonalExpenseReceiptFlag.value) {
		if (!formState.value.receiptFile || formState.value.receiptFile.length === 0) {
			message.error("영수증 파일을 첨부하세요.")
			throw new Error("영수증 파일을 첨부하세요.")
		}
		const receiptFile = formState.value.receiptFile[0]
		body.receiptFileId = receiptFile && receiptFile.uid ? receiptFile.uid : undefined

		if (disabledExpenseFile.value && formState.value.files) {
			body.slipFileIds = formState.value.files
				.filter((file: any) => file.uid !== undefined)
				.map((file: any) => ({ id: file.uid as number }))
		}
	}

	if (disabledDocumentsFile.value && formState.value.documents) {
		body.relatedDocumentIds = formState.value.documents
			.filter((file: any) => file.uid !== undefined)
			.map((file: any) => ({ id: file.uid as number }))
	}

	body.slipDetailRequests = body.slipDetails.map((x: SlipDetails, idx: number) => ({
		...x,
		seq: idx + 1,
		divisionSeq: idx + 1,
		debitCreditType: "DEBIT",
		slipLineType: "ITEM",
		companyCode: getCompanyCode.value,
		taxCode: x.taxCode === SlipTaxType.NON_DEDUCTION ? "A" : "B",
		//이제까지 안넣으거 확인
		// budgetDepartmentCode: '',
		// localAmount: x.amount,
		// localTaxAmount: x.taxAmount,
		// localTaxBaseAmount: 10000,
		// taxBaseAmount: 10000,
	}))

	//이제까지 안넣으거 확인
	// body.foreignCurrencyAmount = 0;
	// body.krwOtherAmount = 0;
	// body.otherAmount = 0;
	// body.representativeAccountCode = '';

	// body.taxInvoiceNumber = '';
	// body.termsOfPaymentCode = '';

	return await useCFetch<Response<any>>(
		`/api/v2/slip/expenses${formState.value.entityslipHeader.id ? "/" + formState.value.entityslipHeader.id : ""}`,
		{
			method: formState.value.entityslipHeader.id ? "PATCH" : "POST",
			body,
		}
	).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success(`저장하였습니다.`)
		} else {
			console.log(res)
		}
		return res
	})
}

const onSubmit = () => {
	formRef.value
		?.validate()
		.then(() => {
			// loading.value = true;
			const divisionType = formState.value.entityslipHeader.divisionSlipFlag
				? SlipDivisionType.CARD_DIVISION
				: SlipDivisionType.CARD
			if (divisionType === SlipDivisionType.CARD_DIVISION && !validateTotalAmount())
				return
			onSave()
			// .then((res: Response<any>) => {
			//   if (res.status === 0) {
			//     open.value = false;
			//   }
			// });
		})
		.catch((error: Error) => {
			console.log("error", error)
		})
}

const onRepeat = () => {
	formRef.value
		?.validate()
		.then(async () => {
			const divisionType = formState.value.entityslipHeader.divisionSlipFlag
				? SlipDivisionType.CARD_DIVISION
				: SlipDivisionType.CARD
			if (divisionType === SlipDivisionType.CARD_DIVISION) return validateTotalAmount()
			isRepeat.value = true
			await onSave()
			// .then(async (res: Response<any>) => {
			//   if (res.status === 0) {
			//     await message
			//       .success(`이어서 다음 지출을 입력합니다.`)
			//       .then(async () => {
			//         formState.value = await initFormState();
			//         formRef.value?.resetFields();
			//       });
			//   }
			// })
			// .finally(() => {
			//   isRepeat.value = false;
			// });
		})
		.catch((error: Error) => {
			console.log("error", error)
		})
}

const updateFormTotalAmount = (amount: number) => {
	if (formState.value.slipDetails && formState.value.slipDetails.length > 0) {
		const isDirectModify = formState.value.slipDetails[0].isDirectModify
		if (isDirectModify) {
			const vat = (amount || 0) * 0.1
			formState.value.slipDetails[0].totalAmount = amount - vat
			formState.value.entityslipHeader.supplyAmount = amount - vat
			formState.value.entityslipHeader.krwSupplyAmount = amount - vat

			formState.value.slipDetails[0].taxAmount = vat
			formState.value.entityslipHeader.taxAmount = vat
			formState.value.entityslipHeader.krwTaxAmount = vat
		} else {
			formState.value.slipDetails[0].totalAmount = amount
			formState.value.entityslipHeader.supplyAmount = amount
			formState.value.entityslipHeader.krwSupplyAmount = amount

			formState.value.slipDetails[0].taxAmount = 0
			formState.value.entityslipHeader.taxAmount = 0
			formState.value.entityslipHeader.krwTaxAmount = 0
		}
	}
}

const updateTotalAmount = (amount: number = 0) => {
	if (!formState.value.entityslipHeader.totalAmount) {
		formState.value.entityslipHeader.totalAmount = 0
	}
	formState.value.entityslipHeader.totalAmount = amount
	formState.value.entityslipHeader.krwTotalAmount = amount
}

const updateSupplyAmount = (amount: number = 0) => {
	if (!formState.value.entityslipHeader.supplyAmount) {
		formState.value.entityslipHeader.supplyAmount = 0
	}
	formState.value.entityslipHeader.supplyAmount = amount
	formState.value.entityslipHeader.krwSupplyAmount = amount
}

const updateTaxAmount = (amount: number = 0) => {
	if (!formState.value.entityslipHeader.taxAmount) {
		formState.value.entityslipHeader.taxAmount = 0
	}
	formState.value.entityslipHeader.taxAmount = amount
	formState.value.entityslipHeader.krwTaxAmount = amount
}

const modifyFlag = (value: any) => {
	formRef.value?.resetFields([value])
}

const updateDescription = (value: string) => {
	formState.value.entityslipHeader.description = value
}

/**
 * 전표 상세 정보 조회
 * @param id
 * @param signal
 */
const getSlipExpenses = async (id: number, signal?: AbortSignal) => {
	return await Promise.resolve(
		useCFetch<Response<Slip>>(`/api/v2/slip/expenses/${id}`, {
			signal,
		}).then(async (res: Response<Slip>) => res.data || (await initFormState()))
	)
}

/**
 * 프로젝트 전체 조회
 * @param id
 * @param signal
 */
const getDefaultProjectList = async (employeeId: number, signal?: any) => {
	return await Promise.resolve(
		useCFetch<Response<Array<CommonProject>>>("/api/v2/slips/commons/projects", {
			signal,
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				employeeId,
				used: true,
				page: 0,
				size: 10,
			},
		}).then((res: Response<Array<CommonProject>>) => res)
	)
}

const updateCurrencyType = (value: any) => {
	console.log("updateCurrencyType", value)
	if (value === "KRW") {
	} else {
	}
}

const modalCancle = async (value: any) => {
	// formState.value = new ExpenseBuilder().build();
	currentPage.value = 1
	formState.value = await initFormState()
	// resetChanges();
}

const disabledDate = (current: Dayjs) => {
	const formattedDate = current.format(monthFormat)
	return !accountPeriodsDays.value.includes(formattedDate)
}

/**
 * 부채계정 조회
 * !NOTICE 개인경비/법인카드의 경우 부채계정은 저장이 되나 보조계정은 세금계산서에서만 저장이 되므로 조회 및 저장이 불필요함(주석한 이유)
 * @param value
 */
const updateAccuredAccountCode = async (value: any) => {
	// const sub = await Promise.resolve(
	//   useCFetch<Response<Array<any>>>(`/api/v2/slip/expenses/credit/sub`, {
	//     method: 'GET',
	//     params: {
	//       companyCode: getCompanyCode.value,
	//       personalExpenseFlag:
	//         formSlipType === SlipType.PERSONAL_EXPENSE,
	//       cardFlag: formSlipType === SlipType.CARD,
	//       billInvoiceFlag:
	//         formSlipType === SlipType.E_TAX_INVOICE ||
	//         formSlipType === SlipType.TAX_INVOICE,
	//       parentId: value.parentId,
	//     },
	//   }).then((res: Response<Array<any>>) => {return res.data})
	// );
}

const updateSlipFile = (value: any) => {
	console.log(`updateSlipFile : `, value)
}

const writerUpdate = (values: WriterInfo[]): void => {
	if (!formState.value.entityslipHeader) return

	const [firstValue] = values
	if (!firstValue) return

	const { id: employeeId, companyCode, workplaceCode } = firstValue

	// 전표 헤더 업데이트
	Object.assign(formState.value.entityslipHeader, {
		writer: values.map((v) => v.id),
		employeeId,
		companyCode,
		workplaceCode,
	})

	// 분할전표가 아니라면 전표 상세 업데이트
	if (!formState.value.entityslipHeader.divisionSlipFlag) {
		formState.value.slipDetails = formState.value.slipDetails.map(
			(detail: SlipDetails) => ({
				...detail,
				employee: [employeeId],
				employeeId,
				workplaceCode,
			})
		)
	}
}

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

const addDivisionSlip = async () => {
	const ctr = new AbortController()
	const { status: projectStatus, data: projectData } = await getDefaultProjectList(
		getEmployeeId.value,
		ctr.signal
	).finally(() => ctr.abort())

	formState.value.entityslipHeader.divisionSlipFlag = true

	if (formState.value.slipDetails && formState.value.slipDetails.length > 0) {
		const employeeId = getEmployeeId.value
		const costCenterId = getCostCenterId.value
		// 초기화
		formState.value.slipDetails[0].supplyAmount = 0
		formState.value.slipDetails[0].taxAmount = 0
		formState.value.slipDetails[0].taxCode = undefined
		formState.value.slipDetails[0].accountId = undefined
		formState.value.slipDetails[0].description = undefined
		formState.value.slipDetails[0].projectId = undefined
		formState.value.slipDetails[0].workplaceId = undefined
		formState.value.slipDetails[0].workplaceCode = undefined

		formState.value.slipDetails.push({
			seq: formState.value.slipDetails.map((x: any) => x.seq).at(-1) + 1,
			taxCode: "A",
			employee: [employeeId],
			employeeId: employeeId,
			krwTotalAmount: 0,
			taxAmount: 0,
			supplyAmount: 0,
			slipLineType: "ITEM",
			debitCreditType: "DEBIT",
			slipHeaderId: formState.value.entityslipHeader.id,
			companyCode: getCompanyCode.value,
			costCenterId: costCenterId,
			projectId:
				projectStatus === 0 && projectData && projectData.length === 1
					? projectData[0].id
					: undefined,
		})
	}
}

const { data: accountPeriodsDays, refresh: accountPeriodsDayssRefresh } =
	await useAsyncData(`slip-expenses-account-periods`, async () =>
		useCFetch<Response<Array<AccountPeriod>>>("/api/v2/slips/commons/accountPeriods", {
			method: "GET",
			// lazy: true,
			params: {
				companyCode: getCompanyCode.value,
				accountPeriodStatus: AccountPeriodStatus.OPEN,
				workplaceCode: getWorkplaceCode.value,
				searchYearMonthFrom: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
				searchYearMonthTo: dayjs().add(1, "year").format("YYYY-MM-DD"),
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
const validateTotalAmount = () => {
	let returnType = true
	const taxAmount = formState.value.slipDetails
		?.map((x: any) => x.taxAmount || 0)
		?.reduce((prev, next) => {
			return prev + next
		}, 0)
	const supplyAmount = formState.value.slipDetails
		?.map((x: any) => x.supplyAmount || 0)
		?.reduce((prev, next) => {
			return prev + next
		}, 0)
	const addSupplyTax = taxAmount + supplyAmount
	if (formState.value.entityslipHeader.totalAmount !== addSupplyTax) {
		message.error("총 금액이 맞지 않습니다.")
		returnType = false
	}
	return returnType
}

const changePage = async (page: number, count: number) => {
	console.log("changePage", page, count, checkIfStateChanged())

	if (checkIfStateChanged()) {
		Modal.confirm({
			title: "변경사항이 있습니다. 저장하시겠습니까?",
			icon: createVNode(materialIcons("mso", "save")),
			okType: "primary",
			type: "info",
			okText: "확인",
			cancelText: "취소",
			centered: true,
			async onOk() {
				const divisionType = formState.value.entityslipHeader.divisionSlipFlag
					? SlipDivisionType.CARD_DIVISION
					: SlipDivisionType.CARD
				if (divisionType === SlipDivisionType.CARD_DIVISION) return validateTotalAmount()
				formRef.value
					?.validate()
					.then(async () => {
						await onSave()
						// .then(async (res: Response<any>) => {
						//   const id = currentPageDataList
						//     ? currentPageDataList
						//         ?.filter(
						//           (value: any, index: number) => index === page + count - 1
						//         )
						//         .map((value: any) => value.id)[0]
						//     : slipData.id;

						//   if (id) {
						//     await loadData(id, true);
						//     currentPage.value = page + count;
						//   } else {
						//     formState.value = await initFormState();
						//     formRef.value?.resetFields();
						//   }
						// });
					})
					.catch((error: Error) => {
						console.log("error", error)
					})
			},
			async onCancel() {
				// const id = currentPageDataList
				//   ? currentPageDataList
				//       ?.filter((value: any, index: number) => index === page - 1)
				//       .map((value: any) => value.id)[0]
				//   : slipData.id;
				// if (id) {
				//   await loadData(id, true);
				//   // currentPage.value = page;
				// } else {
				//   formState.value = await initFormState();
				//   formRef.value?.resetFields();
				// }
			},
		})
	} else {
		formRef.value
			?.validate()
			.then(async () => {
				const id = currentPageDataList
					? currentPageDataList
							?.filter((value: any, index: number) => index === page + count - 1)
							.map((value: any) => value.id)[0]
					: slipData.id

				if (id) {
					await loadData(id, true)
					currentPage.value = page + count
				}
			})
			.catch((error: Error) => {
				console.log("error", error)
			})
	}
}

const fieldsToWatch = [
	"entityslipHeader",
	"slipDetails",
	"slipCard",
	"files",
	"receiptFile",
	"documents",
] as const

const fieldNames = {
	entityslipHeader: "헤더정보",
	slipDetails: "라인정보",
	slipCard: "카드정보",
	files: "첨부파일",
	receiptFile: "영수증파일",
	documents: "관련문서",
}

const checkAllChanges = () => {
	const allFieldsUnchanged = fieldsToWatch.every((field) =>
		_isEqual(formState.value[field], initialState.value?.[field])
	)

	if (allFieldsUnchanged) {
		console.log("모든 정보가 초기 상태로 돌아왔습니다.")
		hasChanged.value = false
	}
}

fieldsToWatch.forEach((field) => {
	watch(
		() => formState.value[field],
		(newValue, oldValue) => {
			if (isLoading.value || !isWatching.value) return

			if (initialState.value?.[field]) {
				const changed = !_isEqual(newValue, initialState.value[field])
				if (changed && open.value) {
					console.log(`${fieldNames[field]}가 변경되었습니다.`)
					hasChanged.value = true
				} else if (!changed && hasChanged.value) {
					console.log(`${fieldNames[field]}가 초기 상태로 돌아왔습니다.`)
					checkAllChanges()
				}
			}
		},
		{ deep: true }
	)
})

// 상태가 변경되었는지 확인하는 함수
const checkIfStateChanged = () => {
	return hasChanged.value
}

// 변경 사항 초기화 함수
const resetChanges = () => {
	hasChanged.value = false
	initializeState()
}

/**
 * 모달 오픈 시점에서의 전표 정보 초기화
 */
watch(
	open,
	async () => {
		if (open) {
			accruedAccountInputDisabled.value = await checkAccountInputMethod()
				.then((res: any) => !res.key)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return false
				})
			accruedAccountInputMethod.value = await checkAccountInputMethod()
				.then((res: any) => res)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return null
				})

			// ((formState.value.entityslipHeader as EntityslipHeader).entityslipHeader as EntityslipHeader).paymentDueDate = await checkPaymentDate(
			//   SlipType.PERSONAL_EXPENSE
			// )
			//   .then((res: any) => {
			//     disabledPaymentDueDate.value = !res.flag;
			//     return dayjs(dayjs().month(res.month).date(res.day).format(dateFormat));
			//   })
			//   .catch((error: any) => {
			//     disabledPaymentDueDate.value = true;
			//     message.error(`${error.message}`);
			//     return undefined;
			//   });
			if (formState.value.entityslipHeader) {
				formState.value.entityslipHeader.paymentDueDate = await checkPaymentDate(
					// SlipType.PERSONAL_EXPENSE
					formSlipType
				)
					.then((res: any) => {
						disabledPaymentDueDate.value = !res.flag
						return dayjs(dayjs().month(res.month).date(res.day).format(dateFormat))
					})
					.catch((error: any) => {
						disabledPaymentDueDate.value = true
						message.error(`${error.message}`)
						return undefined
					})
			}

			disabledPersonalExpenseReceiptFlag.value = await checkPersonalExpenseReceipt()
				.then((res: any) => res)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return false
				})

			disabledPersonalExpenseVendorFlag.value = await checkPersonalExpenseVendor()
				.then((res: any) => res)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return false
				})

			disabledExpenseFile.value = await checkExpenseFile(
				// SlipType.PERSONAL_EXPENSE
				formSlipType
			)
				.then((res: any) => res)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return true
				})

			disabledDocumentsFile.value = await checkExpenseDoc(formSlipType)
				.then((res: any) => res)
				.catch((error: any) => {
					message.error(`${error.message}`)
					return true
				})
		}

		if (open && slipData?.id) {
			currentPage.value = slipData.groupedIndices // 이미 그룹화된 id 값으로 현재 페이지를 제어함.
			await loadData(slipData.id)
		} else {
			// formState.value = new ExpenseBuilder().build();
			// formRef.value?.resetFields();
			formState.value = await initFormState()
			initFormState()
		}
	},
	{ immediate: true }
)

// 비동기 데이터 로드 및 초기화 로직
const loadData = async (id: number, isPageChange: boolean = false) => {
	isLoading.value = true
	isWatching.value = false

	try {
		const controller = new AbortController()
		const expenseData = await getSlipExpenses(id, controller.signal)

		formState.value = {
			...expenseData,
			entityslipHeader: {
				...expenseData.entityslipHeader,
				writer: [expenseData.entityslipHeader.writerId as number],
				accountingYearMonth: dayjs(expenseData.entityslipHeader.accountingYearMonth),
				accountingDate: dayjs(expenseData.entityslipHeader.accountingDate),
				paymentDueDate: dayjs(expenseData.entityslipHeader.paymentDueDate),
				currencyType: expenseData.entityslipHeader.currencyTypeName,
			},
			slipDetails: expenseData.slipDetails.map((form: SlipDetails) => {
				if (expenseData.entityslipHeader.writerId) {
					if (!form.employee) {
						form.employee = [form.employeeId as number]
					}
					if (!form.employeeId) {
						form.employeeId = expenseData.entityslipHeader.writerId
					}
					if (!form.workplaceCode) {
						form.workplaceCode = expenseData.entityslipHeader.workplaceCode
					}
				}
				if (form.taxCode === "A") form.taxCode = SlipTaxType.NON_DEDUCTION
				if (form.taxCode === "B") form.taxCode = SlipTaxType.DEDUCTION

				return form
			}),
			receiptFile: expenseData.receiptFile
				? [
						{
							...expenseData.receiptFile,
							uid: expenseData.receiptFile.id,
						},
					]
				: [],
			files: expenseData.files?.map((file: any) => ({ ...file, uid: file.id })) || [],
			documents:
				expenseData.documents?.map((file: any) => ({
					...file,
					uid: file.id,
				})) || [],
		}

		initialState.value = _cloneDeep(formState.value)
		hasChanged.value = false

		const filteredSlipStateType = enumOmit(
			SlipStateType,
			"UNPROCESSED",
			"COMPLETE",
			"COMPLETE_TEMP_BOX"
		)

		isRead.value =
			Object.values(filteredSlipStateType).filter(
				(e) => e === expenseData.entityslipHeader.slipStatusName
			).length > 0
	} catch (error) {
		console.error("Error loading data:", error)
		formState.value = await initFormState()
		formRef.value?.resetFields()
	} finally {
		isLoading.value = false
		isWatching.value = true
	}
}
</script>
<template>
	<!-- :width="formState.divisionSlipFlag ? '160rem' : '80rem'" -->
	<a-modal
		:width="modalWidth"
		centered
		v-model:open="open"
		:destroy-on-close="false"
		:mask-closable="false"
		:keyboard="false"
		@cancel="modalCancle"
	>
		<template #title>
			<expense-title
				v-model:page="currentPage"
				:is-page="slipData ? true : false"
				:loading="loading"
				:title="`지출 ${slipData ? '수정' : '등록'}`"
				:current-page-data-list="currentPageDataList"
				@update:page="changePage"
			>
				<template #changed>
					<a-tag color="processing" v-if="hasChanged">
						<template #default> 변경 중 </template>
						<template #icon>
							<file-sync-outlined :spin="true"></file-sync-outlined>
						</template>
					</a-tag>
				</template>
			</expense-title>
		</template>
		<a-row :gutter="40">
			<a-col :span="formState.entityslipHeader.divisionSlipFlag ? 8 : 11">
				<!-- 영수증 이미지 업로드 및 뷰어 -->
				<receipt-file-upload
					:is-read="isRead"
					v-model:file-list="formState.receiptFile"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'RECEIPT',
						documentedNumber: formState.entityslipHeader.slipNumber,
					}"
				/>
				<!-- 첨부파일 -->
				<attachment-file-upload
					v-if="disabledExpenseFile"
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="formState.files"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						documentedNumber: formState.entityslipHeader.slipNumber,
					}"
					@update:file-list="updateSlipFile"
				>
				</attachment-file-upload>
				<!-- 관련문서 -->
				<documents-file-upload
					v-if="disabledDocumentsFile"
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="formState.documents"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						documentedNumber: formState.entityslipHeader.slipNumber,
					}"
					@update:file-list="updateSlipFile"
				>
				</documents-file-upload>
			</a-col>
			<a-col :span="formState.entityslipHeader.divisionSlipFlag ? 16 : 13">
				<a-spin :spinning="loading">
					<a-flex
						v-if="formState.entityslipHeader.divisionSlipFlag"
						justify="space-between"
						wrap="wrap"
					>
						<a-typography-title :level="5" class="ml-none mb-none"
							>공통 지출정보</a-typography-title
						>
						<a-divider type="horizontal" class="full-height mt-sm mb-md" />
					</a-flex>
					<a-form
						ref="formRef"
						name="expenseForm"
						:fields="SlipField"
						label-align="left"
						:model="formState"
						:colon="false"
						:label-col="{ span: 6 }"
						:wrapper-col="{ span: 18 }"
						:disabled="isRead"
					>
						<a-row :gutter="40" v-if="formState.entityslipHeader.divisionSlipFlag">
							<a-col class="ml-lg" :span="11" v-if="formSlipType === SlipType.CARD">
								<!-- formSlipType -->
								<a-form-item
									label="카드번호"
									has-feedback
									:name="['slipCard', 'cardNumber']"
									:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
								>
									<a-input
										disabled
										v-model:value="formState.slipCard.cardNumber"
									></a-input>
								</a-form-item>
								<a-form-item
									label="사용자"
									has-feedback
									:name="['entityslipHeader', 'writer']"
									:rules="[
										{
											type: 'array',
											required: true,
											message: '필수 입력값 입니다.',
										},
									]"
								>
									<eacc-select-table
										v-model:value="formState.entityslipHeader.writer"
										:disabled="isRead"
										key-props="id"
										label-prop="name"
										url="/api/v2/slips/commons/employees"
										:columns="[
											{ title: '회사', data: (row: any) => row.companyName },
											{ title: 'id', data: (row: any) => row.id },
											{
												title: '사업장',
												data: (row: any) => row.workplaceName,
											},
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
							</a-col>
							<a-col class="ml-lg" :span="11">
								<a-form-item
									v-if="!accruedAccountInputDisabled"
									label="부채계정"
									has-feedback
									:name="['entityslipHeader', 'accruedAccountCode']"
									:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
								>
									<eacc-select
										v-if="getCompanyCode"
										:url="`/api/v2/slip/expenses/credit`"
										:params="{
											companyCode: getCompanyCode,
											personalExpenseFlag: formSlipType === SlipType.PERSONAL_EXPENSE,
											cardFlag: formSlipType === SlipType.CARD,
											billInvoiceFlag:
												formSlipType === SlipType.E_TAX_INVOICE ||
												formSlipType === SlipType.TAX_INVOICE,
											// parentId: ''
										}"
										:on-all-field="false"
										v-model:value="formState.entityslipHeader.accruedAccountCode"
										refresh
										first
										:field-names="{ label: 'name', value: 'code' }"
										value-type="any"
										@update:any-value="(value: any) => updateAccuredAccountCode(value)"
										:disabled="isRead || accruedAccountInputDisabled"
									/>
								</a-form-item>
								<a-form-item
									label="가맹점"
									:name="['entityslipHeader', 'storeName']"
									:rules="[
										{
											required: disabledPersonalExpenseVendorFlag,
											// message: '필수 입력값 입니다.',
										},
									]"
								>
									<a-input
										v-model:value="formState.entityslipHeader.storeName"
										placeholder="가맹점을 입력하세요.(선택)"
									></a-input>
								</a-form-item>
							</a-col>
							<a-col class="ml-lg" :span="11">
								<a-form-item
									label="회계년월"
									has-feedback
									:name="['entityslipHeader', 'accountingYearMonth']"
									:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
								>
									<a-date-picker
										class="full-width"
										:disabled-date="disabledDate"
										picker="month"
										v-model:value="formState.entityslipHeader.accountingYearMonth"
										@change="(_: any, dateString: any) => console.log(dateString)"
									/>
								</a-form-item>
								<a-form-item
									label="사용일자"
									has-feedback
									:name="['entityslipHeader', 'accountingDate']"
									:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
								>
									<a-date-picker
										class="full-width"
										:disabled-date="disabledDate"
										v-model:value="formState.entityslipHeader.accountingDate"
										@change="(_: any, dateString: any) => console.log(dateString)"
									/>
								</a-form-item>
							</a-col>
							<a-col class="ml-lg" :span="11">
								<a-form-item label="지급예정일">
									<a-date-picker
										class="full-width"
										v-model:value="formState.entityslipHeader.paymentDueDate"
										:disabled="isRead || disabledPaymentDueDate"
									/>
								</a-form-item>
								<a-form-item label="총 금액" class="mb-none">
									<a-flex :gap="5">
										<a-form-item
											class="full-width"
											:name="['entityslipHeader', 'totalAmount']"
											:rules="[
												{
													required: true,
													message: '필수입력값입니다.',
												},
												{
													type: 'number',
													min: 1,
													message: '0 이상 이어야합니다.',
												},
											]"
										>
											<eacc-amount-input
												v-model:value="formState.entityslipHeader.totalAmount"
												@update:value="updateFormTotalAmount"
												:disabled="formState.entityslipHeader.divisionSlipFlag || isRead"
											/>
										</a-form-item>
										<a-form-item
											:name="['entityslipHeader', 'currencyType']"
											:rules="[{ required: false }]"
										>
											<a-select
												v-model:value="formState.entityslipHeader.currencyType"
												:options="[{ label: 'KRW', value: 'KRW' }]"
												@change="updateCurrencyType"
											/>
										</a-form-item>
									</a-flex>
								</a-form-item>
							</a-col>
						</a-row>
						<div v-else>
							<a-form-item
								v-if="formSlipType === SlipType.CARD"
								label="카드번호"
								has-feedback
								:name="['slipCard', 'cardNumber']"
								:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
							>
								<a-input disabled v-model:value="formState.slipCard.cardNumber"></a-input>
							</a-form-item>
							<a-form-item
								label="사용자"
								has-feedback
								:name="['entityslipHeader', 'writer']"
								:rules="[
									{
										type: 'array',
										required: true,
										message: '필수 입력값 입니다.',
									},
								]"
							>
								<eacc-select-table
									v-model:value="formState.entityslipHeader.writer"
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
								label="회계년월"
								has-feedback
								:name="['entityslipHeader', 'accountingYearMonth']"
								:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
							>
								<a-date-picker
									class="full-width"
									:disabled-date="disabledDate"
									picker="month"
									v-model:value="formState.entityslipHeader.accountingYearMonth"
									@change="(_: any, dateString: any) => console.log(dateString)"
								/>
							</a-form-item>
							<a-form-item
								label="사용일자"
								has-feedback
								:name="['entityslipHeader', 'accountingDate']"
								:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
							>
								<a-date-picker
									class="full-width"
									:disabled-date="disabledDate"
									v-model:value="formState.entityslipHeader.accountingDate"
									@change="(_: any, dateString: any) => console.log(dateString)"
								/>
							</a-form-item>

							<a-form-item
								v-if="!accruedAccountInputDisabled"
								label="부채계정"
								has-feedback
								:name="['entityslipHeader', 'accruedAccountCode']"
								:rules="[{ required: true, message: '필수 입력값 입니다.' }]"
							>
								<eacc-select
									v-if="getCompanyCode"
									:url="`/api/v2/slip/expenses/credit`"
									:params="{
										companyCode: getCompanyCode,
										personalExpenseFlag: formSlipType === SlipType.PERSONAL_EXPENSE,
										cardFlag: formSlipType === SlipType.CARD,
										billInvoiceFlag:
											formSlipType === SlipType.E_TAX_INVOICE ||
											formSlipType === SlipType.TAX_INVOICE,
										// parentId: ''
									}"
									:on-all-field="false"
									v-model:value="formState.entityslipHeader.accruedAccountCode"
									refresh
									first
									:field-names="{ label: 'name', value: 'code' }"
									value-type="any"
									@update:any-value="updateAccuredAccountCode"
									:disabled="isRead || accruedAccountInputDisabled"
								/>
							</a-form-item>
							<a-form-item label="지급예정일">
								<a-date-picker
									class="full-width"
									v-model:value="formState.entityslipHeader.paymentDueDate"
									:disabled="isRead || disabledPaymentDueDate"
								/>
							</a-form-item>

							<a-form-item
								label="가맹점"
								:name="['entityslipHeader', 'storeName']"
								:rules="[
									{
										required: disabledPersonalExpenseVendorFlag,
										// message: '필수 입력값 입니다.',
									},
								]"
							>
								<a-input
									v-model:value="formState.entityslipHeader.storeName"
									placeholder="가맹점을 입력하세요.(선택)"
								></a-input>
							</a-form-item>

							<a-form-item label="총 금액" class="mb-none">
								<a-flex :gap="5">
									<a-form-item
										class="full-width"
										:name="['entityslipHeader', 'totalAmount']"
										:rules="[
											{
												required: true,
												message: '필수입력값입니다.',
											},
											{
												type: 'number',
												min: 1,
												message: '0 이상 이어야합니다.',
											},
										]"
									>
										<eacc-amount-input
											v-model:value="formState.entityslipHeader.totalAmount"
											@update:value="updateFormTotalAmount"
											disabled
										/>
									</a-form-item>
									<a-form-item
										:name="['entityslipHeader', 'currencyType']"
										:rules="[{ required: false }]"
									>
										<a-select
											v-model:value="formState.entityslipHeader.currencyType"
											:options="[{ label: 'KRW', value: 'KRW' }]"
											@change="updateCurrencyType"
										/>
									</a-form-item>
								</a-flex>
							</a-form-item>
						</div>
						<expense-detail-form
							ref="expenseDetailFormRef"
							:init-state="initialState"
							:form-state="formState"
							:is-read="isRead"
							:is-loading="isLoading"
							:form-slip-type="formSlipType"
							@update:total-amount="updateTotalAmount"
							@update:supply-amount="updateSupplyAmount"
							@update:tax-amount="updateTaxAmount"
							@update:modify-flag="modifyFlag"
							@update:description="updateDescription"
						/>
					</a-form>
				</a-spin>
			</a-col>
		</a-row>
		<template #footer>
			<a-flex justify="space-between">
				<a-flex align="center" justify="flex-start">
					<a-button @click="() => addDivisionSlip()">분할 작성 추가</a-button>
				</a-flex>
				<a-flex align="center" justify="flex-end">
					<a-space :size="5">
						<a-button @click="() => (open = false)">취소</a-button>
						<a-button
							v-if="!slipData && formSlipType === SlipType.PERSONAL_EXPENSE"
							type="primary"
							ghost
							@click.prevent="onRepeat"
							:loading="isRepeat"
						>
							저장 후 추가
						</a-button>
						<a-button
							v-if="!isRead"
							type="primary"
							@click.prevent="onSubmit"
							:loading="loading"
						>
							저장
						</a-button>
					</a-space>
				</a-flex>
			</a-flex>
		</template>
	</a-modal>
</template>
