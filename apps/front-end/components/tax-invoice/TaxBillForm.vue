<script lang="ts" setup>
const { data } = defineProps<{ data: any }>()
</script>
<template>
	<div class="tax-invoice-form">
		<table class="table">
			<thead class="table-header">
				<tr>
					<th colspan="5" rowspan="3" class="title">전자 (세금)계산서</th>
					<th colspan="2">승인번호</th>
					<td colspan="3">{{ data.approvalNumber }}</td>
				</tr>
				<tr>
					<th colspan="2">당초승인번호</th>
					<td colspan="3">{{ data.initialApprovalNumber }}</td>
				</tr>
				<tr>
					<th colspan="2">관리번호</th>
					<td colspan="3">{{ data.managementNumber }}</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th rowspan="5" class="supplier title">공급자</th>
					<th class="supplier label">사업자 등록번호</th>
					<td class="supplier value">1068183458</td>
					<th class="supplier label">종사업장번호</th>
					<td class="supplier value">1</td>
					<th rowspan="5" class="recipient title">공급받는자</th>
					<th class="recipient label">등록번호</th>
					<td class="recipient value">2</td>
					<th class="recipient label">종사업장번호</th>
					<td class="recipient value">3</td>
				</tr>
				<tr>
					<th class="supplier label">상호 (법인명)</th>
					<td class="supplier value"></td>
					<th class="supplier label">성명</th>
					<td class="supplier value"></td>
					<th class="recipient label">상호 (법인명)</th>
					<td class="recipient value"></td>
					<th class="recipient label">성명</th>
					<td class="recipient value"></td>
				</tr>
				<tr>
					<th class="supplier label">사업장 주소</th>
					<td class="supplier value" colspan="3"></td>
					<th class="recipient label">사업장 주소</th>
					<td class="recipient value" colspan="3"></td>
				</tr>
				<tr>
					<th class="supplier label">업태</th>
					<td class="supplier value"></td>
					<th class="supplier label">종목</th>
					<td class="supplier value"></td>
					<th class="recipient label">업태</th>
					<td class="recipient value"></td>
					<th class="recipient label">종목</th>
					<td class="recipient value"></td>
				</tr>
				<tr>
					<th class="supplier label">이메일</th>
					<td class="supplier value" colspan="3"></td>
					<th class="recipient label">이메일</th>
					<td class="recipient value" colspan="3"></td>
				</tr>
			</tbody>
		</table>
		<div class="table-total">
			<div class="tr">
				<div class="th">작성일자</div>
				<div class="td"></div>
				<div class="th">비고</div>
				<div class="td"></div>
			</div>
			<div class="tr">
				<div class="th">합계금액</div>
				<div class="td text-right"></div>
				<div class="th">공급가액</div>
				<div class="td text-right"></div>
				<div class="th">세액</div>
				<div class="td text-right"></div>
			</div>
		</div>

		<table class="list-table">
			<colgroup>
				<col width="5%" />
				<col width="5%" />
				<col width="*" />
				<col width="10%" />
				<col width="10%" />
				<col width="10%" />
				<col width="10%" />
				<col width="10%" />
				<col width="*" />
			</colgroup>
			<tbody>
				<tr>
					<th>월</th>
					<th>일</th>
					<th>품목</th>
					<th>규격</th>
					<th>수량</th>
					<th>단가</th>
					<th>공급가액</th>
					<th>세액</th>
					<th>비고</th>
				</tr>
				<tr>
					<td class="text-center">11</td>
					<td class="text-center">25</td>
					<td>[Apple] 2023 맥북프로 14 M3 Pro (11C CPU 14C ... 외)</td>
					<td class="text-right">0</td>
					<td class="text-right">0</td>
					<td class="text-right">0</td>
					<td class="text-right">9443855</td>
					<td class="text-right">944385</td>
					<td></td>
				</tr>
			</tbody>
		</table>
		<table class="list-table total">
			<colgroup>
				<col width="15%" />
				<col width="15%" />
				<col width="15%" />
				<col width="15%" />
				<col width="15%" />
				<col width="*" />
			</colgroup>
			<tbody>
				<tr>
					<th>합계금액</th>
					<th>현금</th>
					<th>수표</th>
					<th>어음</th>
					<th>외상미수금</th>
					<td rowspan="2" class="signature">이 금액을 (청구)함</td>
				</tr>
				<tr>
					<td class="text-right">10388240</td>
					<td class="text-right"></td>
					<td class="text-right"></td>
					<td class="text-right"></td>
					<td class="text-right"></td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
