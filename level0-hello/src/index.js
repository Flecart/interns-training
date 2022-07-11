function say(name) {
    if (name !== undefined) {
        return `Hello ${name}!`;
    } else {
        return "Hello world!";
    }
}

module.exports = {
    say: say
};