# NOTE: Use `setup-from-setup-cfg.sh` to install the dependencies from the `setup.cfg` file.
import configparser
c = configparser.ConfigParser()
c.read('setup.cfg')
print(c['options']['install_requires'])
