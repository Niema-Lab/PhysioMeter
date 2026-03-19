import { Component } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getCurrentUser, updatePatient } from '../DB'
import Title from './form/Title'
import Text from './form/Text'
import Submit from './form/Submit'
import LoadingPage from './LoadingPage'

const SEX_OPTIONS = ['Male', 'Female']

export class PatientEdit extends Component {
    constructor(props) {
        super(props)

        this.state = {
            patient: null,
            loaded: false,
            name: '',
            dateOfBirth: '',
            sex: '',
            nameValid: true,
            submitText: '',
            submitTextType: '',
            redirectTo: null,
        }
    }

    componentDidMount = async () => {
        const patient = await getCurrentUser()
        if (patient) {
            this.setState({
                patient,
                loaded: true,
                name: patient.name || '',
                dateOfBirth: patient.dateOfBirth || '',
                sex: patient.sex || '',
            })
        } else {
            this.setState({ loaded: true })
        }
    }

    validate = () => {
        let valid = true
        if (!this.state.name || this.state.name.trim() === '') {
            this.setState({ nameValid: false })
            valid = false
        } else {
            this.setState({ nameValid: true })
        }
        return valid
    }

    handleSave = async () => {
        if (!this.validate()) return

        try {
            await updatePatient(this.state.patient.uuid, {
                name: this.state.name.trim(),
                dateOfBirth: this.state.dateOfBirth || null,
                sex: this.state.sex || null,
            })
            this.setState({ redirectTo: `/patient?uuid=${this.state.patient.uuid}` })
        } catch (e) {
            this.setState({
                submitText: `Error saving patient: ${e}`,
                submitTextType: 'error'
            })
        }
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} replace />
        }

        if (!this.state.patient) {
            if (this.state.loaded) {
                return <Navigate to="/existing-patient" replace={true} />
            }
            return <LoadingPage />
        }

        return (
            <div id="patient-edit">
                <Title>Edit Patient</Title>

                <div className="d-flex flex-column align-items-center">
                    <div className="mb-3 w-75" style={{ maxWidth: '500px' }}>
                        <label className="form-label"><h5>Name <span className="text-danger">*</span></h5></label>
                        <input
                            type="text"
                            className={`form-control ${!this.state.nameValid ? 'is-invalid' : ''}`}
                            value={this.state.name}
                            onChange={(e) => this.setState({ name: e.target.value })}
                            placeholder="Enter patient name"
                        />
                        {!this.state.nameValid && (
                            <div className="invalid-feedback">Name is required.</div>
                        )}
                    </div>

                    <div className="mb-3 w-75" style={{ maxWidth: '500px' }}>
                        <label className="form-label"><h5>Date of Birth <span className="text-muted">(optional)</span></h5></label>
                        <input
                            type="date"
                            className="form-control"
                            value={this.state.dateOfBirth}
                            onChange={(e) => this.setState({ dateOfBirth: e.target.value })}
                        />
                    </div>

                    <div className="mb-3 w-75" style={{ maxWidth: '500px' }}>
                        <label className="form-label"><h5>Sex <span className="text-muted">(optional)</span></h5></label>
                        {SEX_OPTIONS.map(option => (
                            <div key={option} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sex"
                                    id={`sex-${option}`}
                                    value={option}
                                    checked={this.state.sex === option}
                                    onChange={(e) => this.setState({ sex: e.target.value })}
                                />
                                <label className="form-check-label" htmlFor={`sex-${option}`}>
                                    {option}
                                </label>
                            </div>
                        ))}
                        {this.state.sex && (
                            <button
                                className="btn btn-sm btn-outline-secondary mt-2"
                                onClick={() => this.setState({ sex: '' })}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="d-flex gap-3 justify-content-center">
                        <Submit onClick={this.handleSave} label="Save" />
                        <Link to={`/patient?uuid=${this.state.patient.uuid}`} className="btn btn-secondary btn-lg">Cancel</Link>
                    </div>
                    {this.state.submitText && (
                        <Text value={this.state.submitText} type={this.state.submitTextType} />
                    )}
                </div>
            </div>
        )
    }
}

export default PatientEdit
