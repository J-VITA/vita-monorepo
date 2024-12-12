<script lang="ts" setup>
import GroupCodeTable from "@/components/settings/codes/GroupCodeTable.vue"
import type { Response } from "~/types"
import type { RequestGroup, GroupCode, SubGroupCode } from "@/types/settings/codes"

definePageMeta({
	name: "코드관리",
})

const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getRole } = storeToRefs(authStore)

const params = ref<RequestGroup>({
	companyCode: getCompanyCode.value,
	companyId: getCompanyId.value,
	used: true,
	page: 1,
	size: 10,
})
// const searchParams = ref();
type Key = string | number

const setPagination = (pagination: any) => {
	params.value.page = pagination.current
	params.value.size = pagination.pageSize
}

const { data, status, refresh, execute } = await useAsyncData(
	"group-code-list",
	() =>
		useCFetch<Response<Array<GroupCode>>>("/api/v2/settings/codes/groupCodes", {
			method: "GET",
			params: {
				companyCode: params.value.companyCode,
				used: true,
				page: params.value.page && params.value.page > 1 ? params.value.page - 1 : 0,
				size: params.value.size,
			},
		}).then((res: Response<Array<GroupCode>>) => res),
	{ watch: [params.value] }
)

/**
 * 헤더코드 행 삭제
 * @param id
 */
const codeDeleteRow = (id: Key): void => {
	//
	useCFetch<Response<any>>(`/api/v2/settings/codes/groupCodes/${id}`, {
		method: "DELETE",
		body: {
			id,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) refresh()
	})
}

/**
 * 헤더코드 행 수정
 * @param data
 */
const codeEditRow = (data: GroupCode): void => {
	const body = Object.assign({}, data, {
		companyCode: params.value.companyCode,
	})

	useCFetch<Response<any>>(`/api/v2/settings/codes/groupCodes/${data.id}`, {
		method: "PATCH",
		body,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
		} else {
			message.error(res.message)
		}
	})
}

/**
 * 그룹코드 추가 API Request
 * @param data
 */
const addGroupCode = (data: GroupCode): void => {
	const body = Object.assign({}, data, {
		used: true,
		companyCode: params.value.companyCode,
	})

	useCFetch<Response<any>>(`/api/v2/settings/codes/groupCodes`, {
		method: "POST",
		body,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
		} else {
			message.error(res.message)
		}
	})
}

onActivated(() => {
	execute()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				그룹코드를 만들고 하위에 상세코드를 만들어 관리할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-flex :gap="10" v-if="getRole === 'ROOT'">
				<a-space :size="10">
					<eacc-select
						:style="{ width: '24rem' }"
						label="회사"
						:first="params.companyCode ? false : true"
						:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
						:on-all-field="false"
						v-model:value="params.companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						value-type="any"
						:refresh="true"
						@update:any-value="
							(value: any) => {
								params.companyCode = value.code
								params.companyId = value.id
							}
						"
						:disabled="getRole !== 'ROOT'"
					>
					</eacc-select>
				</a-space>
				<eacc-button
					componentIs="search"
					type="primary"
					:modal-open="false"
					:data="params"
					@click="(value) => refresh()"
				>
				</eacc-button>
			</a-flex>
			<a-divider v-if="getRole === 'ROOT'" class="my-md" />
			<group-code-table
				v-if="data && params.companyCode"
				:fetch-data="data"
				:params="params"
				:company-code="params.companyCode"
				:pending="status === 'pending' ? true : false"
				@code-edit-row="codeEditRow"
				@code-delete-row="codeDeleteRow"
				@add-group-code="addGroupCode"
				@pagination="setPagination"
			></group-code-table>
		</template>
	</page-layout>
</template>
