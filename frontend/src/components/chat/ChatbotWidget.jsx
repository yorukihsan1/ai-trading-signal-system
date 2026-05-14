import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './ChatbotWidget.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SUGGESTIONS_POOL = [
  "RSI indikatörü nasıl kullanılır?",
  "MACD ile nasıl al-sat sinyali üretilir?",
  "İkili Tepe formasyonu nedir?",
  "Destek ve direnç seviyeleri nasıl belirlenir?",
  "Bitcoin'in güncel durumu hakkında ne düşünüyorsun?",
  "Order Block (Emir Bloğu) nedir?",
  "Hareketli ortalamalar (SMA/EMA) arasındaki fark nedir?",
  "Likidite avı (Liquidity Sweep) ne demek?",
  "Omuz Baş Omuz (OBO) formasyonu nasıl yorumlanır?",
  "Risk/Ödül (R/R) oranı neden önemlidir?",
  "Fibonacci düzeltme seviyeleri nasıl çizilir?",
  "Golden Cross ve Death Cross nedir?",
  "Ayı ve Boğa piyasası arasındaki temel farklar nelerdir?",
  "Stop-Loss (Zarar Kes) emri nereye konulmalı?"
];

const ChatbotWidget = ({ currentTicker }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Merhaba! Ben AI Trading Asistanıyım. Finansal piyasalar, teknik analiz ve formasyonlarla ilgili sorularınızı cevaplayabilirim. Size nasıl yardımcı olabilirim?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (messages.length === 1) {
        const shuffled = [...SUGGESTIONS_POOL].sort(() => 0.5 - Math.random());
        setQuickQuestions(shuffled.slice(0, 3));
      }
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
            message: text,
            context: currentTicker || "Genel piyasa"
        }),
      });

      if (!response.ok) {
        throw new Error("Asistan yanıt veremedi.");
      }

      const data = await response.json();
      
      const botMessage = { id: Date.now() + 1, text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen sistem yapılandırmanızı (API Key) kontrol edin.", sender: 'bot', isError: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessage(inputText);
  };

  const handleQuickQuestionClick = (question) => {
    sendMessage(question);
  };

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Bot size={20} className="chatbot-icon" />
              <span>AI Asistan</span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message-avatar"><Bot size={16} /></div>
                <div className="message-bubble loading-bubble">
                  <div className="dot-flashing"></div>
                </div>
              </div>
            )}
            
            {messages.length === 1 && !isLoading && (
              <div className="quick-questions-container">
                <p className="quick-questions-title">Önerilen Sorular:</p>
                <div className="quick-questions-list">
                  {quickQuestions.map((q, idx) => (
                    <button 
                      key={idx} 
                      className="quick-question-btn"
                      onClick={() => handleQuickQuestionClick(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Bir soru sorun... (Örn: İkili Tepe nedir?)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!inputText.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
