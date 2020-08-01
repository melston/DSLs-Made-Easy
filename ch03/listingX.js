const attribute1 = {
	concept: "Data Attribute",
	settings: {
		"name": "rental period",
		"type": "period in days"
	}
}

const initialValueAttribute2 = {
	concept: "Number Literal",
	settings: {
		"value": "0.0"
	}
}

const attribute2 = {
	concept: "Data Attribute",
	settings: {
		"name": "rental price before discount",
		"type": "amount",
		"initial value": initialValueAttribute2
	}
}

const initialValueAttribute3 = {
	concept: "Number Literal",
	settings: {
		"value": "0"
	}
}

const attribute3 = {
	concept: "Data Attribute",
	settings: {
		"name": "discount",
		"type": "percentage",
		"initial value": initialValueAttribute3
	}
}

const initialValueAttribute4 = {
	concept: "Attribute Reference",
	settings: {
		"attribute": {
			ref: attribute2
		}
	}
}

const attribute4 = {
	concept: "Data Attribute",
	settings: {
		"name": "rental price after discount",
		"type": "amount",
		"initial value": initialValueAttribute4
	}
}


const rental = {
	concept: "Record Type",
	settings: {
		"name": "Rental",
		"attributes": [ attribute1,
                        attribute2,
                        attribute3,
                        attribute4
					  ]
	}
}

//require("./print-pretty")(rental)

module.exports = { rental }
