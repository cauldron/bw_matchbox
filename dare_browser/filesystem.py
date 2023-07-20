import appdirs
from pathlib import Path

base_dir = Path(appdirs.user_data_dir("perdu-search", "perdu"))
base_dir.mkdir(exist_ok=True, parents=True)

export_dir = base_dir / "exports"
export_dir.mkdir(exist_ok=True, parents=True)
