import React from "react"
import { observer } from "mobx-react"
import { action } from "mobx"

const isMissing = (value) => value === null || value === undefined || (
    typeof value === "string" && value === ""
)

const isNumber = (str) => !isNaN(str) && (str.trim().length > 0)

const DisplayValue = observer(({ editState, className, placeholderText }) =>
        <span className={isMissing(editState.value) ? "value-missing" : className}
            onClick={action((_) => {
                editState.inEdit = true
            })}
        >{isMissing(editState.value) ? placeholderText : editState.value}</span>
    )

const inputValueComponent = ({ inputType, isValid }) =>
    observer(({ editState, placeholderText }) =>
        editState.inEdit
            ? <input 
                type={inputType}
                defaultValue={editState.value}
                autoFocus={true}
                onBlur={action((event) => {
                    const newValue = event.target.value
                    if (!isValid || isValid(newValue)) {
                        editState.setValue(newValue)
                    }
                    editState.inEdit = false
                })}
                onKeyUp={action((event) => {
                    if (event.key === "Enter") {
                        const newValue = event.target.value
                        if (!isValid || isValid(newValue)) {
                            editState.setValue(newValue)
                        }
                        editState.inEdit = false
                    }
                    if (event.key === "Escape") {
                        editState.inEdit = false
                    }
                })}
            />
            : <DisplayValue
                editState={editState}
                className="value"
                placeholderText={placeholderText}
              />
    )

export const AddNewButton = observer(({btnText, fn}) =>
    <button 
        className="add-new"
        tabIndex={-1}
        onClick={fn}
    >{btnText}</button>
)

export const TextValue = inputValueComponent({ inputType: "text" })

export const NumberValue = inputValueComponent({ inputType: "number", isValid: isNumber })

export const DropDownValue = observer(({ editState, className, options, placeholderText, actionText }) =>
    editState.inEdit
        ? <select
            autoFocus={true}
            value={editState.value}
            style={{ width: Math.max(
                    ...options.map((option) => option.length),
                    actionText && actionText.length
                ) + "ch" }}
            onChange={action((event) => {
                const newValue = event.target.value
                if (newValue != actionText) {
                    editState.setValue(newValue)
                    editState.inEdit = false
                }
            })}
            onBlur={action((_) => {
                editState.inEdit = false
            })}
            onKeyUp={action((event) => {
                if (event.key === "Escape") {
                    editState.inEdit = false
                }
            })}
        >
        {actionText && <option key={-1} className="action">{actionText}</option>}
        {options.map((option, index) =>
            <option key={index}>{option}</option>
        )}
        </select>
        : <DisplayValue
                editState={editState}
                className={className}
                placeholderText={placeholderText}
          />
    )