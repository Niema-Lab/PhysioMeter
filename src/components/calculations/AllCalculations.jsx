import { CALCULATION_SECTION_CONFIGS } from './CalculationFactory'
import Calculation from './Calculation'
import Submit from '../form/Submit'
import { downloadCSV, generateCalculationsCSVRows } from '../../utils/csvExport'

function AllCalculations({ formState, validations, disabledValues, patientName }) {
    const calculations = Object.entries(CALCULATION_SECTION_CONFIGS).map(([key, config]) => {
        const value = config.valueFunction(formState, validations, disabledValues)
        if (value === null) return null
        return <Calculation key={key} label={config.label} value={value} unit={config.unit} />
    }).filter(Boolean)

    if (calculations.length === 0) return null

    const exportCalculations = () => {
        const date = new Date().toISOString().split('T')[0]
        const rows = generateCalculationsCSVRows(formState, validations, disabledValues)
        downloadCSV(rows, `calculations_${patientName || 'guest'}_${date}.csv`)
    }

    return (
        <div className="calculations-summary mt-4 px-3">
            {calculations}
            <div className="d-flex justify-content-center">
                <Submit label="Export Calculations to CSV" onClick={exportCalculations} />
            </div>
        </div>
    )
}

export default AllCalculations
