#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""bw_matchbox webapp.

Usage:
  matchbox_webapp [--port=<port>] [--localhost]
  matchbox_webapp -h | --help
  matchbox_webapp --version

Options:
  --localhost   Only allow connections from this computer.
  -h --help     Show this screen.
  --version     Show version.

"""
from docopt import docopt
from bw_matchbox.webapp import matchbox_app


def main():
    args = docopt(__doc__, version="bw_matchbox app 1.0")
    port = int(args.get("--port", False) or 5000)
    host = "localhost" if args.get("--localhost", False) else "0.0.0.0"

    print("bw_matchbox webapp started on {}:{}".format(host, port))

    matchbox_app.run(host=host, port=port, debug=True)


if __name__ == "__main__":
    main()
