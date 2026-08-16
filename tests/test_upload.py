import io
import os
from app import app


def test_upload_images_as_admin(tmp_path):
    client = app.test_client()
    # set session to admin
    with client.session_transaction() as sess:
        sess['usuario_id'] = 1
        sess['rol'] = 'admin'
    # create a fake image
    data = {
        'images': (io.BytesIO(b'fakeimagecontent'), 'test.jpg')
    }
    res = client.post('/producto/1/upload_images', content_type='multipart/form-data', data=data)
    # Allow either 200 or 201 depending on implementation
    assert res.status_code in (200, 201)
    json = res.get_json()
    assert 'added' in json
    # if added, ensure list or empty
    assert isinstance(json['added'], list)
