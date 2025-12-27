import React, { Component } from 'react'

export class MultipleMeasurements extends Component {
    constructor(props) {
        super(props)

        this.state = {
            measurements: [],
        }
    }

    addMeasurement = () => {
        this.setState(prevState => ({
            measurements: [
                ...prevState.measurements,
                { label: `${this.props.name} ${prevState.measurements.length + 1}`, value: '' }
            ]
        }));
    }

    updateMeasurement = (index, value) => {
        const measurements = [...this.state.measurements];
        measurements[index].value = value;
        this.setState({ measurements }, () => {
            this.props.onChange(this.state.measurements);
        });
    }

    updateMeasurementLabel = (index, label) => {
        const measurements = [...this.state.measurements];
        measurements[index].label = label;
        this.setState({ measurements }, () => {
            this.props.onChange(this.state.measurements);
        });
    }

    deleteMeasurement = (index) => {
        const measurements = [...this.state.measurements];
        measurements.splice(index, 1);
        this.setState({ measurements }, () => {
            this.props.onChange(this.state.measurements);
        });
    }

    render() {
        const MeasurementComponent = this.props.component;
        return (
            <div className="multiple-measurements">
                <h2 className={`measurement-header text-center w-100 ${this.props.oneMax && this.state.measurements.length === 1 ? 'pe-none' : 'cursor-p'}`} onClick={this.addMeasurement}>{this.props.name} <i className={`bi bi-plus-circle-fill ${this.props.oneMax && this.state.measurements.length === 1 ? 'text-secondary' : 'text-primary'} ms-3`}></i></h2>
                {this.state.measurements.map((measurement, index) => (
                    <MeasurementComponent
                        key={index}
                        value={measurement.value || ''}
                        label={measurement.label || ''}
                        onChange={(value) => this.updateMeasurement(index, value)}
                        onLabelChange={(label) => this.updateMeasurementLabel(index, label)}
                        onDelete={() => this.deleteMeasurement(index)}
                    />
                ))}
            </div>
        )
    }
}

export default MultipleMeasurements