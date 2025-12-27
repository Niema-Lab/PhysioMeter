import React, { Component } from 'react'

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
            <div className="measurement-instructions my-3">
                <p className="text-muted mb-0 text-center"><strong>Instructions: </strong>{instructions}</p>
            </div>
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
                        <div key={optionId} className="form-check mt-3">
                            <input
                                type={type}
                                className={`form-check-input ${valid === false ? 'is-invalid' : ''}`}
                                name={`measurement-${type}-${this.uuid}`}
                                id={optionId}
                                value={optionValue}
                                checked={value === optionValue}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor={optionId}>{option}</label>
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

    render() {
        const { type } = this.props

        let content = null

        if (type === "text" || type === "date") {
            content = this.renderTextOrDate()
        } else if (type === "radio" || type === "checkbox") {
            content = this.renderRadioOrCheckbox()
        } else if (type === "integer" || type === "decimal") {
            content = this.renderNumber()
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
    date: {
        type: 'date',
        defaultLabel: 'Date',
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
        instructions: "May I take your blood pressure? Please sit in this chair with your feet flat on the ground, and don't cross your legs. Before I take your blood pressure, I'd like you to rest here for 1 minute. Have you had a mastectomy or lumpectomy? [If yes, ask which arm, if no, use left arm]. I'm going to support your arm to keep it level with your shoulder while I take your blood pressure."
    },
    oxygenSaturation: {
        type: 'decimal',
        defaultLabel: 'Oxygen Saturation',
        placeholder: 'Enter oxygen saturation (%)',
        min: 0,
        max: 100,
        unit: '%',
        instructions: 'Now I will measure your blood oxygen level using this pulse oximeter. I need to put it on your warmest finger. May I touch your hand to figure out which finger is best?'
    },
    restingPulseRate: {
        type: 'integer',
        defaultLabel: 'Resting Pulse Rate',
        placeholder: 'Enter resting pulse rate (bpm)',
        min: 0,
        max: 300,
        instructions: 'Now I will measure your resting pulse rate. I need to put this heart rate monitor strap around your chest. May I touch you to do that?'
    }
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
export const Date = createMeasurement('date')
export const Sex = createMeasurement('sex')
export const BloodPressure = createMeasurement('bloodPressure')
export const OxygenSaturation = createMeasurement('oxygenSaturation')
export const RestingPulseRate = createMeasurement('restingPulseRate')

export default Measurement
