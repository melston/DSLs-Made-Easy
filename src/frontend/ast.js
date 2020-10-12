
const isObject = (value) => (!!value) && (typeof value == "object") && !Array.isArray(value)
const isAstObject = (value) => isObject(value) && ("concept" in value) && ("settings" in value)
const isAstReference = (value) => isObject(value) && ("ref" in value) && isAstObject(value.ref)

const sum = (numbers) => numbers.reduce((currentSum, currentNumber) => currentSum + currentNumber, 0)

function numberOfLeaves(value) {
	if (isAstObject(value)) {
		const sub = sum(Object.values(value.settings).map(numberOfLeaves))
		return sub === 0 ? 1 : sub
	}
	if (isAstReference(value)) {
		return 0;
	}
	if (Array.isArray(value)) {
		return sum(value.map(numberOfLeaves))
	}
	return 0
}

module.exports = { "isAstObject": isAstObject, "isAstReference": isAstReference, 
				   "isObject": isObject, "numberOfLeaves": numberOfLeaves
				 }
