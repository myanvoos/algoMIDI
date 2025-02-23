import { type IDBPDatabase, openDB } from "idb"
import type { DBConfig } from "./types"

export class IndexedDBService {
	private config: DBConfig

	constructor(config: DBConfig) {
		this.config = config
	}

	async initDB(): Promise<IDBPDatabase> {
		try {
			const db = await openDB(this.config.name, this.config.version, {
				upgrade: (db, oldVersion, newVersion, transaction) => {
					console.log("Upgrading db:", oldVersion, newVersion, transaction)
					if (!db.objectStoreNames.contains(this.config.storeName)) {
						db.createObjectStore(this.config.storeName, {
							keyPath: "id",
							autoIncrement: true,
						})
					}
				},
			})
			return db
		} catch (error) {
			console.error("Error opening database:", error)
			throw error
		}
	}
}
