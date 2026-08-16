import json
from app import app


def test_api_compare():
    client = app.test_client()
    # request compare for product id 1
    res = client.post('/api/compare', json={'ids':[1]})
    assert res.status_code == 200
    data = res.get_json()
    assert 'products' in data
    assert isinstance(data['products'], list)
    assert len(data['products']) >= 1


def test_api_ai_chat_demo():
    client = app.test_client()
    # ensure demo mode works without env vars
    payload = {'messages':[{'role':'user','content':'¿Cuál es el precio?'}], 'mode':'demo'}
    res = client.post('/api/ai_chat_v2', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert 'reply' in data
    assert data.get('source') == 'demo'
