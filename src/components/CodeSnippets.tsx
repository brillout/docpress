export { CodeSnippets }

import React, { useId, useState } from 'react'

const languages = [
    { id: 'js', name: 'Javascript' },
    { id: 'ts', name: 'Typescript' },
]

function CodeSnippets({ children }: { children: React.ReactNode; }) {
    // TODO: set and get selected language globally from localStorage. Use custom hook ?
    const [selectedLang, setSelectedLang] = useState('js')
    const uniqueId = useId()

    const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLang(e.target.value)
    }

    const copyToClipboard = async () => {
        const selectedCodeBlock = document.getElementById(`${selectedLang}-code-${uniqueId}`)
        try {
            await navigator.clipboard.writeText(selectedCodeBlock?.textContent ?? '')
            console.log('Copied to clipboard!')
        } catch (error) {
            console.warn('Copy failed', error)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', margin: '0.25rem 1rem', justifyContent: 'flex-end', gap: '2px' }}>
                <form>
                    <select name="language" id="language" onChange={handleOnChange} value={selectedLang}>
                        {languages.map((language, index) => (
                            <option key={index} value={language.id} defaultValue={selectedLang}>{language.name}</option>
                        ))}
                    </select>
                </form>
                <button onClick={copyToClipboard}>Copy</button>
            </div>
            <div>
                {
                    React.Children.toArray(children).map((child, index) => (
                        <CodeSnippet key={index} selected={selectedLang} language={languages[index].id} uniqueId={uniqueId}>
                            {child}
                        </CodeSnippet>
                    ))
                }
            </div>
        </div>
    )
}

function CodeSnippet({ children, language, selected, uniqueId }: { children: React.ReactNode; language: string; selected: string; uniqueId: string }) {
    return (
        <div id={`${language}-code-${uniqueId}`} style={{ display: selected !== language ? 'none' : 'block' }}>
            {children}
        </div>
    )
}