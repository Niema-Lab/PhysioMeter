import { PT_TEST_CONFIG } from './components/physical-therapy-tests/PhysicalTherapyTestFactory'

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

const getCurrentTestUUID = () => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
    return urlParams.get('testUUID')
}

const addEmptyTest = (user, config_key) => {
    const config = PT_TEST_CONFIG.find(c => c.testKey === config_key)
    if (!config) {
        throw new Error(`Invalid test config key: ${config_key}`)
    }
    const testKey = config.testKey;

    if (!user.tests[testKey]) {
        user.tests[testKey] = [];
    }

    const testUUID = crypto.randomUUID()
    user.tests[testKey].push({
        uuid: testUUID,
        name: config.defaultTestName,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        lastSaved: null,
        data: {
            formState: {},
            validations: {},
            disabledValues: {}
        }
    })
}


const createDBUser = async (name, uuid) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    const newUser = {
        name: name,
        uuid: uuid,
        createdAt: new Date().toISOString(),
        // schema for tests:
        // tests: {
        //     // testKey can be: 'measurements' or a preset test (e.g., 'annualMobilityScreening')
        //     'testKey': {
        //         [
        //             uuid: 'test-uuid',
        //             name: 'Test Name',
        //             createdAt: '2024-01-01T00:00:00.000Z',
        //             lastModified: '2024-01-01T00:00:00.000Z',
        //             lastSaved: '2024-01-01T00:00:00.000Z', // a valid manual save
        //             data: {
        //                 formState,
        //                 validations,
        //                 disabledValues
        //             }
        //         ]
        //     }
        // }
        tests: {},
    }

    // TODO: if in the future, we have the ability for multiple tests, we might want to move this initialization logic out of the createDBUser function and into the specific test creation flow instead
    addEmptyTest(newUser, 'measurements')
    addEmptyTest(newUser, 'annualMobilityScreening')

    store.put(newUser)

    return new Promise((resolve, reject) => {
        tx.oncomplete = async () => resolve(await getUser(uuid))
        tx.onerror = (e) => reject(e.target.error)
    })
}

export { openDB, createDBUser, getCurrentUser, getGuestUser, getCurrentTestUUID }