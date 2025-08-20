export { CodeSnippets }

import React, { useId } from 'react'
import { useSelectedLanguage } from '../utils/useSelectedLanguage';

const languages = [
    { id: 'js', name: 'Javascript' },
    { id: 'ts', name: 'Typescript' },
]

function CodeSnippets({ children }: { children: React.ReactNode; }) {
    const [selectedLang, setSelectedLang] = useSelectedLanguage()
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
            <div >
                <form style={{ display: 'flex', padding: '0.25rem', justifyContent: 'flex-end', gap: '2px' }}>
                    <select name="language" id="language" onChange={handleOnChange} value={selectedLang}>
                        {languages.map((language, index) => (
                            <option key={index} value={language.id} defaultValue={selectedLang}>{language.name}</option>
                        ))}
                    </select>
                    <button type='button' onClick={copyToClipboard}>Copy</button>
                </form>
            </div>
            <div>
                {
                    React.Children.toArray(children).map((child, index) => (
                        <CodeSnippet key={index} language={languages[index].id} uniqueId={uniqueId}>
                            {child}
                        </CodeSnippet>
                    ))
                }
            </div>
        </div>
    )
}

function CodeSnippet({ children, language, uniqueId }: { children: React.ReactNode; language: string; uniqueId: string }) {
    const [selectedLang] = useSelectedLanguage()

    return (
        <div id={`${language}-code-${uniqueId}`} style={{ display: selectedLang === language ? 'block' : 'none' }}>
            {children}
        </div>
    )
}