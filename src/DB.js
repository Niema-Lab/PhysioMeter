import { PT_TEST_CONFIG } from './components/physical-therapy-tests/PhysicalTherapyTestFactory'

// NOTE: every time the DB schema is updated, this must be incremented. NOTE THAT THIS WILL DELETE ALL EXISTING USERS IN THE DB.
const CURRENT_DB_VERSION = 4

let dbPromise = null

const openDB = () => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('PTAppDB', CURRENT_DB_VERSION)

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (db.objectStoreNames.contains('users')) {
                    db.deleteObjectStore('users');
                }

                db.createObjectStore('users', { keyPath: 'uuid' });
            };

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
        return null;
    }

    return await getUser(uuid)
}

const getCurrentSessionUUID = () => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
    return urlParams.get('sessionUUID')
}

// Schema for patient (stored in 'users' object store):
// {
//     uuid: string,
//     name: string,              // required
//     dateOfBirth: string|null,  // optional, ISO date string (YYYY-MM-DD)
//     sex: string|null,          // optional, 'Male' or 'Female'
//     createdAt: string,         // ISO 8601 timestamp
//     sessions: [
//         {
//             uuid: string,
//             sessionTimestamp: string,  // ISO 8601, user-selectable (defaults to creation time)
//             createdAt: string,         // ISO 8601
//             testKey: string,           // e.g. 'annualMobilityAssessment' or 'measurements'
//             testName: string,          // e.g. 'Annual Mobility Assessment'
//             lastModified: string,      // ISO 8601
//             lastSaved: string|null,    // ISO 8601, null until manually saved
//             data: {
//                 formState: object,
//                 validations: object,
//                 disabledValues: object
//             }
//         }
//     ]
// }

const createDBUser = async (name, uuid, { dateOfBirth, sex } = {}) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    const newUser = {
        uuid: uuid,
        name: name,
        dateOfBirth: dateOfBirth || null,
        sex: sex || null,
        createdAt: new Date().toISOString(),
        sessions: [],
    }

    store.put(newUser)

    return new Promise((resolve, reject) => {
        tx.oncomplete = async () => resolve(await getUser(uuid))
        tx.onerror = (e) => reject(e.target.error)
    })
}

const updatePatient = async (uuid, updates) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    return new Promise((resolve, reject) => {
        const getRequest = store.get(uuid)
        getRequest.onsuccess = () => {
            const patient = getRequest.result
            if (!patient) {
                reject(new Error(`Patient with uuid ${uuid} not found`))
                return
            }

            if (updates.name !== undefined) patient.name = updates.name
            if (updates.dateOfBirth !== undefined) patient.dateOfBirth = updates.dateOfBirth
            if (updates.sex !== undefined) patient.sex = updates.sex

            const putRequest = store.put(patient)
            putRequest.onsuccess = () => resolve(patient)
            putRequest.onerror = (e) => reject(e.target.error)
        }
        getRequest.onerror = (e) => reject(e.target.error)
    })
}

const createSession = async (patientUUID, testKey, sessionTimestamp) => {
    const config = PT_TEST_CONFIG.find(c => c.testKey === testKey)
    if (!config) {
        throw new Error(`Invalid test key: ${testKey}`)
    }

    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    const sessionUUID = crypto.randomUUID()
    const now = new Date().toISOString()

    return new Promise((resolve, reject) => {
        const getRequest = store.get(patientUUID)
        getRequest.onsuccess = () => {
            const patient = getRequest.result
            if (!patient) {
                reject(new Error(`Patient with uuid ${patientUUID} not found`))
                return
            }

            patient.sessions.push({
                uuid: sessionUUID,
                sessionTimestamp: sessionTimestamp || now,
                createdAt: now,
                testKey: config.testKey,
                testName: config.defaultTestName,
                lastModified: now,
                lastSaved: null,
                data: {
                    formState: {},
                    validations: {},
                    disabledValues: {}
                }
            })

            const putRequest = store.put(patient)
            putRequest.onsuccess = () => resolve(sessionUUID)
            putRequest.onerror = (e) => reject(e.target.error)
        }
        getRequest.onerror = (e) => reject(e.target.error)
    })
}

const deleteSession = async (patientUUID, sessionUUID) => {
    const db = await openDB()

    const tx = db.transaction('users', 'readwrite')
    const store = tx.objectStore('users')

    return new Promise((resolve, reject) => {
        const getRequest = store.get(patientUUID)
        getRequest.onsuccess = () => {
            const patient = getRequest.result
            if (!patient) {
                reject(new Error(`Patient with uuid ${patientUUID} not found`))
                return
            }

            patient.sessions = patient.sessions.filter(s => s.uuid !== sessionUUID)

            const putRequest = store.put(patient)
            putRequest.onsuccess = () => resolve(patient)
            putRequest.onerror = (e) => reject(e.target.error)
        }
        getRequest.onerror = (e) => reject(e.target.error)
    })
}

export { openDB, createDBUser, getCurrentUser, getCurrentSessionUUID, updatePatient, createSession, deleteSession }
