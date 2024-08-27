import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

const WORD_LENGTH = 5
const TOTAL_GUESSES = 6

function App() {

  const [guessedWords, setGuessedWords] = useState(new Array(TOTAL_GUESSES).fill("     "))
  const [correctWord, setCorrectWord] = useState("")
  const [correctLetterObject, setCorrectLetterObject] = useState({})
  const [wordCount, setWordCount] = useState(0)
  const [letterCount, setLetterCount] = useState(0)
  const [currentWord, setCurrentWord] = useState("     ")
  const [gameOver, setGameOver] = useState(false)

  async function fetchWord() {
    const response = await axios.get('https://api.datamuse.com/words?sp=?????&max=1000')
    const words = response.data
    const randomIndex = Math.floor(Math.random() * words.length)
    const word = words[randomIndex].word
    console.log(word)
    const letterObject = {}
    for (let letter of word) {
      letterObject[letter] = (letterObject[letter] || 0) + 1
    } 
    setCorrectWord(word)
    setCorrectLetterObject(letterObject)
  }

  // Getting Correct Word
  useEffect(() => {
    fetchWord()
  }, [])

  function handleEnter() {

    if (currentWord === correctWord) {
      setGameOver(true)
      alert("YOU'VE WON!")
      return
    }

    if (currentWord !== correctWord && wordCount === TOTAL_GUESSES - 1) {
      setGameOver(true)
      alert("YOU'VE LOST!")
      return
    }

    if (letterCount !== WORD_LENGTH) {
      alert("Words must be five letters.")
      return
    }

    setGuessedWords((current) => {
      const updatedGuessedWords = [...current]
      updatedGuessedWords[wordCount] = currentWord
      return updatedGuessedWords
    })

    setWordCount(current => current + 1)
    setLetterCount(0)
    setCurrentWord("     ")
  }

  function handleBackspace() {
    if (letterCount === 0) {
      return
    }

    setCurrentWord((currentWord) => {
      const currentWordArray = currentWord.split("")
      currentWordArray[letterCount - 1] = " "
      const newWord = currentWordArray.join("")
      return newWord
    })

    setLetterCount(currentCount => currentCount - 1)
  }

  function handleAlphabetical(key) {
    if (letterCount === WORD_LENGTH) {
      return
    }

    setCurrentWord((currentWord) => {
      const currentWordArray = currentWord.split("")
      currentWordArray[letterCount] = key
      const newWord = currentWordArray.join("")
      return newWord
    })

    setLetterCount(currentCount => currentCount + 1)
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter") {
        handleEnter()
      } else if (e.key === "Backspace") {
        handleBackspace()
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleAlphabetical(e.key)
      } else {
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    if (gameOver) {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {document.removeEventListener('keydown', handleKeyDown)}
  }, [handleEnter, handleBackspace, handleAlphabetical, gameOver])

  function resetGame() {
    setGuessedWords(new Array(TOTAL_GUESSES).fill("     "))
    fetchWord()
    setWordCount(0)
    setLetterCount(0)
    setCurrentWord("     ")
    setGameOver(false)
  }

  return (
    <div>
      <span div className="text-8xl text-white font-extrabold">WORDLE!</span>
      {guessedWords.map((word, index) => {
        if (index === wordCount) {
          return (
            <WordLine word={currentWord} 
            correctWord={correctWord} 
            correctLetterObject={correctLetterObject}
            revealed={false || gameOver} 
            key={index}/>
          )
        }
        return (
          <WordLine word={word} 
          correctWord={correctWord} 
          correctLetterObject={correctLetterObject}
          revealed={true} 
          key={index}/>
        )
      })}
      <button className="m-4 p-4 border-white hover:bg-gray-700 text-2xl font-semibold"
      onClick={(e) => {resetGame(); e.target.blur()}}>Reset Game</button>
    </div>
  )
}

function WordLine( {word, correctWord, correctLetterObject, revealed} ) {
  return (
    <div className="flex flex-row space-x-2 m-4">
      {word.split("").map((letter, index) => {

        const hasCorrectLocation = letter === correctWord[index]
        const hasCorrectLetter = letter in correctLetterObject

        return (
          <LetterBox 
          letter={letter}
          green={hasCorrectLocation && hasCorrectLetter && revealed}
          yellow={!hasCorrectLocation && hasCorrectLetter && revealed}
           key={index}/>
        )
      })}
    </div>
  )
}

function LetterBox({letter, green, yellow}) {
  return (
    <div className={`w-24 h-24 border-4 border-black bg-white text-black text-6xl 
    ${green ? 'bg-green-500' : yellow ? 'bg-yellow-500' : ""}`}>
      {letter}
    </div>
  )
}

export default App