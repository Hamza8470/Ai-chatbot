exports.handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    const baseUrl = process.env.OPENAI_BASE_URL;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!baseUrl || !apiKey) {
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'AI service not available. Please try again later.' })
      };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: payload.messages || [],
        temperature: payload.temperature || 0.7,
        max_tokens: payload.max_tokens || 1500
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
};
