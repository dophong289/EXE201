import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi, productApi } from '../services/api'
import ImageWithFallback from './ImageWithFallback'
import '../styles/components/ChatBox.css'

// Helper function to format message content with line breaks and basic formatting
const formatMessage = (content) => {
  if (!content) return content

  // Process each line separately
  const lines = content.split('\n')

  return lines.map((line, index) => {
    // Handle bold text with ** markers
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const formattedParts = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    return (
      <span key={index}>
        {formattedParts}
        {index < lines.length - 1 && <br />}
      </span>
    )
  })
}

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của Gói Mây. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, set quà tặng và đặc sản của chúng tôi. Bạn cần tư vấn gì không? 😊'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Load products để AI có thể tham khảo
    loadProducts()
  }, [])

  useEffect(() => {
    // Auto scroll to bottom khi có message mới
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input khi mở chat
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300)
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll(0, 100) // Lấy tất cả sản phẩm
      const productsList = response.data.content || response.data || []
      setProducts(productsList)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Thêm user message
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Gửi message đến backend AI
      const response = await chatApi.sendMessage(userMessage, products)
      const aiResponse = response.data.message || response.data.response || 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.'

      setMessages([...newMessages, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi qua hotline.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
    // Trigger send after a short delay
    setTimeout(() => {
      const form = document.querySelector('.chat-input-form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  return (
    <>
      {/* Chat Button - Cục tròn cố định góc dưới phải (không di chuyển) */}
      {!isOpen && (
        <motion.button
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          initial={false}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Mở chat"
        >
          <ImageWithFallback
            src="/Logo-Gói-Mây.png"
            alt="Gói Mây"
            className="chat-toggle-logo"
            onError={(e) => {
              // Nếu logo lỗi, ẩn ảnh để tránh icon lỗi
              e.currentTarget.style.display = 'none'
            }}
          />
          {messages.length > 1 && (
            <span className="chat-notification-badge">{messages.length - 1}</span>
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <ImageWithFallback
                    src="/Logo-Gói-Mây.png"
                    alt="Gói Mây"
                    className="chat-avatar-image"
                    onError={(e) => {
                      // Nếu logo lỗi, ẩn ảnh để tránh icon lỗi
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <h3>Trợ lý Gói Mây</h3>
                  <p>Đang trực tuyến</p>
                </div>
              </div>
              <button
                type="button"
                className="chat-close-btn"
                aria-label="Đóng chat"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`chat-message ${message.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="message-content">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  className="chat-message assistant loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-content">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="quick-questions">
                <p>Câu hỏi thường gặp:</p>
                <div className="quick-question-buttons">
                  <button onClick={() => handleQuickQuestion('Bạn có những set quà nào?')}>
                    Set quà nào có sẵn?
                  </button>
                  <button onClick={() => handleQuickQuestion('Giá cả như thế nào?')}>
                    Giá cả ra sao?
                  </button>
                  <button onClick={() => handleQuickQuestion('Có giao hàng không?')}>
                    Có giao hàng không?
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form className="chat-input-form" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={loading}
              />
              <button type="submit" disabled={!inputValue.trim() || loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBox
