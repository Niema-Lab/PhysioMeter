import React, { Component } from 'react'
import Markdown from 'react-markdown'
import Stopwatch from './custom/Stopwatch'
import CountdownTimer from './custom/CountdownTimer'

export class Measurement extends Component {
    constructor(props) {
        super(props)
        this.uuid = crypto.randomUUID()

        const numFields = this.props.fields?.length || this.props.numTrials || 0
        this.state = {
            multipleValues: numFields > 0 ? Array(numFields).fill(null) : [],
            disabledValues: props.disabledCases ? Array(props.disabledCases.length).fill(false) : [],
            disabled: false,
        }
    }

    renderLabel = () => {
        const label = this.props.label ?? this.props.defaultLabel
        const { onLabelChange } = this.props

        if (!label && !onLabelChange) return null

        return (
            <div className="measurement-label d-block">
                {onLabelChange ? (
                    <div className="d-flex align-items-center">
                        <label className="me-2">Label:</label>
                        <input
                            type="text"
                            className="measurement-label-input form-control"
                            value={label}
                            onChange={(e) => onLabelChange(e.target.value)}
                            placeholder="Enter label"
                        />
                    </div>
                ) : (
                    <h4>{label}</h4>
                )}
            </div>
        )
    }

    renderInstructions = (instructions) => {
        if (!instructions) return null

        return (
            <>
                <div className="measurement-instructions my-3 p-3">
                    <h5>Instructions:</h5>
                    <Markdown>{instructions}</Markdown>
                </div>
            </>
        )
    }

    renderDeleteButton = () => {
        if (!this.props.onDelete) return null

        return (
            <div className="measurement-delete ms-4 d-flex align-items-center cursor-p">
                <i className="bi bi-trash-fill text-danger cursor-p" onClick={this.props.onDelete}></i>
            </div>
        )
    }

    renderLabelAndDelete = () => {
        return (
            <div className="d-flex align-items-center mb-3">
                {this.renderLabel()}
                {this.renderDeleteButton()}
            </div>
        )
    }

    renderDisabledToggles = (disabledCases) => {
        if (!disabledCases || disabledCases.length === 0) {
            return null
        }

        return (
            <div className="d-flex mb-3">
                {disabledCases.map((caseText, index) => (
                    <div key={index} className="d-flex form-check">
                        <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id={`disabled-case-${index}-${this.uuid}`}
                            checked={this.state.disabledValues?.[index] || false}
                            onChange={() => this.updateDisabledValues(index)}
                        />
                        <label className="form-check-label" htmlFor={`disabled-case-${index}-${this.uuid}`}>
                            {caseText}
                        </label>
                    </div>
                ))}
            </div>
        )
    }

    updateDisabledValues = (index) => {
        const newValues = [...(this.state.disabledValues || [])]
        newValues[index] = !newValues[index]
        const disabled = newValues.some(val => val)
        this.setState({ disabledValues: newValues, disabled })
        this.props.onChange(disabled ? null : this.props.value)
    }

