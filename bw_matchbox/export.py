from pathlib import Path
import csv
from bw_processing import safe_filename

import bw2data as bd
from bw2data.backends import Activity

from .matching import BASE_MATCH_TYPES


def get_csv_row(proxy: Activity) -> dict:
    orig = bd.get_node(id=proxy["original_id"])

    return {
        "source_name": orig.get("name"),
        "source_reference_product": orig.get("reference product"),
        "source_unit": orig.get("unit"),
        "source_location": orig.get("location"),
        "source_database": orig["database"],
        "target_name": proxy.get("name"),
        "target_reference_product": proxy.get("reference product"),
        "target_unit": proxy.get("unit"),
        "target_location": proxy.get("location"),
        "target_database": proxy["database"],
        "comment": proxy.get("comment"),
        "match_type": BASE_MATCH_TYPES.get(proxy.get("match_type")),
    }


def export_database_to_csv(db_name: str, directory: Path):
    COLUMNS = ["name", "reference_product", "unit", "location", "database"]
    HEADERS = (
        ["source_{}".format(x) for x in COLUMNS]
        + ["target_{}".format(x) for x in COLUMNS]
        + ["comment", "match_type"]
    )

    filename = safe_filename(db_name) + ".csv"
    fp = directory / filename

    with open(fp, "w") as f:
        writer = csv.DictWriter(f, HEADERS)
        writer.writeheader()
        for process in bd.Database(db_name):
            writer.writerow(get_csv_row(process))

    return fp
