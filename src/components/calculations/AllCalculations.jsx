import { CALCULATION_SECTION_CONFIGS } from './CalculationFactory'
import Calculation from './Calculation'

function AllCalculations({ formState, validations, disabledValues }) {
    const calculations = Object.entries(CALCULATION_SECTION_CONFIGS).map(([key, config]) => {
        const value = config.valueFunction(formState, validations, disabledValues)
        if (value === null) return null
        return <Calculation key={key} label={config.label} value={value} unit={config.unit} />
    }).filter(Boolean)

    if (calculations.length === 0) return null

    return (
        <div className="calculations-summary mt-4 px-3">
            {calculations}
        </div>
    )
}

export default AllCalculations
