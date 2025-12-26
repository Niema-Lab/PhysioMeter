import React, { Component, Fragment } from 'react'

export class Measurement extends Component {
    constructor(props) {
        super(props)
    }

    renderMeasurement() {
        const { type, label, value, onChange, onLabelChange, valid, placeholder, min, max } = this.props

        if (type === "text" || type === "date") {
            return (
                <div className="measurement px-3">
                    {(label || onLabelChange) && (
                        <label className="measurement-label d-block mb-2">
                            {onLabelChange ? (
                                <div className="d-flex align-items-center mb-2">
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
                        </label>
                    )}
                    <div className="d-flex align-items-center">
                        <input
                            name={`measurement-${type}`}
                            type={type}
                            className={`measurement-input form-control ${valid === false ? 'is-invalid' : ''}`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            min={min}
                            max={max}
                        />
                        {this.props.onDelete &&
                            <div className="measurement-delete ms-2 d-flex align-items-center">
                                <i className="bi bi-trash-fill text-danger cursor-p" onClick={this.props.onDelete}></i>
                            </div>
                        }
                    </div>
                </div>
            )
        }

        return null
    }

    render() {
        return this.renderMeasurement()
    }
}

export default Measurement
