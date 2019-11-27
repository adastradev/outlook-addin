const uuidv4 = require('uuid/v4');

export function asyncGet(value, status = 'success') {
    return (func) => { return func({ status, value }); };
}

export function asyncSet(value, status = 'success') {    
    return jest.fn((v, x) => x({ status, value }));
}

export default class MockOffice {
    public values: any = {};
    public uuid: any;

    constructor(overrides = {}, settings = {}, uuid = uuidv4()) {
        this.uuid = uuid;
        let getSettings = (_x) => true;
        if (Object.keys(settings).length > 0) {
            getSettings = (key) => {
                console.log(`returning ${settings[key]} for ${key} setting`);
                return settings[key];
            }
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
        const defaults = {
            context: {
                roamingSettings: {
                    get: jest.fn(getSettings),
                    set: jest.fn((_x, _y) => true),
                    saveAsync: jest.fn((x) => x())
                },
                mailbox: {
                    item: {
                        start: {
                            getAsync: asyncGet(startDate)
                        },
                        end: {
                            getAsync: asyncGet(endDate)
                        },
                        location: {
                            setAsync: asyncSet(null)
                        },
                        organizer: {
                            getAsync: asyncGet({ emailAddress: `${uuid}@aais.com`, displayName: `Person ${uuid}` })
                        },
                        subject: {
                            getAsync: (func) => {
                                return func({
                                    status: 'success',
                                    value: `Meeting ${uuid}`
                                });
                            }
                        },
                    }
                }
            },
            AsyncResultStatus: {
                Failed: 'FAILED'
            }
        };

        this.values = Object.assign(overrides, defaults);
    }

    mock(namespace) {
        (namespace as any).Office = this.values;
    }
}