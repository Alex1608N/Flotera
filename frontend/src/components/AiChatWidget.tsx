import { useState, useRef, useEffect } from 'react';                                                                             
    import axios from 'axios';                                                                                                              
    import { MessageSquare, X, Send, Bot } from 'lucide-react';                                                                             
                                                                                                                                            
    interface Message {                                                                                                                     
        sender: 'user' | 'bot';                                                                                                             
        text: string;                                                                                                                       
    }                                                                                                                                       
                                                                                                                                            
    export default function AiChatWidget() {                                                                                                
        const [isOpen, setIsOpen] = useState(false);                                                                                        
        const [messages, setMessages] = useState<Message[]>([                                                                               
            { sender: 'bot', text: 'Salut! Sunt asistentul AI Flotera. Cu ce te pot ajuta astazi?' }                                           
        ]);                                                                                                                                 
        const [input, setInput] = useState('');                                                                                             
        const [isLoading, setIsLoading] = useState(false);                                                                                  
                                                                                                                                            
        // Ref pentru a face scroll automat la ultimul mesaj                                                                                
        const messagesEndRef = useRef<HTMLDivElement>(null);                                                                                
                                                                                                                                            
        const scrollToBottom = () => {                                                                                                      
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });                                                                 
        };                                                                                                                                  
                                                                                                                                            
        // Apelăm scroll-ul automat de fiecare dată când se schimbă lista de mesaje sau starea de încărcare                                 
        useEffect(() => {                                                                                                                   
            scrollToBottom();                                                                                                               
        }, [messages, isLoading]);                                                                                                          
                                                                                                                                            
        const handleSend = async () => {                                                                                                    
            if (!input.trim() || isLoading) return;                                                                                         
                                                                                                                                            
            const userText = input;                                                                                                         
            setInput('');                                                                                                                   
                                                                                                                                            
            setMessages((prev) => [...prev, { sender: 'user', text: userText }]);                                                           
            setIsLoading(true);                                                                                                             
                                                                                                                                            
            try {                                                                                                                           
                const response = await axios.post('http://localhost:8080/api/ai/chat', {                                                    
                    message: userText                                                                                                       
                });                                                                                                                         
                                                                                                                                            
                setMessages((prev) => [...prev, { sender: 'bot', text: response.data }]);                                                   
            } catch (error) {                                                                                                               
                console.error('Eroare la trimiterea mesajului: ', error);                                                                   
                setMessages((prev) => [                                                                                                     
                    ...prev,                                                                                                                
                    { sender: 'bot', text: 'Ne pare rău, a apărut o eroare la conexiunea cu asistentul AI.' }                               
                ]);                                                                                                                         
            } finally {                                                                                                                     
                setIsLoading(false);                                                                                                        
            }                                                                                                                               
        };                                                                                                                                  
                                                                                                                                            
        return (                                                                                                                            
            <div className="fixed bottom-6 right-6 z-50 font-sans">                                                                         
                {/* 1. FERESTRA DE CHAT (când isOpen este TRUE) */}                                                                         
                {isOpen ? (                                                                                                                 
                    <div className="w-80 sm:w-96 h-[480px] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col     
  overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">                                                         
                                                                                                                                            
                        {/* Antetul Chatului (Header) */}                                                                                   
                        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">                      
                            <div className="flex items-center gap-2">                                                                       
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">                           
                                    <Bot size={18} className="text-white" />                                                                
                                </div>                                                                                                      
                                <div>                                                                                                       
                                    <h3 className="font-bold text-sm text-white leading-none">Copilot Flotera</h3>                          
                                    <span className="text-[10px] text-green-400 flex items-center gap-1 mt-1">                              
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>                       
                                        Activ                                                                                               
                                    </span>                                                                                                 
                                </div>                                                                                                      
                            </div>                                                                                                          
                            <button                                                                                                         
                                onClick={() => setIsOpen(false)}                                                                            
                                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"             
                            >                                                                                                               
                                <X size={18} />                                                                                             
                            </button>                                                                                                       
                        </div>                                                                                                              
                                                                                                                                            
                        {/* Zona cu mesaje (Messages Area) */}                                                                              
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">                     
                            {messages.map((msg, index) => (                                                                                 
                                <div                                                                                                        
                                    key={index}                                                                                             
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}                           
                                >                                                                                                           
                                    <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm shadow-md ${                               
                                        msg.sender === 'user'                                                                               
                                            ? 'bg-blue-600 text-white rounded-tr-none'                                                      
                                            : 'bg-slate-900 text-slate-100 border border-slate-800/80 rounded-tl-none'                      
                                    }`}>                                                                                                    
                                        {msg.text}                                                                                          
                                    </div>                                                                                                  
                                </div>                                                                                                      
                            ))}                                                                                                             
                                                                                                                                            
                            {/* Indicator de loading când AI-ul se gândește */}                                                             
                            {isLoading && (                                                                                                 
                                <div className="flex justify-start">                                                                        
                                    <div className="bg-slate-900 border border-slate-800/80 text-slate-300 px-3.5 py-2.5 rounded-2xl        
  rounded-tl-none shadow-md flex items-center gap-1">                                                                                       
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce duration-300"></span>         
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce duration-300 delay-           
  100"></span>                                                                                                                              
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce duration-300 delay-           
  200"></span>                                                                                                                              
                                    </div>                                                                                                  
                                </div>                                                                                                      
                            )}                                                                                                              
                            <div ref={messagesEndRef} />                                                                                    
                        </div>                                                                                                              
                                                                                                                                            
                        {/* Zona de input (Input Area) */}                                                                                  
                        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">                                
                            <input                                                                                                          
                                type="text"                                                                                                 
                                value={input}                                                                                               
                                onChange={(e) => setInput(e.target.value)}                                                                  
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}                                                        
                                placeholder="Adresează o întrebare despre flotă..."                                                         
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100        
  placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"                        
                                disabled={isLoading}                                                                                        
                            />                                                                                                              
                            <button                                                                                                         
                                onClick={handleSend}                                                                                        
                                disabled={isLoading}                                                                                        
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl active:scale-95 transition-all           
  disabled:opacity-50 flex items-center justify-center"                                                                                     
                            >                                                                                                               
                                <Send size={16} />                                                                                          
                            </button>                                                                                                       
                        </div>                                                                                                              
                                                                                                                                            
                    </div>                                                                                                                  
                ) : (                                                                                                                       
                    /* 2. BULA DE CHAT (când isOpen este FALSE) */                                                                          
                    <button                                                                                                                 
                        onClick={() => setIsOpen(true)}                                                                                     
                        className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white     
  rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"                     
                    >                                                                                                                       
                        <MessageSquare size={24} />                                                                                         
                    </button>                                                                                                               
                )}                                                                                                                          
            </div>                                                                                                                          
        );                                                                                                                                  
    }                                           