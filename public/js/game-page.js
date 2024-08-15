//sorting
const sortCountry = document.querySelector('#sort-country')
const sortPrice = document.querySelector('#sort-price')
const sortAudio = document.querySelector('#sort-audio')
const sortInterface = document.querySelector('#sort-interface')
const tbody = document.querySelector('.game-languages').querySelector('tbody')
const rows = tbody.querySelectorAll('tr')
const sortSelect = document.querySelector('#sort-select')

let sortState = ''

function changeSortState(column) {
    if (column.match(/-asc/) || column.match(/-desc/)) {
        sortState = column
    } else if (!sortState.match(column)) {
        sortState = `${column}-asc`
    } else if (sortState === `${column}-asc`) {
        sortState = `${column}-desc`
    } else {
        sortState = ''
    }

    const columns = {
        country: sortCountry,
        price: sortPrice,
        audio: sortAudio,
        interface: sortInterface
    }
    for (let key in columns) {
        columns[key].className = 'th-button no-sort'
    }
    if (sortState) {
        columns[`${sortState.match(/\w+/)[0]}`].className = `th-button sort-${sortState.match(/\w+$/)[0]}`
    }
}

function sortRows(rows) {
    if (sortState) {
        const sortedRows = [...rows].filter(tr => {
            if (sortState.match(/price/)) {
                return tr.querySelector('.usd-price')
            }
            if (sortState.match(/audio|interface/)) {
                return !tr.querySelector('.unavailable-cell')
            }
            return tr
        })
        sortedRows.sort((a, b) => {
            function param(tr) {
                if (sortState.match(/country/)) {
                    const countryNameElement = tr.querySelector('.country-name')
                    return countryNameElement.innerText.toLowerCase()
                }
                if (sortState.match(/price/)) {
                    const usdPriceElement = tr.querySelector('.usd-price')
                    return +usdPriceElement.innerText.match(/\d+.\d+/)[0]
                }
                if (sortState.match(/audio|interface/)) {
                    const languageIcons = tr.querySelector(`.${sortState.match(/\w+/)}-cell`).querySelectorAll('.flag-icon')
                    return languageIcons.length
                }
            }
            const paramA = param(a)
            const paramB = param(b)
            if (paramA < paramB) {
                return sortState.match(/asc$/) ? -1 : 1
            }
            if (paramA > paramB) {
                return sortState.match(/asc$/) ? 1 : -1
            }
            return 0;
        })
        return sortedRows
    } else {
        const idSortedRows = [...rows]
        idSortedRows.sort((a, b) => a.dataset.id - b.dataset.id)
        return idSortedRows
    }
}

function sortAndInsertRows(column) {
    changeSortState(column)

    const currentRows = tbody.querySelectorAll('tr')
    const sortedRows = sortRows(currentRows)

    tbody.prepend(...sortedRows)
}

sortCountry.onclick = () => sortAndInsertRows('country')
sortPrice.onclick = () => sortAndInsertRows('price')
sortAudio.onclick = () => sortAndInsertRows('audio')
sortInterface.onclick = () => sortAndInsertRows('interface')
sortSelect.onchange = e => sortAndInsertRows(e.target.value)


//filter language
const languageSelect = document.querySelector('.language-select')

languageSelect.onchange = function(e) {
    rows.forEach(tr => tr.remove())
    if (e.target.value === 'all') {
        const sortedRows = sortRows(rows)
        tbody.prepend(...sortedRows)
    } else {
        const rowsWithTargetLanguage = [...rows]
            .filter(tr => !tr.querySelector('.unavailable-cell'))
            .filter(tr => {
                function hasLanguage(type) {
                    const icons = tr.querySelector(`.${type}-cell`).querySelectorAll('.flag-icon')
                    return [...icons].some(icon => icon.dataset.language === e.target.value)
                }
                return hasLanguage('audio') || hasLanguage('interface')
            })
        const sortedRows = sortRows(rowsWithTargetLanguage)
        tbody.prepend(...sortedRows)
    }
}


// reset button
const resetBtn = document.querySelector('.reset-btn')

resetBtn.onclick = function() {
    changeSortState('')
    languageSelect.value = 'all'
    sortSelect.value = ''
    rows.forEach(tr => tr.remove())
    tbody.append(...rows)
}