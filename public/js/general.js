window.onresize = function (e) {
    moveOnResizeWindow({
        element: languagePopup,
        defaultStyleLeft: defaultLanguagePopupLeft
    },
    {
        element: transcript,
        defaultStyleLeft: defaultTranscriptLeft
    })

    mobileLanguageInit()
}


// header language button
const languageBtn = document.querySelector('#site-language-btn')
const languagePopup = document.querySelector('.site-language-popup')

let defaultLanguagePopupLeft = languagePopup.style.left ? +languagePopup.style.left.match(/[0-9.]+/)[0] : 0

languageBtn.onclick = function() {
    languagePopup.classList.toggle('site-language-popup_show')
    moveOnResizeWindow({
        element: languagePopup,
        defaultStyleLeft: defaultLanguagePopupLeft
    })
}

document.onclick = function(e) {
    if (!languagePopup.contains(e.target) && !languageBtn.contains(e.target)) {
        languagePopup.classList.remove('site-language-popup_show')
    }
}


// theme
// (theme.js) const body = document.querySelector('body')
const themeBtn = document.querySelector('#site-theme-btn')
if (body.getAttribute('theme') === 'light') {
    themeBtn.innerText = 'Dark'
} else {
    themeBtn.innerText = 'Light'
}

themeBtn.onclick = function() {
    if (body.getAttribute('theme') === 'light') {
        themeBtn.innerText = 'Light'
        body.setAttribute('theme', 'dark')
        localStorage.setItem('theme', 'dark')
    } else {
        themeBtn.innerText = 'Dark'
        body.setAttribute('theme', 'light')
        localStorage.setItem('theme', 'light')
    }
}


// transcript
const transcript = document.querySelector('.transcript')
const flagIcons = document.querySelectorAll('.language-icon')
const table = document.querySelector('.game-languages')
const homePageContainer = document.querySelector('.games')

let defaultTranscriptLeft = transcript.style.left ? +transcript.style.left.match(/[0-9.]+/)[0] : 0

function moveTranscript(event, container) {
    const containerBoudingClientRect = container.getBoundingClientRect()
    const pixelsToRight = event.x - containerBoudingClientRect.x + 10
    const pixelsDown = event.y - containerBoudingClientRect.y + 15

    const transcriptBoundingClientRect = transcript.getBoundingClientRect()

    const rightPointInPixels = ((document.documentElement.clientWidth - 5) - transcriptBoundingClientRect.width) - containerBoudingClientRect.x
    transcript.style.left = (pixelsToRight > rightPointInPixels ? rightPointInPixels : pixelsToRight) + 'px'

    const bottomPointInPixels = ((document.documentElement.clientHeight - 5) - transcriptBoundingClientRect.height) - containerBoudingClientRect.y
    transcript.style.top = (pixelsDown > bottomPointInPixels ? bottomPointInPixels : pixelsDown) + 'px'

    defaultTranscriptLeft = (pixelsToRight > rightPointInPixels ? rightPointInPixels : pixelsToRight)
}

flagIcons.forEach(icon => {
    icon.onmouseover = function(mouseEvent) {
        if (window.innerWidth > 800) {
            transcript.innerText = icon.dataset.language
                if (transcript.dataset.page === 'home-page') {
                    moveTranscript(mouseEvent, homePageContainer)
                } else {
                    moveTranscript(mouseEvent, table)
                }
            transcript.classList.add('transcript_show')
        }
    }

    icon.onmouseout = function() {
        transcript.classList.remove('transcript_show')
    }
})

function setTranscriptContainerEvent(container) {
    function touchMoveTranscript(event) {
        if (event.type !== 'touchstart' && event.target.classList.contains('language-icon') && window.innerWidth > 800) {
            moveTranscript(event, container)
        }
    }
    container.onmousemove = mouseEvent => touchMoveTranscript(mouseEvent)
    container.ontouchstart = touchEvent => touchMoveTranscript(touchEvent)
}

setTranscriptContainerEvent(transcript.dataset.page === 'home-page' ? homePageContainer : table)


// mobile language
let languageLists = document.querySelectorAll('.language-list')
let li = document.querySelectorAll('.language-list__item')
let liSpan = document.querySelectorAll('.language-list__text')

const config = {
    duration: 0.2,
    spanOpenTransitionDuration: 0.05,
    spanCloseTransitionDuration: 0.1,
    marginInHeight: 5,
    marginInWidth: 5,
    paddingLeft: 5,
    paddingTop: 7.5,
    paddingBottom: 7.5,
    mobileBreakpoint: 800
}

let liHeight = li[0].getBoundingClientRect().height
let collapsedListHeight = liHeight + config.paddingTop + config.paddingBottom + 'px'
let mode = 'desktop'

function mobileLanguageInit(isObserver = false) {
    if (isObserver) {
        if (mode === 'desktop') {
            initForDesktop()
        }
        if (mode === 'mobile') {
            initForMobile()
        }
    }

    if (window.innerWidth <= config.mobileBreakpoint) {
        if (mode === 'desktop') {
            initForMobile()
            mode = 'mobile'
        }
        const currentLiHeight = li.length ? li[0].getBoundingClientRect().height : liHeight
        if (liHeight !== currentLiHeight) {
            liHeight = currentLiHeight
            collapsedListHeight = liHeight + config.paddingTop + config.paddingBottom + 'px'
            initForMobile()
        }
    }
    if (mode === 'mobile' && window.innerWidth > config.mobileBreakpoint) {
        initForDesktop()
        mode = 'desktop'
    }
}

