#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""bw_matchbox scripts.

Usage:
  matchbox setup
  matchbox example_project [<project_name>]
  matchbox webapp <config> [--port=<port>] [--localhost]

Options:
  -h --help     Show this screen.
  --version     Show version.

"""
from bw_matchbox.webapp import matchbox_app, configure_app
from docopt import docopt
from pathlib import Path
import bw2data as bd
import bw2io as bi
import datetime
import json


CWD = Path.cwd()

CONFIG_TEMPLATE = """[users]
johnny = "mnemonic"

[files]
directories = []
changes_file = "{}"
"""

CHANGES_TEMPLATE = {
    "name": "<change-this-please>",
    "licenses": [
        {
            "name": "CC BY 4.0",
            "path": "https://creativecommons.org/licenses/by/4.0/",
            "title": "Creative Commons Attribution 4.0 International"
        }
    ],
    "version": "1.0.0",
    "description": "<change-this-please>",
    "created": None,
    "contributors": [
        {
          "title": "<change-this-please>",
          "path": "<change-this-please>",
          "role": "author"
        }
    ],
    "create-datasets": [],
    "create-exchanges": [],
    "delete": [],
    "disaggregate": [],
    "replace": [],
    "update": []
}


def create_setup_files(filename, changesfile):
    if not filename.lower().endswith(".toml"):
        filename += ".toml"
    if not changesfile.lower().endswith(".json"):
        changesfile += ".json"
    with open(CWD / filename, "w") as f:
        f.write(CONFIG_TEMPLATE.format(CWD / changesfile))
        print("Created config file {}".format(CWD / filename))
    with open(CWD / changesfile, "w") as f:
        CHANGES_TEMPLATE['created'] = datetime.datetime.now().isoformat()
        json.dump(CHANGES_TEMPLATE, f, ensure_ascii=False, indent=2)
        print("Created changes file {}".format(CWD / changesfile))


def main():
    args = docopt(__doc__, version="bw_matchbox app 1.0")

    if args['setup']:
        create_setup_files("config.toml", "changes.json")
    elif args['example_project']:
        name = args['<project_name>'] or 'matchbox-example'
        bi.install_project('USEEIO-1.1', name)
        bd.projects.set_current(name)
        bd.Database("USEEIO-1.1").copy("USEEIO-copy")
        print(f"Create project {name}. Make sure to select `USEEIO-1.1` for one database and `USEEIO-copy` for the other.")
    elif args['webapp']:
        filepath = args['<config>']
        port = int(args.get("--port", False) or 5000)
        host = "localhost" if args.get("--localhost", False) else "0.0.0.0"

        app = configure_app(filepath, matchbox_app)

        print("bw_matchbox webapp started on {}:{}".format(host, port))
        app.run(host=host, port=port, debug=True)


if __name__ == "__main__":
    main()
