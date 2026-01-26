import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi, productApi } from '../services/api'
import '../styles/components/ChatBox.css'

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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatWindowRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    // Load products để AI có thể tham khảo
    loadProducts()
    
    // Load saved position từ localStorage hoặc set default (góc phải dưới)
    const savedPosition = localStorage.getItem('chatbox_position')
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition)
        // Validate position vẫn trong viewport
        const maxX = window.innerWidth - 380
        const maxY = window.innerHeight - 600
        setPosition({
          x: Math.max(0, Math.min(pos.x, maxX)),
          y: Math.max(0, Math.min(pos.y, maxY))
        })
      } catch (e) {
        console.error('Error loading chatbox position:', e)
        // Default: góc phải dưới
        setPosition({ 
          x: Math.max(0, window.innerWidth - 400), 
          y: Math.max(0, window.innerHeight - 650)
        })
      }
    } else {
      // Default: góc phải dưới
      setPosition({ 
        x: Math.max(0, window.innerWidth - 400), 
        y: Math.max(0, window.innerHeight - 650)
      })
    }

    // Handle window resize để giữ chatbox trong viewport
    const handleResize = () => {
      setPosition(prev => {
        const maxX = window.innerWidth - 380
        const maxY = window.innerHeight - 600
        return {
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY))
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Save position to localStorage khi thay đổi
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('chatbox_position', JSON.stringify(position))
    }
  }, [position])

  // Handle drag
  const handleMouseDown = (e) => {
    // Chỉ drag khi click vào header, không phải các element con
    if (e.target.closest('.chat-header') && !e.target.closest('button') && !e.target.closest('input')) {
      setIsDragging(true)
      const rect = chatWindowRef.current?.getBoundingClientRect()
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
      e.preventDefault()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !chatWindowRef.current) return
      
      const rect = chatWindowRef.current.getBoundingClientRect()
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Giới hạn trong viewport
      const maxX = window.innerWidth - rect.width
      const maxY = window.innerHeight - rect.height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, dragStart])

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
      {/* Chat Button - Hình tròn ở góc phải dưới */}
      <motion.button
        ref={buttonRef}
        className={`chat-toggle-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
        animate={{
          scale: isOpen ? 0.9 : 1,
          rotate: isOpen ? 180 : 0
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở chat"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
            <line x1="12" y1="7" x2="12" y2="13"/>
          </svg>
        )}
        {!isOpen && messages.length > 1 && (
          <span className="chat-notification-badge">{messages.length - 1}</span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            className="chat-window"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              cursor: isDragging ? 'grabbing' : 'default'
            }}
          >
            {/* Chat Header */}
            <div 
              className="chat-header"
              onMouseDown={handleMouseDown}
              style={{ cursor: 'grab' }}
            >
              <div className="chat-header-info">
                <div className="chat-avatar">🤖</div>
                <div>
                  <h3>Trợ lý Gói Mây</h3>
                  <p>Đang trực tuyến</p>
                </div>
              </div>
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
                    {message.content}
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
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
