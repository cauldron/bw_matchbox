#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""DARE webapp.

Usage:
  dare_webapp [--port=<port>] [--localhost]
  dare_webapp -h | --help
  dare_webapp --version

Options:
  --localhost   Only allow connections from this computer.
  -h --help     Show this screen.
  --version     Show version.

"""
from docopt import docopt
from dare_browser.webapp import dare_app


def main():
    args = docopt(__doc__, version="dare webapp 1.0")
    port = int(args.get("--port", False) or 5000)
    host = "localhost" if args.get("--localhost", False) else "0.0.0.0"

    print("dare webapp started on {}:{}".format(host, port))

    dare_app.run(host=host, port=port, debug=True)


if __name__ == "__main__":
    main()
