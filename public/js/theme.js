const body = document.querySelector('body')
const userTheme = localStorage.getItem('theme')

if (userTheme && (userTheme === 'dark' || userTheme === 'light')) {
    if (userTheme === 'dark') {
        body.setAttribute('theme', 'dark')
    } else {
        body.setAttribute('theme', 'light')
    }
} else {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (prefersDarkScheme.matches) {
        body.setAttribute('theme', 'dark')
    } else {
        body.setAttribute('theme', 'light')
    }
}