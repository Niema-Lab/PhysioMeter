function Interpretation({ label, messages }) {
    return (
        <div className="card mb-3 border-secondary" style={{ borderWidth: '2px' }}>
            <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">{label}</h5>
            </div>
            <div className="card-body p-2">
                {messages.map((msg, i) => (
                    <div key={i} className={`alert alert-${msg.type} ${i < messages.length - 1 ? 'mb-2' : 'mb-0'}`} style={{ whiteSpace: 'pre-line' }}>
                        {msg.text}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Interpretation
