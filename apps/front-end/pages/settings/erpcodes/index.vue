<script setup>
definePageMeta({
	name: "ERP코드매핑관리",
})
</script>

<template>
	<page-layout>
		<template #header>
			<span class="">
				<span class="material-symbols-outlined">help</span> ERP에 일반/매입전표 엑셀
				파일을 업로드하기 위해 ERP에서 관리하는 세금 코드, 비용항목 코드, 거래처 코드를
				등록합니다.
			</span>
		</template>
		<template #content>
			<div class="card-body">
				<section class="section">
					<!--필터-->
					<form class="row gy-2 gx-3 align-items-center">
						<div class="col-auto">ERP 종류</div>
						<div class="col-2">
							<select class="form-select form-select-sm">
								<option selected="">선택하세요</option>
								<option value="1">더존 스마트A</option>
								<option value="2">더존 아이큐브</option>
								<option value="3">이카운드</option>
								<option value="3">SAP</option>
							</select>
						</div>
						<div class="col-auto">
							<button class="btn btn-sm btn-secondary" type="button">
								<span class="material-icons">search</span> 조회
							</button>
						</div>
						<div class="col-auto">
							<button class="btn btn-sm btn-outline-primary" type="button">
								<span class="material-icons">download</span>
								ERP 업로드 전표양식 다운로드
							</button>
						</div>
					</form>
					<hr />
					<!--//필터-->

					<div class="row">
						<!--erp상세정보-->
						<div class="col-md-12">
							<ul class="nav nav-underline" id="borderedTab" role="tablist">
								<li class="nav-item" role="presentation">
									<button
										class="nav-link active"
										id="tax-tab"
										data-bs-toggle="tab"
										data-bs-target="#tab-1"
										type="button"
										role="tab"
										aria-selected="true"
									>
										세금코드 매핑
									</button>
								</li>
								<li class="nav-item" role="presentation">
									<button
										class="nav-link"
										id="item-tab"
										data-bs-toggle="tab"
										data-bs-target="#tab-2"
										type="button"
										role="tab"
										aria-selected="false"
									>
										비용항목 매핑
									</button>
								</li>
								<li class="nav-item" role="presentation">
									<button
										class="nav-link"
										id="card-tab"
										data-bs-toggle="tab"
										data-bs-target="#tab-3"
										type="button"
										role="tab"
										aria-selected="false"
									>
										법인카드 매핑
									</button>
								</li>
								<li class="nav-item" role="presentation">
									<button
										class="nav-link"
										id="user-tab"
										data-bs-toggle="tab"
										data-bs-target="#tab-4"
										type="button"
										role="tab"
										aria-selected="false"
									>
										사용자 매핑
									</button>
								</li>
							</ul>
							<!--탭컨텐츠시작-->
							<div class="tab-content pt-2 mx-3" id="borderedTabContent">
								<!--탭1-->
								<div
									class="tab-pane fade show active"
									id="tab-1"
									role="tabpanel"
									aria-labelledby="home-tab"
								>
									<div class="row mt-3">
										<div
											class="d-sm-flex justify-content-between align-items-center mb-2"
										>
											<h6>코드매핑정보</h6>
											<div class="fr">
												<button
													type="button"
													class="btn btn-sm btn-outline-secondary ms-2"
												>
													<span class="material-symbols-outlined"> download </span
													>엑셀다운로드
												</button>
												<button type="button" class="btn btn-sm btn-primary ms-2">
													<span class="material-symbols-outlined"> save </span>
													저장
												</button>
											</div>
										</div>

										<div class="div-contents-border">
											<table class="table table-data"></table>
										</div>
									</div>
								</div>
								<!--//탭1-->
								<!--탭2-->
								<div
									class="tab-pane fade"
									id="tab-2"
									role="tabpanel"
									aria-labelledby="tab-2"
								>
									<div class="row mt-3">
										<div
											class="d-sm-flex justify-content-between align-items-center mb-2"
										>
											<h6>비용항목 매핑</h6>
											<div class="fr">
												<button
													type="button"
													class="btn btn-sm btn-outline-secondary ms-2"
												>
													<span class="material-symbols-outlined"> download </span
													>엑셀다운로드
												</button>
												<button type="button" class="btn btn-sm btn-primary ms-2">
													<span class="material-symbols-outlined"> save </span>저장
												</button>
											</div>
										</div>
										<div class="div-contents-border">
											<table class="table table-data"></table>
										</div>
									</div>
								</div>
								<!--//탭2-->
								<!--탭3-->
								<div
									class="tab-pane fade"
									id="tab-3"
									role="tabpanel"
									aria-labelledby="tab-3"
								>
									<div class="row mt-3">
										<div
											class="d-sm-flex justify-content-between align-items-center mb-2"
										>
											<h6>법인카드 매핑</h6>
											<div class="fr">
												<button
													type="button"
													class="btn btn-sm btn-outline-secondary ms-2"
												>
													<span class="material-symbols-outlined"> download </span
													>엑셀다운로드
												</button>
												<button type="button" class="btn btn-sm btn-primary ms-2">
													<span class="material-symbols-outlined"> save </span>저장
												</button>
											</div>
										</div>
										<div class="div-contents-border">
											<table class="table table-data"></table>
										</div>
									</div>
								</div>
								<!--//탭3-->

								<!--//탭종료-->
							</div>
						</div>
					</div>
				</section>
			</div>
		</template>
	</page-layout>
</template>
