import importlib.metadata
import json
from pathlib import Path
from typing import Optional, Union

from Levenshtein import distance


def get_version_tuple() -> tuple:
    def as_integer(x: str) -> Union[int, str]:
        try:
            return int(x)
        except ValueError:
            return x

    return tuple(
        as_integer(v)
        for v in importlib.metadata.version("bw_matchbox").strip().split(".")
    )


def normalize_name(string_: str) -> str:
    REMOVED = [
        "market group for ",
        "market for ",
        " construction",
        "at plant",
    ]

    string_ = string_.lower()
    for phrase in REMOVED:
        string_ = string_.replace(phrase, "")

    while "  " in string_:
        string_ = string_.replace("  ", " ")

    string_ = string_.strip()
    if string_.endswith(","):
        string_ = string_[:-1]
    return string_.strip()


def name_close_enough(a: str, b: str, cutoff: Optional[int] = 3) -> int:
    print(normalize_name(a))
    print(normalize_name(b))
    print(distance(normalize_name(a), normalize_name(b)))
    return distance(normalize_name(a), normalize_name(b)) < cutoff


def similar_location(a: str, b: str) -> bool:
    return any(
        [
            (b == a),
            (b == "CH" and a in ("CH", "RER", "GLO", "RoW")),
            (len(b) == 2 and a in ("GLO", "RoW")),
            (b == "RER" and a in ("GLO", "RoW", "RoE")),
        ]
    )


BASE_MATCH_TYPES = {
    "1": "No direct match available",
    "2": "Direct match with near-identical data",
    "3": "Match with updated data",
    "4": "Match with updated data and adding source transport",
    "5": "Match with market and replace or remove transport",
    "6": "Match with market and replace or remove transport and loss factor",
    "7": "Equivalent datasets after modification",
    "8": "Replace aggregated with unit process",
    "9": "Rescaled direct correspondence",
    "10": "Similar data but different location"
}


def get_match_types(output_dir: Path) -> dict:
    match_types_file = output_dir / "match_types.json"
    try:
        return json.load(open(match_types_file))
    except:
        with open(match_types_file, "w") as f:
            json.dump(BASE_MATCH_TYPES, f, indent=2, ensure_ascii=False)
        return BASE_MATCH_TYPES
