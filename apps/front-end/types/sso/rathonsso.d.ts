interface Rathonsso {
	init(): void
	requestAuthentication(): boolean
	logout(): void
}

declare global {
	const rathonsso: Rathonsso
}

export {}
