import React from "react"
import { render } from "react-dom"
import { observable } from "mobx"
import { observer } from "mobx-react"

require('./styling.css')

import { rental } from "../ch03/listingX.js"
import { isAstObject } from "./ast"
import { TextValue, NumberValue, DropDownValue } from "./value-components"

const anAsNeeded = (nextword) => "a" + (nextword.match(/^[aeiou]/) ? "n" : "")

const Projection = observer(({ value, parent }) => {
    if (isAstObject(value)) {
        const { settings } = value
        const editStateFor = (propertyName) =>  observable({
            value: settings[propertyName],
            inEdit: false,
            setValue: (newValue) => { settings[propertyName] = newValue }
        })
        switch (value.concept) {
            case "Attribute Reference": return <div className="inline">
                <span className="keyword">the </span>
                <span className="data-reference">{settings["attribute"].ref.settings["name"]}</span>
            </div>
            case "Data Attribute": return <div className="attribute">
                    <span className="keyword">the</span>&nbsp;
                    <TextValue editState={editStateFor("name")} />&nbsp;
                    <span className="keyword">is {anAsNeeded(settings["type"])}</span>&nbsp;
                    <DropDownValue
                        className="value quoted-type"
                        editState={editStateFor("type")}
                        options={[ "amount", "percentage", "period in days" ]}
                    />
                    {settings["initial value"] &&
                        <div className="inline">
                            <span className="keyword">initially</span>&nbsp;
                            <Projection value={settings["initial value"]} parent={value} />
                        </div>
                        }
                </div>
            case "Number Literal": 
                const attributeType = parent && parent.concept === "Data Attribute" && parent.settings["type"]
                return <div className="inline">
                        {attributeType === "amount" && <span className="keyword">$</span>}
                        <NumberValue editState={editStateFor("value")}/>
                        {attributeType === "percentage" && <span className="keyword">%</span>}
                        {attributeType === "period in days" && <span className="keyword"> days</span>}
                </div>
            case "Record Type": return <div>
                    <div>
                        <span className="keyword">Record Type</span>&nbsp;
                        <TextValue editState={editStateFor("name")} />
                    </div>
                    <div className="attributes">
                        <div><span className="keyword">attributes:</span></div>
                        {settings["attributes"].map((attribute, index) => 
                            <Projection value={attribute} key={index} parent={value} />
                        )}
                    </div>
                </div>
            default: return <div className="inline">
                <em>{"No projection defined for concept: " + value.concept}</em>
            </div>
        }
    }
    return <em>{"No projection defined for value: " + value}</em>
})

render(
    <Projection value={observable(rental)} />,
    document.getElementById("root")
)

