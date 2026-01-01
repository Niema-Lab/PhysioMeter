let dbPromise = null

const openDB = () => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('PTAppDB', 1)

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'uuid' })
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

const getUser = async (uuid) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readonly')
    const store = tx.objectStore('users')

    return new Promise((resolve, reject) => {
        const getUser = store.get(uuid)
        getUser.onsuccess = () => resolve(getUser.result)
        getUser.onerror = (e) => reject(e.target.error)
    })
}

const getCurrentUser = async () => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
    const uuid = urlParams.get('uuid')

    if (!uuid) {
        return await getGuestUser()
    }

    return await getUser(uuid)
}

const getGuestUser = async () => {
    const guestUser = await getUser('guest');

    if (!guestUser) {
        return await createDBUser('Guest', 'guest')
    }

    return guestUser
}

const createDBUser = async (name, uuid) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    const newUser = {
        name: name,
        uuid: uuid,
        createdAt: new Date().toISOString(),
        lastTestModified: null,
        lastTestSaved: null, // a valid manual save
        lastMeasurementsModified: null,
        lastMeasurementsSaved: null, // a valid manual save
        measurements: {},
    }

    store.add(newUser)

    return new Promise((resolve, reject) => {
        tx.oncomplete = async () => resolve(await getUser(uuid))
        tx.onerror = (e) => reject(e.target.error)
    })
}

export { openDB, createDBUser, getCurrentUser }