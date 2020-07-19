'use strict';

const date = new Date()
const localTimeZone = 'Asia/Singapore'

exports.getDate = () => {
    const options = { 
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: localTimeZone
    }

    return date.toLocaleDateString("en-US", options)
}

exports.getDay = () => {
    const options = { 
        weekday: "long",
        timeZone: localTimeZone
    }
    return date.toLocaleDateString("en-US", options)
}