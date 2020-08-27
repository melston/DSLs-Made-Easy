import React from "react"
import { observable, action } from "mobx"
import { observer } from "mobx-react"

const selection = observable({ selected: undefined })

const deselect = () => {
    selection.selected = undefined
}

document.addEventListener("mousedown", (event) => {
    if (!event.target.classList.contains("selectable")) {
        deselect()
    }
})

export const Selectable = observer(({ className, astObject, deleteAstObject, children }) =>
    <div
        className={className + " selectable" + (selection.selected === astObject ? " selected" : "")}
        onClick={action((evt) => {
            evt.stopPropagation()
            selection.selected = astObject
        })}
        onKeyDown={action((event) => {
            if (event.key === "Backspace" || event.key === "Delete") {
                event.stopPropagation()
                event.preventDefault()
                if (typeof deleteAstObject === "function") {
                    deleteAstObject()
                }
            }
        })}
        tabIndex={0}
    >
    {children}
    </div>
)
