// InpitError.js
// модальное окно ошибки записи URL

//--------------------ИМПОРТ-ЗАВИСИМОСТЕЙ----------------------------------------------------------------------------

import React from 'react';
import './InputError.css'





//--------------------ОСНОВНОЙ КОД-----------------------------------------------------------------------------------

const InputError = ({active, setActive, children}) => {
    return (
        <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
            <div className={active ? "modal__content active" : "modal__content"} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
            
    )
}

export default InputError;