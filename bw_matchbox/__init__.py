"""bw_matchbox."""
__all__ = (
    "__version__",
    "configure_app",
    "matchbox_app",
)

from .utils import get_version_tuple

__version__ = get_version_tuple()

from .webapp import configure_app, matchbox_app
