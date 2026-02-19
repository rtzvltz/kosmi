'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LessonClient({
  lesson,
  variant,
  characters,
  profile,
  progress,
}: any) {
  const [step, setStep] = useState(progress?.completed ? 'completed' : 'intro')
  const [showDepth, setShowDepth] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [reflectionAnswer, setReflectionAnswer] = useState(progress?.reflection_answer || '')
  const [earnedPoints, setEarnedPoints] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()

  // Auto-play intro voor groep 1-3
  useEffect(() => {
    if (step === 'intro' && profile.groep <= 3 && variant.introText) {
      playTTS(variant.introText, characters[0]?.elevenLabsVoiceId)
    }
  }, [step])

  const playTTS = async (text: string, voiceId: string) => {
    if (!voiceId) return

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
    } catch (error) {
      console.error('TTS error:', error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      alert('Kan microfoon niet gebruiken')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/ai/stt', {
        method: 'POST',
        body: formData,
      })

      const { transcript } = await response.json()
      if (transcript) {
        setChatInput(transcript)
      }
    } catch (error) {
      console.error('STT error:', error)
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !characters[0] || isSending) return

    setIsSending(true)
    const userMessage = chatInput
    setChatInput('')

    const newMessages = [...chatMessages, { role: 'user', content: userMessage }]
    setChatMessages(newMessages)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: characters[0].id,
          message: userMessage,
          studentGroep: profile.groep,
          studentDisplayName: profile.display_name || profile.name,
          conversationHistory: chatMessages,
        }),
      })

      const { response: aiResponse } = await response.json()

      setChatMessages([
        ...newMessages,
        { role: 'assistant', content: aiResponse },
      ])

      // Speel antwoord af
      if (characters[0].elevenLabsVoiceId) {
        playTTS(aiResponse, characters[0].elevenLabsVoiceId)
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const unlockDepth = async () => {
    setShowDepth(true)
    setEarnedPoints(variant.pointsBase + variant.pointsDepthBonus)

    // Track depth access
    await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson.id,
        eventType: 'depth_accessed',
        points: variant.pointsDepthBonus,
      }),
    })
  }

  const completeLesson = async () => {
    // Save reflection en mark als completed
    await fetch('/api/lesson/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson.id,
        reflectionAnswer,
        depthAccessed: showDepth,
      }),
    })

    setStep('completed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
      <audio ref={audioRef} className="hidden" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro */}
        {step === 'intro' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {lesson.title}
            </h1>
            <p className="text-lg text-gray-700 mb-6">{variant.introText}</p>

            {profile.groep >= 4 && characters[0]?.elevenLabsVoiceId && (
              <button
                onClick={() => playTTS(variant.introText, characters[0].elevenLabsVoiceId)}
                className="bg-primary-100 hover:bg-primary-200 px-4 py-2 rounded-lg mb-6 transition"
              >
                🔊 Luister
              </button>
            )}

            <button
              onClick={() => setStep('core')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Begin de les →
            </button>
          </div>
        )}

        {/* Core content */}
        {step === 'core' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lesson.title}
              </h2>

              <div
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: variant.coreContent }}
              />

              {variant.coreImage && typeof variant.coreImage === 'object' && 'url' in variant.coreImage && (
                <div className="my-6">
                  <img
                    src={variant.coreImage.url}
                    alt={lesson.title}
                    className="rounded-lg w-full"
                  />
                  {variant.coreImageCredit && (
                    <p className="text-xs text-gray-500 mt-2">
                      Bron: {variant.coreImageCredit}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('chat')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Verder →
            </button>
          </div>
        )}

        {/* Character chat */}
        {step === 'chat' && characters[0] && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              {characters[0].avatar && typeof characters[0].avatar === 'object' && 'url' in characters[0].avatar && (
                <img
                  src={characters[0].avatar.url}
                  alt={characters[0].name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Praat met {characters[0].name}
                </h3>
                <p className="text-gray-600">{characters[0].personaDescription}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
              {chatMessages.length === 0 && (
                <p className="text-gray-500 text-center">
                  Stel een vraag aan {characters[0].name}!
                </p>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type je vraag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-lg transition ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>

              <button
                onClick={sendMessage}
                disabled={!chatInput.trim() || isSending}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition"
              >
                Stuur
              </button>
            </div>

            <button
              onClick={() => setStep('depth-prompt')}
              className="w-full mt-6 bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Klaar met chatten →
            </button>
          </div>
        )}

        {/* Depth prompt */}
        {step === 'depth-prompt' && !showDepth && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Wil je meer weten?
            </h2>
            <p className="text-gray-600 mb-6">
              Ontdek nog meer over dit onderwerp en verdien extra punten!
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={unlockDepth}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Ja, vertel meer! (+{variant.pointsDepthBonus} punten)
              </button>

              <button
                onClick={() => {
                  setEarnedPoints(variant.pointsBase)
                  setStep('reflection')
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-3 rounded-lg font-semibold transition"
              >
                Nee, verder gaan
              </button>
            </div>
          </div>
        )}

        {/* Depth content */}
        {showDepth && step === 'depth-prompt' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verdieping
              </h2>

              <div
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: variant.depthContent }}
              />

              {variant.depthImage && typeof variant.depthImage === 'object' && 'url' in variant.depthImage && (
                <div className="my-6">
                  <img
                    src={variant.depthImage.url}
                    alt="Verdieping"
                    className="rounded-lg w-full"
                  />
                  {variant.depthImageCredit && (
                    <p className="text-xs text-gray-500 mt-2">
                      Bron: {variant.depthImageCredit}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('reflection')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Verder →
            </button>
          </div>
        )}

        {/* Reflection */}
        {step === 'reflection' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tijd om na te denken
            </h2>

            <p className="text-lg text-gray-700 mb-6">
              {variant.reflectionQuestion}
            </p>

            <textarea
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
              placeholder="Schrijf hier je antwoord..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
            />

            <button
              onClick={completeLesson}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Les afronden
            </button>
          </div>
        )}

        {/* Completed */}
        {step === 'completed' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Goed gedaan!
            </h2>

            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Verdiend in deze les
              </div>
              <div className="text-4xl font-bold text-primary-600">
                +{earnedPoints} punten
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Totaal punten</div>
              <div className="text-2xl font-bold text-gray-900">
                {profile.points_total + earnedPoints}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Terug naar dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