function initForDesktop() {
    languageLists.forEach(ul => {
        ul.style = ''
        ul.classList.remove('language-list_open')
        ul.onclick = null
    })
    li.forEach(el => el.style = '')
    liSpan.forEach(el => el.style = '')
}

function initForMobile() {
    languageLists.forEach(ul => {
        initUl(ul)
        ul.onclick = ul.childElementCount ? () => clickUl(ul) : null
    })
}

mobileLanguageInit()

function getExpandedListHeight(liHeight, numberOfLanguages, withPx = false) {
    return ((liHeight + config.marginInHeight) * numberOfLanguages - config.marginInHeight) + config.paddingTop + config.paddingBottom + (withPx ? 'px' : 0)
}

function initUl(ul) {
    const items = ul.querySelectorAll('.language-list__item')
    const numberOfLanguages = items.length
    if (!ul.classList.contains('language-list_open')) {
        ul.style.height = collapsedListHeight
    }
    ul.style.transition = `all ${config.duration}s linear`
    items.forEach((item, index) => {
        item.style.left = (item.querySelector('img').offsetWidth + config.marginInWidth) * index + config.paddingLeft + 'px'
        item.style.transition = `all ${(config.duration / (numberOfLanguages - 1)) * index}s ${config.duration - (config.duration / (numberOfLanguages - 1)) * index}s linear`
    })
}

function openUl(ul) {
    if (ul) {
        const items = ul.querySelectorAll('.language-list__item')
        const secPerPixel = config.duration / ((getExpandedListHeight(liHeight, items.length) - config.paddingTop - config.paddingBottom) - liHeight)
        
        ul.classList.add('language-list_open')
        ul.style.height = getExpandedListHeight(liHeight, items.length, true)

        items.forEach((item, index) => {
            item.style.top = config.paddingTop + ((liHeight + config.marginInHeight) * index) + 'px'
            const transitionDelay = (liHeight + ((config.marginInHeight + liHeight) * index)) * secPerPixel
            item.querySelector('span').style.transition = `opacity ${config.spanOpenTransitionDuration}s ${transitionDelay}s linear`
        })
    }
}

function closeUl(ul) {
    if (ul) {
        const items = ul.querySelectorAll('.language-list__item')
        const secPerPixel = config.duration / ((getExpandedListHeight(liHeight, items.length) - config.paddingTop - config.paddingBottom) - liHeight)

        ul.classList.remove('language-list_open')
        ul.style.height = collapsedListHeight

        items.forEach((item, index, arr) => {
            item.style.top = null
            const transitionDelay = (config.marginInHeight + ((config.marginInHeight + liHeight) * (arr.length - index - 2))) * secPerPixel
            item.querySelector('span').style.transition = `opacity ${config.spanCloseTransitionDuration}s ${(transitionDelay <= 0 ? 0 : transitionDelay) - config.spanCloseTransitionDuration}s linear`
        })
    }
}

function clickUl(ul) {
    if (!ul.classList.contains('language-list_open')) {
        closeUl(document.querySelector('.language-list_open'))
        openUl(ul)
    } else {
        closeUl(ul)
    }
}


// -- general functions --
function moveOnResizeWindow(...elements) {
    const clWidth = document.documentElement.clientWidth - 5
    elements.forEach(elArr => {
        const {element, defaultStyleLeft} = elArr
        const currentStyleLeft = element.style.left ? +element.style.left.match(/[-0-9.]+/)[0] : 0
        const elBoundingClientRect = element.getBoundingClientRect()
        const moveLeft = currentStyleLeft + (clWidth - elBoundingClientRect.right)
        element.style.left = (moveLeft > defaultStyleLeft ? defaultStyleLeft : moveLeft) + 'px'
    })
}


// -- observer --
const gamesObserver = new MutationObserver(records => {
    records.forEach(mutationRecord => {
        const newNodeList = mutationRecord.addedNodes
        if (newNodeList.length) {
            const newFlagIcons = newNodeList[0].querySelectorAll('.language-icon')
            newFlagIcons.forEach(icon => {
                icon.onmouseover = function(mouseEvent) {
                    if (window.innerWidth > 800) {
                        transcript.innerText = icon.dataset.language
                            if (transcript.dataset.page === 'home-page') {
                                moveTranscript(mouseEvent, homePageContainer)
                            } else {
                                moveTranscript(mouseEvent, table)
                            }
                        transcript.classList.add('transcript_show')
                    }
                }
            
                icon.onmouseout = function() {
                    transcript.classList.remove('transcript_show')
                }
            })
        }
    })

    languageLists = document.querySelectorAll('.language-list')
    li = document.querySelectorAll('.language-list__item')
    liSpan = document.querySelectorAll('.language-list__text')
    mobileLanguageInit(true)

    if (!homePageContainer.querySelectorAll('.game').length) {
        document.querySelector('.not-found').classList.add('show')
        document.querySelector('.load-more-btn').style.display = 'none'
    } else {
        document.querySelector('.not-found').classList.remove('show')
        document.querySelector('.load-more-btn').style.display = null
    }
})

if (homePageContainer) {
    gamesObserver.observe(homePageContainer, {
        childList: true
    })
}
