//Find what the user think
const think = {
    events: [],

    log(type, details = {}) {
        const event = {
            type,
            details,
            timestamp: new Date().toISOString()
        };
        this.events.push(event);
        console.log("[think]", event);
    },

    getEvents() {
        return [...this.events];
    },

    clear() {
        this.events = [];
    }
};

window.think = think;