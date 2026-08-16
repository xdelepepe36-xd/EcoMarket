# Minimal shim for PIL used in test environment when Pillow isn't installed.
# Provides a lightweight Image interface used by parts of the app during tests.
class Image:
    @staticmethod
    def open(fp):
        # Return a simple file-like wrapper; no actual image ops performed in tests
        class Img:
            def __init__(self, fp):
                self.fp = fp
            def save(self, path, format=None):
                # Copy bytes if file-like
                try:
                    # If fp is a path
                    if isinstance(self.fp, str):
                        with open(self.fp, 'rb') as src, open(path, 'wb') as dst:
                            dst.write(src.read())
                    else:
                        self.fp.seek(0)
                        with open(path, 'wb') as dst:
                            dst.write(self.fp.read())
                except Exception:
                    # create empty file as placeholder
                    open(path, 'wb').close()
        return Img(fp)

    @staticmethod
    def new(mode, size, color=0):
        # create a blank bytes file as placeholder
        class Img:
            def save(self, path, format=None):
                open(path, 'wb').close()
        return Img()

# compatibility import
from .__init__ import Image
