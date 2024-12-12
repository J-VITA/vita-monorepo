export default function (str: string) {
	if (!str) {
		throw new Error("Invalid string passed to camelCase function")
	}
	return stringToUpperFirst(stringToCamelCase(str))
}
