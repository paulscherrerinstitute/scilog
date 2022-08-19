import urllib
from typing import Tuple

import requests


class PSIWebpageIconExtractor:
    def __init__(self, url: str, subpage: str, filename: str) -> None:
        self.url = url
        self.subpage = subpage
        self.filename = filename
        self.filepath = None
        self.content = None
        self.get_primer_image()

    @staticmethod
    def _get_webpage_content(url: str) -> str:
        res = requests.get(url)
        return res.text

    def _find_primer_position(self) -> Tuple:
        start_pos_primer = self.content.find(
            "field--name-primer-media"
        )  # "media--type-primer-image media")
        start_pos_img = self.content[start_pos_primer:].find("<img") + start_pos_primer
        end_pos_img = self.content[start_pos_img:].find(">") + start_pos_img
        return (start_pos_img, end_pos_img)

    def _get_primer_src(self) -> str:
        start, stop = self._find_primer_position()
        return self.content[start:stop]

    def get_primer_image(self):
        self.content = self._get_webpage_content(self.url + self.subpage)
        img_src = self._get_primer_src().split("src=")[1].split('"')[1].split("?")[0]
        urllib.request.urlretrieve(self.url + img_src, self.filename + ".png")
        print("done")
        self.filepath = self.filename + ".png"


if __name__ == "__main__":
    extractor = PSIWebpageIconExtractor("https://www.psi.ch/", "en/sls/superxas", "superxas")
