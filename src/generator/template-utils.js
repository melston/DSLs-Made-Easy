
const camelCase = (str) => str
    .toLowerCase()
    .replace(/ ([a-z])/g, (_, ch) => ch.toUpperCase())
    .replace(" ", "")

const withFirstUpper = (str) => str.charAt(0).toUpperCase() + str.substring(1)

module.exports = {
    "camelCase": camelCase,
    "withFirstUpper": withFirstUpper
}

