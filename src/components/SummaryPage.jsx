import MeasurementSummary from './measurements/MeasurementSummary'
import AllCalculations from './calculations/AllCalculations'
import AllInterpretations from './interpretations/AllInterpretations'
import Text from './form/Text'
import Title from './form/Title'
import Submit from './form/Submit'
import { downloadCSV, generateMeasurementsCSVRows, generateCalculationsCSVRows, generateInterpretationsCSVRows } from '../utils/csvExport'
import { hasData } from './measurements/MeasurementSummary'

function SummaryPage({ name, patientName, submitText, submitTextType, formState, validations, disabledValues, isDisabled }) {
    const date = new Date().toISOString().split('T')[0]

    const exportAll = () => {
        const measurementRows = generateMeasurementsCSVRows(formState, isDisabled)
        downloadCSV(measurementRows, `measurements_${patientName}_${date}.csv`)

        setTimeout(() => {
            const calculationsRows = generateCalculationsCSVRows(formState, validations, disabledValues)
            downloadCSV(calculationsRows, `calculations_${patientName}_${date}.csv`)
        }, 100)

        setTimeout(() => {
            const interpretationRows = generateInterpretationsCSVRows(formState, validations, disabledValues)
            downloadCSV(interpretationRows, `interpretations_${patientName}_${date}.csv`)
        }, 200)
    }

    return (
        <>
            <Title>Summary {name}</Title>
            {hasData(formState) &&
                <div className="d-flex justify-content-center">
                    <Submit label="Export All Data to CSV" onClick={exportAll} />
                </div>
            }
            {submitText &&
                <Text value={submitText} type={submitTextType} />
            }
            <MeasurementSummary
                formState={formState}
                validations={validations}
                isDisabled={isDisabled}
                patientName={patientName}
            />
            <AllCalculations
                formState={formState}
                validations={validations}
                disabledValues={disabledValues}
                patientName={patientName}
            />
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
