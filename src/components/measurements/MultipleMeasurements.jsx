import React, { Component } from 'react'

export class MultipleMeasurements extends Component {
    addMeasurement = () => {
        const measurements = [...this.props.measurements];
        measurements.push({ label: `${this.props.name} ${measurements.length + 1}`, value: '' });
        this.props.onChange(measurements);
        if (this.props.validations) {
            const validations = [...this.props.validations];
            validations.push(true);
            this.props.onValidationChange(validations);
        }
        if (this.props.disabledValues) {
            const disabledValues = [...this.props.disabledValues];
            disabledValues.push([true]); // the first value is always the vitals + physical activity case
            this.props.onDisabledChange(disabledValues);
        }
    }

    updateMeasurement = (index, value) => {
        const measurements = [...this.props.measurements]
        measurements[index].value = value
        this.props.onChange(measurements)
    }

    updateValidation = (index, isValid) => {
        if (this.props.validations) {
            const validations = [...this.props.validations]
            validations[index] = isValid
            this.props.onValidationChange(validations)
        }
    }

    updatedDisabledValues = (index, disabledValue) => {
        if (this.props.disabledValues) {
            const disabledValues = [...this.props.disabledValues]
            disabledValues[index] = disabledValue
            this.props.onDisabledChange(disabledValues)
        }
    }

    updateMeasurementLabel = (index, label) => {
        const measurements = [...this.props.measurements]
        measurements[index].label = label
        this.props.onChange(measurements)
    }

    deleteMeasurement = (index) => {
        const measurements = [...this.props.measurements]
        measurements.splice(index, 1)
        this.props.onChange(measurements)
        if (this.props.validations) {
            const validations = [...this.props.validations]
            validations.splice(index, 1)
            this.props.onValidationChange(validations)
        }
        if (this.props.disabledValues) {
            const disabledValues = [...this.props.disabledValues]
            disabledValues.splice(index, 1)
            this.props.onDisabledChange(disabledValues)
        }
    }

    render() {
        const MeasurementComponent = this.props.component
        return (
            <div className="multiple-measurements">
                <h2 className={`measurement-header text-center w-100 ${this.props.oneMax && this.props.measurements.length === 1 ? 'pe-none' : 'cursor-p'}`} onClick={this.addMeasurement}>{this.props.name} <i className={`bi bi-plus-circle-fill ${this.props.oneMax && this.props.measurements.length === 1 ? 'text-secondary' : 'text-primary'} ms-3`}></i></h2>
                {this.props.measurements.map((measurement, index) => (
                    <MeasurementComponent
                        key={index}
                        value={measurement.value || ''}
                        label={measurement.label || ''}
                        valid={this.props.validations ? this.props.validations[index] : true}
                        checkValidVitals={this.props.checkValidVitals}
                        disabledValues={this.props.disabledValues ? this.props.disabledValues[index] : false}
                        formState={this.props.formState}
                        onChange={(value) => this.updateMeasurement(index, value)}
                        onValidationChange={(isValid) => this.updateValidation(index, isValid)}
                        onDisabledChange={(disabledValue) => this.updatedDisabledValues(index, disabledValue)}
                        onLabelChange={(label) => this.updateMeasurementLabel(index, label)}
                        onDelete={() => this.deleteMeasurement(index)}
                    />
                ))}
            </div>
        )
    }
}

export default MultipleMeasurements