// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // السماح فقط بطلبات POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // استلام الرسالة من المستخدم
        const { message } = JSON.parse(event.body);
        
        // API Key من المتغيرات البيئية - غير ظاهر للمستخدم
        const API_KEY = process.env.DEEPSEEK_API_KEY;
        
        if (!API_KEY) {
            throw new Error('API Key not configured');
        }
        
        // الاتصال بـ DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { 
                        role: "system", 
                        content: "أنت مساعد تعليمي ذكي متخصص في مساعدة الطلاب. تتحدث باللغة العربية الفصحى. أجيب على أسئلة الطلاب الدراسية بدقة وبطريقة مبسطة." 
                    },
                    { 
                        role: "user", 
                        content: message 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }
        
        const reply = data.choices[0].message.content;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ reply: reply })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'حدث خطأ في معالجة طلبك',
                details: error.message 
            })
        };
    }
};
