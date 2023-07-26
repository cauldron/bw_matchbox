# bw_matchbox

[![PyPI](https://img.shields.io/pypi/v/bw_matchbox.svg)][pypi status]
[![Status](https://img.shields.io/pypi/status/bw_matchbox.svg)][pypi status]
<!-- [![Python Version](https://img.shields.io/pypi/pyversions/bw_matchbox)][pypi status] -->
[![License](https://img.shields.io/pypi/l/bw_matchbox)][license]

<!-- [![Read the documentation at https://bw_matchbox.readthedocs.io/](https://img.shields.io/readthedocs/bw_matchbox/latest.svg?label=Read%20the%20Docs)][read the docs] -->
<!-- [![Tests](https://github.com/cauldron/bw_matchbox/workflows/Tests/badge.svg)][tests] -->
<!-- [![Codecov](https://codecov.io/gh/cauldron/bw_matchbox/branch/main/graph/badge.svg)][codecov] -->

<!-- [![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)][pre-commit] -->
<!-- [![Black](https://img.shields.io/badge/code%20style-black-000000.svg)][black] -->

[pypi status]: https://pypi.org/project/bw_matchbox/
[read the docs]: https://bw_matchbox.readthedocs.io/
[tests]: https://github.com/cauldron/bw_matchbox/actions?workflow=Tests
[codecov]: https://app.codecov.io/gh/cauldron/bw_matchbox
[pre-commit]: https://github.com/pre-commit/pre-commit
[black]: https://github.com/psf/black

`bw_matchbox` is a web app for matching two [Brightway](https://docs.brightway.dev/en/latest/). It allows you to do complicated matches, such as:

* Link process a to processes b and c, with allocation factors
* Link process a to a proxy for process b, changing the exchange values in b proxy to match those in process a where desired
* Link process a to a proxy for process b, removing some exchanges from b and adding some from a
* Link process a to a proxy for process b, expanding and inlining some exchanges from b to "flatten" its supply chain

## Installation

You can install _bw_matchbox_ via [pip] from [PyPI]:

```console
pip install bw_matchbox
```

This library depends on:

* Brightway 2.5 (`brightway25`)
* `docopt-ng`
* `flask` and `flask_httpauth`
* `tomli`
* `werkzeug`

## Usage

This is a `flask` application. Flask has a debug server suitable for development, but it [should not be used for production](https://flask.palletsprojects.com/en/2.3.x/deploying/)!

To use `bw_matchbox`, you need to do the following:

### Create a configuration file

Configuration is done via a `toml` file. See [`config_example.toml`](https://github.com/cauldron/bw_matchbox/blob/main/config_example.toml) for the structure of this file. It needs to provide the following:

* `[users]` section: Authentication, via a set of usernames and passwords
* `changes_file`: Location of the file where we will save your matching selections.
* `directories`: (Optional) Location of existing [randonneur](https://github.com/cmutel/randonneur) matching files to use, if any.

The easiest way to set this up is with:

```console
matchbox setup
```

This will create stub configuration and changes files in your current working directory - note that you need to edit `changes.json`, and should change the username/password in `config.toml`.

### Create a Brightway project

`bw_matchbox` is designed to match two [Brightway](https://docs.brightway.dev/en/latest/) databases against each other. If you are new to life cycle assessment, or just want to see matchbox in action, do the following.

```console
matchbox example_project
```

This will install the [US EEIO database](https://github.com/USEPA/USEEIO/). You can practice by linking it against itself :p

### Running the development server

Just run:

```console
matchbox webapp config.toml
```

### Running in production

You will need to configure the Flask app using `configure_app`, or re-implement its functionality. Here is an example using [waitress](https://docs.pylonsproject.org/projects/waitress/en/stable/index.html):

```python
from bw_matchbox import matchbox_app, configure_app
config_filepath = "/path/to/config.toml"
app = configure_app(config_filepath, matchbox_app)

from waitress import serve
serve(app, port=8080)
```

### Starting the app

Once the app is running and configured locally or remotely, connect to the correct address and port. If you are running locally, this is probably either `http://localhost:5000` or `http://127.0.0.1:5000`.

In the first screen, choose the Brightway project you want to work on. This is `matchbox-example` if you ran `matchbox example_project`.

On the next screen, choose one database as the *source*, and **a different database** as the *target*. Currently you need to specify a new proxy database by typing a new database name into the *Create a new database* input box.

## Contributing

Contributions are very welcome.
To learn more, see the [Contributor Guide].

## License

Distributed under the terms of the [MIT license][license],
_bw_matchbox_ is free and open source software.

## Issues

If you encounter any problems,
please [file an issue] along with a detailed description.


<!-- github-only -->

[command-line reference]: https://bw_matchbox.readthedocs.io/en/latest/usage.html
[license]: https://github.com/cauldron/bw_matchbox/blob/main/LICENSE
[contributor guide]: https://github.com/cauldron/bw_matchbox/blob/main/CONTRIBUTING.md
