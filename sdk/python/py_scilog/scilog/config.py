from pathlib import Path
import json


class Config(dict):

    def __init__(self, fname, folder=None):
        if folder is not None:
            folder = Path(folder)
        else:
            folder = Path.home()
        self.fname = folder / fname
        content = self._load()
        super().__init__(content)

    def __setitem__(self, name, value):
        self.update(**{name: value})

    def update(self, **kwargs):
        super().update(**kwargs)
        self._save()

    def _load(self):
        fn = self.fname
        if fn.exists():
            return json_load(fn)
        else:
            return {}

    def _save(self):
        json_save(self, self.fname)

    def delete(self):
        self.fname.unlink()



def json_save(what, filename, *args, indent=4, sort_keys=True, **kwargs):
    with open(filename, "w") as f:
        json.dump(what, f, *args, indent=indent, sort_keys=sort_keys, **kwargs)

def json_load(filename, *args, **kwargs):
    with open(filename, "r") as f:
        return json.load(f, *args, **kwargs)



