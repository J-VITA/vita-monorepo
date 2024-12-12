import Tags from "./Tags/index.vue"
import Link from "./Link/index.vue"
import IconLink from "./IconLink/index.vue"
import Badge from "./Badge/index.vue"
import ColorTag from "./ColorTag/index.vue"
import StyleText from "./StyleText/index.vue"
import ColorTagValue from "./ColorTagValue/index.vue"

export { Tags, Link, IconLink, Badge, ColorTag, StyleText, ColorTagValue }

/**
 * 브랜드 타입을 생성하는 유틸리티 타입 (이렇게 사용하는 것을 추천)
 */
type AgPramsBrand<K, T> = T & { __brand: K }

/**
 * 파라미터 타입을 생성하는 유틸리티 타입
 * @used createAgParams<T, B extends string>
 */
export type createAgParams<T, B extends string> = {
	params: AgPramsBrand<B, T>
}
