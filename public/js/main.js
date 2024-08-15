// loadMore-btn
const loadMoreBtn = document.querySelector('.load-more-btn')
const container = document.querySelector('.games')
let games = document.querySelectorAll('.game')
loadMoreBtn.onclick = function() {
    const btnText = loadMoreBtn.innerHTML
    loadMoreBtn.setAttribute('disabled', true)
    loadMoreBtn.innerHTML = 'Загрузка...'
    setTimeout(() => {
        games.forEach(game => {
            container.append(game.cloneNode(true))
        })
        games = document.querySelectorAll('.game')
        loadMoreBtn.innerHTML = btnText
        loadMoreBtn.removeAttribute('disabled')
    }, 1000)
}


// filters: search - language - platform
const searchGameInput = document.querySelector('.search-game')
const languageSelect = document.querySelector('.search-language')
const platformSelect = document.querySelector('.search-platform')

let timeout
searchGameInput.oninput = function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => searchGame(), 500)
}
languageSelect.onchange = () => searchGame()
platformSelect.onchange = () => searchGame()

async function gameSearchRequest() {
    const siteLanguage = document.querySelector('html').getAttribute('lang')
    const gameValue = searchGameInput.value ? `?game=${searchGameInput.value}` : ''
    const languageValue = languageSelect.value !== 'all'
        ? `${gameValue ? '&' : '?'}language=${languageSelect.value}`
        : ''
    const platformValue = platformSelect.value !== 'all'
        ? `${gameValue || languageValue ? '&' : '?'}platform=${platformSelect.value}`
        : ''
    const url = `http://localhost:3000/search${gameValue}${languageValue}${platformValue}`
    window.history.pushState(
        '',
        '',
        gameValue || languageValue || platformValue
            ? `${gameValue}${languageValue}${platformValue}`
            : `/${siteLanguage}`)
    const response = await fetch(url, {
        headers: {
            'Site-Language': siteLanguage
        }
    })
    // EXCEPTION: { "statusCode": 400, "message": "Site language not found" }
    return await response.json()
}

async function searchGame() {
    const currentGames = container.querySelectorAll('.game')
    currentGames.forEach(currentGame => currentGame.remove())

    const data = await gameSearchRequest()
    
    if (data.length) {
        let subtemplate
        if (languageSelect.value !== 'all') {
            subtemplate = `
                <div class="which-regions">
                    <img class="flag-icon language-icon" src={{currentLanguage.iconSrc}} alt={{currentLanguage.iconAlt}} data-language="{{currentLanguage.name}}">
                    <span>{{languageAvailability}}</span>
                </div>
                <div class="audio-languages-number">{{audioCount}}</div>
                <ul class="language-list language-list_audio">
                    {{#each audioRegions}}
                    <li class="language-list__item">
                        <img class="flag-icon language-icon" src={{this.iconSrc}} alt={{this.iconAlt}} data-language="{{this.name}}">
                        <span class="language-list__text">{{this.name}}</span>
                    </li>
                    {{/each}}
                </ul>
                <div class="interface-languages-number">{{interfaceCount}}</div>
                <ul class="language-list language-list_interface">
                    {{#each interfaceRegions}}
                    <li class="language-list__item">
                        <img class="flag-icon language-icon" src={{this.iconSrc}} alt={{this.iconAlt}} data-language="{{this.name}}">
                        <span class="language-list__text">{{this.name}}</span>
                    </li>
                    {{/each}}
                </ul>
            `
        } else {
            subtemplate = `
                <div class="audio-languages-number">{{audioLanguagesNumber}}</div>
                    <ul class="language-list language-list_audio">
                        {{#each audioLanguages}}
                        <li class="language-list__item">
                            <img class="flag-icon language-icon" src={{this.iconSrc}} alt={{this.iconAlt}} data-language="{{this.name}}">
                            <span class="language-list__text">{{this.name}}</span>
                        </li>
                        {{/each}}
                    </ul>
                    <div class="interface-languages-number">{{interfaceLanguagesNumber}}</div>
                    <ul class="language-list language-list_interface">
                        {{#each interfaceLanguages}}
                        <li class="language-list__item">
                            <img class="flag-icon language-icon" src={{this.iconSrc}} alt={{this.iconAlt}} data-language="{{this.name}}">
                            <span class="language-list__text">{{this.name}}</span>
                        </li>
                        {{/each}}
                    </ul>
                <div class="regions-number">{{regionsNumber}}</div>
            `
        }

        const template = Handlebars.compile(`
            <a class="game__img" href={{link}}>
                <img src={{imgSrc}} alt="{{imgAlt}}">
            </a>
            <div class="game__header">
                <a class="game__title" href={{link}}>{{title}}</a>
                <div class="game__type">{{type}}</div>
            </div>
            <div class="game__platforms">
                {{#each platforms}}
                <div class="game__platform game__platform_{{this.class}}">{{this.name}}</div>
                {{/each}}
            </div>
            <div class="game__languages">
                ${subtemplate}
            </div>
        `)
        const gamesDiv = document.querySelector('.games')
        data.forEach(game => {
            let gameDiv = document.createElement('div')
            gameDiv.className = 'game'
            gameDiv.innerHTML = template(game)
            gamesDiv.append(gameDiv)
        })
    }
}