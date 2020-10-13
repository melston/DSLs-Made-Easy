import React from "react"
import { render } from "react-dom"
import { observable, runInAction, action } from "mobx"
import { observer } from "mobx-react"

require('./styling.css')

import { rental } from "../../ch03/listingX.js"
const apiUrl = "http://localhost:8080/ast"
const astContainer = observable({ 
    ast: null 
})

fetch(apiUrl)
    .then((response) => response.json())
    .then((json) => {
        runInAction(() => {
            astContainer.ast = json
            // console.log(astContainer.ast)
            // console.log(json)
        })
    })

import { isAstObject } from "./ast"
import { TextValue, NumberValue, DropDownValue, AddNewButton } from "./value-components"
import { Selectable } from "./selectable"

const anAsNeeded = (nextword) => "a" + (typeof nextword === "string" && (nextword.match(/^[aeiou]/)) ? "n" : "")
const placeholderAstObject = "<placeholder for an AST object>"

const Projection = observer(({ value, deleteValue, ancestors }) => {
    { console.log(`Projection: value = ${value}`) }
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
                return <Selectable 
                            className="inline" 
                            astObject={value} 
                            deleteAstObject={deleteValue} >
                    <span className="keyword">the </span>
                    <DropDownValue
                        editState={observable({
                            value: settings["attribute"] && settings["attribute"].ref.settings["name"],
                            inEdit: false,
                            setValue: (newVal) => {
                                settings["attribute"] = {
                                    ref: attributes.find((attr) => attr.settings["name"] === newVal)
                                }
                            }
                        })}
                        className="data-reference"
                        options={attributes.map((attr) =>attr.settings["name"]).filter((attr) => attr !== ancestors[0].settings["name"])}
                        placeholderText="<attribute>"
                        actionText="(choose an attribute to reference)"
                    />
                </Selectable>
            case "Data Attribute": 
                return <Selectable 
                            className="attribute" 
                            astObject={value} 
                            deleteAstObject={deleteValue} >
                    <span className="keyword">the</span>&nbsp;
                    <TextValue editState={editStateFor("name")} />&nbsp;
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
                                <Projection 
                                    value={settings["initial value"]} 
                                    ancestors={[value, ...ancestors]} 
                                    deleteValue = {() => {
                                        delete settings["initial value"]
                                    }}
                                />
                            }
                        </div>
                        : 
                        <AddNewButton 
                            btnText="+ initial value"
                            actionFunction={() => {
                                                settings["initial value"] = placeholderAstObject 
                                            }}
                        />
                    }
                </Selectable>
            case "Number Literal": 
                //const attributeType = ancestors && ancestors.concept === "Data Attribute" && ancestors.settings["type"]
                const attribute = ancestors.find((ancestor) => ancestor.concept === "Data Attribute")
                const attributeType = attribute.settings["type"]
                return <Selectable className="inline" astObject={value} deleteAstObject={deleteValue} >
                        {attributeType === "amount" && <span className="keyword">$</span>}
                        <NumberValue editState={editStateFor("value")} placeholderText="<number>" />
                        {attributeType === "percentage" && <span className="keyword">%</span>}
                        {attributeType === "period in days" && <span className="keyword">&nbsp;days</span>}
                </Selectable>
            case "Record Type": 
                return <Selectable 
                            className="record-type" 
                            astObject={value} >
                    <div>
                        <span className="keyword">Record Type</span>&nbsp;
                        <TextValue editState={editStateFor("name")} placeholderText="<name>" />
                    </div>
                    <div className="attributes">
                        <div><span className="keyword">attributes:</span></div>
                        {settings["attributes"].map((attribute, index) => 
                            <Projection 
                                value = {attribute} key={index} 
                                ancestors = {[value, ...ancestors]} 
                                deleteValue = {() =>{
                                    settings["attributes"].splice(index, 1)
                                }}
                            />
                        )}
                        <AddNewButton 
                            btnText="+ attribute"
                            actionFunction={() => {
                                                settings["attributes"].push({
                                                    concept: "Data Attribute",
                                                    settings: {}
                                                })
                                            }}
                        />
                    </div>
                </Selectable>
            default: return <div className="inline">
                <em>{"No projection defined for concept: " + value.concept}</em>
            </div>
        }
    }
    return <em>{"No projection defined for value: " + value}</em>
})

const App = observer(() => {
    // { astContainer.ast ? console.log (astContainer.ast) : console.log("spinner") }
    astContainer.ast 
        ? <Projection value={astContainer.ast} ancestors={[]} />
        : <div className="spinner"></div>
})

//console.log(rental)

render(
    // <Projection value={observable(rental)} ancestors={[]} />,
    <App />,
    document.getElementById("root")
)

