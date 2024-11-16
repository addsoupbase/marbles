const max = {
    title: '20',
    author: '16'
}
const あ = Elem;
const elements = {
    cont: new Elem({
        tag: 'div', id: 'cont', children: [
            new Elem({ tag: 'canvas', width: 500, height: 500, id: 'can', }),
            new Elem({
                tag: 'div', id: 'message', children: [
                    new Elem({ tag: 'h3', message: '' })
                ]
            }),

            new Elem({
                id: 'data', tag: 'div', class: ['menu'], children: [
                    new Elem({ tag: 'p', text: 'Nothing Selected...' })
                ]
            }), new Elem({
                tag: 'div', id: 'data2', class: ['menu', 'hidden'], children: [
                    new Elem({ tag: 'div', id: 'buttonholder' })
                ]
            }),
            new Elem({ tag: 'div', id: 'data4', class: ['menu', 'hidden'] }),
            new Elem({
                tag: 'div', id: 'data3', class: ['menu', 'hidden'], children: [
                    new Elem({
                        tag: 'div', children: [
                            new Elem({ tag: 'button', id: 'marbleAdder', class: ['good'], text: 'Add Marble' }),
                            new Elem({ tag: 'button', id: 'spawnImmediately', class: ['good'], text: 'Spawn All' }),
                            new Elem({ tag: 'button', id: 'killAll', class: ['bad'], text: 'Destroy All' })

                        ]
                    }),
                    new Elem({
                        tag: 'div', class: ['separate'], children: [
                            new Elem({ tag: 'label', for: 'title', text: 'Title' }),
                            new Elem({ tag: 'input', id: 'title', class: ['write'], type: 'text', value: 'Untitled', maxLength: max.title }),
                            new Elem({ tag: 'label', for: 'author', text: 'Author' }),
                            new Elem({ tag: 'input', id: 'author', class: ['write'], type: 'text', value: 'Unknown', maxLength: max.author }),
                            new Elem({ tag: 'label', for: 'bounciness', text: 'Marble bounce' }),
                            new Elem({ tag: 'input', id: 'bounciness', class: ['write'], type: 'number', value: '1', }),
                            new Elem({ tag: 'label', for: 'camBehaviour', text: 'Camera Behaviour', class: ['hidden'] }),
                            new Elem({
                                tag: 'select', id: 'camBehaviour', style: 'display: hidden;', class: ['hidden'], value: 'leader', children: [
                                    new Elem({ tag: 'option', value: 'leader', text: 'Follow Leader' }),
                                    new Elem({ tag: 'option', value: 'loser', text: 'Follow Loser' }),
                                    new Elem({ tag: 'option', value: 'middle', text: 'Follow Middle' }),
                                    new Elem({ tag: 'option', value: 'average', text: 'Average' }),
                                    new Elem({ tag: 'option', value: 'outliers', text: 'Outliers' }),
                                    new Elem({ tag: 'option', value: 'random', text: 'Pick randomly' }),
                                    new Elem({ tag: 'option', value: 'free', text: 'Free' }),
                                    new あ({ tag: 'optgroup', label: 'Contestants' })
                                ]
                            }),


                        ]
                    }),
                    new Elem({ tag: 'p', class: ['danger'], text: 'Spawned marbles will not be saved' }),
                    new Elem({ tag: 'div', id: 'allMarbles' })
                ]
            })

        ]
    }, true),
    startmenu: new Elem({
        tag: 'div', id: 'startmenu', class: ['menu', 'gameMenu'],
        children: [
            new Elem({ tag: 'h1', text: 'Untitled', class: ['gameMenu'], id: 'levelTitle' }),
            new Elem({ tag: 'cite', text: 'by Unknown', class: ['gameMenu'], id: 'authorName', parent: Elem.$('#levelTitle') }),

            new Elem({
                tag: 'button', id: 'gameStartButton', class: ['good', 'gameMenu'], text: 'Play',
            }),
            new Elem({
                tag: 'div', class: ['gameMenu'], id: 'secondMenu', children: [
                    new Elem({ tag: 'label', text: 'Play Cutscenes', for: 'cutscenes' }),
                    new Elem({ tag: 'input', type: 'checkbox', id: 'cutscenes', checked: true, }),
                    new Elem({ tag: 'label', for: 'camSpeed', text: 'Camera Speed', }),
                    new Elem({ tag: 'input', id: 'camSpeed', value: 0.1, placeholder: 'Default: 0.1' }),
                    new Elem({ tag: 'label', text: 'Camera Behaviour', for: 'camBehaviour' }),


                ]
            }),
            new Elem({
                tag: 'div', class: ['gameMenu'], children: [
                    new Elem({
                        tag: 'button', id: 'gameSettings', class: ['neutral', 'gameMenu'], text: 'Settings', events: [
                            ['click', turnToSettingsMenu]
                        ]
                    })
                ]
            }),

        ]
    }, true),
    hold: new Elem({
        class: ['hold'],
        id: 'hideme', tag: 'div', children: [
            new Elem({ tag: 'button', id: 'saveButton', text: 'Download', class: ['good'] }),
            new Elem({
                class: ['good'], tag: 'button', id: 'loadButton', text: 'Load from file', events: [
                    ['click', () => {
                        Elem.$('#uploadedData').content.click()

                    }]
                ]
            }),
            new Elem({
                class: ['good'], tag: 'button', id: 'loadButton2', text: 'Load from text field', events: [
                    ['click', () => Load()]
                ]
            }),

            new Elem({
                class: ['good'], tag: 'button', text: 'Copy', events: [
                    ['click', () => navigator.clipboard.writeText(あ.$('#textData').value)]
                ]
            }),
            new Elem({ tag: 'textArea', id: 'textData', placeholder: 'Saved Data' }),
            new Elem({ class: ['good'], tag: 'button', id: 'put', text: 'Put' }),
            new Elem({ class: ['good'], tag: 'button', id: 'edit', text: 'Edit' }),
            new Elem({ class: ['good'], tag: 'button', id: 'marble', text: 'Marbles' }),
            new Elem({ class: ['good'], tag: 'button', id: 'startButton', text: 'Start' }),
        ]
    }, true)
}
function turnToSettingsMenu() {
    _('secondMenu').content.style.display = 'grid'
    Elem.$('#secondMenu').children.forEach(o => o.removeClass('hidden') + o.show() + (o.content.style.display = 'grid'))

    あ.$('#gameSettings').kill()
}
export default elements
export {max,あ}