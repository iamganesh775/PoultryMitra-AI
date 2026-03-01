import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Volume2, Loader } from 'lucide-react';

const VoiceAdvisory = () => {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/voice-advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: i18n.language }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Failed to get voice response:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (response?.audioUrl) {
      const audio = new Audio(response.audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Voice Advisory</h2>
      
      <div className="card">
        <div className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question..."
            className="w-full border rounded-lg p-3"
            rows={4}
          />
          <button onClick={handleAsk} disabled={loading} className="btn-primary">
            <Mic className="inline mr-2 h-5 w-5" />
            {loading ? 'Processing...' : 'Ask'}
          </button>
        </div>

        {response && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p>{response.text}</p>
            </div>
            <button onClick={playAudio} disabled={isPlaying} className="btn-secondary">
              <Volume2 className="inline mr-2 h-5 w-5" />
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAdvisory;
