import numpy as np
from bw2data import Database
from bw_processing import clean_datapackage_name, create_datapackage, INDICES_DTYPE, load_datapackage
from fs.zipfs import ZipFS
import os
import datetime


def refresh_proxy_database_if_needed(database: Database):
    fp = filepath_for_proxy_database(database)
    if not fp.is_file():
        create_proxy_datapackage(database)
        return True

    modified = datetime.datetime.fromisoformat(database.metadata['modified']).timestamp()
    created = os.stat(fp).st_mtime

    if modified > created:
        create_proxy_datapackage(database)
        return True
    else:
        return False


def filepath_for_proxy_database(database: Database):
    return database.dirpath_processed() / ("proxies-" + database.filename_processed())


def datapackage_for_source_database(database: Database):
    return load_datapackage(ZipFS(filepath_for_proxy_database(database)))


def create_proxy_datapackage(database: Database):
    """"""
    dp = create_datapackage(
        fs=ZipFS(str(filepath_for_proxy_database(database)), write=True),
        name=clean_datapackage_name(database.name),
        sum_intra_duplicates=True,
        sum_inter_duplicates=False,
    )

    substitution_map = {ds.id: ds['proxy_id'] for ds in database if 'proxy_id' in ds}

    TECHNOSPHERE_NEGATIVE_SQL = """SELECT e.data, a.id, b.id, e.input_database, e.input_code, e.output_database, e.output_code
            FROM exchangedataset as e
            LEFT JOIN activitydataset as a ON a.code == e.input_code AND a.database == e.input_database
            LEFT JOIN activitydataset as b ON b.code == e.output_code AND b.database == e.output_database
            WHERE e.output_database = ?
            AND e.type IN ('technosphere', 'generic consumption')
    """

    data_as_dicts = []

    for obj in database.exchange_data_iterator(TECHNOSPHERE_NEGATIVE_SQL, set()):
        if obj['row'] in substitution_map:
            data_as_dicts.append({'row': obj['row'], 'col': obj['col'], 'amount': 0})
            data_as_dicts.append({'row': substitution_map[obj['row']], 'col': obj['col'], 'amount': obj['amount']})

    dp.add_persistent_vector(
        matrix="technosphere_matrix",
        name=clean_datapackage_name(database.name + " proxies"),
        data_array=np.array([o['amount'] for o in data_as_dicts]),
        indices_array=np.array([(o['row'], o['col']) for o in data_as_dicts], dtype=INDICES_DTYPE),
        flip_array=np.ones(len(data_as_dicts), dtype=bool)
    )
    dp.finalize_serialization()
