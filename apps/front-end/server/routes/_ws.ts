import type { Peer, Message } from "crossws"

interface ClientPeer extends Peer {
	userId?: string
}

const clients: Map<string, ClientPeer> = new Map()

export default defineWebSocketHandler({
	open(peer: ClientPeer) {
		try {
			// peer.url이 전체 URL이 아닐 수 있으므로, 현재 호스트를 기반으로 URL을 구성합니다.
			// const host = peer.request?.url || 'localhost';
			// const url = new URL(peer.request?.url || '', `http://${host}`);
			const host = peer.request?.headers?.get("host") || "localhost"
			const url = new URL(peer.request?.url || "", `http://${host}`)
			const userId = url.searchParams.get("userId")
			if (userId) {
				peer.userId = userId
				clients.set(userId, peer)
				// console.log(`WebSocket connection opened for user: ${userId}`);
			} else {
				// console.log('WebSocket connection opened without userId');
			}
		} catch (error) {
			console.error("Error parsing WebSocket URL:", error)
			console.log("Peer connection info:", peer)
		}
	},

	message(peer: ClientPeer, message: Message) {
		try {
			const data = JSON.parse(message.toString())
			console.log(`Received message from user ${peer.userId || "Unknown"}:`, data)

			if (data.type === "private_message" && peer.userId) {
				const targetUserId = data.targetUserId
				const targetPeer = clients.get(targetUserId)
				if (targetPeer) {
					targetPeer.send(
						JSON.stringify({
							type: "private_message",
							content: data.content,
							senderId: peer.userId,
						})
					)
				}
			} else if (data.type === "broadcast") {
				clients.forEach((client, userId) => {
					if (client !== peer) {
						client.send(
							JSON.stringify({
								type: "broadcast",
								content: data.content,
								senderId: peer.userId || "Unknown",
							})
						)
					}
				})
			} else if (data.type === "notification") {
				const data = JSON.parse(message.toString())
				clients.forEach((client) => {
					if (client !== peer) {
						// 메시지를 보낸 클라이언트를 제외하고 전송
						client.send(JSON.stringify(data))
					}
				})
			}
		} catch (error) {
			console.error("Error processing message:", error)
		}
	},

	close(peer: ClientPeer) {
		if (peer.userId) {
			clients.delete(peer.userId)
			console.log(`WebSocket connection closed for user: ${peer.userId}`)
		} else {
			console.log("WebSocket connection closed for unknown user")
		}
	},
})
