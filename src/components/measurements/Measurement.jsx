import React, { Component } from 'react'
import Markdown from 'react-markdown'
import Stopwatch from './Stopwatch'
import BloodPressureText from './instructions/BloodPressure.md?raw'
import OxygenSaturationText from './instructions/OxygenSaturation.md?raw'
import FiveMeterUsualWalkingSpeedText from './instructions/FiveMeterUsualWalkingSpeed.md?raw'
import FiveMeterFastWalkingSpeedText from './instructions/FiveMeterFastWalkingSpeed.md?raw'

export class Measurement extends Component {
    constructor(props) {
        super(props)
        this.uuid = crypto.randomUUID()
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

    renderInstructions = () => {
        const { instructions } = this.props

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

    renderTextOrDate = () => {
        const { type, value, onChange, valid, placeholder, min, max } = this.props

        return (
            <div className="d-flex align-items-center">
                <input
                    name={`measurement-${type}`}
                    type={(type === 'date' && value) ? 'date' : 'text'}
                    className={`measurement-input form-control ${valid === false ? 'is-invalid' : ''}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onFocus={(e) => type === 'date' && (e.target.type = 'date')}
                    onTouchStart={(e) => type === 'date' && (e.target.type = 'date')}
                    onBlur={(e) => type === 'date' && !e.target.value && (e.target.type = 'text')}
                    min={min}
                    max={max}
                />
            </div>
        )
    }

    renderRadioOrCheckbox = () => {
        const { type, value, onChange, valid, options = [] } = this.props

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
                                checked={value === optionValue}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            <label className="form-check-label cursor-p" htmlFor={optionId}>{option}</label>
                        </div>
                    )
                })}
            </div>
        )
    }

    renderNumber = () => {
        const { type, value, onChange, valid, placeholder, min, max, unit } = this.props

        const step = type === 'decimal' ? 'any' : '1'
        const inputMode = type === 'decimal' ? 'decimal' : 'numeric'

        return (
            <div className="d-flex align-items-center">
                <div className={unit ? 'input-group' : ''}>
                    <input
                        name={`measurement-${type}`}
                        type="number"
                        step={step}
                        inputMode={inputMode}
                        className={`measurement-input form-control ${valid === false ? 'is-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                    />
                    {unit && <span className="input-group-text">{unit}</span>}
                </div>
            </div>
        )
    }

    renderStopwatch = () => {
        const { value, onChange, valid, placeholder, computedFields } = this.props
        return (
            <Stopwatch
                value={value}
                onChange={onChange}
                valid={valid}
                placeholder={placeholder}
                computedFields={computedFields}
            />
        )
    }

    render() {
        const { type } = this.props

        let content = null

        if (type === "text" || type === "date") {
            content = this.renderTextOrDate()
        } else if (type === "radio" || type === "checkbox") {
            content = this.renderRadioOrCheckbox()
        } else if (type === "integer" || type === "decimal") {
            content = this.renderNumber()
        } else if (type === "stopwatch") {
            content = this.renderStopwatch()
        }

        if (!content) return null

        return (
            <div className="measurement px-3 py-3">
                {this.renderLabelAndDelete()}
                {content}
                {this.renderInstructions()}
            </div>
        )
    }
}

const MEASUREMENT_CONFIGS = {
    name: {
        type: 'text',
        defaultLabel: 'Name',
        placeholder: 'Enter name'
    },
    dob: {
        type: 'date',
        defaultLabel: 'Date of Birth',
        placeholder: 'mm/dd/yyyy'
    },
    sex: {
        type: 'radio',
        defaultLabel: 'Sex',
        options: ['Male', 'Female']
    },
    bloodPressure: {
        type: 'text',
        defaultLabel: 'Blood Pressure',
        placeholder: 'Enter blood pressure (e.g., 120/80 systolic/diastolic mmHg)',
        instructions: BloodPressureText,
    },
    oxygenSaturation: {
        type: 'decimal',
        defaultLabel: 'Oxygen Saturation',
        placeholder: 'Enter oxygen saturation (%)',
        min: 0,
        max: 100,
        unit: '%',
        instructions: OxygenSaturationText,
    },
    restingPulseRate: {
        type: 'integer',
        defaultLabel: 'Resting Pulse Rate',
        placeholder: 'Enter resting pulse rate (bpm)',
        min: 0,
        max: 300,
    },
    fiveMeterUsualWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Usual Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterUsualWalkingSpeedText,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        }
    },
    fiveMeterFastWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Fast Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterFastWalkingSpeedText,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        }
    },
}

const createMeasurement = (configKey) => {
    const config = MEASUREMENT_CONFIGS[configKey]
    return class extends Component {
        render() {
            return <Measurement {...config} {...this.props} />
        }
    }
}

export const Name = createMeasurement('name')
export const DoB = createMeasurement('dob')
export const Sex = createMeasurement('sex')
export const BloodPressure = createMeasurement('bloodPressure')
export const OxygenSaturation = createMeasurement('oxygenSaturation')
export const RestingPulseRate = createMeasurement('restingPulseRate')
export const FiveMeterUsualWalkingSpeed = createMeasurement('fiveMeterUsualWalkingSpeed')
export const FiveMeterFastWalkingSpeed = createMeasurement('fiveMeterFastWalkingSpeed')
export default Measurement
