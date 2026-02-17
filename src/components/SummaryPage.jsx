import MeasurementSummary from './measurements/MeasurementSummary'
import AllCalculations from './calculations/AllCalculations'
import AllInterpretations from './interpretations/AllInterpretations'
import Text from './form/Text'
import Title from './form/Title'
import Submit from './form/Submit'
import { downloadCSV, generateMeasurementsCSVRows, generateCalculationsCSVRows, generateInterpretationsCSVRows } from '../utils/csvExport'

function SummaryPage({ name, patientName, submitText, submitTextType, formState, validations, disabledValues, isDisabled }) {
    const date = new Date().toISOString().split('T')[0]

    const exportMeasurements = () => {
        const rows = generateMeasurementsCSVRows(formState, isDisabled)
        downloadCSV(rows, `measurements_${patientName}_${date}.csv`)
    }

    const exportAll = () => {
        const measRows = generateMeasurementsCSVRows(formState, isDisabled)
        downloadCSV(measRows, `measurements_${patientName}_${date}.csv`)

        setTimeout(() => {
            const calcRows = generateCalculationsCSVRows(formState, validations, disabledValues)
            downloadCSV(calcRows, `calculations_${patientName}_${date}.csv`)
        }, 100)

        setTimeout(() => {
            const interpRows = generateInterpretationsCSVRows(formState, validations, disabledValues)
            downloadCSV(interpRows, `interpretations_${patientName}_${date}.csv`)
        }, 200)
    }

    return (
        <>
            <Title>Summary {name}</Title>
            <div className="d-flex justify-content-center">
                <Submit label="Export All Data to CSV" onClick={exportAll} />
            </div>
            {submitText &&
                <Text value={submitText} type={submitTextType} />
            }
            <h3 className="text-center mt-5 mb-3">Measurements</h3>
            <MeasurementSummary
                formState={formState}
                validations={validations}
                isDisabled={isDisabled}
            />
            <div className="d-flex justify-content-center">
                <Submit label="Export Measurements to CSV" onClick={exportMeasurements} />
            </div>
            <h3 className="text-center mt-5 mb-3">Calculations</h3>
            <AllCalculations
                formState={formState}
                validations={validations}
                disabledValues={disabledValues}
                patientName={patientName}
            />
            <h3 className="text-center mt-5 mb-3">Interpretations</h3>
            <AllInterpretations
                formState={formState}
                validations={validations}
                disabledValues={disabledValues}
                patientName={patientName}
            />
        </>
    )
}

export default SummaryPage
