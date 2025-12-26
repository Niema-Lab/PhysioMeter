import React from 'react'

function Title(props) {
    return (
        <h1 className="text-center w-100 my-5">{props.children}</h1>
    )
}

export default Title