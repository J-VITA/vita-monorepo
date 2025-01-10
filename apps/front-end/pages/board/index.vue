<script setup lang="ts">
import { type Response, pagination, generateSortParams, pageSizeOptions } from "@/types"
import { type BoardList, useBoardListColumns, useBoardListSearch } from "@/types/board"

definePageMeta({
	name: "게시판",
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = useBoardListSearch(getCompanyCode.value)
const columns = useBoardListColumns()

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(`board-list`, () =>
	useCFetch<Response<BoardList>>(`/api/v2/boards`, {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
			...searchParams.value,
		},
	}).then((res: any) => {
		const data = res.data.sort((a: any, b: any) => {
			if (a.isNotice && !b.isNotice) return -1
			if (!a.isNotice && b.isNotice) return 1
			return 0 // 타입이 같으면 순서 변경 없음
		})

		return { ...res, data: data }
	})
)

const onSearch = () => {
	refresh()
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: pagination.current - 1,
		size: pagination.pageSize,
		sort: sortParams,
	})
}

const onSelectionchange = (size: number) => {
	updateSearchParams({
		pageNumber: 0,
		size,
	})
}

const onWrite = async () => {
	await navigateTo("/board/write")
}
const onDetail = async (id: string) => {
	await navigateTo(`/board/detail/${id}`)
}
onActivated(() => {
	refresh()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				게시글을 작성하여 조직에 정보를 공유합니다. 게시판 관리자는 공지사항을 작성할 수
				있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row class="mb-sm">
				<a-col flex="1">
					<a-flex :gap="5">
						<a-space>
							<label>제목</label>
							<a-input v-model:value="searchParams.title" />
						</a-space>
						<a-space>
							<label>작성자</label>
							<a-input v-model:value="searchParams.write" />
						</a-space>

						<eacc-button
							component-is="search"
							size="middle"
							:modal-open="false"
							:data="searchParams"
							@click="onSearch"
						/>
					</a-flex>
				</a-col>
				<a-col>
					<a-space :size="5">
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'edit')"
							@click="onWrite"
						>
							글쓰기
						</a-button>
						<a-select
							v-model:value="searchParams.size"
							:options="pageSizeOptions"
							value-field="key"
							text-field="label"
							@change="(page: any) => onSelectionchange(page)"
						/>
					</a-space>
				</a-col>
			</a-row>
			<a-table
				size="small"
				:columns="columns"
				:data-source="dataSource?.data"
				:loading="status === 'pending'"
				:pagination="{
					...pagination,
					current: (searchParams.pageNumber || 0) + 1,
					pageSize: searchParams.size,
					total: dataSource?.totalElements,
				}"
				:row-key="(record: any) => record.id"
				:show-sorter-tooltip="false"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-space :size="5" align="center">
							<span style="width: 4rem; display: inline-flex">
								<a-tag color="red" v-if="record.isNotice" class="mr-none">공지</a-tag>
							</span>
							<a
								class="board-list-title"
								:class="{ notice: record.isNotice }"
								@click="onDetail(record.id)"
							>
								{{ text }}
								<span v-if="record.commentCount > 0" class="comment">
									({{ record.commentCount }})
								</span>
							</a>
						</a-space>
					</template>
				</template>
			</a-table>
		</template>
	</page-layout>
</template>
