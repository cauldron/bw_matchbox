#!/usr/bin/env python
# -*- coding: utf-8 -*-
# flake8: noqa
"""bw_matchbox scripts.

Usage:
  matchbox setup [<output_dir>]
  matchbox webapp <config> [--port=<port>] [--localhost]

Options:
  -h --help     Show this screen.
  --version     Show version.

"""
from pathlib import Path

# import bw2data as bd
# import bw2io as bi
from docopt import docopt

from bw_matchbox.webapp import configure_app, matchbox_app

CWD = Path.cwd()

CONFIG_TEMPLATE = """[users]
johnny = "mnemonic"

[roles]
editors = ["johnny"]

[configs]
my_config = { project = "something", source = "database A", target = "database B", proxy = "database C" }

[files]
output_dir = "{o}"
"""

CHANGES_TEMPLATE = {
    "name": "<change-this-please>",
    "licenses": [
        {
            "name": "CC BY 4.0",
            "path": "https://creativecommons.org/licenses/by/4.0/",
            "title": "Creative Commons Attribution 4.0 International",
        }
    ],
    "version": "1.0.0",
    "description": "<change-this-please>",
    "created": None,
    "contributors": [
        {
            "title": "<change-this-please>",
            "path": "<change-this-please>",
            "role": "author",
        }
    ],
    "create-datasets": [],
    "create-exchanges": [],
    "delete": [],
    "disaggregate": [],
    "replace": [],
    "update": [],
}


def create_setup_files(filename, output_dir):
    if not filename.lower().endswith(".toml"):
        filename += ".toml"
    with open(CWD / filename, "w", newline="\n") as f:
        data = CONFIG_TEMPLATE.replace("{o}", str(output_dir).replace("\\", "/"))
        f.write(data)
        print("Created config file {}".format(CWD / filename))


def main():
    args = docopt(__doc__, version="bw_matchbox app 1.0")

    if args["setup"]:
        output_dir = args["<output_dir>"] or CWD
        create_setup_files("config.toml", Path(output_dir).resolve())
    # elif args["example_project"]:
    #     name = args["<project_name>"] or "matchbox-example"
    #     bi.install_project("USEEIO-1.1", name)
    #     bd.projects.set_current(name)
    #     bd.Database("USEEIO-1.1").copy("USEEIO-copy")
    #     print(
    #         f"Create project {name}. Make sure to select `USEEIO-1.1` for one "
    #         + "database and `USEEIO-copy` for the other."
    #     )
    elif args["webapp"]:
        filepath = args["<config>"]
        port = int(args.get("--port", False) or 5000)
        host = "localhost" if args.get("--localhost", False) else "0.0.0.0"

        try:
            app = configure_app(filepath, matchbox_app)

            print("bw_matchbox webapp started on {}:{}".format(host, port))
            app.run(host=host, port=port, debug=True)
        except Exception as err:
            print("Error:", err)
            raise err


if __name__ == "__main__":
    main()
