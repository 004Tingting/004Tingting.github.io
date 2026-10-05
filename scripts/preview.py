"""支持 clean URL 的静态预览服务器。

用法：python scripts/preview.py [port]
模拟 GitHub Pages 行为：/blog/hello-world -> out/blog/hello-world.html
"""

import http.server
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "out"))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        p = super().translate_path(path)
        if os.path.isfile(p) or path.endswith("/"):
            return p
        # clean URL：无后缀路径尝试 .html 映射
        candidate = p + ".html"
        if os.path.isfile(candidate):
            return candidate
        return p


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"preview serving {ROOT} at http://localhost:{port}")
    http.server.test(HandlerClass=CleanURLHandler, port=port)
