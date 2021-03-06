const { readFile, writeFileSync } = require("fs")
const { join } = require("path")
const { deserialize } = require("../ast")

const options = { encoding: "utf8" }

const astPath = join(__dirname, "../backend/contents.json")
const indexJsxPath = join(__dirname, "../runtime/index.jsx")

const indexJsx = (recordType) => {
    const { camelCase, withFirstUpper } = require("./template-utils")
    const name = camelCase(recordType.settings["name"])
    const Name = withFirstUpper(name)

    const defaultInitExpressionForType = (type) => {
        switch (type) {
            case "period in days": return `{ from: Date.now(), to: Date.now() }`
            default: return `// [GENERATION PROBLEM] type "${type}" isn't handled`
        }
    }

    const initAssignment = (attribute) => {
        const initExpressionForExpression = () => {
            switch (initialValue.concept) {
                case "Attribute Reference": {
                    const targetAttribute = initialValue.settings["attribute"].ref
                    return `${name}.${camelCase(targetAttribute.settings["name"])}`
                }
                case "Number Literal": return `"${initialValue.settings["value"]}"`
                default: return `// [GENERATION PROBLEM] initial value of concept "${initialValue.concept}" isn't handled`
            }
        }
        const { settings } = attribute
        const attributeName = camelCase(settings["name"])
        const initialValue = settings["initial value"]
        return `${name}.${attributeName} = ${
            initialValue
                ? initExpressionForExpression()
                : defaultInitExpressionForType(settings["type"])
        }`
    }

    return `import React from "react"

import { render } from "react-dom"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { FormField, Input } from "./components"

require("./styling.css")

const new${Name} = () => {
    const ${name} = {}
${recordType.settings["attributes"].map((attribute) => `    ${initAssignment(attribute)}`).join("\n")}
    return ${name}
}

const RentalForm = observer(({ rental }) => <div className="form">
    <form>
        <FormField label="Rental period">
            <Input type="date" object={rental.rentalPeriod} fieldName="from" />
            <Input type="date" object={rental.rentalPeriod} fieldName="to" />
        </FormField>
        <FormField label="Rental price before discount">
            $ <Input type="number" object={rental} fieldName="rentalPriceBeforeDiscount" />
        </FormField>
        <FormField label="Discount">
            <Input type="number" object={rental} fieldName="discount" /> %
        </FormField>
        <FormField label="Rental price after discount">
            $ <Input type="number" object={rental} fieldName="rentalPriceAfterDiscount" />
        </FormField>
    </form>
</div>)

const rental = observable(newRental())

const App = observer(() => <div>
    <RentalForm rental={rental} />
</div>)


render(
    <App />,
    document.getElementById("root")
)
`
}

readFile(astPath, options, (_, data) => {
    const serializedAst = JSON.parse(data)
    const deserializedAst = deserialize(serializedAst)
    writeFileSync(indexJsxPath, indexJsx(deserializedAst), options)
})