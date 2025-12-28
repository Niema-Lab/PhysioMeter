let dbPromise = null

const openDB = () => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('PTAppDB', 1)

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'uid' })
                }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
            request.onblocked = () =>
                console.warn('Database blocked by another tab')
        })
    }

    return dbPromise
}

const getCurrentUser = async () => {
    const db = await openDB()

    const tx = db.transaction('users', 'readonly')
    const store = tx.objectStore('users')

    const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
    const uid = urlParams.get('uid')

    if (!uid) {
        return null
    }

    return new Promise((resolve, reject) => {
        const getUser = store.get(uid)
        getUser.onsuccess = () => resolve(getUser.result)
        getUser.onerror = (e) => reject(e.target.error)
    })
}

export { openDB, getCurrentUser }