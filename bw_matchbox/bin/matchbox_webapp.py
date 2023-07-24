#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""bw_matchbox webapp.

Usage:
  matchbox_webapp <config> [--port=<port>] [--localhost]
  matchbox_webapp -h | --help
  matchbox_webapp --version

Options:
  --localhost   Only allow connections from this computer.
  -h --help     Show this screen.
  --version     Show version.

"""
from bw_matchbox.webapp import matchbox_app
from docopt import docopt
from pathlib import Path
from werkzeug.security import generate_password_hash
import json
import tomli


def main():
    args = docopt(__doc__, version="bw_matchbox app 1.0")
    try:
        config_fp = Path(args['<config>'])
        assert config_fp.exists
        with open(config_fp, "rb") as f:
            config = tomli.load(f)
        assert 'users' in config
    except:
        raise ValueError("Invalid or unreadable config file")

    port = int(args.get("--port", False) or 5000)
    host = "localhost" if args.get("--localhost", False) else "0.0.0.0"

    matchbox_app.config["mb_users"] = {
        user: generate_password_hash(password)
        for user, password in config['users'].items()
    }
    matchbox_app.config["mb_changes_file"] = config['files']['changes_file']
    try:
        json.load(open(matchbox_app.config["mb_changes_file"], "rb"))
    except:
        raise ValueError("Can't read changes file")

    print("bw_matchbox webapp started on {}:{}".format(host, port))
    matchbox_app.run(host=host, port=port, debug=True)


if __name__ == "__main__":
    main()
