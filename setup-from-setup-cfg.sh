#!/bin/sh
echo " Installing the dependencies from the 'setup.cfg:install_requires' (using 'setup-from-setup-cfg')..."
python setup-from-setup-cfg.py | xargs pip install
echo "Done"