    renderTextOrDate = (props) => {
        const { type, value, onChange, valid, placeholder, min, max } = props
        const disabled = this.state.disabled || props.disabled

        return (
            <div className="d-flex align-items-center justify-content-center">
                <input
                    name={`measurement-${type}`}
                    type={(type === 'date' && value) ? 'date' : 'text'}
                    className={`measurement-input form-control ${valid === false ? 'is-invalid' : ''}`}
                    value={disabled ? '' : value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onFocus={(e) => type === 'date' && (e.target.type = 'date')}
                    onTouchStart={(e) => type === 'date' && (e.target.type = 'date')}
                    onBlur={(e) => type === 'date' && !e.target.value && (e.target.type = 'text')}
                    min={min}
                    max={max}
                    disabled={disabled}
                />
            </div>
        )
    }

    renderRadioOrCheckbox = (props) => {
        const { type, value, onChange, valid, options = [] } = props
        const disabled = this.state.disabled || props.disabled

        return (
            <div>
                {options.map((option) => {
                    const optionValue = option.toLowerCase()
                    const optionId = `${type}-${optionValue}-${this.uuid}`
                    return (
                        <div key={optionId} className="form-check mt-3 cursor-p">
                            <input
                                type={type}
                                className={`form-check-input  cursor-p ${valid === false ? 'is-invalid' : ''}`}
                                name={`measurement-${type}-${this.uuid}`}
                                id={optionId}
                                value={optionValue}
                                checked={disabled ? false : (type === 'radio' ? value === optionValue : Array.isArray(value) && value.includes(optionValue))}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={disabled}
                            />
                            <label className="form-check-label cursor-p" htmlFor={optionId}>{option}</label>
                        </div>
                    )
                })}
            </div>
        )
    }

    renderNumber = (props) => {
        const { type, value, onChange, valid, placeholder, min, max, unit, counterButtons } = props
        const disabled = this.state.disabled || props.disabled

        const step = type === 'decimal' ? 'any' : '1'
        const inputMode = type === 'decimal' ? 'decimal' : 'numeric'
        const currentValue = value ? parseFloat(value) : 0

        const decrement = () => {
            const newValue = currentValue - 1
            if (min !== undefined && newValue < min) return
            onChange(newValue)
        }

        const increment = () => {
            const newValue = currentValue + 1
            if (max !== undefined && newValue > max) return
            onChange(newValue)
        }

        const canDecrement = !disabled && (min === undefined || currentValue > min)
        const canIncrement = !disabled && (max === undefined || currentValue < max)

        return (
            <div className="d-flex align-items-center justify-content-center">
                <div className={unit || (type === 'integer' && counterButtons) ? 'input-group' : ''}>
                    {type === 'integer' && counterButtons && (
                        <button
                            type="button"
                            className={`btn btn-${disabled ? 'secondary' : 'primary'}`}
                            onClick={decrement}
                            disabled={!canDecrement}
                        >
                            <i className="bi bi-dash"></i>
                        </button>
                    )}
                    <input
                        name={`measurement-${type}`}
                        type="number"
                        step={step}
                        inputMode={inputMode}
                        className={`measurement-input form-control ${valid === false ? 'is-invalid' : ''}`}
                        value={disabled ? '' : value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        disabled={disabled}
                    />
                    {type === 'integer' && counterButtons && (
                        <button
                            type="button"
                            className={`btn btn-${disabled ? 'secondary' : 'primary'}`}
                            onClick={increment}
                            disabled={!canIncrement}
                        >
                            <i className="bi bi-plus"></i>
                        </button>
                    )}
                    {unit && <span className="input-group-text">{unit}</span>}
                </div>
            </div>
        )
    }

    renderStopwatch = (props) => {
        return (
            <Stopwatch
                {...props}
                disabled={this.state.disabled || props.disabled}
            />
        )
    }

    renderCountdownTimer = (props) => {
        return (
            <CountdownTimer
                {...props}
                disabled={this.state.disabled || props.disabled}
            />
        )
    }

    renderContent = (props) => {
        const renderFunc = this.renderFunction(props)
        if (!renderFunc) return null

        if (props.numTrials && props.numTrials > 1) {
            return this.renderMultipleTrials(props, renderFunc)
        } else {
            return renderFunc(props)
        }
    }

    renderFunction = (props) => {
        const { type } = props

        if (type === "text" || type === "date") {
            return this.renderTextOrDate
        } else if (type === "radio" || type === "checkbox") {
            return this.renderRadioOrCheckbox
        } else if (type === "integer" || type === "decimal") {
            return this.renderNumber
        } else if (type === "stopwatch") {
            return this.renderStopwatch
        } else if (type === "countdown") {
            return this.renderCountdownTimer
        } else if (type === "fields") {
            return this.renderMultipleFields
        }

        console.error(`Measurement: Unknown measurement type "${type}"`)
        return null
    }

    renderMultipleFields = (props) => {
        const { fields } = props

        if (!fields || fields.length === 0) {
            return null
        }

        return (
            <div>
                {fields.map((field, i) => {
                    const newProps = {
                        ...field,
                        value: this.state.multipleValues[i],
                        onChange: (value) => this.multipleValuesOnChange(i, value),
                    }
                    return <div key={`field-${i}`} className="d-flex flex-column align-items-center mb-4">
                        {this.renderContent(newProps)}
                        {this.renderInstructions(field.instructions)}
                    </div>
                })}
            </div>
        )
    }

    renderMultipleTrials = (props, renderFunction) => {
        let { numTrials = 1, trialNames } = props

        if (numTrials <= 1) {
            return null
        }

        if (trialNames && trialNames.length !== numTrials) {
            console.error(`Measurement: trialNames length (${trialNames.length}) does not match numTrials (${numTrials}). Ignoring trialNames.`)
            trialNames = null
        }

        const trials = []
        for (let i = 0; i < numTrials; i++) {
            const newProps = {
                ...props,
                value: this.state.multipleValues[i],
                onChange: (value) => this.multipleValuesOnChange(i, value),
            }
            trials.push(
                <div key={`trial-${i}`} className="mb-4">
                    <h5>{trialNames ? trialNames[i] : `Trial ${i + 1}`}</h5>
                    {renderFunction(newProps)}
                </div>
            )
        }

        return <div>{trials}</div>
    }

    multipleValuesOnChange = (index, value) => {
        const { onChange } = this.props

        const updatedValues = [...(this.state.multipleValues)]
        updatedValues[index] = value
        this.setState({ multipleValues: updatedValues })
        if (onChange) {
            onChange(updatedValues)
        }
    }

    render() {
        const content = this.renderContent(this.props)

        if (!content) return null

        return (
            <div className="measurement px-3 py-3">
                {this.renderLabelAndDelete()}
                {this.renderDisabledToggles(this.props.disabledCases)}
                {content}
                {this.renderInstructions(this.props.instructions)}
            </div>
        )
    }
}

export default Measurement
