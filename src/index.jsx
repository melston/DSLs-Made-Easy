import React from "react"
import { render } from "react-dom"
import { observable, action } from "mobx"
import { observer } from "mobx-react"

require('./styling.css')

import { rental } from "../ch03/listingX.js"
import { isAstObject } from "./ast"
import { TextValue, NumberValue, DropDownValue, AddNewButton } from "./value-components"

const anAsNeeded = (nextword) => "a" + (typeof nextword === "string" && (nextword.match(/^[aeiou]/)) ? "n" : "")
const placeholderAstObject = "<placeholder for an AST object>"
const selection = observable({ selected: undefined })

rental.settings["attributes"].push({
    concept: "Data Attribute",
    settings: {}
})

const Projection = observer(({ value, ancestors }) => {
    if (isAstObject(value)) {
        const { settings } = value
        const editStateFor = (propertyName) =>  observable({
            value: settings[propertyName],
            inEdit: false,
            setValue: (newValue) => { settings[propertyName] = newValue }
        })

        switch (value.concept) {
            case "Attribute Reference": 
                const recordType = ancestors.find((anc) => anc.concept === "Record Type")
                const attributes = recordType.settings["attributes"]
                return <div className="inline">
                    <span className="keyword">the </span>
                    <DropDownValue
                        actionText="(choose an attribute to reference)"
                        editState={observable({
                            value: settings["attribute"] && settings["attribute"].ref.settings["name"],
                            inEdit: false,
                            setValue: (newVal) => {
                                settings["attribute"] = {
                                    ref: attributes.find((attr) => attr.settings["name"] === newVal)
                                }
                            }
                        })}
                        placeholderText="<attribute>"
                        className="data-reference"
                        options={attributes.map((attr) =>attr.settings["name"]).filter((attr) => attr !== ancestors[0].settings["name"])}
                    />
                </div>
            case "Data Attribute": 
                return <div 
                        className={"attribute" + (selection.selected === value ? " selected" : "")}
                        onClick={action((_) => {
                            selection.selected = value})} >
                    <span className="keyword">the</span>&nbsp;
                    <TextValue editState={editStateFor("name")} placeholderText="<name>" />&nbsp;
                    <span className="keyword">is {anAsNeeded(settings["type"])}</span>&nbsp;
                    <DropDownValue
                        className="value quoted-type"
                        editState={editStateFor("type")}
                        options={[ "amount", "percentage", "period in days" ]}
                        placeholderText="<type>"
                    />
                    {settings["initial value"]
                        ? <div className="inline">
                            <span className="keyword">initially</span>&nbsp;
                            {settings["initial value"] === placeholderAstObject
                            ? <DropDownValue
                                editState={observable({
                                    inEdit: true,
                                    setValue: (newValue) => {
                                        settings["initial value"] = {
                                            concept: newValue,
                                            settings: {}
                                        }
                                    }
                                })}
                                options={[
                                    "Attribute Reference",
                                    "Number Literal"
                                ]}
                                placeholderText="<initial value>"
                                actionText="{choose concept for initial value}"
                              />
                            :
                            <Projection value={settings["initial value"]} ancestors={[value, ...ancestors]} />
                            }
                        </div>
                        : 
                        <AddNewButton 
                            btnText="+ initial value"
                            fn={action((_) => 
                                    settings["initial value"] = placeholderAstObject
                                )}
                        />
                    }
                </div>
            case "Number Literal": 
                const attributeType = ancestors && ancestors.concept === "Data Attribute" && ancestors.settings["type"]
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
                            <Projection value={attribute} key={index} ancestors={[value, ...ancestors]} />
                        )}
                        <AddNewButton 
                            btnText="+ attribute"
                            fn={action((_) => 
                                    settings["attributes"].push({
                                        concept: "Data Attribute",
                                        settings: {}
                                }))}
                        />
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
    <Projection value={observable(rental)} ancestors={[]} />,
    document.getElementById("root")
)

