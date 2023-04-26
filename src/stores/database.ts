export class Database<T> {
  private db: IDBDatabase | undefined

  constructor(public db_name: string, public store_name: string) {
    if (!('indexedDB' in window))
      throw new Error('browser does not support IndexedDB')
  }

  private async init_store(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.db_name)
      request.onupgradeneeded = () =>
        request.result.createObjectStore(this.store_name, {
          autoIncrement: true,
        })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  private tx(mode: IDBTransactionMode) {
    if (!this.db) throw new Error('database not connected')
    return this.db
      .transaction(this.store_name, mode)
      .objectStore(this.store_name)
  }

  public async connect() {
    if (this.db) return
    this.db = await this.init_store()
  }
  public put(value: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const request = this.tx('readwrite').put(value, key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
  public get(key: IDBValidKey): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = this.tx('readonly').get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
  public delete(key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.tx('readwrite').delete(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
  public async list(query?: IDBValidKey, count = 10): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = this.tx('readonly').getAll(query, count)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}
