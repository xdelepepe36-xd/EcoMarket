"""
Simple local AI mock server for LOCAL_AI_MODEL testing.
Run: python scripts/local_ai_mock.py

Accepts POST /generate with JSON {messages: [...]}
Returns: {reply: "..."}
"""
from flask import Flask, request, jsonify
app = Flask('local_ai_mock')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    messages = data.get('messages') or []
    last_user = ''
    for m in reversed(messages):
        if m.get('role') == 'user':
            last_user = m.get('content','')
            break
    reply = 'Mock reply: ' + (last_user[:200] if last_user else 'Hola desde modelo local')
    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(port=5005, host='127.0.0.1')
