from pathlib import Path
import json

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
    "10": "Similar data but different location",
}


def get_match_types(output_dir: Path) -> dict:
    match_types_file = output_dir / "match_types.json"
    try:
        return json.load(open(match_types_file))
    except:
        with open(match_types_file, "w") as f:
            json.dump(BASE_MATCH_TYPES, f, indent=2, ensure_ascii=False)
        return BASE_MATCH_TYPES


mwmarortalf = "Match with market and replace or remove transport and loss factor"

MATCH_TYPE_ABBREVIATIONS = {
    "No direct match available": "No direct match",
    "Direct match with near-identical data": "Near-identical data",
    "Match with updated data": "Updated data",
    "Match with updated data and adding source transport": "Updated data w/ src trans",
    "Match with market and replace or remove transport": "Market w/ diff trans",
    mwmarortalf: "Market w/ diff trans loss",
    "Equivalent datasets after modification": "Modifications",
    "Replace aggregated with unit process": "Replace aggregated",
    "Rescaled direct correspondence": "Rescaled",
    "Similar data but different location": "New location",
    "Unknown": "Unknown",
}
