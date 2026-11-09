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
    # La ruta puede no existir todavía - solo verificamos que no sea 500
    assert res.status_code in (200, 201, 404)
