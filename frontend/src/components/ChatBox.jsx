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
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatWindowRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    // Load products để AI có thể tham khảo
    loadProducts()
    
    // Load saved button position từ localStorage hoặc set default (góc phải dưới)
    const savedPosition = localStorage.getItem('chatbox_button_position')
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition)
        // Validate position vẫn trong viewport (nút tròn 60px)
        const maxX = window.innerWidth - 60
        const maxY = window.innerHeight - 60
        setButtonPosition({
          x: Math.max(0, Math.min(pos.x, maxX)),
          y: Math.max(0, Math.min(pos.y, maxY))
        })
      } catch (e) {
        console.error('Error loading chatbox button position:', e)
        // Default: góc phải dưới
        setButtonPosition({ 
          x: 0, // right: 2rem = 32px
          y: 0  // bottom: 2rem = 32px
        })
      }
    } else {
      // Default: góc phải dưới (sử dụng right/bottom CSS)
      setButtonPosition({ 
        x: 0,
        y: 0
      })
    }

    // Handle window resize để giữ button trong viewport
    const handleResize = () => {
      setButtonPosition(prev => {
        const maxX = window.innerWidth - 60
        const maxY = window.innerHeight - 60
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
    // Save button position to localStorage khi thay đổi
    localStorage.setItem('chatbox_button_position', JSON.stringify(buttonPosition))
  }, [buttonPosition])

  // Handle drag cho nút tròn
  const handleButtonMouseDown = (e) => {
    // Chỉ drag khi chat đóng và click vào button
    if (!isOpen && e.target.closest('.chat-toggle-button')) {
      // Kiểm tra xem có click vào icon không (không drag nếu click vào icon)
      const isClickOnIcon = e.target.tagName === 'svg' || e.target.closest('svg')
      if (!isClickOnIcon) {
        setIsDragging(true)
        const rect = buttonRef.current?.getBoundingClientRect()
        if (rect) {
          setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          })
        }
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !buttonRef.current) return
      
      const rect = buttonRef.current.getBoundingClientRect()
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Giới hạn trong viewport (nút tròn 60px)
      const maxX = window.innerWidth - 60
      const maxY = window.innerHeight - 60
      
      setButtonPosition({
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

  // Tính toán vị trí cửa sổ chat dựa trên vị trí nút
  const getChatWindowPosition = () => {
    if (!buttonRef.current) {
      // Fallback: góc phải dưới
      return {
        left: 'auto',
        right: '2rem',
        top: 'auto',
        bottom: 'calc(2rem + 60px + 10px)'
      }
    }
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const chatWidth = 380
    const chatHeight = 600
    const spacing = 10
    
    // Tính toán vị trí: ưu tiên mở ở trên và bên trái nút
    let x = buttonRect.left - chatWidth - spacing
    let y = buttonRect.top - chatHeight - spacing
    
    // Nếu không đủ chỗ bên trái, mở bên phải
    if (x < spacing) {
      x = buttonRect.right + spacing
    }
    
    // Nếu không đủ chỗ phía trên, mở phía dưới
    if (y < spacing) {
      y = buttonRect.bottom + spacing
    }
    
    // Đảm bảo trong viewport
    const maxX = window.innerWidth - chatWidth - spacing
    const maxY = window.innerHeight - chatHeight - spacing
    
    const finalX = Math.max(spacing, Math.min(x, maxX))
    const finalY = Math.max(spacing, Math.min(y, maxY))
    
    return {
      left: `${finalX}px`,
      top: `${finalY}px`,
      right: 'auto',
      bottom: 'auto'
    }
  }

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
      {/* Chat Button - Hình tròn có thể di chuyển */}
      <motion.button
        ref={buttonRef}
        className={`chat-toggle-button ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={(e) => {
          // Chỉ toggle khi không đang drag và không phải đang drag
          if (!isDragging) {
            setIsOpen(!isOpen)
          }
        }}
        onMouseDown={(e) => {
          // Chỉ drag khi chat đóng
          if (!isOpen) {
            handleButtonMouseDown(e)
          }
        }}
        initial={false}
        animate={{
          scale: isOpen ? 0.9 : 1,
          rotate: isOpen ? 180 : 0,
          x: buttonPosition.x,
          y: buttonPosition.y
        }}
        whileHover={{ scale: isDragging ? 1 : 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở chat"
        style={{
          position: 'fixed',
          bottom: buttonPosition.x === 0 && buttonPosition.y === 0 ? '2rem' : 'auto',
          right: buttonPosition.x === 0 && buttonPosition.y === 0 ? '2rem' : 'auto',
          left: buttonPosition.x !== 0 || buttonPosition.y !== 0 ? `${buttonPosition.x}px` : 'auto',
          top: buttonPosition.x !== 0 || buttonPosition.y !== 0 ? `${buttonPosition.y}px` : 'auto',
          cursor: isDragging ? 'grabbing' : (isOpen ? 'pointer' : 'grab')
        }}
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
              scale: 1
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={(() => {
              const pos = getChatWindowPosition()
              return {
                position: 'fixed',
                left: pos.left,
                top: pos.top,
                right: pos.right,
                bottom: pos.bottom
              }
            })()}
          >
            {/* Chat Header */}
            <div className="chat-header">
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
