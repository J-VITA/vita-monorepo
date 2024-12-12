export type Tax = {
	id: number | undefined
	companyCode: string
	code: string
	name: string
	rate: number
	slipEvidenceTypeCode: string
	slipEvidenceTypeLabel: string
	used: boolean
	orderSeq: number
	attribute1: string | undefined
	attribute2: string | undefined
}
